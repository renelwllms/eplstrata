"use client";

import * as React from "react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error";
};

type ToastState = {
  toasts: Toast[];
};

type Action =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string };

const ToastContext = React.createContext<{
  state: ToastState;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
} | null>(null);

const TOAST_LIMIT = 3;
const TOAST_DURATION = 3500;

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case "ADD": {
      const next = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT);
      return { toasts: next };
    }
    case "REMOVE":
      return { toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD", toast: { ...toast, id } });
    window.setTimeout(() => dispatch({ type: "REMOVE", id }), TOAST_DURATION);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <ToastContext.Provider value={{ state, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastViewport() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-80 flex-col gap-2">
      {ctx.state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg ${
            toast.variant === "error" ? "text-rose-700" : "text-ink-900"
          }`}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description && <p className="text-xs text-ink-700">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}
