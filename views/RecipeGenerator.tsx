import React, { useState, useMemo } from 'react';
import { Recipe, SavedRecipe } from '../types';
import { generateImageForRecipe } from '../services/geminiService';
import { callAIForRecipe } from '../api/callAIForRecipe';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RecipeCard } from '../components/RecipeCard';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ClockIcon } from '../components/icons/ClockIcon';
import { SaladIcon } from '../components/icons/SaladIcon';
import { BowlIcon } from '../components/icons/BowlIcon';
import { GlobeIcon } from '../components/icons/GlobeIcon';
import { ServingSizeSelector } from '../components/ServingSizeSelector';
import { motion, AnimatePresence } from 'framer-motion';

const getRecipeId = (recipeName: string) => recipeName.toLowerCase().replace(/\s+/g, '-');

interface RecipeGeneratorProps {
    savedRecipeIds: Set<string>;
    onSave: (recipe: Recipe | SavedRecipe) => void;
    onUnsave: (recipeName: string) => void;
    onMarkAsCooked: (recipeName:string) => void;
}

const surprisePrompts = [
    "A fusion of Italian and Japanese cuisine",
    "A healthy dessert using avocado",
    "A quick 15-minute lunch with shrimp",
    "A vegan version of a classic comfort food",
    "Something creative with sweet potatoes",
    "A colorful and spicy vegetarian curry",
    "A gourmet sandwich with unique ingredients",
    "A low-carb breakfast that's not eggs",
];

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ savedRecipeIds, onSave, onUnsave, onMarkAsCooked }) => {
    const { t } = useTranslation();
    const { restrictions } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [servingSize, setServingSize] = useState({ adults: 2, children: 0, seniors: 0 });

    const totalServings = useMemo(() => servingSize.adults + servingSize.children + servingSize.seniors, [servingSize]);

    const inspirationCategories = [
        {
            label: t('recipeGenerator.quickEasy'),
            icon: <ClockIcon className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" />,
            prompt: "a quick and easy recipe that takes less than 30 minutes to prepare"
        },
        {
            label: t('recipeGenerator.healthy'),
            icon: <SaladIcon className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" />,
            prompt: "a healthy and nutritious meal, low in calories but high in flavor"
        },
        {
            label: t('recipeGenerator.comfort'),
            icon: <BowlIcon className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" />,
            prompt: "a classic comfort food recipe that's warm and satisfying"
        },
        {
            label: t('recipeGenerator.world'),
            icon: <GlobeIcon className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" />,
            prompt: "an interesting and authentic recipe from a random country around the world"
        },
    ];
    
    const handleGenerate = async (generationPrompt: string) => {
        if (!generationPrompt.trim()) {
            setError(t('recipeGenerator.promptError'));
            return;
        }
        if (totalServings === 0) {
            setError(t('pantry.servingSizeError'));
            return;
        }
        setIsGeneratingRecipe(true);
        setIsGeneratingImage(true);
        setError(null);
        setRecipe(null);
        setImageUrl(null);

        try {
            const result = await callAIForRecipe({
                promptType: 'single',
                singlePrompt: generationPrompt,
                servingSize: servingSize,
                restrictions: restrictions
            });

            const generatedRecipe = Array.isArray(result) ? result[0] : result;
            setRecipe(generatedRecipe);
            setIsGeneratingRecipe(false);

            const generatedImageUrl = await generateImageForRecipe(generatedRecipe.recipeName, generatedRecipe.description);
            setImageUrl(generatedImageUrl);
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
            setError(t('recipeGenerator.genericError', { details: errorMessage }));
            setIsGeneratingRecipe(false);
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const isLoading = isGeneratingRecipe || isGeneratingImage;

    const handleSurpriseMe = () => {
        const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
        setPrompt(randomPrompt);
    };

    const handleInspirationClick = (inspirationPrompt: string) => {
        setPrompt(inspirationPrompt);
        handleGenerate(inspirationPrompt);
    };

    return (
        <div className="container mx-auto px-4 pb-20">
            <div className="max-w-3xl mx-auto animate-fade-in-up">
                <div className="text-center">
                    <h2 className="text-4xl font-bold font-heading">{t('recipeGenerator.title')}</h2>
                    <p className="text-lg text-text-secondary mt-2">{t('recipeGenerator.subtitle')}</p>
                </div>
                
                <div className="mt-8 bg-surface p-6 rounded-2xl shadow-lg border border-border">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate(prompt)}
                        placeholder={t('recipeGenerator.inputPlaceholder')}
                        className="flex-grow px-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                      />
                      <button
                        onClick={() => handleGenerate(prompt)}
                        disabled={isLoading || totalServings === 0}
                        className="glass-button px-5 py-2.5 font-semibold text-white rounded-lg transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
                      >
                         <SparklesIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                        <ServingSizeSelector servingSize={servingSize} onChange={setServingSize} />
                    </div>

                    <div className="text-center mt-4">
                       <button
                           onClick={handleSurpriseMe}
                           disabled={isLoading}
                           className="px-4 py-2 text-sm font-semibold text-primary dark:text-primary-dark hover:bg-primary-light dark:hover:bg-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface focus:ring-primary transition-all disabled:text-gray-400 disabled:cursor-not-allowed"
                       >
                           {t('recipeGenerator.surpriseMe')}
                       </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isLoading && <LoadingSpinner />}
            </AnimatePresence>

            {error && (
                <div className="max-w-3xl mx-auto mt-6 p-4 text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 rounded-lg" role="alert">
                    <p className="font-semibold">{t('pantry.errorTitle')}</p>
                    <p>{error}</p>
                </div>
            )}

            {recipe ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mt-12"
                >
                    <RecipeCard
                        recipe={recipe}
                        imageUrl={imageUrl}
                        imageLoading={isGeneratingImage}
                        isSaved={savedRecipeIds.has(getRecipeId(recipe.recipeName))}
                        onSave={onSave}
                        onUnsave={onUnsave}
                        onMarkAsCooked={onMarkAsCooked}
                    />
                </motion.div>
            ) : !isLoading && (
                 <div className="max-w-3xl mx-auto mt-12 animate-fade-in-up" style={{animationDelay: '150ms'}}>
                    <h3 className="text-xl font-bold text-center font-heading mb-4">{t('recipeGenerator.inspirationTitle')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {inspirationCategories.map((cat, index) => (
                            <button
                                key={index}
                                onClick={() => handleInspirationClick(cat.prompt)}
                                className="group flex flex-col items-center justify-center text-center p-4 bg-surface rounded-2xl border border-border hover:border-primary hover:shadow-lg dark:hover:border-primary-dark transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {cat.icon}
                                <span className="mt-2 font-semibold text-text-secondary group-hover:text-text-primary transition-colors">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};