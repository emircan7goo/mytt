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
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Store size={16} /> Diğer Satıcılar
        </h3>
        <span className="text-[11px] text-gray-500 font-medium">B2B Ekosistemi</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {dealers.map((dealerStock) => {
          const price = Number(dealerStock.price);
          const isCheaper = price < currentPrice;
          
          return (
            <div key={dealerStock.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
               <div className="flex flex-col gap-1.5">
                 <DealerTrustBadge
                   rating={dealerStock.store?.rating}
                   reviewCount={dealerStock.store?.reviewCount}
                   isPremium={dealerStock.store?.isPremium}
                 />
                 <div className="flex gap-2 text-[11px] text-gray-500 font-medium">
                   <span>Grade {dealerStock.grade}</span>
                   {dealerStock.warrantyMonths && <span>• {dealerStock.warrantyMonths} Ay Garanti</span>}
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                   <span className={`text-[14px] font-black tracking-tight ${isCheaper ? 'text-orange-600' : 'text-gray-900'}`}>
                     {price.toLocaleString('tr-TR')} <span className="text-[10px]">₺</span>
                   </span>
                 </div>
                 <Link href={`/product/${dealerStock.id}`} className="text-gray-400 hover:text-black transition-colors bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
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
