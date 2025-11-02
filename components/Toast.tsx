/**
 * Toast Notification Component - Modern Airbnb-inspired design
 */

'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          gradient: 'from-red-500 to-rose-500',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500 to-orange-500',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'info':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        ${isLeaving ? 'animate-toast-exit' : 'animate-toast-enter'}
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl
        ${styles.bg} border-2 ${styles.border}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-white shadow-lg`}>
            {styles.icon}
          </div>

          {/* Message */}
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 leading-relaxed">{message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/50 hover:bg-white/80 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200/50">
        <div
          className={`h-full bg-gradient-to-r ${styles.gradient} animate-toast-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>

      <style jsx>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes toastExit {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
        }
        @keyframes toastProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-toast-enter {
          animation: toastEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-toast-exit {
          animation: toastExit 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-toast-progress {
          animation: toastProgress linear;
        }
      `}</style>
    </div>
  );
}

// Toast Container
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[60]"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {children}
      </div>
    </div>
  );
}
