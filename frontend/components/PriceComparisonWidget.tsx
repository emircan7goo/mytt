'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Store, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import DealerTrustBadge from './DealerTrustBadge';

interface PriceComparisonWidgetProps {
  globalProductId: string;
  currentPrice: number;
}

export default function PriceComparisonWidget({ globalProductId, currentPrice }: PriceComparisonWidgetProps) {
  const [dealers, setDealers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!globalProductId) return;
    
    // We fetch the global product detail which encompasses dealer items
    const fetchDealers = async () => {
      try {
        const { data } = await apiClient.get(`/catalog/${globalProductId}`);
        // Filter out the current one if its price matches exactly (assuming unique, or just list all)
        // Sort by price
        const sorted = (data.dealerItems || []).sort((a: any, b: any) => Number(a.price) - Number(b.price));
        setDealers(sorted.slice(0, 3)); // Top 3
      } catch (error) {
        console.error('Failed to fetch dealer comparisons', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealers();
  }, [globalProductId]);

  if (isLoading || dealers.length <= 1) return null; // Don't show if there are no alternatives

  return (
    <div className="w-full bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] p-5 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-[var(--k-ink)] tracking-tight flex items-center gap-2">
          <Store size={16} /> Diğer Satıcılar
        </h3>
        <span className="text-[11px] text-[var(--k-ink-3)] font-medium">B2B Ekosistemi</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {dealers.map((dealerStock) => {
          const price = Number(dealerStock.price);
          const isCheaper = price < currentPrice;
          
          return (
            <div key={dealerStock.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--k-surface-2)] hover:bg-[var(--k-surface-3)] transition-colors border border-transparent hover:border-[var(--k-line)]">
               <div className="flex flex-col gap-1.5">
                 <DealerTrustBadge
                   rating={dealerStock.store?.rating}
                   reviewCount={dealerStock.store?.reviewCount}
                   isPremium={dealerStock.store?.isPremium}
                 />
                 <div className="flex gap-2 text-[11px] text-[var(--k-ink-3)] font-medium">
                   <span>Grade {dealerStock.grade}</span>
                   {dealerStock.warrantyMonths && <span>• {dealerStock.warrantyMonths} Ay Garanti</span>}
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                   <span className={`text-[14px] font-black tracking-tight ${isCheaper ? 'text-[var(--k-hot)]' : 'text-[var(--k-ink)]'}`}>
                     {price.toLocaleString('tr-TR')} <span className="text-[10px]">₺</span>
                   </span>
                 </div>
                 <Link href={`/product/${dealerStock.id}`} className="text-[var(--k-ink-4)] hover:text-[var(--k-ink)] transition-colors bg-[var(--k-surface)] p-1.5 rounded-full shadow-sm border border-[var(--k-line)]">
                    <ChevronRight size={14} strokeWidth={3} />
                 </Link>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
