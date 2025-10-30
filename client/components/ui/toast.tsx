"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
};

type ToastContextValue = {
  showToast: (message: string, type?: Toast["type"], duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = { id, message, type };
      setToasts((t) => [toast, ...t]);
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-2 rounded shadow-md text-sm text-white break-words ${
              t.type === "error"
                ? "bg-red-600"
                : t.type === "success"
                ? "bg-green-600"
                : "bg-slate-800"
            }`}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

export default ToastProvider;
