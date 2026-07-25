'use client';
import {
  X, ShoppingCart, ChevronLeft, ChevronRight, ShieldCheck,
  Star, Zap, Lock, ArrowRight, BadgeCheck, CreditCard,
  CheckCircle2, Heart, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import BatteryGauge from '@/components/BatteryGauge';
import { GRADE_LABELS, type CosmeticGrade } from '@/lib/mock-data';

const gradeClass: Record<CosmeticGrade, string> = {
  'A+': 'bg-violet-500 text-white',
  'A':  'bg-[#8B5CF6] text-white',
  'B':  'bg-[#3B82F6] text-white',
  'C':  'bg-[#F59E0B] text-white',
};

function TestValueTag({ value }: { value: string | number | boolean }) {
  if (typeof value === 'boolean') {
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${value ? 'bg-violet-100 text-violet-700' : 'bg-red-100 text-red-600'}`}>
        {value ? '✓ Başarılı' : '✗ Sorunlu'}
      </span>
    );
  }
  if (typeof value === 'number') {
    const colorClass = value >= 90
      ? 'bg-violet-100 text-violet-700'
      : value >= 80
        ? 'bg-amber-100 text-amber-600'
        : 'bg-red-100 text-red-600';
    return <span className={`px-2 py-1 rounded-[6px] text-[10px] font-black ${colorClass}`}>%{value}</span>;
  }
  return <span className="px-2 py-1 rounded-[6px] text-[10px] font-black uppercase bg-slate-100 text-slate-600">{value}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProductDetailModal() {
  const {
    showProductModal, closeProductModal, activeProduct,
    addToCart, openCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare
  } = useApp();

  const [activeImg,  setActiveImg]  = useState(0);
  const [justAdded,  setJustAdded]  = useState(false);

  const handleAddToCart = useCallback(() => {
    if (!activeProduct) return;

    addToCart(activeProduct);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);

    toast.success(`🛒 Sepete Eklendi!`, {
      description: `${activeProduct.brand} ${activeProduct.model} — ${activeProduct.price.toLocaleString('tr-TR')} ₺`,
      action: {
        label: 'Sepeti Aç',
        onClick: () => { closeProductModal(); openCart(); },
      },
      duration: 4000,
    });
  }, [activeProduct, addToCart, closeProductModal, openCart]);

  // Modal only renders when showProductModal is true and activeProduct exists
  if (!activeProduct) return null;
  
  const inWishlist = isInWishlist?.(activeProduct.id);
  const inCompare = isInCompare?.(activeProduct.id);

  const discount = Math.round((1 - activeProduct.price / activeProduct.originalPrice) * 100);
  const isCrazyDiscount = discount > 20;
  const images = activeProduct.images?.length ? activeProduct.images : [activeProduct.image];

  return (
    <AnimatePresence>
      {showProductModal && (
        <>
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200]"
            onClick={closeProductModal}
          />
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[95vh] overflow-y-auto z-[201] hide-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 md:p-10">

              {/* Header / Breadcrumb */}
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[13px] font-medium">
                  <button onClick={closeProductModal} className="hover:text-slate-900 transition-colors font-bold">Ana Sayfa</button>
                  <ChevronRight size={14} strokeWidth={3} className="text-slate-300" />
                  <span className="hover:text-slate-700 cursor-pointer text-slate-500 font-medium">{activeProduct.brand}</span>
                  <ChevronRight size={14} strokeWidth={3} className="text-slate-300" />
                  <span className="text-slate-900 font-black">{activeProduct.model}</span>
                </div>
                <button
                  onClick={closeProductModal}
                  aria-label="Modalı kapat"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">

                {/* ── Gallery ── */}
                <div className="flex flex-col gap-4">
                  <div className="relative aspect-square bg-[#F8FAFC] rounded-[24px] flex items-center justify-center p-8 border border-slate-100">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImg}
                        src={resolveUploadUrl(images[activeImg])}
                        alt={activeProduct.model}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]"
                      />
                    </AnimatePresence>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                          aria-label="Önceki resim"
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-slate-800 shadow-md rounded-full border border-slate-100 flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                          aria-label="Sonraki resim"
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-slate-800 shadow-md rounded-full border border-slate-100 flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <ChevronRight size={24} strokeWidth={2.5} />
                        </button>
                      </>
                    )}

                    {/* Thumbnail dots */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`w-2 h-2 rounded-full transition-all ${ i === activeImg ? 'bg-slate-900 w-5' : 'bg-slate-300' }`}
                          />
                        ))}
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="absolute top-4 right-4 bg-[#EF4444] text-white text-[14px] font-black px-4 py-2 rounded-xl shadow-lg rotate-3 z-30">
                        %{discount} İNDİRİM
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-6 text-[13px] font-black text-slate-700 bg-slate-100 py-4 rounded-[20px]">
                    <span className="flex items-center gap-2 text-slate-800">
                      <ShieldCheck size={18} className="text-[#8B5CF6]" strokeWidth={3} /> 6 Ay Garantili
                    </span>
                    <span className="flex items-center gap-2 text-slate-800">
                      <Lock size={18} className="text-blue-600" strokeWidth={3} /> %100 Güvenli Ödeme
                    </span>
                  </div>
                </div>

                {/* ── Details ── */}
                <div className="flex flex-col">
                  <div className="mb-6">
                    <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {activeProduct.brand}
                    </p>
                    <h2 className="font-heading font-black text-slate-900 text-[28px] sm:text-[36px] md:text-[44px] leading-tight mb-4">
                      {activeProduct.model}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-4 py-2 rounded-xl text-[12px] font-black uppercase shadow-sm ${gradeClass[activeProduct.cosmeticGrade as CosmeticGrade]}`}>
                        {GRADE_LABELS[activeProduct.cosmeticGrade as CosmeticGrade]}
                      </span>
                      {activeProduct.isHot && (
                        <span className="flex items-center gap-1.5 bg-slate-900 text-amber-400 text-[12px] font-black px-4 py-2 rounded-xl shadow-sm">
                          <Zap size={14} fill="currentColor" strokeWidth={2.5} /> GÖZDE CİHAZ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-8 bg-amber-50 self-start px-4 py-2 rounded-xl border border-amber-100">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" strokeWidth={2} />
                    ))}
                    <span className="text-[14px] font-black text-amber-700 ml-1">4.8</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200 mx-2" />
                    <span className="flex items-center gap-1 font-bold text-amber-700 text-[13px]">
                      <BadgeCheck size={16} strokeWidth={2.5} className="text-violet-500" /> Mytt Onaylı
                    </span>
                  </div>

                  {/* Fiyat — düzeltilmiş tipografi */}
                  <div className="flex items-baseline gap-2 mb-8">
                    {discount > 0 && (
                      <span className="text-[18px] font-medium text-slate-400 line-through decoration-slate-300">
                        {activeProduct.originalPrice.toLocaleString('tr-TR')} ₺
                      </span>
                    )}
                    <span className={`font-heading font-black text-[52px] tracking-tighter leading-none ${isCrazyDiscount ? 'text-[#8B5CF6]' : 'text-[#EF4444]'}`}>
                      {activeProduct.price.toLocaleString('tr-TR')}
                      <span className="text-[28px] align-baseline ml-1 font-bold">₺</span>
                    </span>
                  </div>

                  {/* Quick Specs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {/* Hafıza */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Hafıza</p>
                      <p className="text-slate-900 font-bold text-[16px] mt-1 line-clamp-1">{activeProduct.storage}</p>
                    </div>

                    {/* Pil */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">Pil Sağlığı</p>
                      <div className="flex items-center gap-2">
                        <BatteryGauge percent={activeProduct.batteryHealth} size="sm" showLabel={true} />
                        <span className="text-slate-900 font-bold text-[14px]">%{activeProduct.batteryHealth}</span>
                      </div>
                    </div>

                    {/* Kargo */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Kargo</p>
                      <p className="text-slate-900 font-bold text-[16px] mt-1 line-clamp-1">Ücretsiz</p>
                    </div>

                    {/* Stok */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center flex flex-col justify-center items-center">
                      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Stok</p>
                      <p className="text-slate-900 font-bold text-[16px] mt-1 line-clamp-1">
                        {activeProduct.inStock ? `${activeProduct.stockCount} Adet` : 'Tükendi'}
                      </p>
                    </div>
                  </div>

                  {/* Test Report badges */}
                  {activeProduct.testReport && (
                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        47 Nokta Test Raporu
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {Object.entries(activeProduct.testReport)
                          .filter(([k]) => k !== 'testedAt')
                          .map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                              <span className="text-slate-600 text-[12px] font-bold capitalize">
                                {key === 'faceId'    ? 'Face ID'   :
                                 key === 'touchId'   ? 'Touch ID'  :
                                 key === 'cellular'  ? '5G/LTE'    :
                                 key === 'charging'  ? 'Şarj'      :
                                 key === 'battery'   ? 'Batarya'   :
                                 key === 'screen'    ? 'Ekran'     :
                                 key === 'camera'    ? 'Kamera'    :
                                 key === 'speakers'  ? 'Hoparlör'  :
                                 key === 'wifi'      ? 'Wi-Fi'     : key}
                              </span>
                              <TestValueTag value={val} />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex flex-col mt-auto pb-4 gap-3">
                    <div className="flex items-center gap-2 justify-center pb-2">
                      <CreditCard size={20} className="text-blue-500" strokeWidth={2.5} />
                      <span className="font-bold text-slate-500 text-[14px]">Kartla Vade Farksız 12 Ay Taksit!</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(activeProduct); toast.success(inWishlist ? "Favorilerden Çıkarıldı" : "Favorilere Eklendi", { duration: 2000 })}}
                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all border-2 border-slate-100 bg-white hover:bg-slate-50 ${inWishlist ? 'text-rose-500 border-rose-100' : 'text-slate-400 hover:text-slate-900'}`}
                        aria-label="Favorilere ekle"
                      >
                        <Heart size={24} strokeWidth={inWishlist ? 3 : 2.5} className={inWishlist ? "fill-rose-500" : ""} />
                      </button>

                      <button
                        id={`modal-add-cart-${activeProduct.id}`}
                        onClick={handleAddToCart}
                        disabled={!activeProduct.inStock}
                        aria-label="Sepete ekle"
                        className={`flex-1 flex items-center justify-center gap-3 py-4 text-[18px] font-black rounded-[20px] transition-all ${activeProduct.inStock ? 'vibrant-btn-main' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' }`}
                      >
                        <AnimatePresence mode="wait">
                          {justAdded ? (
                            <motion.span
                              key="added"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 size={22} /> Eklendi!
                            </motion.span>
                          ) : (
                            <motion.span
                              key="add"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart size={22} strokeWidth={2.5} />
                              {activeProduct.inStock ? 'Hemen Sepete Ekle' : 'Stok Tükendi'}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(activeProduct); toast.success(inCompare ? "Karşılaştırmadan Çıkarıldı" : "Karşılaştırmaya Eklendi", { duration: 2000 })}}
                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all border-2 border-slate-100 bg-white hover:bg-slate-50 ${inCompare ? 'text-indigo-600 border-indigo-100' : 'text-slate-400 hover:text-slate-900'}`}
                        aria-label="Karşılaştırmaya ekle"
                      >
                        <BarChart2 size={24} strokeWidth={2.5} />
                      </button>
                    </div>

                    {activeProduct.inStock && (
                      <button
                        onClick={() => { handleAddToCart(); closeProductModal(); openCart(); }}
                        className="btn-enterprise w-full py-3.5 flex items-center justify-center gap-2"
                      >
                        Hızlı Satın Al <ArrowRight size={18} strokeWidth={3} />
                      </button>
                    )}

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-4 flex-wrap pt-1">
                      {[
                        { icon: '💳', label: '12 Taksit' },
                        { icon: '🚚', label: 'Aynı Gün Kargo' },
                        { icon: '🔒', label: 'Güvenli Ödeme' },
                        { icon: '🛡️', label: '6 Ay Garanti' },
                      ].map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                          <span className="text-[14px]">{icon}</span>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
