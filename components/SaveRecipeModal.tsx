import React, { useState, useEffect, useRef } from 'react';
import { Recipe, SavedRecipe } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { XIcon } from './icons/XIcon';

interface SaveRecipeModalProps {
  recipe: Recipe | SavedRecipe;
  onSave: (recipeData: Omit<SavedRecipe, 'id'>) => void;
  onClose: () => void;
}

export const SaveRecipeModal: React.FC<SaveRecipeModalProps> = ({ recipe, onSave, onClose }) => {
    const { t } = useTranslation();
    const isEditing = 'id' in recipe;
    const modalRef = useRef<HTMLDivElement>(null);

    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        if (isEditing) {
            const savedRecipe = recipe as SavedRecipe;
            setNotes(savedRecipe.notes || '');
            setCategory(savedRecipe.categories?.[0] || '');
            setTags(savedRecipe.tags?.join(', ') || '');
        }
    }, [recipe, isEditing]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        const categoriesArray = category ? [category] : [];

        const savedRecipeData: Omit<SavedRecipe, 'id'> = {
            recipeName: recipe.recipeName,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            difficulty: recipe.difficulty,
            servingSize: recipe.servingSize,
            nutrition: recipe.nutrition,
            notes,
            categories: categoriesArray,
            tags: tagsArray,
        };
        onSave(savedRecipeData);
    };
    
    const categoryOptions = [
        { value: 'Dinner', labelKey: 'saveModal.category_dinner' },
        { value: 'Lunch', labelKey: 'saveModal.category_lunch' },
        { value: 'Breakfast', labelKey: 'saveModal.category_breakfast' },
        { value: 'Dessert', labelKey: 'saveModal.category_dessert' },
        { value: 'Snack', labelKey: 'saveModal.category_snack' },
        { value: 'Vegan', labelKey: 'saveModal.category_vegan' },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDuration: '0.3s' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
        >
            <div ref={modalRef} className="w-full max-w-lg bg-surface rounded-2xl shadow-xl m-4 animate-scale-in">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 id="save-modal-title" className="text-2xl font-bold font-heading">
                        {isEditing ? t('saveModal.title_edit') : t('saveModal.title_save')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">{t('saveModal.notes')}</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('saveModal.notes_placeholder')}
                                rows={4}
                                className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">{t('saveModal.categories')}</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            >
                                <option value="">{t('saveModal.category_placeholder')}</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">{t('saveModal.tags')}</label>
                            <input
                                type="text"
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder={t('saveModal.tags_placeholder')}
                                className="w-full px-4 py-2.5 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-border rounded-b-2xl">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-primary dark:bg-primary-dark dark:text-gray-900 rounded-lg shadow-md hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105"
                        >
                            {isEditing ? t('saveModal.update') : t('saveModal.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};