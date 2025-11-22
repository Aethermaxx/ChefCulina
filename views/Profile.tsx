import React, { useState, useEffect } from 'react';
import { UserIcon } from '../components/icons/UserIcon';
import { ChefHatIcon } from '../components/icons/ChefHatIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { IngredientInput } from '../components/IngredientInput';
import { IngredientList } from '../components/IngredientList';
import { AIProvider } from '../api/callAIForRecipe';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, updateUser, restrictions, addRestriction, removeRestriction } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [cookedCount, setCookedCount] = useState(0);

  // Settings State
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);

  const userCookedCountKey = `cookedCount_${currentUser?.email}`;

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      const savedCount = parseInt(localStorage.getItem(userCookedCountKey) || '0', 10);
      setCookedCount(savedCount);
    }
  }, [currentUser, userCookedCountKey]);

  useEffect(() => {
    // Load settings from localStorage
    const provider = localStorage.getItem('chefCulina_selectedProvider') as AIProvider;
    if (provider) setSelectedProvider(provider);

    setGeminiKey(localStorage.getItem('chefCulina_geminiApiKey') || '');
    setOpenaiKey(localStorage.getItem('chefCulina_openaiApiKey') || '');
    setDeepseekKey(localStorage.getItem('chefCulina_deepseekApiKey') || '');
  }, []);

  useEffect(() => {
    const syncCookedCount = (event: StorageEvent) => {
      if (event.key === userCookedCountKey) {
        const savedCount = parseInt(localStorage.getItem(userCookedCountKey) || '0', 10);
        setCookedCount(savedCount);
      }
    };
    window.addEventListener('storage', syncCookedCount);
    return () => {
      window.removeEventListener('storage', syncCookedCount);
    }
  }, [userCookedCountKey]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    if (currentUser && currentUser.name !== name.trim() && name.trim() !== '') {
        updateUser({ ...currentUser, name: name.trim() });
    }
  };

  // Settings Handlers
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider;
    setSelectedProvider(newProvider);
    localStorage.setItem('chefCulina_selectedProvider', newProvider);
  };

  const handleKeyChange = (provider: string, value: string) => {
    if (provider === 'gemini') {
        setGeminiKey(value);
        localStorage.setItem('chefCulina_geminiApiKey', value);
    } else if (provider === 'openai') {
        setOpenaiKey(value);
        localStorage.setItem('chefCulina_openaiApiKey', value);
    } else if (provider === 'deepseek') {
        setDeepseekKey(value);
        localStorage.setItem('chefCulina_deepseekApiKey', value);
    }
  };

  if (!currentUser) {
    return null; // Or a loading indicator
  }

  return (
    <div className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="space-y-8">
                {/* Account Details */}
                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-lg border border-border">
                    <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-3"><UserIcon className="w-6 h-6 text-primary dark:text-primary-dark" /> {t('profile.accountDetails')}</h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">{t('profile.displayName')}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                onBlur={handleNameBlur}
                                placeholder={t('profile.displayNamePlaceholder')}
                                className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                        </div>
                        <div>
                           <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">{t('auth.email')}</label>
                           <div className="relative">
                               <MailIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                               <input
                                   type="email"
                                   id="email"
                                   value={currentUser.email}
                                   disabled
                                   className="w-full pl-10 pr-4 py-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                               />
                           </div>
                        </div>
                    </div>
                </div>

                {/* API Settings */}
                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-lg border border-border">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold font-heading flex items-center gap-3">
                            <LockIcon className="w-6 h-6 text-primary dark:text-primary-dark" /> 
                            AI Provider Settings
                        </h3>
                        <button 
                            onClick={() => setShowKeys(!showKeys)}
                            className="text-sm text-primary hover:underline"
                        >
                            {showKeys ? 'Hide Keys' : 'Show Keys'}
                        </button>
                     </div>
                     
                     <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                         <strong>Privacy Note:</strong> Do not publish or share your API key. Your key is stored only on your device (localStorage) and will not be shared with anyone, including us.
                     </div>

                     <div className="space-y-6">
                        <div>
                            <label htmlFor="provider" className="block text-sm font-medium text-text-secondary mb-1">Preferred AI Provider</label>
                            <select
                                id="provider"
                                value={selectedProvider}
                                onChange={handleProviderChange}
                                className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            >
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI (ChatGPT)</option>
                                <option value="deepseek">DeepSeek</option>
                            </select>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Google Gemini API Key</label>
                                <input
                                    type={showKeys ? "text" : "password"}
                                    value={geminiKey}
                                    onChange={(e) => handleKeyChange('gemini', e.target.value)}
                                    placeholder="Enter your Gemini API Key"
                                    className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">OpenAI API Key</label>
                                <input
                                    type={showKeys ? "text" : "password"}
                                    value={openaiKey}
                                    onChange={(e) => handleKeyChange('openai', e.target.value)}
                                    placeholder="Enter your OpenAI API Key"
                                    className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">DeepSeek API Key</label>
                                <input
                                    type={showKeys ? "text" : "password"}
                                    value={deepseekKey}
                                    onChange={(e) => handleKeyChange('deepseek', e.target.value)}
                                    placeholder="Enter your DeepSeek API Key"
                                    className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                            </div>
                        </div>
                     </div>
                </div>
                
                {/* Allergies and Restrictions */}
                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-lg border border-border">
                    <h3 className="text-xl font-bold font-heading mb-2">{t('profile.restrictions.title')}</h3>
                    <p className="text-text-secondary mb-4 text-sm">{t('profile.restrictions.subtitle')}</p>
                    <IngredientInput
                        onAddIngredient={addRestriction}
                        placeholder={t('profile.restrictions.placeholder')}
                        buttonText={t('profile.restrictions.add')}
                    />
                    <IngredientList
                        ingredients={restrictions}
                        onRemoveIngredient={removeRestriction}
                    />
                </div>


                {/* My Stats */}
                <div className="bg-gradient-to-r from-primary to-primary-dark dark:from-primary dark:to-green-800 text-white p-6 md:p-8 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <ChefHatIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-heading">{t('profile.stats.dishesCooked')}</h3>
                            <p className="opacity-80">{t('profile.stats.tally')}</p>
                        </div>
                    </div>
                    <div className="text-5xl font-bold font-heading">
                        {cookedCount}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};