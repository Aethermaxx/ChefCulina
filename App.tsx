import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Home } from './views/Home';
import { Pantry } from './views/Pantry';
import { RecipeGenerator } from './views/RecipeGenerator';
import { Cookbook } from './views/Cookbook';
import { Profile } from './views/Profile';
import { Finder } from './views/Finder';
import { SharedRecipeView } from './components/SharedRecipeView';
import { Recipe, SavedRecipe, User } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SaveRecipeModal } from './components/SaveRecipeModal';
import { AnimatePresence, motion } from 'framer-motion';

export type Page = 'home' | 'pantry' | 'finder' | 'recipe' | 'cookbook' | 'profile';

// Helper to create a consistent ID from a recipe name
const getRecipeId = (recipeName: string) => {
  return recipeName.toLowerCase().replace(/\s+/g, '-');
};

const MainApp: React.FC<{ user: User }> = ({ user }) => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [sharedRecipe, setSharedRecipe] = useState<Recipe | null>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | SavedRecipe | null>(null);
  
  const userCookbookKey = `cookbook_${user.email}`;
  const userCookedCountKey = `cookedCount_${user.email}`;

  const [cookbook, setCookbook] = useState<SavedRecipe[]>(() => {
    try {
      const savedCookbook = localStorage.getItem(userCookbookKey);
      return savedCookbook ? JSON.parse(savedCookbook) : [];
    } catch (error) {
      console.error("Failed to parse cookbook from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(userCookbookKey, JSON.stringify(cookbook));
  }, [cookbook, userCookbookKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipeData = params.get('recipe');
    if (recipeData) {
      try {
        const decodedRecipe = decodeURIComponent(escape(atob(recipeData)));
        const recipeObject: Recipe = JSON.parse(decodedRecipe);
        setSharedRecipe(recipeObject);
      } catch (error) {
        console.error("Failed to parse shared recipe from URL:", error);
      }
    }
  }, []);

  const handleOpenSaveModal = (recipe: Recipe | SavedRecipe) => {
    const recipeId = getRecipeId(recipe.recipeName);
    const existingRecipe = cookbook.find(r => r.id === recipeId);
    setRecipeToEdit(existingRecipe || recipe);
    setIsSaveModalOpen(true);
  };

  const handleUnsaveRecipe = (recipeName: string) => {
    const recipeId = getRecipeId(recipeName);
    setCookbook(prev => prev.filter(r => r.id !== recipeId));
  };
  
  const handleSaveRecipe = (savedRecipeData: Omit<SavedRecipe, 'id'>) => {
    const recipeId = getRecipeId(savedRecipeData.recipeName);
    const newSavedRecipe: SavedRecipe = { ...savedRecipeData, id: recipeId };

    setCookbook(prev => {
      const existingIndex = prev.findIndex(r => r.id === recipeId);
      if (existingIndex > -1) {
        const updatedCookbook = [...prev];
        updatedCookbook[existingIndex] = newSavedRecipe;
        return updatedCookbook;
      } else {
        return [...prev, newSavedRecipe];
      }
    });
    setIsSaveModalOpen(false);
    setRecipeToEdit(null);
  };

  const handleMarkAsCooked = () => {
    const currentCount = parseInt(localStorage.getItem(userCookedCountKey) || '0', 10);
    localStorage.setItem(userCookedCountKey, (currentCount + 1).toString());
  };
  
  const handleCloseSharedRecipe = () => {
      setSharedRecipe(null);
      window.history.replaceState({}, document.title, window.location.pathname);
  }

  const savedRecipeIds = new Set(cookbook.map(r => r.id));

  const renderContent = () => {
    if (sharedRecipe) {
      return (
        <SharedRecipeView 
            recipe={sharedRecipe}
            onClose={handleCloseSharedRecipe}
            isSaved={savedRecipeIds.has(getRecipeId(sharedRecipe.recipeName))}
            onSave={handleOpenSaveModal}
            onUnsave={handleUnsaveRecipe}
            onMarkAsCooked={handleMarkAsCooked}
        />
      );
    }

    const commonProps = {
        savedRecipeIds,
        onSave: handleOpenSaveModal,
        onUnsave: handleUnsaveRecipe,
        onMarkAsCooked: handleMarkAsCooked
    };

    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'pantry':
        return <Pantry {...commonProps} />;
      case 'finder':
        return <Finder />;
      case 'recipe':
        return <RecipeGenerator {...commonProps} />;
      case 'cookbook':
          return <Cookbook cookbook={cookbook} onEdit={handleOpenSaveModal} {...commonProps} />;
      case 'profile':
        return <Profile />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={sharedRecipe ? 'shared' : currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="py-6"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {isSaveModalOpen && recipeToEdit && (
        <SaveRecipeModal
            recipe={recipeToEdit}
            onSave={handleSaveRecipe}
            onClose={() => setIsSaveModalOpen(false)}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    
    // In guest mode (auth removed), currentUser should always be defined by AuthContext
    if (!currentUser) {
        return null; 
    }
    return <MainApp user={currentUser} />;
}


const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  )
}


export default App;