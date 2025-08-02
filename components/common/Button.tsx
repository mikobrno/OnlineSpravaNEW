import React from 'react';

export const Button: React.FC<{ 
    children: React.ReactNode; 
    onClick?: (e: React.MouseEvent) => void; 
    variant?: 'primary' | 'secondary' | 'danger' | 'success'; 
    className?: string; 
    type?: 'button' | 'submit' | 'reset'; 
    disabled?: boolean; 
    title?: string; 
}> = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, title }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 focus:ring-gray-500 border border-gray-300 dark:border-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  };
  return <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled} title={title}>{children}</button>;
};