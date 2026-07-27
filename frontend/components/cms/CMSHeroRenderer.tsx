'use client';
import { useCMSStore, BentoBlock } from '@/store/cmsStore';
import { useApp } from '@/providers/AppProvider';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function CMSHeroRenderer() {
  const { config } = useCMSStore();
  const { openProductModal } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pick the first block setup as our hero
  const block = config.blocks.find(b => b.type === 'hero-main');
  
  if (!mounted || !block) return null;

  if (!block.visibility.desktop) return null;

  // Cinematic Entrance Variants
  const getVariants = () => {
    switch(block.animation.entranceVariant) {
      case 'fade': return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.5 } } };
      case 'slide-up': return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 1.2 } } };
      case 'zoom-in': return { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.5 } } };
      default: return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1.2 } } };
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={getVariants()}
      className="relative w-full min-h-[100svh] sm:min-h-[90vh] flex flex-col justify-center overflow-hidden bg-[var(--k-canvas)] mt-0 pt-16 sm:pt-20"
    >
      {/* Deep Space / Studio Lighting Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] rounded-full bg-[var(--k-surface-3)] blur-[100px] mix-blend-multiply opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[var(--k-surface-3)] blur-[120px] mix-blend-multiply opacity-40" />
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between min-h-[80vh] px-5 sm:px-8 md:px-16 lg:px-24 gap-8 py-10 lg:py-0">
        
        {/* Floating Badge (Glassmorphism) — hidden on small mobile */}
        {block.badge.active && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden sm:block absolute px-5 py-2 font-bold text-[10px] uppercase tracking-widest rounded-full backdrop-blur-xl bg-[rgba(255,255,255,0.92)] text-[var(--k-ink)] border border-[var(--k-line)] z-30 shadow-sm"
            style={{ 
              left: `${block.badge.xPercent}%`, 
              top: `${block.badge.yPercent}%`, 
            }}
          >
            {block.badge.text}
          </motion.div>
        )}

        {/* ── TEXT CONTENT (LEFT) ── */}
        <div className="relative z-20 w-full lg:w-[55%] flex flex-col justify-center space-y-5 sm:space-y-8 order-2 lg:order-1">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="font-heading tracking-tight leading-[0.95] text-[var(--k-ink)] font-thin break-words"
            style={{ 
              fontSize: 'clamp(2.5rem, 7vw, 120px)',
            }}
          >
            {block.typography.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-[16px] sm:text-[20px] lg:text-[24px] font-medium max-w-[95%] sm:max-w-[85%] leading-relaxed text-[var(--k-ink-2)]"
          >
            {block.typography.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="pt-4 sm:pt-8"
          >
            <button 
              className={`group inline-flex items-center justify-between gap-4 min-w-[180px] sm:min-w-[220px] px-6 sm:px-8 py-4 sm:py-5 rounded-[24px] backdrop-blur-xl bg-[var(--k-surface)] border-2 border-[var(--k-line)] font-black text-[13px] sm:text-[15px] tracking-widest uppercase text-[var(--k-ink)] transition-all duration-500 hover:bg-zinc-900 hover:text-white shadow-sm hover:shadow-md ${block.cta.isMagnetic ? 'hover:scale-105 active:scale-95' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = block.cta.href && block.cta.href !== '#' ? block.cta.href : '/';
              }}
            >
              <span>{block.cta.text}</span>
              <ArrowRight size={18} strokeWidth={2} className="text-[var(--k-ink)] group-hover:text-white transition-colors shrink-0" />
            </button>
          </motion.div>
        </div>

        {/* ── CINEMATIC PRODUCT IMAGE (RIGHT) ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[320px] sm:max-w-full lg:w-[45%] flex items-center justify-center mx-auto lg:mx-0 p-4 lg:p-12 pointer-events-none z-10 order-1 lg:order-2"
        >
          {/* Glass halo effect behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--k-surface-3)] blur-[60px] rounded-full mix-blend-multiply" />
          
          <img 
            src={block.image.src} 
            alt="Hero Feature" 
            className="w-full h-auto max-h-[350px] sm:max-h-[500px] lg:max-h-[85vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.05)] filter brightness-[1.05] contrast-[1.05]"
            style={{
              filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.1)) drop-shadow(0 0 20px rgba(0,0,0,0.05))',
            }}
          />
        </motion.div>

      </div>
    </motion.div>
  );
}
