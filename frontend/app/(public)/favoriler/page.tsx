'use client';

import Link from 'next/link';
import { Heart, ArrowRight, X, Smartphone } from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { parseFamilyFavoriteId } from '@/lib/familyFavorite';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

function hrefFor(item: { id: string; brand?: string; model?: string }): string {
  const fam = parseFamilyFavoriteId(item.id);
  if (fam) return `/urun/${encodeURIComponent(fam.brand)}/${encodeURIComponent(fam.model)}`;
  return `/product/${item.id}`;
}

export default function FavorilerPage() {
  const { wishlist, toggleWishlist } = useApp();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
        <div className="max-w-[900px] mx-auto bg-[var(--k-surface)] p-8 md:p-12 rounded-3xl border border-[var(--k-line)] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--k-hot-wash)] text-[var(--k-hot)] flex items-center justify-center mx-auto border border-[var(--k-line-hot)]">
            <Heart size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[var(--k-ink)]">Favori Listeniz Henüz Boş</h1>
            <p className="text-[var(--k-ink-3)] text-sm font-medium">
              Beğendiğiniz cihazları kalbe tıklayarak favorilerinize ekleyebilirsiniz.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--k-hot)] hover:bg-[var(--k-hot-deep)] text-[var(--k-hot-ink)] font-black text-xs shadow-md transition-all"
          >
            <span>Ürünleri İncele</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-10 px-4 lg:px-8">
      <div className="max-w-[1100px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[var(--k-hot-wash)] text-[var(--k-hot)] flex items-center justify-center border border-[var(--k-line-hot)]">
            <Heart size={22} className="fill-[var(--k-hot)]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--k-ink)] leading-none">Favorilerim</h1>
            <p className="text-[var(--k-ink-3)] text-sm font-medium mt-1">{wishlist.length} cihaz</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {wishlist.map((item) => {
            const img = item.image ? resolveUploadUrl(item.image) : null;
            return (
              <Link
                key={item.id}
                href={hrefFor(item)}
                className="group relative flex flex-col rounded-2xl bg-[var(--k-surface)] border border-[var(--k-line)] p-3.5 shadow-xs hover:shadow-xl hover:border-[var(--k-line-hot)] transition-all duration-300 hover:-translate-y-1"
              >
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item); }}
                  title="Favorilerden çıkar"
                  aria-label="Favorilerden çıkar"
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[var(--k-canvas)] border border-[var(--k-line)] flex items-center justify-center text-[var(--k-ink-4)] hover:text-[var(--k-hot)] transition-colors shadow-sm"
                >
                  <X size={15} />
                </button>

                <div className="w-full aspect-square bg-[var(--k-hot-wash)]/40 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3">
                  {img ? (
                    <img src={img} alt={`${item.brand} ${item.model}`} loading="lazy" className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <Smartphone size={34} strokeWidth={1.5} className="text-[var(--k-hot)]" />
                  )}
                </div>

                <div className="text-[11px] font-black text-[var(--k-hot)]/80 uppercase tracking-wider">{item.brand}</div>
                <h3 className="font-extrabold text-sm text-[var(--k-ink)] line-clamp-2 leading-snug group-hover:text-[var(--k-hot)] transition-colors">{item.model}</h3>
                {typeof item.price === 'number' && item.price > 0 && (
                  <div className="mt-2 text-lg font-black text-[var(--k-hot)] leading-none">
                    {fmt(item.price)} <span className="text-xs">₺</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
