import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface IngredientInputProps {
  onAddIngredient: (ingredient: string) => void;
  placeholder?: string;
  buttonText?: string;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({ onAddIngredient, placeholder, buttonText }) => {
  const [ingredient, setIngredient] = useState('');
  const { t } = useTranslation();

  const handleAdd = () => {
    if (ingredient.trim()) {
      onAddIngredient(ingredient.trim());
      setIngredient('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('pantry.inputPlaceholder')}
        className="flex-grow px-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
      />
      <button
        onClick={handleAdd}
        className="px-6 py-2 font-semibold text-white bg-primary dark:bg-primary-dark dark:text-gray-900 rounded-lg hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105"
      >
        {buttonText || t('pantry.add')}
      </button>
    </div>
  );
};