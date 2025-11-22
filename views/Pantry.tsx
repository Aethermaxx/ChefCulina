import React, { useState, useMemo } from 'react';
import { Recipe, SavedRecipe } from '../types';
import { generateImageForRecipe } from '../services/geminiService';
import { callAIForRecipe } from '../api/callAIForRecipe';
import { IngredientInput } from '../components/IngredientInput';
import { IngredientList } from '../components/IngredientList';
import { RecipeCard } from '../components/RecipeCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ServingSizeSelector } from '../components/ServingSizeSelector';
import { motion, AnimatePresence } from 'framer-motion';

const getRecipeId = (recipeName: string) => recipeName.toLowerCase().replace(/\s+/g, '-');

interface PantryProps {
  savedRecipeIds: Set<string>;
  onSave: (recipe: Recipe | SavedRecipe) => void;
  onUnsave: (recipeName: string) => void;
  onMarkAsCooked: (recipeName: string) => void;
}

export const Pantry: React.FC<PantryProps> = ({ savedRecipeIds, onSave, onUnsave, onMarkAsCooked }) => {
  const [ingredients, setIngredients] = useState<string[]>(['3 chicken breasts', '1 cup rice', '1 can of tomatoes']);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const { t } = useTranslation();
  const { restrictions } = useAuth();

  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const [imageLoadings, setImageLoadings] = useState<Record<string, boolean>>({});
  const [servingSize, setServingSize] = useState({ adults: 2, children: 0, seniors: 0 });

  const totalServings = useMemo(() => servingSize.adults + servingSize.children + servingSize.seniors, [servingSize]);

  const handleAddIngredient = (ingredient: string) => {
    if (!ingredients.some(i => i.toLowerCase() === ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient]);
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setIngredients([]);
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      setError(t('pantry.addIngredientError'));
      return;
    }
    if (totalServings === 0) {
      setError(t('pantry.servingSizeError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setImageUrls({});
    setImageLoadings({});
    setDifficultyFilter('All');
    setSortOrder('none');

    try {
      const result = await callAIForRecipe({
        promptType: 'pantry',
        ingredients: ingredients,
        servingSize: servingSize,
        restrictions: restrictions
      });

      const recipeList = Array.isArray(result) ? result : [result];
      setRecipes(recipeList);
      setIsLoading(false);

      // Set initial loading states for images
      const initialLoadings: Record<string, boolean> = {};
      recipeList.forEach(r => { initialLoadings[r.recipeName] = true; });
      setImageLoadings(initialLoadings);

      // Generate images (still using legacy Gemini image gen for now)
      recipeList.forEach(async (recipe) => {
          try {
              const url = await generateImageForRecipe(recipe.recipeName, recipe.description);
              setImageUrls(prev => ({ ...prev, [recipe.recipeName]: url }));
          } catch (e) {
              console.error(`Failed to generate image for ${recipe.recipeName}`, e);
              setImageUrls(prev => ({ ...prev, [recipe.recipeName]: null }));
          } finally {
              setImageLoadings(prev => ({ ...prev, [recipe.recipeName]: false }));
          }
      });

    } catch (err) {
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        if (err.message.includes("NO_API_KEY")) {
            const provider = err.message.split('_').pop();
            errorMessage = `Please add your ${provider} API key in Profile settings before using AI.`;
        } else {
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const filteredAndSortedRecipes = useMemo(() => {
    const parseCookTime = (timeStr: string): number => {
      let totalMinutes = 0;
      const hourMatch = timeStr.match(/(\d+)\s*hour/i);
      const minMatch = timeStr.match(/(\d+)\s*minute/i);
      if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
      if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
      if (totalMinutes === 0) {
        const fallbackMatch = timeStr.match(/(\d+)/);
        if (fallbackMatch) totalMinutes = parseInt(fallbackMatch[1], 10);
      }
      return totalMinutes > 0 ? totalMinutes : Infinity;
    };

    return [...recipes]
      .filter(recipe => difficultyFilter === 'All' || recipe.difficulty === difficultyFilter)
      .sort((a, b) => {
        const aIsSaved = savedRecipeIds.has(getRecipeId(a.recipeName));
        const bIsSaved = savedRecipeIds.has(getRecipeId(b.recipeName));
        if (aIsSaved && !bIsSaved) return -1;
        if (!aIsSaved && bIsSaved) return 1;

        if (sortOrder !== 'none') {
          const timeA = parseCookTime(a.cookTime);
          const timeB = parseCookTime(b.cookTime);
          if (timeA !== timeB) {
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
          }
        }
        return 0;
      });
  }, [recipes, difficultyFilter, sortOrder, savedRecipeIds]);

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="max-w-3xl mx-auto bg-surface p-6 md:p-8 rounded-2xl shadow-lg border border-border hide-on-print animate-fade-in-up">
        <h3 className="text-xl font-bold font-heading mb-4">{t('pantry.inputHeader')}</h3>
        <IngredientInput onAddIngredient={handleAddIngredient} />
        <IngredientList ingredients={ingredients} onRemoveIngredient={handleRemoveIngredient} />
        
        {ingredients.length > 0 && (
          <div className="text-right mt-2">
              <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 hover:underline focus:outline-none"
                  aria-label="Clear all ingredients"
              >
                  {t('pantry.clearAll')}
              </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
            <ServingSizeSelector servingSize={servingSize} onChange={setServingSize} />
        </div>
        
        <button
          onClick={handleGenerateRecipes}
          disabled={isLoading || totalServings === 0}
          className="glass-button mt-5 w-full flex items-center justify-center gap-3 px-6 py-3 font-bold text-white rounded-lg transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
        >
          <SparklesIcon className="w-5 h-5" />
          <span>{isLoading ? t('pantry.thinking') : t('pantry.generate')}</span>
        </button>
      </div>

      <AnimatePresence>
        {isLoading && <LoadingSpinner />}
      </AnimatePresence>
      
      {error && (
        <div className="max-w-3xl mx-auto mt-6 p-4 text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 rounded-lg animate-fade-in-up" role="alert">
          <p className="font-semibold">{t('pantry.errorTitle')}</p>
          <p>{error}</p>
        </div>
      )}

      {recipes.length > 0 && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
        >
          <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-surface rounded-xl shadow-sm border border-border hide-on-print">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-secondary text-sm">{t('pantry.filters.difficulty')}</span>
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors font-medium ${difficultyFilter === level ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary-light dark:hover:bg-primary/20'}`}
                >
                  {t(`pantry.filters.${level.toLowerCase()}`)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-order" className="font-semibold text-text-secondary text-sm">{t('pantry.filters.sortBy')}</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'none' | 'asc' | 'desc')}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800 text-text-primary"
              >
                <option value="none">{t('pantry.filters.default')}</option>
                <option value="asc">{t('pantry.filters.shortest')}</option>
                <option value="desc">{t('pantry.filters.longest')}</option>
              </select>
            </div>
          </div>

          <motion.div 
            className="grid gap-8 max-w-4xl mx-auto"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.15
                    }
                }
            }}
            initial="hidden"
            animate="show"
          >
            {filteredAndSortedRecipes.map((recipe) => (
              <motion.div
                key={recipe.recipeName}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                }}
              >
                  <RecipeCard 
                    recipe={recipe} 
                    isSaved={savedRecipeIds.has(getRecipeId(recipe.recipeName))}
                    onSave={onSave}
                    onUnsave={onUnsave}
                    onMarkAsCooked={onMarkAsCooked}
                    imageUrl={imageUrls[recipe.recipeName] ?? null}
                    imageLoading={imageLoadings[recipe.recipeName] ?? false}
                  />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};