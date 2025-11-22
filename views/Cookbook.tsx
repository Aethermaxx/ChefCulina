import React, { useState, useMemo } from 'react';
import { Recipe, SavedRecipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { useTranslation } from '../contexts/LanguageContext';
import { BookMarkIcon } from '../components/icons/BookMarkIcon';

interface CookbookProps {
  cookbook: SavedRecipe[];
  savedRecipeIds: Set<string>;
  onSave: (recipe: Recipe | SavedRecipe) => void;
  onUnsave: (recipeName: string) => void;
  onMarkAsCooked: (recipeName: string) => void;
  onEdit: (recipe: SavedRecipe) => void;
}

export const Cookbook: React.FC<CookbookProps> = ({ cookbook, onSave, onUnsave, onMarkAsCooked, onEdit }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    cookbook.forEach(recipe => {
      if (recipe.categories) {
        recipe.categories.forEach(cat => cat && categories.add(cat));
      }
    });
    return ['All', ...Array.from(categories).sort()];
  }, [cookbook]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    cookbook.forEach(recipe => {
      if (recipe.tags) {
        recipe.tags.forEach(tag => tag && tags.add(tag));
      }
    });
    return ['All', ...Array.from(tags).sort()];
  }, [cookbook]);

  const filteredCookbook = useMemo(() => {
    return cookbook
      .filter(recipe => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        const nameMatch = recipe.recipeName.toLowerCase().includes(lowerSearchTerm);
        const ingredientMatch = recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerSearchTerm));
        const notesMatch = recipe.notes?.toLowerCase().includes(lowerSearchTerm);

        const categoryMatch = categoryFilter === 'All' || (recipe.categories && recipe.categories.includes(categoryFilter));
        const tagMatch = tagFilter === 'All' || (recipe.tags && recipe.tags.includes(tagFilter));

        return (nameMatch || ingredientMatch || notesMatch) && categoryMatch && tagMatch;
      })
      .sort((a, b) => a.recipeName.localeCompare(b.recipeName));
  }, [cookbook, searchTerm, categoryFilter, tagFilter]);

  if (cookbook.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center py-16 animate-fade-in-up">
        <BookMarkIcon className="w-16 h-16 mx-auto text-primary dark:text-primary-dark" />
        <h2 className="mt-6 text-3xl font-bold font-heading">{t('cookbook.empty')}</h2>
        <p className="mt-2 text-lg text-text-secondary">{t('cookbook.empty_cta')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold font-heading">{t('cookbook.title')}</h2>
          <p className="text-lg text-text-secondary mt-2">{t('cookbook.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-surface rounded-xl shadow-sm border border-border hide-on-print">
            <input
                type="text"
                placeholder={t('cookbook.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 mb-4 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('cookbook.search_placeholder')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-text-secondary mb-1">{t('cookbook.filter_category')}</label>
                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-text-primary"
                    >
                        {allCategories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All' ? t('cookbook.all_categories') : cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="tag-filter" className="block text-sm font-medium text-text-secondary mb-1">{t('cookbook.filter_tag')}</label>
                    <select
                        id="tag-filter"
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-text-primary"
                    >
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag === 'All' ? t('cookbook.all_tags') : tag}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        
        {/* Recipe List */}
        {filteredCookbook.length > 0 ? (
          <div className="grid gap-8">
            {filteredCookbook.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={true}
                onSave={onSave}
                onUnsave={onUnsave}
                onMarkAsCooked={onMarkAsCooked}
                onEdit={() => onEdit(recipe)}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-text-primary">{t('cookbook.no_results')}</h3>
                <p className="text-text-secondary mt-2">{t('cookbook.no_results_desc')}</p>
            </div>
        )}
      </div>
    </div>
  );
};