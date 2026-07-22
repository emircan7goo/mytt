'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode, useEffect } from 'react';
import { useCartStore, useUIStore, useWishlistStore, useCompareStore, selectCartCount, selectCartTotal } from '@/store';
import { useAuthStore } from '@/store';
import { usePathname, useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';
import type { AuthPayload } from '@/lib/auth';
import { setSessionCookie, clearSessionCookie } from '@/lib/auth';
import type { MockProduct } from '@/lib/mock-data';
import { API_BASE } from '@/lib/api';

import ThemeInjector from '@/components/ThemeInjector';

// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  /**
   * Session Restore — HttpOnly cookie ile
   * Sayfa yüklendiğinde GET /auth/me çağrısı yapılır.
   * Cookie geçerliyse backend user bilgisini döndürür, store'a yazılır.
   * Cookie geçersiz/yoksa sessizce görmezden gelinir.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          credentials: 'include', // HttpOnly cookie gönderir
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const user: AuthPayload = await res.json();
          if (user?.id && user?.role) {
            useAuthStore.setState({ user });
            // Companion cookie'yi de yenile — proxy.ts (RBAC) bunu okuyor
            setSessionCookie(user);
          }
        } else if (res.status === 401) {
          // Cookie geçersiz → companion cookie'yi de temizle
          clearSessionCookie();
          useAuthStore.setState({ user: null });
        }
      } catch {
        // Network hatası → sessizce geç
      }
    };

    restoreSession();
  }, []);

  // Sync route changes with UI state (close modals/drawers on navigation)
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    useUIStore.getState().setAuthModalOpen(false);
    useUIStore.getState().setCartDrawerOpen(false);
    useUIStore.getState().closeProductModal();
  }, [pathname, searchParams]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInjector />
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: { fontFamily: 'var(--font-heading, sans-serif)' },
          className: 'font-bold text-[14px]',
        }}
      />
      {children}
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useApp — Unified bridge hook for components
// All component-level interactions go through this single API surface.
// ─────────────────────────────────────────────────────────────────────────────
export function useApp() {
  const auth = useAuthStore();
  const items = useCartStore((s) => s.items);
  const cartCount = useCartStore(selectCartCount);
  const cartTotal = useCartStore(selectCartTotal);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCartFn = useCartStore((s) => s.clearCart);
  const ui = useUIStore();

  const wishlist = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  const compareList = useCompareStore((s) => s.items);
  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const isInCompare = useCompareStore((s) => s.isInCompare);
  const isCompareDrawerOpen = useCompareStore((s) => s.isCompareDrawerOpen);
  const setCompareDrawerOpen = useCompareStore((s) => s.setCompareDrawerOpen);

  return {
    // ── Auth ────────────────────────────────────────────────────────────────
    user: auth.user,
    login: auth.login,
    logout: auth.logout,

    // ── Cart ────────────────────────────────────────────────────────────────
    cart: items.map(item => {
      const isDealer = auth.user?.role === 'dealer';
      const rate = auth.user?.commissionRate || 0.05;
      return { ...item, price: isDealer ? item.price * (1 - rate) : item.price };
    }),
    cartCount,
    cartTotal: items.reduce((acc, item) => {
      const isDealer = auth.user?.role === 'dealer';
      const rate = auth.user?.commissionRate || 0.05;
      const finalPrice = isDealer ? item.price * (1 - rate) : item.price;
      return acc + (finalPrice * item.quantity);
    }, 0),
    cartOpen: ui.isCartDrawerOpen,
    openCart: () => ui.setCartDrawerOpen(true),
    closeCart: () => ui.setCartDrawerOpen(false),

    addToCart: (product: MockProduct) =>
      addItem({
        id: `${product.id}-${Date.now()}`,
        variantId: product.id,
        productId: product.id,
        name: `${product.brand} ${product.model}`,
        price: product.price,
        quantity: 1,
        image: product.image,
        color: product.color,
        storage: product.storage,
      }),

    removeFromCart: (variantId: string) => removeItem(variantId),
    updateQuantity: (variantId: string, delta: number) => updateQuantity(variantId, delta),
    clearCart: () => clearCartFn(),

    // ── Auth Modal ─────────────────────────────────────────────────────────
    showAuthModal: ui.isAuthModalOpen,
    setShowAuthModal: ui.setAuthModalOpen,

    // ── Product Detail Modal ───────────────────────────────────────────────
    activeProduct: ui.activeProduct as MockProduct | null,
    showProductModal: ui.isProductModalOpen,
    openProductModal: (product: MockProduct) => ui.openProductModal(product),
    closeProductModal: () => ui.closeProductModal(),

    // ── Search ─────────────────────────────────────────────────────────────
    searchQuery: ui.searchQuery,
    setSearchQuery: ui.setSearchQuery,

    // ── Wishlist ───────────────────────────────────────────────────────────
    wishlist,
    toggleWishlist,
    isInWishlist,

    // ── Compare ────────────────────────────────────────────────────────────
    compareList,
    toggleCompare,
    isInCompare,
    isCompareDrawerOpen,
    setCompareDrawerOpen,
  };
}
