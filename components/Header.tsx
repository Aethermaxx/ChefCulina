import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { useTranslation } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
    const { t } = useTranslation();
    return (
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg sticky top-0 z-50 border-b border-border/50 shadow-sm hide-on-print transition-colors duration-300">
            <div className="container mx-auto px-4 flex items-center py-3 h-16">
                <div className="flex items-center gap-3 group cursor-default">
                    <LogoIcon className="w-9 h-9 transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex flex-col">
                        <span className="font-heading text-xl font-bold text-text-heading leading-none tracking-tight">
                            Chef Culina
                        </span>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary dark:text-primary-dark mt-0.5 hidden md:block opacity-80">
                            {t('slogan')}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};