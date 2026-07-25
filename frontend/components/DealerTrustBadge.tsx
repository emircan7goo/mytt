'use client';
import { Star, ShieldCheck, Award } from 'lucide-react';

interface DealerTrustBadgeProps {
  rating?: number | null;
  reviewCount?: number | null;
  isPremium?: boolean;
  jobsCompleted?: number | null;
  size?: 'sm' | 'md';
}

/**
 * Satıcı kimliği hiçbir zaman gösterilmez — sadece güven sinyalleri.
 * Mytt komisyoncu modelinde alıcı ve satıcı birbirini görmez.
 */
export default function DealerTrustBadge({
  rating,
  reviewCount,
  isPremium,
  jobsCompleted,
  size = 'sm',
}: DealerTrustBadgeProps) {
  const text = size === 'sm' ? 'text-[11px]' : 'text-[12.5px]';

  return (
    <div className={`flex items-center gap-2 flex-wrap ${text}`}>
      <span className="inline-flex items-center gap-1 font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
        <ShieldCheck size={12} strokeWidth={2.5} /> Doğrulanmış Satıcı
      </span>

      {typeof rating === 'number' && rating > 0 && (
        <span className="inline-flex items-center gap-1 font-semibold text-zinc-600">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
          {typeof reviewCount === 'number' && reviewCount > 0 && (
            <span className="text-zinc-400 font-medium">({reviewCount})</span>
          )}
        </span>
      )}

      {isPremium && (
        <span className="inline-flex items-center gap-1 font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide text-[10px]">
          <Award size={11} /> Premium Bayi
        </span>
      )}

      {typeof jobsCompleted === 'number' && jobsCompleted > 0 && (
        <span className="text-zinc-400 font-medium">{jobsCompleted}+ satış tamamlandı</span>
      )}
    </div>
  );
}
