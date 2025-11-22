import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

type Translations = { [key: string]: any };

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define a map of language names to their file paths, using absolute paths from the web root
const localeFiles: { [key: string]: string } = {
  English: '/locales/en.json',
  Spanish: '/locales/es.json',
  French: '/locales/fr.json',
  German: '/locales/de.json',
  Hindi: '/locales/hi.json',
  Bengali: '/locales/bn.json',
  Tamil: '/locales/ta.json',
  Telugu: '/locales/te.json',
  Marathi: '/locales/mr.json',
  Kannada: '/locales/kn.json',
};

const availableLanguages = Object.keys(localeFiles);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [translations, setTranslations] = useState<{[key: string]: Translations} | null>(null);

  const [locale, setLocaleState] = useState(() => {
    try {
      const savedLang = localStorage.getItem('userLanguage');
      return savedLang && availableLanguages.includes(savedLang) ? savedLang : 'English';
    } catch (e) {
      console.error("Could not access localStorage. Defaulting to English.");
      return 'English';
    }
  });
  
  // Effect to load all translation files on mount
  useEffect(() => {
    const fetchAllTranslations = async () => {
      try {
        const promises = Object.entries(localeFiles).map(async ([lang, path]) => {
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`Network response was not ok for ${path}`);
          }
          const data = await response.json();
          return [lang, data];
        });
        const loadedTranslations = Object.fromEntries(await Promise.all(promises));
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error("Failed to load translations:", error);
        // Attempt to load English as a fallback
        try {
            const response = await fetch('/locales/en.json');
            const enData = await response.json();
            setTranslations({ English: enData });
        } catch (fallbackError) {
            console.error("Failed to load fallback English translation:", fallbackError);
            setTranslations({}); // Set to empty to avoid crashing
        }
      }
    };
    fetchAllTranslations();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('userLanguage', locale);
    } catch(e) {
      console.error("Could not save language to localStorage.");
    }
  }, [locale]);

  const setLocale = (newLocale: string) => {
    if (availableLanguages.includes(newLocale)) {
      setLocaleState(newLocale);
    }
  };

  const t = useMemo(() => (key: string, options?: { [key: string]: string | number }): string => {
    if (!translations) return ''; // Return empty string or key if translations not loaded
    
    const keys = key.split('.');
    
    const findTranslation = (langData: Translations, path: string[]) => {
        let result: any = langData;
        for (const k of path) {
            result = result?.[k];
            if (result === undefined) return undefined;
        }
        return result;
    };
    
    const currentTranslations = translations[locale];
    const fallbackTranslations = translations['English'];

    let translatedString = currentTranslations ? findTranslation(currentTranslations, keys) : undefined;

    if (translatedString === undefined) {
        translatedString = fallbackTranslations ? findTranslation(fallbackTranslations, keys) : key;
    }
    
    if (translatedString === undefined || typeof translatedString !== 'string') {
        return key;
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        translatedString = translatedString.replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }

    return translatedString;
  }, [locale, translations]);

  const value = { locale, setLocale, t };

  if (!translations) {
      // Don't render children until translations are loaded to prevent FOUC
      return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};