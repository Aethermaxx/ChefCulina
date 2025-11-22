import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { LogoIcon } from '../components/icons/LogoIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { AppleIcon } from '../components/icons/AppleIcon';
import { DiscordIcon } from '../components/icons/DiscordIcon';

type SocialProvider = 'google' | 'apple' | 'discord';

export const Auth: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login, signup, socialLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // --- Validation Logic ---
        if (!isLoginView && !name.trim()) {
            setError(t('auth.errors.nameEmpty'));
            return;
        }
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setError(t('auth.errors.emailInvalid'));
            return;
        }
        if (!password) {
            setError(t('auth.errors.passwordEmpty'));
            return;
        }
        if (!isLoginView && password.length < 6) {
            setError(t('auth.errors.passwordShort'));
            return;
        }
        if (!isLoginView && password !== confirmPassword) {
            setError(t('auth.errors.passwordMismatch'));
            return;
        }
        // --- End Validation ---

        setIsLoading(true);

        try {
            if (isLoginView) {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(t(err.message));
            } else {
                setError(t("auth.errors.generic"));
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSocialLogin = async (provider: SocialProvider) => {
        setError(null);
        setIsLoading(true);
        try {
            await socialLogin(provider);
        } catch (err) {
             if (err instanceof Error) {
                setError(t(err.message));
            } else {
                setError(t("auth.errors.socialLogin"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError(null);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <LogoIcon className="w-16 h-16" />
                    <h1 className="font-heading text-3xl font-bold text-text-heading mt-4">
                       {t('auth.welcome')} Chef Culina
                    </h1>
                    <p className="text-text-secondary mt-1">{t('slogan')}</p>
                </div>

                <div className="bg-surface p-8 rounded-2xl shadow-lg border border-border">
                    <div className="flex border-b border-border mb-6">
                        <button
                            onClick={() => setIsLoginView(true)}
                            className={`w-1/2 py-3 text-lg font-bold transition-colors ${isLoginView ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            {t('auth.login')}
                        </button>
                        <button
                            onClick={() => setIsLoginView(false)}
                            className={`w-1/2 py-3 text-lg font-bold transition-colors ${!isLoginView ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            {t('auth.signup')}
                        </button>
                    </div>

                    <form key={isLoginView ? 'login' : 'signup'} onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.5s' }}>
                        {!isLoginView && (
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">{t('auth.name')}</label>
                                <div className="relative">
                                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">{t('auth.email')}</label>
                            <div className="relative">
                                <MailIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-text-secondary mb-1">{t('auth.password')}</label>
                            <div className="relative">
                                <LockIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                            </div>
                        </div>

                        {!isLoginView && (
                             <div>
                                <label htmlFor="confirm-password"className="block text-sm font-medium text-text-secondary mb-1">{t('auth.confirmPassword')}</label>
                                <div className="relative">
                                    <LockIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    />
                                </div>
                            </div>
                        )}

                        {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="glass-button w-full flex items-center justify-center gap-3 px-6 py-3 font-bold text-white rounded-lg transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            {isLoading && !error ? '...' : (isLoginView ? t('auth.login') : t('auth.signup'))}
                        </button>
                    </form>

                     <p className="text-center text-sm text-text-secondary mt-6">
                        {isLoginView ? t('auth.loginPrompt') : t('auth.signupPrompt')}{' '}
                        <button onClick={toggleView} className="font-semibold text-primary dark:text-primary-dark hover:underline">
                            {isLoginView ? t('auth.signup') : t('auth.login')}
                        </button>
                    </p>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-surface px-2 text-text-secondary">
                          {t('auth.divider')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                        <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-text-primary bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <GoogleIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">{t('auth.google_signin')}</span>
                        </button>
                        <button onClick={() => handleSocialLogin('apple')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-800 dark:border-gray-700 rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <AppleIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">{t('auth.apple_signin')}</span>
                        </button>
                        <button onClick={() => handleSocialLogin('discord')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-transparent rounded-lg text-white bg-[#5865F2] hover:bg-[#4f5bda] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5865F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <DiscordIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">{t('auth.discord_signin')}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};