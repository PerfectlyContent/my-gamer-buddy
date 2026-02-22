import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';
import { playSound, triggerHaptic } from '@/lib/sounds';

// ---- Types ----

type ToastVariant = 'default' | 'success' | 'error' | 'achievement';

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

// ---- Context ----

const ToastContext = createContext<ToastContextValue | null>(null);

// ---- Hook ----

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ---- Icons ----

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// ---- Single Toast ----

interface ToastItemProps {
  data: ToastData;
  onDismiss: (id: string) => void;
}

const variantAccent: Record<ToastVariant, string> = {
  default: '',
  success: 'border-l-2 border-l-gaming-green shadow-[inset_2px_0_8px_rgba(57,255,20,0.15)]',
  error: 'border-l-2 border-l-gaming-red shadow-[inset_2px_0_8px_rgba(255,51,51,0.15)]',
  achievement: 'border border-yellow-500/50 shadow-[0_0_24px_rgba(234,179,8,0.2)]',
};

const ToastItem: React.FC<ToastItemProps> = ({ data, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Trigger slide-in on next frame
    const raf = requestAnimationFrame(() => setVisible(true));

    timerRef.current = setTimeout(() => {
      setVisible(false);
      // Wait for exit animation before removing
      setTimeout(() => onDismiss(data.id), 300);
    }, 4000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timerRef.current);
    };
  }, [data.id, onDismiss]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onDismiss(data.id), 300);
  };

  const variant = data.variant ?? 'default';

  const icon =
    variant === 'achievement' ? (
      <TrophyIcon className="w-5 h-5 text-yellow-400 shrink-0" />
    ) : variant === 'success' ? (
      <CheckIcon className="w-5 h-5 text-gaming-green shrink-0" />
    ) : variant === 'error' ? (
      <XCircleIcon className="w-5 h-5 text-gaming-red shrink-0" />
    ) : null;

  return (
    <div
      className={cn(
        'pointer-events-auto w-80 glass-strong rounded-xl p-4 shadow-2xl',
        'transition-all duration-300 ease-out',
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        variantAccent[variant]
      )}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-semibold text-gaming-text',
              variant === 'achievement' &&
                'text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]'
            )}
          >
            {data.title}
          </p>
          {data.description && (
            <p className="mt-1 text-xs text-gaming-muted leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 text-gaming-muted hover:text-gaming-text transition-colors"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ---- Provider ----

let idCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((input: ToastInput) => {
    const id = `toast-${++idCounter}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...input, id }]);
    if (input.variant === 'achievement') {
      playSound('complete');
      triggerHaptic('achievement');
    } else {
      playSound('notification');
      triggerHaptic('tap');
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {ReactDOM.createPortal(
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} data={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';
