import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import type { ToastType } from '@/store/ui.store';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-navy text-white',
};

export function Toaster() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-float',
            'animate-slide-in-right pointer-events-auto max-w-sm',
            styles[t.type]
          )}
        >
          <span className="shrink-0">{icons[t.type]}</span>
          <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
