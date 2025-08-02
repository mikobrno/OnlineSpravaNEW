import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Vote as VoteIcon } from 'lucide-react';

export const AuthView = () => {
    const { theme } = useTheme();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3">
                        <VoteIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vítejte v OnlineSprava</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Přihlaste se pro pokračování.</p>
                </div>
                <Card>
                    <CardContent className="p-8">
                        <Auth
                            supabaseClient={supabase}
                            appearance={{ 
                                theme: ThemeSupa,
                                style: {
                                    button: { background: '#2563eb', color: 'white', border: 'none' },
                                    anchor: { color: '#2563eb' },
                                },
                            }}
                            theme={theme}
                            providers={[]}
                            view="magic_link"
                            showLinks={true}
                            localization={{
                                variables: {
                                    sign_in: {
                                        email_label: 'Vaše emailová adresa',
                                        password_label: 'Vaše heslo',
                                        email_input_placeholder: "vas@email.cz",
                                        button_label: "Odeslat přihlašovací odkaz",
                                        magic_link_text: 'Nemáte heslo? Pošleme vám odkaz pro přihlášení.',
                                        loading_button_label: 'Odesílání...',
                                    },
                                    magic_link: {
                                        header: 'Ověřte si email',
                                        body: 'Poslali jsme vám odkaz na přihlášení na váš email.',
                                        button_label: 'Poslat znovu',
                                    }
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
