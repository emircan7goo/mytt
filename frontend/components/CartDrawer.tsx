'use client';
import { X, ShoppingCart, Trash2, Lock, ArrowRight, ShieldCheck, Box, Plus, Minus, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveUploadUrl } from '@/lib/resolveUrl';

export default function CartDrawer() {
  const {
    cartOpen, closeCart,
    cart, removeFromCart, updateQuantity, clearCart,
    cartTotal, cartCount,
    setShowAuthModal, user,
  } = useApp();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cartOpen) closeCart();
    };
    if (cartOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [cartOpen, closeCart]);

  const router = useRouter();

  const handleCheckout = useCallback(() => {
    if (!user) {
      closeCart();
      setTimeout(() => setShowAuthModal(true), 300);
      toast.info('Ödeme için giriş yapmanız gerekiyor.', { duration: 3000 });
      return;
    }
    toast.success('Ödeme ağına bağlanılıyor...', { duration: 2000 });
    closeCart();
    setTimeout(() => router.push('/checkout'), 300);
  }, [user, closeCart, setShowAuthModal, router]);

  const handleRemove = useCallback(
    (variantId: string, name: string) => {
      removeFromCart(variantId);
      toast.error(`🗑️ Sepetten Çıkarıldı: ${name}`, { duration: 2000 });
    },
    [removeFromCart]
  );

  const handleClear = useCallback(() => {
    clearCart();
    toast.error('🗑️ Sepet tamamen boşaltıldı.', { duration: 2000 });
  }, [clearCart]);

  return (
    <AnimatePresence>
      {mounted && cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[rgba(28,21,18,0.45)] backdrop-blur-md z-[300]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[var(--k-surface)] border-l border-[var(--k-line)] z-[301] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.05)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-transparent border-b border-[var(--k-line)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--k-surface-2)] rounded-full flex items-center justify-center border border-[var(--k-line)] text-[var(--k-ink)]">
                  <ShoppingCart size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-heading font-thin text-2xl tracking-tight text-[var(--k-ink)]">
                    Sepetim
                  </h2>
                  <p className="text-[var(--k-ink-3)] text-[11px] uppercase tracking-widest font-bold">{cartCount} Cihaz Bekliyor</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                aria-label="Sepeti kapat"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--k-surface-2)] border border-[var(--k-line)] hover:bg-[var(--k-surface-3)] transition-colors text-[var(--k-ink-3)]"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Escrow Banner */}
            <div className="bg-[var(--k-canvas-2)] border-b border-[var(--k-line)] p-4 flex items-start gap-3">
              <ShieldCheck size={20} strokeWidth={2.5} className="text-[var(--k-hot)] shrink-0 mt-0.5" />
              <p className="text-[var(--k-ink-2)] font-bold text-[12px] uppercase tracking-widest leading-loose">
                Re-Luxe Güvencesi: Sipariş sonlanana dek bakiye koruma altında.
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 hide-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-24 h-24 bg-[var(--k-surface-2)] rounded-full flex items-center justify-center mx-auto border border-[var(--k-line)] mb-6">
                    <Box size={40} strokeWidth={1.5} className="text-[var(--k-ink-3)]" />
                  </div>
                  <h3 className="font-heading font-thin text-[40px] text-[var(--k-ink)] mb-2">Boşluk.</h3>
                  <p className="text-[var(--k-ink-3)] text-[14px] font-bold max-w-[250px] mb-8 leading-relaxed uppercase tracking-widest">
                    Uzayda süzülen bir ürün yok.
                  </p>
                  <button onClick={closeCart} className="bg-[var(--k-canvas)] text-white font-bold uppercase tracking-widest px-8 py-4 text-[12px] rounded-full hover:bg-[var(--k-void)] transition-colors shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                    Kataloğa Dön
                  </button>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-4 p-4 bg-[var(--k-canvas-2)] rounded-[24px] border border-[var(--k-line)]"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-2xl shrink-0 bg-[var(--k-surface)] flex items-center justify-center border border-[var(--k-line)] p-2 overflow-hidden shadow-sm">
                          {item.image ? (
                            <img
                              src={resolveUploadUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-contain drop-shadow-sm"
                            />
                          ) : (
                            <Smartphone size={24} className="text-[var(--k-ink-4)]" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-[14px] text-[var(--k-ink)] truncate tracking-wide">{item.name}</p>
                          <p className="text-[var(--k-ink-2)] text-[10px] uppercase tracking-widest font-bold bg-[var(--k-surface-3)] inline-block px-2 py-0.5 rounded mt-1 border border-[var(--k-line)]">
                            {item.storage} | {item.color}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              id={`cart-minus-${item.variantId}`}
                              onClick={() => updateQuantity(item.variantId, -1)}
                              aria-label="Azalt"
                              className="w-7 h-7 rounded-full bg-[var(--k-surface-3)] border border-[var(--k-line)] hover:bg-[var(--k-surface-3)] transition-colors flex items-center justify-center text-[var(--k-ink)]"
                            >
                              <Minus size={14} strokeWidth={2} />
                            </button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="font-black text-[var(--k-ink)] text-[15px] w-6 text-center tabular-nums"
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              id={`cart-plus-${item.variantId}`}
                              onClick={() => updateQuantity(item.variantId, 1)}
                              aria-label="Artır"
                              className="w-7 h-7 rounded-full bg-[var(--k-surface-3)] border border-[var(--k-line)] hover:bg-[var(--k-surface-3)] transition-colors flex items-center justify-center text-[var(--k-ink)]"
                            >
                              <Plus size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex flex-col items-end justify-between gap-4 shrink-0 h-full">
                          <button
                            onClick={() => handleRemove(item.variantId, item.name)}
                            aria-label={`${item.name} sepetten çıkar`}
                            className="w-8 h-8 rounded-full bg-[var(--k-surface)] border border-[var(--k-line)] flex items-center justify-center text-[var(--k-ink-3)] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                          <span className="font-heading tracking-tighter text-[var(--k-ink)] font-light text-[18px]">
                            {(item.price * item.quantity).toLocaleString('tr-TR')} <span className="text-[12px] text-[var(--k-ink-3)]">₺</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {cart.length > 1 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={handleClear}
                        className="text-[11px] font-bold text-[var(--k-ink-2)] uppercase tracking-widest hover:text-red-500 underline transition-colors"
                      >
                        Koleksiyonu Sıfırla
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-8 py-8 bg-[var(--k-surface)] border-t border-[var(--k-line)] mt-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-widest text-[var(--k-ink-3)]">
                    <span>Lojistik İntikali</span>
                    <span className="text-[var(--k-ink)] bg-[var(--k-surface-3)] border border-[var(--k-line)] px-3 py-1 rounded-full text-[10px] shadow-sm">
                      KARŞILANDI
                    </span>
                  </div>
                  <div className="w-full h-px bg-[var(--k-surface-3)] my-4" />
                  <div className="flex items-end justify-between">
                    <span className="text-[var(--k-ink-3)] text-[12px] font-bold uppercase tracking-widest mb-1">Total Limit</span>
                    <motion.span
                      key={cartTotal}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="font-heading text-[var(--k-ink)] font-thin text-[50px] tracking-tighter leading-none flex items-start gap-1"
                    >
                      {cartTotal.toLocaleString('tr-TR')} <span className="text-[20px] font-bold text-[var(--k-ink-3)] mt-2">₺</span>
                    </motion.span>
                  </div>
                </div>

                <button
                  id="cart-checkout-btn"
                  onClick={handleCheckout}
                  className="w-full py-5 text-[14px] bg-[var(--k-canvas)] text-white font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-3 mt-8 hover:bg-[var(--k-void)] transition-colors shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]"
                >
                  Güvenli Ödeme <ArrowRight size={18} strokeWidth={2.5} />
                </button>

                <div className="flex items-center justify-center gap-2 mt-5 text-[var(--k-ink-3)] text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <Lock size={12} />
                  256-Bit Kuantum Güvenlik Tüneli
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
