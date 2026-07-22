import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MockProduct } from '@/lib/mock-data';
import { API_BASE } from '@/lib/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// UI STORE — Modals, Sidebars, Search, Demo Toggle
// ─────────────────────────────────────────────────────────────────────────────
interface UIState {
  isAuthModalOpen: boolean;
  setAuthModalOpen: (val: boolean) => void;

  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (val: boolean) => void;

  searchQuery: string;
  setSearchQuery: (val: string) => void;

  activeProduct: MockProduct | null;
  isProductModalOpen: boolean;
  openProductModal: (product: MockProduct) => void;
  closeProductModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isAuthModalOpen: false,
      setAuthModalOpen: (val) => set({ isAuthModalOpen: val }),

      isCartDrawerOpen: false,
      setCartDrawerOpen: (val) => set({ isCartDrawerOpen: val }),

      searchQuery: '',
      setSearchQuery: (val) => set({ searchQuery: val }),

      activeProduct: null,
      isProductModalOpen: false,
      openProductModal: (product) =>
        set({ activeProduct: product, isProductModalOpen: true }),
      closeProductModal: () =>
        set({ isProductModalOpen: false, activeProduct: null }),
    }),
    {
      name: 'mytt-ui',
      // Sadece arama sorgusunu sakla; modal/drawer state'lerini ASLA persist etme
      partialize: (state) => ({ searchQuery: state.searchQuery }),
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STORE
// ─────────────────────────────────────────────────────────────────────────────
import type { AuthPayload } from '@/lib/auth';
import { clearSessionCookie } from '@/lib/auth';

interface AuthState {
  user: AuthPayload | null;
  login: (userData: AuthPayload) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      /**
       * login — JWT artık backend tarafından HttpOnly cookie olarak set edilir.
       * Bu fonksiyon sadece kullanıcı bilgisini Zustand state'ine yazar.
       */
      login: (userData) => {
        set({ user: userData });
      },

      /**
       * logout — Backend'e POST /auth/logout yaparak HttpOnly cookie'yi temizletir.
       */
      logout: () => {
        set({ user: null });
        useCartStore.getState().clearCart();
        clearSessionCookie();

        if (typeof window !== 'undefined') {
          void fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          }).finally(() => {
            localStorage.removeItem('mytt-cms-draft');
            localStorage.removeItem('mytt-cart');
            localStorage.removeItem('mytt-ui');
            localStorage.removeItem('mytt-auth');
            window.location.href = '/';
          });
        }
      },
    }),
    {
      name: 'mytt-auth', // LocalStorage key
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// CART STORE — Optimistic Client-Side Cart
// NOTE: cartCount and cartTotal are derived selectors, NOT getters,
// so they work correctly with Zustand persist.
// ─────────────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  storage?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'> & { id?: string }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            ...item,
            id: item.id ?? `${item.productId}-${Date.now()}`,
            quantity: item.quantity ?? 1,
          };
          return { items: [...state.items, newItem] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, delta) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: i.quantity + delta }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'mytt-cart',
    }
  )
);

// ── Derived selectors (use these in components) ───────────────────────────────
export const selectCartCount = (state: CartState) =>
  state.items.reduce((t, i) => t + i.quantity, 0);

export const selectCartTotal = (state: CartState) =>
  state.items.reduce((t, i) => t + i.price * i.quantity, 0);

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST STORE (Unicorn Feature 1)
// ─────────────────────────────────────────────────────────────────────────────
interface WishlistState {
  items: MockProduct[];
  toggleWishlist: (product: MockProduct) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const { items } = get();
        const exists = items.some((i) => i.id === product.id);
        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      isInWishlist: (productId) => get().items.some((i) => i.id === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'mytt-wishlist',
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPARE STORE (Unicorn Feature 2)
// ─────────────────────────────────────────────────────────────────────────────
interface CompareState {
  items: MockProduct[];
  isCompareDrawerOpen: boolean;
  setCompareDrawerOpen: (val: boolean) => void;
  toggleCompare: (product: MockProduct) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isCompareDrawerOpen: false,
      setCompareDrawerOpen: (val) => set({ isCompareDrawerOpen: val }),
      toggleCompare: (product) => {
        const { items } = get();
        const exists = items.some((i) => i.id === product.id);
        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) });
        } else {
          // Limit comparisons to 3 products max
          if (items.length >= 3) {
            set({ items: [...items.slice(1), product] });
          } else {
            set({ items: [...items, product] });
          }
        }
      },
      isInCompare: (productId) => get().items.some((i) => i.id === productId),
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'mytt-compare',
    }
  )
);
