'use client';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title:       string;
  value:       string;
  subtitle?:   string;
  trend?:      number;  // % change (positive = up, negative = down)
  trendLabel?: string;
  accent:      string;  // CSS color
  icon:        React.ReactNode;
  large?:      boolean;
}

export default function MetricCard({ title, value, subtitle, trend, trendLabel, accent, icon, large }: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent}22`,
      borderRadius: '16px',
      padding: large ? '28px 32px' : '22px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}55`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}22`; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Glow bg */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px',
        background: `radial-gradient(ellipse at top left, ${accent}0a 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span style={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {title}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          background: `${accent}18`, border: `1px solid ${accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{
        fontSize: large ? '36px' : '28px', fontWeight: 800, color: '#f8fafc',
        letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '8px',
      }}>
        {value}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {trend !== undefined && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '12px', fontWeight: 700,
            color: isPositive ? '#8B5CF6' : '#ef4444',
          }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
        {(subtitle || trendLabel) && (
          <span style={{ color: 'rgba(248,250,252,0.35)', fontSize: '12px' }}>
            {trendLabel || subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
