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
            className="fixed inset-0 bg-white/80 backdrop-blur-md z-[300]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white/80 backdrop-blur-3xl border-l border-zinc-200/50 z-[301] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.05)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-transparent border-b border-zinc-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-zinc-200 text-zinc-900">
                  <ShoppingCart size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-heading font-thin text-2xl tracking-tight text-zinc-900">
                    Sepetim
                  </h2>
                  <p className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold">{cartCount} Cihaz Bekliyor</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                aria-label="Sepeti kapat"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-zinc-200 hover:bg-slate-100 transition-colors text-zinc-500"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Escrow Banner */}
            <div className="bg-slate-50/50 border-b border-zinc-200 p-4 flex items-start gap-3">
              <ShieldCheck size={20} strokeWidth={2.5} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-zinc-600 font-bold text-[12px] uppercase tracking-widest leading-loose">
                Re-Luxe Güvencesi: Sipariş sonlanana dek bakiye koruma altında.
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 hide-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-zinc-200 mb-6">
                    <Box size={40} strokeWidth={1.5} className="text-zinc-500" />
                  </div>
                  <h3 className="font-heading font-thin text-[40px] text-zinc-900 mb-2">Boşluk.</h3>
                  <p className="text-zinc-500 text-[14px] font-bold max-w-[250px] mb-8 leading-relaxed uppercase tracking-widest">
                    Uzayda süzülen bir ürün yok.
                  </p>
                  <button onClick={closeCart} className="bg-zinc-900 text-white font-bold uppercase tracking-widest px-8 py-4 text-[12px] rounded-full hover:bg-black transition-colors shadow-[0_0_20px_rgba(0,0,0,0.1)]">
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
                        className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[24px] border border-zinc-200"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-2xl shrink-0 bg-white flex items-center justify-center border border-zinc-200 p-2 overflow-hidden shadow-sm">
                          {item.image ? (
                            <img
                              src={resolveUploadUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-contain drop-shadow-sm"
                            />
                          ) : (
                            <Smartphone size={24} className="text-zinc-300" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-[14px] text-zinc-900 truncate tracking-wide">{item.name}</p>
                          <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold bg-slate-100 inline-block px-2 py-0.5 rounded mt-1 border border-zinc-200">
                            {item.storage} | {item.color}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              id={`cart-minus-${item.variantId}`}
                              onClick={() => updateQuantity(item.variantId, -1)}
                              aria-label="Azalt"
                              className="w-7 h-7 rounded-full bg-slate-100 border border-zinc-200 hover:bg-slate-200 transition-colors flex items-center justify-center text-zinc-900"
                            >
                              <Minus size={14} strokeWidth={2} />
                            </button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="font-black text-zinc-900 text-[15px] w-6 text-center tabular-nums"
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              id={`cart-plus-${item.variantId}`}
                              onClick={() => updateQuantity(item.variantId, 1)}
                              aria-label="Artır"
                              className="w-7 h-7 rounded-full bg-slate-100 border border-zinc-200 hover:bg-slate-200 transition-colors flex items-center justify-center text-zinc-900"
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
                            className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                          <span className="font-heading tracking-tighter text-zinc-900 font-light text-[18px]">
                            {(item.price * item.quantity).toLocaleString('tr-TR')} <span className="text-[12px] text-zinc-500">₺</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {cart.length > 1 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={handleClear}
                        className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest hover:text-red-500 underline transition-colors"
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
              <div className="px-8 py-8 bg-white border-t border-zinc-200 mt-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>Lojistik İntikali</span>
                    <span className="text-zinc-900 bg-slate-100 border border-zinc-200 px-3 py-1 rounded-full text-[10px] shadow-sm">
                      KARŞILANDI
                    </span>
                  </div>
                  <div className="w-full h-px bg-zinc-200 my-4" />
                  <div className="flex items-end justify-between">
                    <span className="text-zinc-500 text-[12px] font-bold uppercase tracking-widest mb-1">Total Limit</span>
                    <motion.span
                      key={cartTotal}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="font-heading text-zinc-900 font-thin text-[50px] tracking-tighter leading-none flex items-start gap-1"
                    >
                      {cartTotal.toLocaleString('tr-TR')} <span className="text-[20px] font-bold text-zinc-500 mt-2">₺</span>
                    </motion.span>
                  </div>
                </div>

                <button
                  id="cart-checkout-btn"
                  onClick={handleCheckout}
                  className="w-full py-5 text-[14px] bg-zinc-900 text-white font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-3 mt-8 hover:bg-black transition-colors shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]"
                >
                  Güvenli Ödeme <ArrowRight size={18} strokeWidth={2.5} />
                </button>

                <div className="flex items-center justify-center gap-2 mt-5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-60">
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
