// FIX: Redefined the Recipe interface to resolve a recursive type error and define all required properties.
export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: string;
  difficulty: string;
  servingSize: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

export interface SavedRecipe extends Recipe {
  id: string; // A unique identifier, typically derived from recipeName
  notes?: string;
  categories?: string[];
  tags?: string[];
}


export interface User {
  name: string;
  email: string;
}