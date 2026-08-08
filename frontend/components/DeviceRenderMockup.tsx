import React from 'react';

interface Props {
  brand: string;
  model: string;
  className?: string;
}

export default function DeviceRenderMockup({ brand, model, className = 'w-full h-full' }: Props) {
  const bLower = (brand || '').toLowerCase();
  const mLower = (model || '').toLowerCase();

  const isApple = bLower.includes('apple') || mLower.includes('iphone');
  const isPro = mLower.includes('pro') || mLower.includes('max') || mLower.includes('ultra');

  // Gradient colors based on brand
  const getColors = () => {
    if (isApple) {
      if (mLower.includes('natural') || mLower.includes('titanium')) return ['#484743', '#8A8780', '#D1CEBD'];
      if (mLower.includes('gold') || mLower.includes('altın')) return ['#594C38', '#A38F70', '#E5D6BD'];
      if (mLower.includes('mor') || mLower.includes('deep purple')) return ['#32283C', '#68597A', '#B5A5C7'];
      if (mLower.includes('mavi') || mLower.includes('blue')) return ['#1E2C3A', '#4A6278', '#9BB4CC'];
      return ['#1F2124', '#43464B', '#92969C'];
    }
    if (bLower.includes('samsung')) {
      if (mLower.includes('mürdüm') || mLower.includes('violet')) return ['#3A2436', '#724B6B', '#C9A3C2'];
      if (mLower.includes('yeşil') || mLower.includes('green')) return ['#1F332A', '#426353', '#8CB39E'];
      return ['#121624', '#2C344E', '#6B7A9E'];
    }
    if (bLower.includes('xiaomi') || bLower.includes('poco') || bLower.includes('redmi')) {
      return ['#3B1F0E', '#8C461B', '#E58340'];
    }
    return ['#1A222D', '#3B4A5C', '#7B8EA5'];
  };

  const [bgDark, bgMid, bgLight] = getColors();

  return (
    <div className={`relative flex items-center justify-center p-3 select-none ${className}`}>
      {/* Dynamic Ambient Backlight Glow */}
      <div
        className="absolute inset-2 rounded-2xl blur-xl opacity-30 transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${bgLight} 0%, transparent 70%)` }}
      />

      {/* Smartphone Chassis Vector */}
      <div className="relative w-full h-full max-w-[170px] max-h-[220px] aspect-[9/18] rounded-[28px] p-1.5 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1"
           style={{
             background: `linear-gradient(145deg, ${bgMid} 0%, ${bgDark} 100%)`,
             boxShadow: `0 12px 30px -8px rgba(0,0,0,0.6), inset 0 1px 1px ${bgLight}40`
           }}>
        
        {/* Outer Metal Frame Border */}
        <div className="relative w-full h-full rounded-[24px] bg-[#0A0C10] overflow-hidden border border-white/10 flex flex-col items-center justify-between p-2">

          {/* Screen Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-20" />

          {/* Top Notch / Dynamic Island / Punch Hole */}
          <div className="relative z-30 flex items-center justify-center w-full pt-1">
            {isApple ? (
              <div className="w-14 h-3.5 bg-black rounded-full border border-white/10 flex items-center justify-end px-1.5 gap-1 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-[#111A2E] border border-blue-900/50" />
                <div className="w-1 h-1 rounded-full bg-[#090F1B]" />
              </div>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-black border border-white/20 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#111A2E]" />
              </div>
            )}
          </div>

          {/* Screen Content Graphics (Minimalist Luxury Wallpaper) */}
          <div className="relative w-full flex-1 my-1.5 rounded-[18px] overflow-hidden bg-gradient-to-b from-[#121622] via-[#0D1019] to-[#08090D] border border-white/5 flex flex-col items-center justify-center p-3 text-center">
            
            {/* Ambient Graphic Lines */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            
            {/* Brand Logo Watermark */}
            <div className="relative z-10 font-black tracking-widest text-[11px] uppercase opacity-75 text-white/90 drop-shadow-md">
              {brand}
            </div>

            {/* Model Name */}
            <div className="relative z-10 text-[13px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mt-0.5 max-w-[120px] truncate">
              {model}
            </div>

            {/* Premium Badge Icon */}
            <div className="relative z-10 mt-2 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[9px] font-extrabold text-amber-300 flex items-center gap-1 shadow-xs">
              <span>✦ MYTT YETKİLİ</span>
            </div>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-12 h-1 bg-white/30 rounded-full mb-0.5 z-30" />
        </div>
      </div>
    </div>
  );
}
