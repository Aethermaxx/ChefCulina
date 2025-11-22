import { Recipe } from '../types';
import { callGeminiForRecipe } from './providers/gemini';
import { callOpenAIForRecipe } from './providers/openai';
import { callDeepSeekForRecipe } from './providers/deepseek';

export type AIProvider = 'gemini' | 'openai' | 'deepseek';

interface ServingSize {
    adults: number;
    children: number;
    seniors: number;
}

interface RequestOptions {
    promptType: 'pantry' | 'single';
    ingredients?: string[];
    singlePrompt?: string;
    servingSize: ServingSize;
    restrictions: string[];
}

export const callAIForRecipe = async (
    options: RequestOptions
): Promise<Recipe | Recipe[]> => {
    const provider = (localStorage.getItem('chefCulina_selectedProvider') as AIProvider) || 'gemini';
    
    // Construct Common Prompt Parts
    const servingPrompt = `This meal should serve ${options.servingSize.adults} adult(s), ${options.servingSize.children} child(ren), and ${options.servingSize.seniors} senior(s). Please adjust ingredient quantities accordingly and consider dietary needs if applicable. The "servingSize" field in the JSON response should be a human-readable string like "2 Adults, 1 Child".`;

    const restrictionsPrompt = options.restrictions.length > 0
        ? `IMPORTANT DIETARY RESTRICTIONS: The user is allergic to or avoids: ${options.restrictions.join(', ')}. DO NOT include these ingredients, derivatives, or items containing them.`
        : '';

    const schemaDescription = `
    Return JSON only. Schema:
    {
        "recipeName": "string",
        "description": "string",
        "ingredients": ["string", "string"],
        "instructions": ["string", "string"],
        "cookTime": "string",
        "difficulty": "Easy" | "Medium" | "Hard",
        "servingSize": "string",
        "nutrition": { "calories": "string", "protein": "string", "carbs": "string", "fat": "string" }
    }
    `;

    let userPrompt = "";
    let systemInstruction = "You are an expert chef. " + schemaDescription;

    if (options.promptType === 'pantry') {
        userPrompt = `
            Based on the following ingredients, generate 3 diverse and delicious recipes.
            Ingredients: ${options.ingredients?.join(', ')}.
            ${servingPrompt}
            ${restrictionsPrompt}
            Return a JSON Array of recipes.
        `;
    } else {
        userPrompt = `
            The user wants a recipe based on this request: "${options.singlePrompt}"
            ${servingPrompt}
            ${restrictionsPrompt}
            Generate a single creative and delicious recipe.
            Return a single JSON Object of the recipe.
        `;
    }

    switch (provider) {
        case 'gemini':
            return callGeminiForRecipe(userPrompt, systemInstruction);
        case 'openai':
            return callOpenAIForRecipe(userPrompt, systemInstruction);
        case 'deepseek':
            return callDeepSeekForRecipe(userPrompt, systemInstruction);
        default:
            return callGeminiForRecipe(userPrompt, systemInstruction);
    }
};