import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface IngredientListProps {
  ingredients: string[];
  onRemoveIngredient: (index: number) => void;
}

export const IngredientList: React.FC<IngredientListProps> = ({ ingredients, onRemoveIngredient }) => {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {ingredients.map((ingredient, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-3 py-1.5 text-sm font-medium text-primary-dark bg-primary-light dark:bg-primary/20 dark:text-emerald-300 rounded-full animate-fade-in-up"
        >
          <span>{ingredient}</span>
          <button
            onClick={() => onRemoveIngredient(index)}
            className="ml-2 text-primary dark:text-emerald-400 hover:text-primary-dark dark:hover:text-emerald-200 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full p-0.5 focus:outline-none transition-colors"
            aria-label={`Remove ${ingredient}`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};