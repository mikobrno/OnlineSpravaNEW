

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToastContextType, ToastMessage } from '../types';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {toasts.map(toast => {
          const baseClasses = 'flex items-center gap-4 rounded-lg p-4 shadow-2xl transition-all duration-300 transform backdrop-blur-sm';
          const typeClasses = {
            success: 'bg-green-100/80 dark:bg-green-600/80 border border-green-300 dark:border-green-500 text-green-800 dark:text-white',
            error: 'bg-red-100/80 dark:bg-red-600/80 border border-red-300 dark:border-red-500 text-red-800 dark:text-white',
            info: 'bg-blue-100/80 dark:bg-blue-600/80 border border-blue-300 dark:border-blue-500 text-blue-800 dark:text-white',
          };
          const Icon = {
            success: CheckCircle,
            error: XCircle,
            info: Info,
          }[toast.type];

          return (
            <div key={toast.id} className={`${baseClasses} ${typeClasses[toast.type]}`}>
              <Icon className="h-6 w-6" />
              <p className="flex-grow text-sm font-medium">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};