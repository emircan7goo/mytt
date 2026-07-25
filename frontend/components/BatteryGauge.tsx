'use client';

interface BatteryGaugeProps {
  /** 0–100 yüzde değeri */
  percent: number;
  /** 'sm' → product card mini ring, 'md' → default, 'lg' → detail sayfası */
  size?: 'sm' | 'md' | 'lg';
  /** Yüzde sayısını göster */
  showLabel?: boolean;
  className?: string;
}

function getColor(pct: number): { stroke: string; glow: string; text: string } {
  if (pct >= 80) return { stroke: '#8B5CF6', glow: 'rgba(16,185,129,0.25)', text: '#7C3AED' };
  if (pct >= 65) return { stroke: '#F59E0B', glow: 'rgba(245,158,11,0.25)',  text: '#D97706' };
  return          { stroke: '#EF4444', glow: 'rgba(239,68,68,0.25)',   text: '#DC2626' };
}

const SIZE_MAP = {
  sm: { px: 36, stroke: 4,  font: 9,  subFont: 0 },
  md: { px: 52, stroke: 5,  font: 13, subFont: 8 },
  lg: { px: 72, stroke: 6,  font: 18, subFont: 10 },
};

export default function BatteryGauge({
  percent,
  size = 'md',
  showLabel = true,
  className = '',
}: BatteryGaugeProps) {
  const cfg = SIZE_MAP[size];
  const { stroke: strokeColor, glow, text: textColor } = getColor(percent);

  const r      = (cfg.px - cfg.stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(percent, 0), 100) / 100) * circ;
  const cx     = cfg.px / 2;
  const cy     = cfg.px / 2;

  return (
    <div
      className={`inline-flex flex-col items-center gap-0.5 ${className}`}
      title={`Pil Sağlığı: %${percent}`}
    >
      <svg
        width={cfg.px}
        height={cfg.px}
        viewBox={`0 0 ${cfg.px} ${cfg.px}`}
        style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={cfg.stroke}
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={cfg.stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Yüzde metni */}
        {showLabel && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColor}
            fontSize={cfg.font}
            fontWeight="700"
            fontFamily="inherit"
          >
            {percent}%
          </text>
        )}
      </svg>
      {size !== 'sm' && (
        <span
          style={{ fontSize: cfg.subFont, color: '#9CA3AF', fontWeight: 500, lineHeight: 1 }}
        >
          Pil
        </span>
      )}
    </div>
  );
}
