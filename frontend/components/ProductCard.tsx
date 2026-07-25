'use client';
import { Heart, Smartphone, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';
import SafeImage from '@/components/ui/SafeImage';
import BatteryGauge from '@/components/BatteryGauge';
import type { MockProduct, CosmeticGrade } from '@/lib/mock-data';
import { resolveUploadUrl } from '@/lib/resolveUrl';

const GRADE_BG: Record<CosmeticGrade, string> = {
  'A+': 'badge-metal-gold text-xs font-black tracking-widest',
  'A':  'badge-metal-silver text-xs font-black tracking-widest',
  'B':  'badge-metal-bronze text-xs font-black tracking-widest',
  'C':  'bg-slate-700 text-white text-xs font-black tracking-widest',
};

const GRADE_LABEL: Record<CosmeticGrade, string> = {
  'A+': 'A+ PREMIUM',
  'A':  'A EXCELLENT',
  'B':  'B GOOD',
  'C':  'C FAIR',
};

// ─────────────────────────────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--k-surface)] rounded-3xl border border-[var(--k-line)] w-full overflow-hidden shadow-sm">
      <div className="aspect-square w-full skeleton-wave" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-16 skeleton-wave rounded-full" />
        <div className="h-5 w-2/3 skeleton-wave rounded-full" />
        <div className="h-4 w-1/3 skeleton-wave rounded-full" />
        <div className="h-9 w-full skeleton-wave rounded-xl mt-1" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
interface ProductCardProps {
  product:    MockProduct;
  index:      number;
  isCompact?: boolean;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, openProductModal, openCart, user, toggleWishlist, isInWishlist } = useApp();
  const [hovered, setHovered] = useState(false);

  const inWishlist = isInWishlist?.(product.id);
  const discount   = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const isDealer    = user?.role === 'dealer';
  const dealerRate  = user?.commissionRate || 0.10;
  const displayPrice = isDealer
    ? product.price * (1 - dealerRate)
    : product.price;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product);
      toast.success(`Sepete Eklendi`, {
        description: `${product.brand} ${product.model}`,
        action: { label: 'Sepeti Aç', onClick: openCart },
        duration: 3000,
      });
    },
    [addToCart, openCart, product],
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'rotateX(0deg) rotateY(0deg)' });
  const [glareStyle, setGlareStyle] = useState({ transform: 'translate(-50%, -50%)', opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTiltStyle({ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)` });
    
    setGlareStyle({
      transform: `translate(${x}px, ${y}px)`,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTiltStyle({ transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });
    setGlareStyle({ transform: 'translate(50%, 50%)', opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group h-full tilt-card-wrapper"
    >
      <Link href={`/product/${product.id}`} className="block h-full">
        <div
          className="h-full flex flex-col bg-[var(--k-surface)] rounded-xl overflow-hidden transition-colors duration-300 border border-[var(--k-line)] tilt-card relative"
          style={{
            ...tiltStyle,
            boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          {/* Glare Effect */}
          <div 
            className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_50%)] pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300 -top-1/2 -left-1/2" 
            style={glareStyle}
          />
          {/* ── Image ── */}
          <div className="relative overflow-hidden bg-[var(--k-surface-2)] product-card-shine" style={{ aspectRatio: '1.05/1' }}>
            <SafeImage
              src={resolveUploadUrl(product.image)}
              alt={`${product.brand} ${product.model}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
              fallbackIcon={<Smartphone size={32} className="opacity-10 text-[var(--k-ink-4)]" />}
            />

            {/* Condition label */}
            {(product as any).condition !== 'NEW' ? (
              <div className="absolute top-2.5 left-2.5 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                {GRADE_LABEL[product.cosmeticGrade] ?? 'İkinci El'}
              </div>
            ) : (
              <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                Sıfır
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                -%{discount}
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
                toast.success(inWishlist ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', { duration: 2000 });
              }}
              className={`absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all bg-[var(--k-surface)] shadow-sm border border-[var(--k-line)] ${
                inWishlist ? 'text-red-500' : 'text-[var(--k-ink-4)] hover:text-red-500'
              }`}
              aria-label="Favorilere ekle"
            >
              <Heart size={13} className={inWishlist ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* ── Content ── */}
          <div className="flex flex-col flex-1 p-3.5 gap-1 bg-[var(--k-surface)]">
            <span className="text-[9px] font-bold text-[var(--k-ink-4)] uppercase tracking-wider">
              {product.brand}
            </span>

            <h3 className="text-xs font-bold text-[var(--k-ink)] line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.model}
            </h3>

            {/* Specs */}
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {product.storage && (
                <span className="text-[9px] font-semibold text-[var(--k-ink-3)] bg-[var(--k-surface-3)] px-1.5 py-0.5 rounded">
                  {product.storage}
                </span>
              )}
              {product.batteryHealth && (
                <span className="text-[9px] font-semibold text-[var(--k-ink-3)] bg-[var(--k-surface-3)] px-1.5 py-0.5 rounded">
                  Pil %{product.batteryHealth}
                </span>
              )}
            </div>

            <div className="flex-1 min-h-[12px]" />

            {/* Price & Action */}
            <div className="flex items-end justify-between pt-2 border-t border-[var(--k-line)]">
              <div>
                {discount > 0 && !isDealer && (
                  <span className="block text-[10px] text-[var(--k-ink-4)] line-through leading-none mb-0.5">
                    {product.originalPrice.toLocaleString('tr-TR')} ₺
                  </span>
                )}
                <span className="text-sm font-bold text-[var(--k-ink)] leading-none">
                  {displayPrice.toLocaleString('tr-TR')} <span className="text-[10px] font-semibold">₺</span>
                </span>
              </div>

              {/* Link Indicator Arrow */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:gap-2 transition-all">
                <span>İncele</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
