/**
 * lib/hooks/useDealerMarket.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Bayiler arası cihaz pazaryeri — Frontend veri katmanı
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

// ── Tipler ───────────────────────────────────────────────────────────────────

export type DealerMarketStatus =
  | 'PENDING_ADMIN' | 'ACTIVE' | 'EXPIRED' | 'SOLD' | 'CANCELLED' | 'REJECTED';

export type DealerListingType = 'AUCTION' | 'DIRECT';

export interface DealerMarketBid {
  id:        string;
  itemId:    string;
  bidderId:  string;
  amount:    number;
  note?:     string | null;
  createdAt: string;
  bidder?: {
    id:           string;
    name?:        string | null;
    companyName?: string | null;
  };
}

export interface DealerMarketItem {
  id:              string;
  sellerId:        string;
  brand:           string;
  model:           string;
  storage?:        string | null;
  color?:          string | null;
  grade:           string;
  batteryHealth?:  number | null;
  hasBox:          boolean;
  hasInvoice:      boolean;
  hasAccessories:  boolean;
  description?:    string | null;
  images:          string[];
  listingType:     DealerListingType;
  floorPrice?:     number | null;
  directPrice?:    number | null;
  status:          DealerMarketStatus;
  adminApproved:   boolean;
  adminNote?:      string | null;
  approvedAt?:     string | null;
  expiresAt?:      string | null;
  durationHours?:  number | null;
  winningBidderId?:string | null;
  finalPrice?:     number | null;
  createdAt:       string;
  updatedAt:       string;
  // computed by API
  myBid?:          DealerMarketBid | null;
  bidCount?:       number;
  seller?: {
    id:           string;
    name?:        string | null;
    companyName?: string | null;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BAYİ HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Bayi: aktif pazaryeri ilanlarını listele (kendi ilanları hariç) */
export function useDealerMarketListings() {
  return useQuery<DealerMarketItem[]>({
    queryKey: ['dealer-market', 'listings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dealer-market');
      return data;
    },
    staleTime:       20_000,
    refetchInterval: 30_000,
  });
}

/** Bayi: kendi ilanlarım */
export function useMyDealerListings() {
  return useQuery<DealerMarketItem[]>({
    queryKey: ['dealer-market', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dealer-market/my');
      return data;
    },
    staleTime: 30_000,
  });
}

/** Bayi: teklif ver (AUCTION) */
export function usePlaceDealerBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, amount, note }: { itemId: string; amount: number; note?: string }) => {
      const { data } = await apiClient.post(`/dealer-market/${itemId}/bid`, { amount, note });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-market'] });
    },
  });
}

/** Bayi: doğrudan satın al (DIRECT) */
export function useBuyDirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.post(`/dealer-market/${itemId}/buy`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-market'] });
    },
  });
}

/** Bayi (satıcı): teklif kabul et */
export function useAcceptDealerBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, bidId }: { itemId: string; bidId: string }) => {
      const { data } = await apiClient.post(`/dealer-market/${itemId}/accept-bid/${bidId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-market'] });
    },
  });
}

/** Bayi: ilanı iptal et */
export function useCancelDealerListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.delete(`/dealer-market/${itemId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-market'] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMİN HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useAdminDealerMarket() {
  return useQuery<DealerMarketItem[]>({
    queryKey: ['dealer-market', 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dealer-market/admin');
      return data;
    },
    staleTime: 30_000,
  });
}

export function useAdminApproveDealerMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote?: string }) => {
      const { data } = await apiClient.patch(`/dealer-market/admin/${id}/approve`, { adminNote });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-market', 'admin'] });
      qc.invalidateQueries({ queryKey: ['admin', 'pending-approvals'] });
    },
  });
}

export function useAdminRejectDealerMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote?: string }) => {
      const { data } = await apiClient.patch(`/dealer-market/admin/${id}/reject`, { adminNote });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-market', 'admin'] });
      qc.invalidateQueries({ queryKey: ['admin', 'pending-approvals'] });
    },
  });
}
