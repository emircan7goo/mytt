'use client';
import { useState, useEffect } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';

// ── Constants ─────────────────────────────────────────────────────────────────
const LS_KEY  = 'mytt-viewed';
const MAX_IDS = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────
function readIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_IDS) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids.slice(0, MAX_IDS)));
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
}

// ── Exported hook: call on any product detail page ────────────────────────────
export function useTrackView(productId: string): void {
  useEffect(() => {
    if (!productId) return;
    const current = readIds();
    // Deduplicate — newest first
    const next = [productId, ...current.filter((id) => id !== productId)].slice(
      0,
      MAX_IDS
    );
    writeIds(next);
  }, [productId]);
}

// ── Default export: section component ────────────────────────────────────────
export default function RecentlyViewed() {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [mounted, setMounted]     = useState(false);

  // Read localStorage only on the client after hydration
  useEffect(() => {
    setViewedIds(readIds());
    setMounted(true);
  }, []);

  // Fetch all products; filter client-side by viewed IDs
  const { data: allProducts, isLoading } = useProducts();

  // Don't render until mounted (avoids SSR/hydration mismatch)
  if (!mounted) return null;

  // Need at least 2 viewed products to show the section
  if (viewedIds.length < 2) return null;

  // Filter and preserve the recency order from localStorage
  const viewedProducts =
    allProducts
      ?.filter((p) => viewedIds.includes(p.id))
      .sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id)) ?? [];

  // If we are still loading and have IDs, show skeletons
  const showSkeletons = isLoading && viewedIds.length >= 2;

  if (!showSkeletons && viewedProducts.length < 2) return null;

  return (
    <section
      aria-labelledby="recently-viewed-title"
      className="py-8 bg-[var(--bg)]"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <h2
          id="recently-viewed-title"
          className="text-[22px] font-bold text-zinc-900 tracking-tight mb-5"
        >
          Son Baktıklarınız
        </h2>

        {/* Horizontal scroll list */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {showSkeletons
            ? viewedIds.map((id) => (
                <div
                  key={id}
                  className="shrink-0 w-[200px] sm:w-[220px] snap-start"
                >
                  <ProductCardSkeleton />
                </div>
              ))
            : viewedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="shrink-0 w-[200px] sm:w-[220px] snap-start"
                >
                  <ProductCard
                    product={product as any}
                    index={index}
                    isCompact
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
