import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Simple toast system — no external deps needed beyond this file
let toastId = 0;
let addToastFn = null;

export function toast(message, type = 'info', duration = 3500) {
  if (addToastFn) {
    addToastFn({ id: ++toastId, message, type, duration });
  }
}

toast.success = (msg, duration) => toast(msg, 'success', duration);
toast.error = (msg, duration) => toast(msg, 'error', duration);
toast.info = (msg, duration) => toast(msg, 'info', duration);

// Confirm dialog replacement
export function confirmDialog(message) {
  return new Promise((resolve) => {
    if (addToastFn) {
      addToastFn({
        id: ++toastId,
        message,
        type: 'confirm',
        duration: 0,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    } else {
      resolve(window.confirm(message));
    }
  });
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  confirm: AlertCircle,
};

const colorMap = {
  success: 'bg-green-600 dark:bg-green-500',
  error: 'bg-red-600 dark:bg-red-500',
  info: 'bg-blue-600 dark:bg-blue-500',
  confirm: 'bg-amber-600 dark:bg-amber-500',
};

function ToastItem({ t, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const Icon = iconMap[t.type] || Info;

  useEffect(() => {
    if (t.duration > 0) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => onRemove(t.id), 300);
      }, t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.duration, t.id, onRemove]);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(t.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        transition-all duration-300 ease-out min-w-[300px] max-w-[420px]
        ${exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className={`p-1.5 rounded-lg text-white ${colorMap[t.type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm leading-relaxed">{t.message}</div>
      {t.type === 'confirm' ? (
        <div className="flex gap-2 ml-2 shrink-0">
          <button
            onClick={() => { t.onConfirm?.(); dismiss(); }}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Yes
          </button>
          <button
            onClick={() => { t.onCancel?.(); dismiss(); }}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-lg transition"
          >
            No
          </button>
        </div>
      ) : (
        <button onClick={dismiss} className="shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" aria-label="Dismiss notification">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem t={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
