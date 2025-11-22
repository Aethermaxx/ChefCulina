import React, { useRef, useState } from 'react';
import { Recipe, SavedRecipe } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { ImageIcon } from './icons/ImageIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ShareIcon } from './icons/ShareIcon';
import { LeafIcon } from './icons/LeafIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { PencilIcon } from './icons/PencilIcon';
import { UsersIcon } from './icons/UsersIcon';
import { motion } from 'framer-motion';

interface RecipeCardProps {
  recipe: Recipe | SavedRecipe;
  isSaved: boolean;
  onSave: (recipe: Recipe | SavedRecipe) => void;
  onUnsave: (recipeName: string) => void;
  onMarkAsCooked: (recipeName: string) => void;
  onEdit?: (recipe: Recipe | SavedRecipe) => void;
  className?: string;
  style?: React.CSSProperties;
  imageUrl?: string | null;
  imageLoading?: boolean;
}

const Tag: React.FC<{ text: string; className?: string; icon?: React.ReactNode }> = ({ text, className, icon }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide rounded-full ${className}`}>
    {icon}
    <span>{text}</span>
  </span>
);

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved, onSave, onUnsave, onMarkAsCooked, onEdit, className, style, imageUrl, imageLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const { t } = useTranslation();

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-emerald-300';
      case 'medium':
        return 'bg-accent-lavender-light text-accent-lavender-dark dark:bg-accent-lavender/20 dark:text-violet-300';
      case 'hard':
        return 'bg-accent-red/20 text-accent-red dark:bg-accent-red/10 dark:text-pink-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };
  
  const handleToggleSave = () => {
    if (!isSaved) {
        setIsHeartAnimating(true);
        setTimeout(() => setIsHeartAnimating(false), 300);
    }
    if (isSaved) {
        onUnsave(recipe.recipeName);
    } else {
        onSave(recipe);
    }
  };

  const handlePrint = () => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    document.body.classList.add('is-printing');
    cardElement.classList.add('is-printing-this-one');

    setTimeout(() => {
      window.print();
      document.body.classList.remove('is-printing');
      cardElement.classList.remove('is-printing-this-one');
    }, 100);
  };

  const handleShare = async () => {
    try {
      const recipeJson = JSON.stringify(recipe);
      const encodedRecipe = btoa(unescape(encodeURIComponent(recipeJson)));
      const url = `${window.location.origin}${window.location.pathname}?recipe=${encodedRecipe}`;
      
      const shareData = {
        title: `Check out this recipe: ${recipe.recipeName}`,
        text: `Here's a recipe for ${recipe.recipeName} from Chef Culina!`,
        url: url,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopySuccess(t('recipeCard.linkCopied'));
        setTimeout(() => setCopySuccess(''), 2000);
      }
    } catch (error) {
      console.error('Failed to share recipe:', error);
      setCopySuccess(t('recipeCard.copyFailed'));
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };


  return (
    <motion.div 
      ref={cardRef} 
      className={`recipe-card w-full bg-surface border border-border rounded-2xl shadow-sm relative overflow-hidden ${className || ''}`} 
      style={style}
      whileHover={{ y: -8, scale: 1.01, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {imageUrl !== undefined && (
        <div className="h-64 bg-gray-100 dark:bg-gray-800 border-b border-border">
            {imageLoading ? (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : imageUrl ? (
                <img src={imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
            ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <ImageIcon className="w-16 h-16" />
                      <span className="mt-2 text-sm">{t('recipeCard.image.generating')}</span>
                  </div>
            )}
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <div className="absolute top-4 right-4 flex gap-1 no-print bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm z-10">
           {onEdit && (
              <button
                  onClick={() => onEdit(recipe)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-accent-lavender-dark dark:hover:text-accent-lavender hover:bg-accent-lavender-light dark:hover:bg-accent-lavender/20 transition-colors duration-200"
                  title={t('recipeCard.edit')}
              >
                  <PencilIcon className="w-6 h-6" />
              </button>
           )}
           <button
              onClick={() => onMarkAsCooked(recipe.recipeName)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark hover:bg-primary-light dark:hover:bg-primary/20 transition-colors duration-200"
              title={t('recipeCard.cooked')}
          >
              <CheckCircleIcon className="w-6 h-6" />
          </button>
          <button
              onClick={handleShare}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-accent-lavender-dark dark:hover:text-accent-lavender hover:bg-accent-lavender-light dark:hover:bg-accent-lavender/20 transition-colors duration-200 relative"
              title={t('recipeCard.share')}
          >
              <ShareIcon className="w-6 h-6" />
              {copySuccess && <span className="absolute -top-8 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded-md">{copySuccess}</span>}
          </button>
          <button
              onClick={handlePrint}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark hover:bg-primary-light dark:hover:bg-primary/20 transition-colors duration-200"
              title={t('recipeCard.print')}
          >
              <PrinterIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-full transition-colors duration-200 ${isSaved ? 'text-accent-red bg-accent-red/20 dark:bg-accent-red/10' : 'text-gray-500 dark:text-gray-400 hover:text-accent-red hover:bg-accent-red/20 dark:hover:bg-accent-red/10'}`}
            title={isSaved ? t('recipeCard.unsave') : t('recipeCard.save')}
          >
            <HeartIcon isFilled={isSaved} className={`w-6 h-6 ${isHeartAnimating ? 'animate-pop' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
          <h3 className="text-3xl font-bold font-heading pr-40">{recipe.recipeName}</h3>
          <div className="flex flex-wrap gap-2 flex-shrink-0 mt-2 sm:mt-0 justify-end">
            {recipe.servingSize && <Tag text={recipe.servingSize} icon={<UsersIcon className="w-4 h-4" />} className="bg-gray-100 dark:bg-gray-700 text-text-secondary" />}
            <Tag text={recipe.cookTime} className="bg-text-heading/20 text-text-heading dark:bg-yellow-800/20 dark:text-yellow-300" />
            <Tag text={recipe.difficulty} className={getDifficultyClass(recipe.difficulty)} />
          </div>
        </div>
        <p className="mb-8 text-text-secondary">{recipe.description}</p>
        
        {/* Nutrition Section */}
        <div className="mb-8">
            <h4 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <LeafIcon className="w-5 h-5 text-primary dark:text-primary-dark" />
                {t('recipeCard.nutrition.title')} <span className="text-sm font-normal text-text-secondary">{t('recipeCard.nutrition.serving')}</span>
            </h4>
            {recipe.nutrition ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center p-4 bg-primary-light/50 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
                    <div>
                        <p className="font-bold text-lg text-text-primary">{recipe.nutrition.calories || 'N/A'}</p>
                        <p className="text-sm text-text-secondary">{t('recipeCard.nutrition.calories')}</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg text-text-primary">{recipe.nutrition.protein || 'N/A'}</p>
                        <p className="text-sm text-text-secondary">{t('recipeCard.nutrition.protein')}</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg text-text-primary">{recipe.nutrition.carbs || 'N/A'}</p>
                        <p className="text-sm text-text-secondary">{t('recipeCard.nutrition.carbs')}</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg text-text-primary">{recipe.nutrition.fat || 'N/A'}</p>
                        <p className="text-sm text-text-secondary">{t('recipeCard.nutrition.fat')}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-text-secondary">{t('recipeCard.nutrition.unavailable')}</p>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <h4 className="text-xl font-bold font-heading mb-3">{t('recipeCard.ingredients')}</h4>
            <ul className="space-y-2 list-disc list-inside text-text-secondary marker:text-primary dark:marker:text-primary-dark">
              {recipe.ingredients.map((item, index) => (
                <li key={index} className="pl-2">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold font-heading mb-3">{t('recipeCard.instructions')}</h4>
            <ol className="space-y-3 list-decimal list-inside text-text-secondary marker:text-primary dark:marker:text-primary-dark marker:font-bold">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="pl-2">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </motion.div>
  );
};