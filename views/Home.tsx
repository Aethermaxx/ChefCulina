import React from 'react';
import type { Page } from '../App';
import { PantryIcon } from '../components/icons/PantryIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
    setCurrentPage: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
    const { currentUser } = useAuth();
    const { t } = useTranslation();

    const userName = currentUser?.name || 'Guest';

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden -mt-8 md:-mt-0">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-0 md:left-20 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 md:right-20 w-64 h-64 bg-accent-lavender/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-200/30 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 container mx-auto px-4 text-center py-16 md:py-24 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold font-heading tracking-tight leading-tight mb-6">
            {t('home.greeting', { name: '' })} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark dark:from-primary dark:to-emerald-300">{userName}!</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mt-4 leading-relaxed">
              {t('home.welcome')}
          </p>
          <p className="font-heading text-xl text-primary dark:text-primary-dark font-semibold mt-8 mb-12 tracking-wide">
              {t('slogan')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
              <button 
                  onClick={() => setCurrentPage('pantry')}
                  className="glass-button w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 font-bold text-white rounded-xl transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                  <PantryIcon className="w-6 h-6" />
                  <span>{t('home.myPantry')}</span>
              </button>
              <button 
                  onClick={() => setCurrentPage('recipe')}
                  className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 font-bold text-primary dark:text-primary-dark bg-white/80 dark:bg-surface/80 backdrop-blur-sm border border-primary/20 rounded-xl hover:bg-white dark:hover:bg-surface hover:shadow-lg hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                  <SparklesIcon className="w-6 h-6" />
                  <span>{t('home.inspireMe')}</span>
              </button>
          </div>
        </div>
      </div>
    );
};