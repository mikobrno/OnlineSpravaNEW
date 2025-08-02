import React from 'react';
import { X } from 'lucide-react';

export const Modal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode; 
    footer?: React.ReactNode, 
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' 
}> = ({ isOpen, onClose, title, children, footer, size = '2xl' }) => {
    if (!isOpen) return null;
    
    const sizeClasses = { 
        md: 'max-w-md', 
        lg: 'max-w-lg', 
        xl: 'max-w-xl', 
        '2xl': 'max-w-2xl', 
        '3xl': 'max-w-3xl', 
        '4xl': 'max-w-4xl', 
        '5xl': 'max-w-5xl' 
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="h-6 w-6" /></button>
                </header>
                <div className="p-6 overflow-y-auto flex-grow">{children}</div>
                {footer && (
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};
