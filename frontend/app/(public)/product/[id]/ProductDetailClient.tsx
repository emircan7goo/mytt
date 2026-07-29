'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useProductById } from '@/lib/hooks/useProducts';
import { ArrowLeft, ShoppingCart, Lock, ShieldCheck, Cpu, Smartphone, Battery, CheckCircle2, Award, Truck, Heart } from 'lucide-react';
import { useWishlistIds, useWishlistToggle } from '@/lib/hooks/useWishlist';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PriceComparisonWidget from '@/components/PriceComparisonWidget';
import RecentlyViewed, { useTrackView } from '@/components/RecentlyViewed';
import { resolveUploadUrl } from '@/lib/resolveUrl';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, openCart, user } = useApp();
  const [addedPulse, setAddedPulse] = useState(false);
  const { data: wishlistIds } = useWishlistIds();
  const { toggle, isAuthenticated } = useWishlistToggle();
  const isWishlisted = wishlistIds?.includes(params?.id as string) ?? false;

  const handleWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Favori eklemek için giriş yapmalısınız');
      return;
    }
    await toggle(params?.id as string, isWishlisted);
    toast.success(isWishlisted ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  }, [isAuthenticated, toggle, params?.id, isWishlisted]);

  const { data: product, isLoading, isError } = useProductById(params?.id as string);

  // Track this product view in localStorage for RecentlyViewed
  useTrackView(params?.id as string);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    // ApiProduct ile MockProduct uyumlu alanları örtüşüyor; cast güvenli
    addToCart(product as unknown as Parameters<typeof addToCart>[0]);
    setAddedPulse(true);
    setTimeout(() => {
      setAddedPulse(false);
      openCart();
    }, 1000);
  }, [addToCart, product, openCart]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    const price   = product.price;
    const name    = encodeURIComponent(`${product.brand} ${product.model}`);
    router.push(`/checkout?productId=${product.id}&price=${price}&name=${name}&qty=1`);
  }, [product, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--k-canvas)] flex items-center justify-center">
        <div className="w-10 h-10 border-[1px] border-[var(--k-line)] border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--k-canvas)]">
        <h1 className="text-[var(--k-ink)] font-thin text-[60px] tracking-tighter mb-4">Yokluk.</h1>
        <p className="text-[var(--k-ink-3)] text-[18px] font-light max-w-sm text-center mb-10">
          Bu uzamsal frekansta aradığınız donanıma ulaşılamadı.
        </p>
        <button onClick={() => router.push('/')} className="px-10 py-4 text-sm tracking-widest uppercase font-bold text-white bg-[var(--k-canvas)] rounded-full hover:bg-[var(--k-void)] transition-colors">
          Vitrine Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--k-canvas)] text-[var(--k-ink)] selection:bg-[var(--k-canvas)] selection:text-white pt-[100px] md:pt-[120px] pb-20 overflow-hidden relative">
      
      {/* Deep Space Glowing Orb Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-3 text-[var(--k-ink-3)] hover:text-[var(--k-ink)] transition-colors mb-8 md:mb-12"
        >
          <div className="w-10 h-10 rounded-full border border-[var(--k-line)] flex items-center justify-center group-hover:border-[var(--k-line-2)] transition-colors bg-[var(--k-surface)] shadow-sm">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Vitrine Dön</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left: Huge Floating Image Area */}
          <div className="w-full lg:w-[50%] flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 100, duration: 1 }}
              className="relative w-full aspect-[4/5] bg-[var(--k-surface)] rounded-[40px] border border-[var(--k-line)] shadow-[0_20px_80px_rgba(0,0,0,0.03)] flex items-center justify-center overflow-hidden"
            >
              {/* Subtle background gradient inside image container */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white pointer-events-none" />
              
              <motion.img
                src={resolveUploadUrl(product.image)}
                alt={product.model}
                className="w-10/12 h-10/12 object-contain relative z-10 filter drop-shadow-[0_30px_50px_rgba(0,0,0,0.1)]"
                initial={{ y: 15 }}
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />

              {/* Badges on image */}
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                <span className="bg-[var(--k-canvas)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md">
                  Grade {(product as any).cosmeticGrade || (product as any).grade || 'A'}
                </span>
                {product.condition === 'NEW' && (
                  <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md">
                    Sıfır Cihaz
                  </span>
                )}
              </div>
            </motion.div>

            {/* Elite Value Props Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[var(--k-surface)] p-6 rounded-[24px] border border-[var(--k-line)] shadow-sm flex flex-col gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                     <ShieldCheck size={20} />
                  </div>
                  <span className="font-bold text-[13px] text-[var(--k-ink)]">12 Ay Mytt Garantisi</span>
                  <p className="text-[11px] text-[var(--k-ink-3)] leading-relaxed">Cihazınız tüm donanımsal sorunlara karşı 1 yıl koruma altındadır.</p>
               </div>
               <div className="bg-[var(--k-surface)] p-6 rounded-[24px] border border-[var(--k-line)] shadow-sm flex flex-col gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                     <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-[13px] text-[var(--k-ink)]">21 Nokta Kontrolü</span>
                  <p className="text-[11px] text-[var(--k-ink-3)] leading-relaxed">Uzman teknisyenlerimiz tarafından A'dan Z'ye test edilmiştir.</p>
               </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase */}
          <div className="w-full lg:w-[50%] flex flex-col items-start pt-4 lg:pt-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[13px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
                <span className="text-[13px] font-medium text-[var(--k-ink-4)] flex items-center gap-1">
                  <Award size={14} /> Stok Kodu: {product.id.split('-')[0].toUpperCase()}
                </span>
              </div>
              
              <h1 className="text-[50px] md:text-[64px] font-heading font-thin leading-[1.1] tracking-tight mb-8 text-[var(--k-ink)]">
                {product.model}
              </h1>

              {/* Hardware Specs Grid (Premium look) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                 <div className="flex flex-col items-center justify-center p-4 bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] text-center gap-2 shadow-sm">
                    <Smartphone size={20} className="text-[var(--k-ink-4)]" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--k-ink-3)]">Kapasite</span>
                    <span className="text-[14px] font-semibold text-[var(--k-ink)]">{product.storage || '128 GB'}</span>
                 </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] text-center gap-2 shadow-sm">
                    <div className="w-5 h-5 rounded-full border border-[var(--k-line)]" style={{ backgroundColor: product.color === 'Siyah' ? '#000' : product.color === 'Beyaz' ? '#fff' : product.color === 'Kırmızı' ? '#ef4444' : '#e4e4e7' }} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--k-ink-3)]">Renk</span>
                    <span className="text-[14px] font-semibold text-[var(--k-ink)]">{product.color || 'Standart'}</span>
                 </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] text-center gap-2 shadow-sm">
                    <Battery size={20} className="text-[var(--k-ink-4)]" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--k-ink-3)]">Pil Sağlığı</span>
                    <span className="text-[14px] font-semibold text-[var(--k-ink)]">
                      {(product.specsJson as any)?.batteryHealth ? `%${(product.specsJson as any).batteryHealth}` : '%85+'}
                    </span>
                 </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] text-center gap-2 shadow-sm">
                    <Cpu size={20} className="text-[var(--k-ink-4)]" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--k-ink-3)]">İşlemci</span>
                    <span className="text-[14px] font-semibold text-[var(--k-ink)]">Bionic A Serisi</span>
                 </div>
              </div>

              {/* Price Area */}
              <div className="mb-10 bg-[var(--k-surface)] p-8 rounded-[32px] border border-[var(--k-line)] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                {user?.role === 'dealer' ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[12px] font-black text-rose-500 tracking-widest uppercase bg-rose-50 px-2 py-1 rounded">B2B Bayi Fiyatı</span>
                    </div>
                    <span className="text-[16px] font-medium text-[var(--k-ink-4)] line-through decoration-zinc-300 mb-1">
                       Perakende: {product.price.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[48px] font-black tracking-tight flex items-start gap-2 text-[var(--k-ink)]">
                      {(product.price * (1 - (user.commissionRate || 0.10))).toLocaleString('tr-TR')}
                      <span className="text-[20px] text-[var(--k-ink-4)] mt-3 font-bold">₺</span>
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="block text-[12px] font-bold text-[var(--k-ink-3)] tracking-widest uppercase mb-2">Net Satış Fiyatı</span>
                    <span className="text-[48px] font-light tracking-tight flex items-start gap-2 text-[var(--k-ink)] leading-none">
                      {product.price.toLocaleString('tr-TR')} 
                      <span className="text-[20px] text-[var(--k-ink-4)] mt-2 font-bold">₺</span>
                    </span>
                  </>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
                  {/* Hemen Satın Al — checkout'a yönlendirir */}
                  <motion.button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    whileTap={{ scale: 0.98 }}
                    className={product.stock > 0 ? 'flex-1 h-[60px] rounded-2xl flex items-center justify-center gap-3 text-[14px] font-bold tracking-wide transition-all bg-[var(--k-canvas)] text-white hover:bg-[var(--k-void)] shadow-[0_10px_20px_rgba(0,0,0,0.15)]' : 'flex-1 h-[60px] rounded-2xl flex items-center justify-center gap-3 text-[14px] font-bold tracking-wide transition-all bg-[var(--k-surface-3)] text-[var(--k-ink-4)] cursor-not-allowed'}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span key="buy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                        {product.stock > 0 ? 'Hemen Satın Al' : 'Stokta Yok'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>

                  {/* Sepete Ekle */}
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    whileTap={{ scale: 0.98 }}
                    className={product.stock > 0 ? 'h-[60px] px-6 rounded-2xl flex items-center justify-center gap-3 text-[14px] font-bold tracking-wide transition-all border-2 border-[var(--k-line)] text-[var(--k-ink-2)] hover:border-[var(--k-line-2)] hover:text-[var(--k-ink)]' : 'h-[60px] px-6 rounded-2xl flex items-center justify-center gap-3 text-[14px] font-bold tracking-wide transition-all border-2 border-[var(--k-line)] text-[var(--k-ink-4)] cursor-not-allowed'}
                  >
                    <AnimatePresence mode="wait">
                      {addedPulse ? (
                        <motion.span key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-[var(--k-hot)]" /> Eklendi
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                          <ShoppingCart size={18} strokeWidth={2} /> Sepete Ekle
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Favorilere Ekle */}
                  <motion.button
                    onClick={handleWishlist}
                    whileTap={{ scale: 0.93 }}
                    className={isWishlisted ? 'w-[60px] h-[60px] rounded-2xl flex items-center justify-center border-2 border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-100' : 'w-[60px] h-[60px] rounded-2xl flex items-center justify-center border-2 border-[var(--k-line)] text-[var(--k-ink-4)] transition-all hover:border-red-200 hover:text-red-400 hover:bg-red-50'}
                    aria-label={isWishlisted ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    <Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} strokeWidth={1.5} />
                  </motion.button>
                </div>
              </div>

              {/* B2B Price Comparison Module */}
              <div className="mb-10">
                 <PriceComparisonWidget globalProductId={(product as any).globalProductId} currentPrice={product.price} />
              </div>

              <div className="pt-6 border-t border-[var(--k-line)] flex flex-col gap-4">
                 <div className="flex items-center gap-4 text-[var(--k-ink-2)] text-[13px] font-medium bg-[var(--k-surface)] p-4 rounded-xl border border-[var(--k-line)] shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-[var(--k-hot)] flex items-center justify-center shrink-0">
                       <Truck size={16} />
                    </div>
                    <div>
                       <span className="block font-bold mb-0.5">Ücretsiz ve Hızlı Kargo</span>
                       <span className="text-[var(--k-ink-3)] text-[11px]">Saat 16:00'a kadar verilen siparişler aynı gün kargoda.</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-[var(--k-ink-2)] text-[13px] font-medium bg-[var(--k-surface)] p-4 rounded-xl border border-[var(--k-line)] shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[var(--k-surface-3)] text-[var(--k-ink-2)] flex items-center justify-center shrink-0">
                       <Lock size={16} />
                    </div>
                    <div>
                       <span className="block font-bold mb-0.5">Güvenli Ödeme</span>
                       <span className="text-[var(--k-ink-3)] text-[11px]">256-bit SSL şifreleme ile güvendesiniz.</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Recently Viewed — shows up once 2+ products have been viewed */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-16 relative z-10">
        <RecentlyViewed />
      </div>
    </div>
  );
}
