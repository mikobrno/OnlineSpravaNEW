import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { useToast } from '../../contexts/ToastContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Vyplňte prosím email a heslo', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Přihlášení
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        addToast('Úspěšně přihlášen!', 'success');
        onLoginSuccess();
      } else {
        // Registrace
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        addToast('Účet vytvořen! Zkontrolujte email pro potvrzení.', 'success');
        setIsLogin(true);
      }
    } catch (error: any) {
      addToast(error.message || 'Chyba při autentizaci', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Přihlášení' : 'Registrace'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Online správa společenství vlastníků
          </p>
        </div>
        
        <Card className="mt-8 space-y-6">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Zpracovávám...' : (isLogin ? 'Přihlásit se' : 'Registrovat se')}
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-500 text-sm"
                disabled={loading}
              >
                {isLogin ? 'Nemáte účet? Registrujte se' : 'Už máte účet? Přihlaste se'}
              </button>
            </div>
          </form>
        </Card>
        
        <div className="text-center text-xs text-gray-500">
          <p>Demo účet: admin@example.com / heslo123</p>
        </div>
      </div>
    </div>
  );
};
