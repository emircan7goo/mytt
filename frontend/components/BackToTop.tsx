'use client';
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full text-white flex items-center justify-center border-2 border-[var(--k-line-2)] hover:scale-110 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{
        background: 'var(--brand)',
        boxShadow: 'var(--shadow-brand), 0 4px 12px rgba(0,0,0,0.15)',
      }}
      aria-label="Sayfanın başına dön"
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
  );
}
