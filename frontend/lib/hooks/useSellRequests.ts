/**
 * lib/hooks/useSellRequests.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cihaz Sat sistemi — Frontend veri katmanı
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

// ── Tipler ───────────────────────────────────────────────────────────────────
export type SellRequestStatus =
  | 'PENDING' | 'EXPIRED' | 'ACCEPTED' | 'REJECTED'
  | 'SHIPPED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';

export interface SellRequestBid {
  id:         string;
  dealerId?:  string;
  amount:     number;
  note?:      string | null;
  createdAt:  string;
  dealer?: {
    id:          string;
    name?:       string | null;
    companyName?:string | null;
    email?:      string;
  };
}

export interface SellRequest {
  id:             string;
  userId:         string;
  brand:          string;
  model:          string;
  storage?:       string | null;
  color?:         string | null;
  grade:          string;
  batteryHealth?: number | null;
  hasBox:         boolean;
  hasInvoice:     boolean;
  hasAccessories: boolean;
  description?:   string | null;
  imagesUrl:      string[];
  status:         SellRequestStatus;
  expiresAt:      string;
  finalPrice?:    number | null;
  winningDealerId?:string | null;
  shippingCode?:  string | null;
  adminNote?:     string | null;
  adminApproved?: boolean;
  approvedAt?:    string | null;
  requestType?:   'SELL' | 'TRADE_IN';
  createdAt:      string;
  updatedAt:      string;
  // Relations
  bids?:          SellRequestBid[];
  myBid?:         SellRequestBid | null;  // Bayi endpoint'i: sadece kendi teklifi
  bidCount?:      number;
  user?: {
    id:    string;
    email: string;
    name?: string | null;
  };
  winningDealer?: {
    id:          string;
    name?:       string | null;
    companyName?:string | null;
  } | null;
}

export interface CreateSellRequestPayload {
  brand:         string;
  model:         string;
  storage?:      string;
  color?:        string;
  grade:         string;
  batteryHealth?: number;
  hasBox?:       boolean;
  hasInvoice?:   boolean;
  hasAccessories?:boolean;
  description?:  string;
  imagesUrl?:    string[];
  requestType?:  'SELL' | 'TRADE_IN';
}

// ── Admin İstatistikler ───────────────────────────────────────────────────────
export interface SellRequestStats {
  total:     number;
  pending:   number;
  expired:   number;
  accepted:  number;
  completed: number;
  rejected:  number;
  totalBids: number;
  avgBids:   string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MÜŞTERİ HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Müşteri: kendi satış taleplerini listele */
export function useMySellRequests() {
  return useQuery<SellRequest[]>({
    queryKey: ['sell-requests', 'my'],
    queryFn:  async () => {
      const { data } = await apiClient.get('/sell-requests/my');
      return data;
    },
    staleTime: 30_000,
    retry:     1,
  });
}

/** Müşteri: tekil talep detayı */
export function useMySellRequest(id: string | null) {
  return useQuery<SellRequest>({
    queryKey: ['sell-requests', 'my', id],
    queryFn:  async () => {
      const { data } = await apiClient.get(`/sell-requests/my/${id}`);
      return data;
    },
    enabled:   !!id,
    staleTime: 15_000,
    refetchInterval: 10_000, // Her 10 saniyede yeni teklif var mı kontrol et
  });
}

/** Müşteri: yeni satış talebi oluştur */
export function useCreateSellRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSellRequestPayload) => {
      const { data } = await apiClient.post('/sell-requests', payload);
      return data as SellRequest;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sell-requests', 'my'] });
    },
  });
}

/** Müşteri: teklif kabul et */
export function useAcceptBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, bidId }: { requestId: string; bidId: string }) => {
      const { data } = await apiClient.post(`/sell-requests/${requestId}/accept-bid/${bidId}`);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['sell-requests', 'my', vars.requestId] });
      qc.invalidateQueries({ queryKey: ['sell-requests', 'my'] });
    },
  });
}

/** Müşteri: tüm teklifleri reddet */
export function useRejectAllBids() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data } = await apiClient.post(`/sell-requests/${requestId}/reject`);
      return data;
    },
    onSuccess: (_data, requestId) => {
      qc.invalidateQueries({ queryKey: ['sell-requests', 'my', requestId] });
      qc.invalidateQueries({ queryKey: ['sell-requests', 'my'] });
    },
  });
}

/** Müşteri: kargo kodu gir */
export function useAddShippingCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, shippingCode }: { requestId: string; shippingCode: string }) => {
      const { data } = await apiClient.patch(`/sell-requests/${requestId}/shipping`, { shippingCode });
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['sell-requests', 'my', vars.requestId] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BAYİ HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Bayi: aktif satış taleplerini listele */
export function useDealerSellRequests() {
  return useQuery<SellRequest[]>({
    queryKey: ['sell-requests', 'dealer'],
    queryFn:  async () => {
      const { data } = await apiClient.get('/sell-requests/dealer');
      return data;
    },
    staleTime:       20_000,
    refetchInterval: 30_000, // Her 30 saniyede yeni talep var mı kontrol et
  });
}

/** Bayi: tekil talep detayı */
export function useDealerSellRequest(id: string | null) {
  return useQuery<SellRequest>({
    queryKey: ['sell-requests', 'dealer', id],
    queryFn:  async () => {
      const { data } = await apiClient.get(`/sell-requests/dealer/${id}`);
      return data;
    },
    enabled:         !!id,
    staleTime:       15_000,
    refetchInterval: 15_000,
  });
}

/** Bayi: teklif ver */
export function usePlaceBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, amount, note }: { requestId: string; amount: number; note?: string }) => {
      const { data } = await apiClient.post(`/sell-requests/dealer/${requestId}/bid`, { amount, note });
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['sell-requests', 'dealer', vars.requestId] });
      qc.invalidateQueries({ queryKey: ['sell-requests', 'dealer'] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMİN HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Admin: tüm talepleri listele */
export function useAdminSellRequests(opts?: { status?: SellRequestStatus; skip?: number; take?: number }) {
  return useQuery<{ items: SellRequest[]; total: number }>({
    queryKey: ['sell-requests', 'admin', opts],
    queryFn:  async () => {
      const params = new URLSearchParams();
      if (opts?.status) params.set('status', opts.status);
      if (opts?.skip !== undefined) params.set('skip', String(opts.skip));
      if (opts?.take !== undefined) params.set('take', String(opts.take));
      const { data } = await apiClient.get(`/sell-requests/admin?${params}`);
      return data;
    },
    staleTime: 30_000,
  });
}

/** Admin: istatistikler */
export function useAdminSellRequestStats() {
  return useQuery<SellRequestStats>({
    queryKey: ['sell-requests', 'admin', 'stats'],
    queryFn:  async () => {
      const { data } = await apiClient.get('/sell-requests/admin/stats');
      return data;
    },
    staleTime:       60_000,
    refetchInterval: 60_000,
  });
}

/** Admin: tekil talep tam detay */
export function useAdminSellRequest(id: string | null) {
  return useQuery<SellRequest>({
    queryKey: ['sell-requests', 'admin', id],
    queryFn:  async () => {
      const { data } = await apiClient.get(`/sell-requests/admin/${id}`);
      return data;
    },
    enabled:  !!id,
    staleTime: 15_000,
  });
}

/** Admin: durum/atama güncelle */
export function useAdminUpdateSellRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; status?: SellRequestStatus; winningDealerId?: string; finalPrice?: number; adminNote?: string; shippingCode?: string }) => {
      const { data } = await apiClient.patch(`/sell-requests/admin/${id}`, body);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['sell-requests', 'admin', vars.id] });
      qc.invalidateQueries({ queryKey: ['sell-requests', 'admin'] });
    },
  });
}
