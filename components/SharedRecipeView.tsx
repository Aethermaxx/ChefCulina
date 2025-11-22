import React from 'react';
import { Recipe, SavedRecipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { useTranslation } from '../contexts/LanguageContext';

interface SharedRecipeViewProps {
  recipe: Recipe;
  onClose: () => void;
  isSaved: boolean;
  onSave: (recipe: Recipe | SavedRecipe) => void;
  onUnsave: (recipeName: string) => void;
  onMarkAsCooked: (recipeName: string) => void;
}

export const SharedRecipeView: React.FC<SharedRecipeViewProps> = ({ recipe, onClose, isSaved, onSave, onUnsave, onMarkAsCooked }) => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading">{t('shared.title')}</h2>
          <p className="text-text-secondary mt-2">{t('shared.subtitle')}</p>
        </div>
        <RecipeCard
          recipe={recipe}
          isSaved={isSaved}
          onSave={onSave}
          onUnsave={onUnsave}
          onMarkAsCooked={onMarkAsCooked}
          imageUrl={undefined}
        />
        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="glass-button px-8 py-3 font-bold text-white rounded-lg transition-transform duration-300 transform hover:-translate-y-0.5"
          >
            {t('shared.back')}
          </button>
        </div>
      </div>
    </div>
  );
};