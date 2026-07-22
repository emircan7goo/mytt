/**
 * lib/hooks/usePayout.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Bayi Hakediş Çekim Sistemi — Frontend veri katmanı
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface DealerEarnings {
  escrowPending:    number;
  withdrawable:     number;
  inProcess:        number;
  lastPayoutAmount: number;
  lastPayoutDate:   string | null;
  iban:             string | null;
  ibanName:         string | null;
}

export interface Payout {
  id:          string;
  dealerId:    string;
  amount:      number;
  status:      PayoutStatus;
  iban:        string;
  ibanName?:   string | null;
  adminNote?:  string | null;
  requestedAt: string;
  processedAt?: string | null;
  dealer?: {
    id: string; name?: string | null; email: string; companyName?: string | null;
  };
}

// ── Bayi ─────────────────────────────────────────────────────────────────────
export function useDealerEarnings() {
  return useQuery<DealerEarnings>({
    queryKey: ['payout', 'my-earnings'],
    queryFn: async () => (await apiClient.get('/payout/my-earnings')).data,
    staleTime: 30_000,
  });
}

export function useMyPayouts() {
  return useQuery<Payout[]>({
    queryKey: ['payout', 'my-requests'],
    queryFn: async () => (await apiClient.get('/payout/my-requests')).data,
    staleTime: 30_000,
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { amount?: number; iban: string; ibanName?: string }) =>
      apiClient.post('/payout/request', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payout'] });
    },
  });
}

// ── Admin ────────────────────────────────────────────────────────────────────
export function useAdminPayouts(status?: PayoutStatus) {
  return useQuery<Payout[]>({
    queryKey: ['admin', 'payouts', status],
    queryFn: async () => (await apiClient.get('/payout/admin', { params: { status } })).data,
    staleTime: 15_000,
  });
}

export function useAdminApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/payout/admin/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  });
}

export function useAdminMarkPaidPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient.patch(`/payout/admin/${id}/paid`, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  });
}

export function useAdminRejectPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiClient.patch(`/payout/admin/${id}/reject`, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  });
}
