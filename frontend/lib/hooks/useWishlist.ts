/**
 * lib/hooks/useWishlist.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Favori listesi — DB tabanlı, login gerektiriyor.
 * Login değilse localStorage'daki Zustand store kullanılır (geçici).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store';

export interface WishlistItem {
  id:            string;
  dealerStockId: string;
  addedAt:       string;
  product: {
    id:            string;
    brand:         string;
    model:         string;
    storage?:      string | null;
    color?:        string | null;
    masterImage?:  string | null;
    grade:         string;
    batteryHealth?: number | null;
    price:         number;
    stock:         number;
    // Bayi kimliği asla gönderilmez — sadece güven sinyalleri (anonim pazar)
    store: {
      id:            string;
      rating:        number;
      reviewCount?:  number;
      jobsCompleted?: number;
      isPremium:     boolean;
    } | null;
  };
}

// ── Tam liste ─────────────────────────────────────────────────────────────────
export function useWishlist() {
  const user = useAuthStore(s => s.user);
  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn:  async () => {
      const { data } = await apiClient.get('/wishlist');
      return data;
    },
    enabled:   !!user,
    staleTime: 30_000,
  });
}

// ── ID seti (kalp ikonları için hızlı kontrol) ────────────────────────────────
export function useWishlistIds() {
  const user = useAuthStore(s => s.user);
  return useQuery<string[]>({
    queryKey: ['wishlist', 'ids'],
    queryFn:  async () => {
      const { data } = await apiClient.get('/wishlist/ids');
      return data;
    },
    enabled:   !!user,
    staleTime: 30_000,
  });
}

// ── Toggle (ekle / çıkar) ─────────────────────────────────────────────────────
export function useWishlistToggle() {
  const qc   = useQueryClient();
  const user = useAuthStore(s => s.user);

  const add = useMutation({
    mutationFn: (dealerStockId: string) =>
      apiClient.post(`/wishlist/${dealerStockId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const remove = useMutation({
    mutationFn: (dealerStockId: string) =>
      apiClient.delete(`/wishlist/${dealerStockId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const toggle = async (dealerStockId: string, isInWishlist: boolean) => {
    if (!user) return false; // login gerekli
    if (isInWishlist) {
      await remove.mutateAsync(dealerStockId);
    } else {
      await add.mutateAsync(dealerStockId);
    }
    return true;
  };

  return {
    toggle,
    isLoading: add.isPending || remove.isPending,
    isAuthenticated: !!user,
  };
}
