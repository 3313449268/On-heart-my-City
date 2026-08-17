import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'text-rose-500',
    iconBg: 'bg-rose-100',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-100',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    iconBg: 'bg-amber-100',
  },
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconClass = cn('w-5 h-5', toastStyles[type].icon);
  switch (type) {
    case 'success':
      return <CheckCircle className={iconClass} />;
    case 'error':
      return <AlertCircle className={iconClass} />;
    case 'info':
      return <Info className={iconClass} />;
    case 'warning':
      return <AlertTriangle className={iconClass} />;
  }
};

function ToastItemComponent({ toast, onClose }: { toast: ToastItem; onClose: (id: string) => void }) {
  const style = toastStyles[toast.type];

  useEffect(() => {
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in-down',
        style.bg,
        style.border
      )}
    >
      <div className={cn('flex-shrink-0 p-1 rounded-full', style.iconBg)}>
        <ToastIcon type={toast.type} />
      </div>
      <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-slate-200/50 transition-colors text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onClose }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
