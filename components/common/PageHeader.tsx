import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export const PageHeader: React.FC<{ 
    title: string; 
    children?: React.ReactNode; 
    onBack?: () => void; 
}> = ({ title, children, onBack }) => (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
            {onBack && (
                <Button onClick={onBack} variant="secondary" className="p-2 h-10 w-10 !rounded-full shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        {children && <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">{children}</div>}
    </div>
);
