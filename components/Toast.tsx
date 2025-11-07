'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'default';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  let icon,
    bgColor,
    textColor,
    borderColor = '';

  switch (type) {
    case 'success':
      icon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
      bgColor = 'bg-green-50';
      textColor = 'text-green-900';
      borderColor = 'border-green-200';
      break;
    case 'error':
      icon = <AlertCircle className="h-5 w-5 text-red-600" />;
      bgColor = 'bg-red-50';
      textColor = 'text-red-900';
      borderColor = 'border-red-200';
      break;
    default:
      icon = <Info className="h-5 w-5 text-gray-600" />;
      bgColor = 'bg-white';
      textColor = 'text-gray-900';
      borderColor = 'border-gray-200';
      break;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`flex items-center gap-3 ${bgColor} ${textColor} px-6 py-3 rounded-full shadow-lg border ${borderColor}`}
      >
        {icon}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}

export function useToast(): {
  showToast: (message: string, type?: ToastType) => void;
  ToastComponent: JSX.Element | null;
} {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType = 'default'): void => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}