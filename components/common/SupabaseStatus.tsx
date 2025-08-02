import React from 'react';
import { AlertCircle, CheckCircle, Settings, Database } from 'lucide-react';

interface SupabaseStatusProps {
  isConnected: boolean;
  errors?: string[];
  className?: string;
}

export const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ 
  isConnected, 
  errors = [], 
  className = '' 
}) => {
  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 text-green-600 text-sm ${className}`}>
        <CheckCircle size={16} />
        <span>Supabase připojena</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-orange-600 text-sm ${className}`}>
      <AlertCircle size={16} />
      <span>Mock data</span>
      {errors.length > 0 && (
        <div className="ml-2 text-xs text-gray-500">
          (Supabase nedostupná)
        </div>
      )}
    </div>
  );
};

interface SupabaseSetupBannerProps {
  errors: string[];
  onDismiss?: () => void;
}

export const SupabaseSetupBanner: React.FC<SupabaseSetupBannerProps> = ({ 
  errors, 
  onDismiss 
}) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Database className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            Supabase databáze není nakonfigurována
          </h3>
          <div className="mt-2 text-sm text-orange-700">
            <p className="mb-2">
              Aplikace nyní používá mock data. Pro plnou funkcionalnost nakonfigurujte Supabase:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <Settings size={16} />
              <span>Přečtěte si SUPABASE_SETUP_GUIDE.md pro detailní návod</span>
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-orange-400 hover:text-orange-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
