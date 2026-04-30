"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, WarningCircle, Warning, X } from "@phosphor-icons/react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} weight="fill" className="text-[var(--color-success)]" />,
  error: <WarningCircle size={20} weight="fill" className="text-[var(--color-danger)]" />,
  warning: <Warning size={20} weight="fill" className="text-[var(--color-warning)]" />,
};

const bgMap: Record<ToastType, string> = {
  success: "bg-[var(--color-success-bg)]",
  error: "bg-[var(--color-danger-bg)]",
  warning: "bg-[var(--color-warning-bg)]",
};

// Toast provider wraps the app and renders active toasts
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container: fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)]
                shadow-lg border border-[var(--color-border)]
                max-w-sm
                ${bgMap[toast.type]}
              `}
            >
              {iconMap[toast.type]}
              <span className="text-sm text-[var(--color-text)] flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
