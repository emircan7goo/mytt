'use client';
/**
 * ErrorBoundary.tsx — Yeniden kullanılabilir React class error boundary.
 *
 * Kullanım:
 *   <ErrorBoundary fallback={<div>Hata oluştu</div>}>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 *
 * veya varsayılan fallback ile:
 *   <ErrorBoundary>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
  onError?:  (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    // Custom fallback
    if (this.props.fallback) return this.props.fallback;

    // Varsayılan fallback UI
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-red-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-zinc-900 font-semibold text-base mb-1">
          Bu bölüm yüklenemedi
        </h3>
        <p className="text-zinc-400 text-sm mb-5 max-w-xs">
          Geçici bir hata oluştu. Tekrar deneyebilir ya da sayfayı yenileyebilirsiniz.
        </p>
        {process.env.NODE_ENV !== 'production' && this.state.error && (
          <pre className="text-[10px] text-left text-red-400 bg-red-50 border border-red-100 rounded-lg p-3 max-w-full overflow-auto mb-4 max-h-32">
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={this.reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          <RefreshCw size={14} />
          Tekrar Dene
        </button>
      </div>
    );
  }
}
