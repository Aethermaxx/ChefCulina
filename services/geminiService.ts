// FIX: Implement the full Gemini service to resolve module and runtime errors.
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

// Helper to get key (either environment or localStorage)
const getApiKey = () => {
  return localStorage.getItem('chefCulina_geminiApiKey') || process.env.API_KEY;
};

// We create the client dynamically inside functions now to ensure we pick up the latest key
const createClient = () => {
    const key = getApiKey();
    if (!key) {
        console.warn("No Gemini API key found in localStorage or environment.");
        // We might let it fail naturally or return null
    }
    return new GoogleGenAI({ apiKey: key });
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: { type: Type.STRING, description: 'Name of the recipe' },
        description: { type: Type.STRING, description: 'A short, enticing description of the recipe.' },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of ingredients with quantities.'
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Step-by-step cooking instructions.'
        },
        cookTime: { type: Type.STRING, description: 'Estimated cooking time, e.g., "30 minutes".' },
        difficulty: {
            type: Type.STRING,
            description: 'The difficulty level of the recipe, must be one of: Easy, Medium, Hard.'
        },
        servingSize: { type: Type.STRING, description: 'A description of the number of people this recipe serves, e.g., "2 Adults, 1 Child".' },
        nutrition: {
            type: Type.OBJECT,
            description: 'Nutritional information per serving. This is optional.',
            properties: {
                calories: { type: Type.STRING, description: "e.g., '350 kcal'" },
                protein: { type: Type.STRING, description: "e.g., '15g'" },
                carbs: { type: Type.STRING, description: "e.g., '30g'" },
                fat: { type: Type.STRING, description: "e.g., '20g'" },
            },
        },
    },
};

export interface ServingSize {
    adults: number;
    children: number;
    seniors: number;
}


export const generateRecipes = async (ingredients: string[], servingSize: ServingSize, restrictions: string[]): Promise<Recipe[]> => {
    // This function is kept for backward compatibility but the app should move to callAIForRecipe
    const servingPrompt = `This meal should serve ${servingSize.adults} adult(s), ${servingSize.children} child(ren), and ${servingSize.seniors} senior(s). Please adjust ingredient quantities accordingly and consider dietary needs if applicable (e.g., simpler flavors for children, softer textures for seniors). The "servingSize" field in the JSON response should be a human-readable string like "2 Adults, 1 Child".`;

    const restrictionsPrompt = restrictions.length > 0
        ? `IMPORTANT DIETARY RESTRICTIONS: The user is allergic to or avoids the following items. DO NOT include these ingredients, any of their derivatives, or items that commonly contain them in the recipe under any circumstances: ${restrictions.join(', ')}.`
        : '';

    const prompt = `
        You are an expert chef. Based on the following ingredients, generate 3 diverse and delicious recipes.
        Ingredients: ${ingredients.join(', ')}.
        ${servingPrompt}
        ${restrictionsPrompt}
        Please provide the response as a JSON array, where each object in the array is a recipe that conforms to the specified schema.
        Ensure each recipe includes a name, description, ingredients list, instructions, cook time, difficulty (Easy, Medium, or Hard), serving size, and nutrition facts.
    `;

    try {
        const ai = createClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: recipeSchema,
                },
            },
        });

        const jsonText = response.text.trim();
        const recipes = JSON.parse(jsonText);
        return recipes as Recipe[];
    } catch (error) {
        console.error("Error generating recipes:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate recipes. The AI service might be unavailable or the request failed. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating recipes.");
    }
};

export const generateSingleRecipe = async (prompt: string, servingSize: ServingSize, restrictions: string[]): Promise<Recipe> => {
     // This function is kept for backward compatibility
     const servingPrompt = `This meal should serve ${servingSize.adults} adult(s), ${servingSize.children} child(ren), and ${servingSize.seniors} senior(s). Please adjust ingredient quantities accordingly and consider dietary needs if applicable (e.g., simpler flavors for children, softer textures for seniors). The "servingSize" field in the JSON response should be a human-readable string like "2 Adults, 1 Child".`;
    
     const restrictionsPrompt = restrictions.length > 0
        ? `IMPORTANT DIETARY RESTRICTIONS: The user is allergic to or avoids the following items. DO NOT include these ingredients, any of their derivatives, or items that commonly contain them in the recipe under any circumstances: ${restrictions.join(', ')}.`
        : '';
     
     const fullPrompt = `
        You are an expert chef. The user wants a recipe based on their request.
        User request: "${prompt}"
        ${servingPrompt}
        ${restrictionsPrompt}
        Generate a single creative and delicious recipe based on this.
        Please provide the response as a single JSON object that conforms to the specified schema.
        Ensure the recipe includes a name, description, ingredients list, instructions, cook time, difficulty (Easy, Medium, or Hard), serving size, and nutrition facts.
     `;
    
    try {
        const ai = createClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        const jsonText = response.text.trim();
        const recipe = JSON.parse(jsonText);
        return recipe as Recipe;
    } catch (error) {
        console.error("Error generating single recipe:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate the recipe. The AI service might be unavailable or the request failed. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the recipe.");
    }
};

export const generateImageForRecipe = async (recipeName: string, recipeDescription?: string): Promise<string | null> => {
    const descriptionPart = recipeDescription ? ` It is described as: "${recipeDescription}"` : '';
    const prompt = `
        A vibrant, appetizing, professional food photograph of "${recipeName}".${descriptionPart}
        The image should be well-lit, with a shallow depth of field, plated beautifully on a clean, modern dish.
        Focus on textures and colors to make it look delicious. Minimalistic background.
    `;

    try {
        const ai = createClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image for recipe:", recipeName, error);
        // Fail gracefully for image generation, so the app can still show the recipe.
        return null;
    }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
    const prompt = "Identify the food ingredients in this picture. List them clearly. If it's not food, describe what you see.";
    try {
        const ai = createClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: prompt }
                ]
            }
        });
        return response.text || "No description available.";
    } catch (error) {
        console.error("Error analyzing image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while analyzing the image.");
    }
};