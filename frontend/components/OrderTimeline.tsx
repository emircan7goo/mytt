'use client';
import {
  CreditCard, PackageCheck, FlaskConical, Truck,
  CheckCircle2, Clock,
} from 'lucide-react';
import { type OrderStep, ORDER_TIMELINE } from '@/lib/mock-data';

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard, PackageCheck, FlaskConical, Truck,
};

interface OrderTimelineProps {
  currentStep: OrderStep;
  compact?:    boolean; // Para usar en cards compactas
}

const STEP_ORDER: OrderStep[] = [
  'payment_received',
  'ops_received',
  'testing',
  'shipped',
];

export default function OrderTimeline({ currentStep, compact = false }: OrderTimelineProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <div className={compact ? 'space-y-0' : 'space-y-0'}>
      {ORDER_TIMELINE.map((step, idx) => {
        const isDone    = idx < currentIdx;
        const isActive  = idx === currentIdx;
        const isPending = idx > currentIdx;

        const Icon      = ICON_MAP[step.icon] ?? Clock;
        const iconState = isDone ? 'done' : isActive ? 'active' : 'pending';

        return (
          <div
            key={step.step}
            className={`timeline-step ${isDone ? 'completed' : ''}`}
          >
            {/* Icon bubble */}
            <div className={`timeline-icon ${iconState}`}>
              {isDone
                ? <CheckCircle2 size={18} strokeWidth={2.5} />
                : <Icon size={18} strokeWidth={2} />
              }
            </div>

            {/* Content */}
            <div className="pt-1.5 pb-1 min-w-0 flex-1">
              <p className={`font-bold text-sm leading-tight
                ${isDone    ? 'text-emerald-700' : ''}
                ${isActive  ? 'text-slate-900'   : ''}
                ${isPending ? 'text-slate-400'   : ''}
              `}>
                {step.label}
                {isActive && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
                    AKTIF
                  </span>
                )}
              </p>
              {!compact && (
                <p className={`text-xs font-medium mt-1 leading-relaxed
                  ${isDone    ? 'text-emerald-600/80' : ''}
                  ${isActive  ? 'text-slate-500'       : ''}
                  ${isPending ? 'text-slate-300'       : ''}
                `}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
