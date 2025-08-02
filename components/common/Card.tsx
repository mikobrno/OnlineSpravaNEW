import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-blue-500 hover:shadow-blue-500/10' : ''} ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => <div className={`p-4 ${className}`}>{children}</div>;
