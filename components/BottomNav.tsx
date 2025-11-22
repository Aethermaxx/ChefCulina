import React from 'react';
import type { Page } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { PantryIcon } from './icons/PantryIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { BookMarkIcon } from './icons/BookMarkIcon';
import { DocumentScannerIcon } from './icons/DocumentScannerIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-1 w-full h-20 transition-all duration-300 group ${
      isActive
        ? 'text-primary dark:text-primary-dark'
        : 'text-text-secondary hover:text-primary dark:hover:text-primary-dark'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {isActive && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(90,176,127,0.6)]"></span>
    )}
    <div className={`p-2 rounded-xl transition-all duration-300 ease-out ${isActive ? 'bg-primary/10 -translate-y-1' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'}`}>
        {icon}
    </div>
    <span className={`text-[0.65rem] uppercase tracking-wide transition-opacity duration-200 ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-70 group-hover:opacity-100'}`}>
        {label}
    </span>
  </button>
);

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', label: t('nav.home'), icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'pantry', label: t('nav.pantry'), icon: <PantryIcon className="w-5 h-5" /> },
    { id: 'finder', label: t('nav.finder'), icon: <DocumentScannerIcon className="w-5 h-5" /> },
    { id: 'recipe', label: t('nav.recipe'), icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'cookbook', label: t('nav.cookbook'), icon: <BookMarkIcon className="w-5 h-5" /> },
    { id: 'profile', label: t('nav.profile'), icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <footer className="sticky bottom-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] hide-on-print">
      <nav className="container mx-auto px-2 grid grid-cols-6 justify-around items-center max-w-4xl">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={currentPage === item.id}
              onClick={() => setCurrentPage(item.id as Page)}
            />
          ))}
      </nav>
    </footer>
  );
};