import { Recipe } from '../../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const callOpenAIForRecipe = async (
  prompt: string,
  systemInstruction: string
): Promise<Recipe | Recipe[]> => {
  const apiKey = localStorage.getItem('chefCulina_openaiApiKey');
  
  if (!apiKey) {
    throw new Error("NO_API_KEY_OPENAI");
  }

  const payload = {
    model: "gpt-4o-mini", // Using a cost-effective model
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.choices?.[0]?.message?.content;

    if (!textResponse) {
      throw new Error("Empty response from OpenAI");
    }

    const parsed = JSON.parse(textResponse);
    // OpenAI's json_object mode requires the prompt to output a JSON object. 
    // If the response is wrapped (e.g. { recipes: [...] }), we might need to unwrap it 
    // or ensure the prompt asks for the exact array/object structure we need.
    // Assuming prompt asks for a JSON structure that matches Recipe | Recipe[]
    
    // Sometimes it might return { "recipes": [...] } if the model prefers objects
    if (parsed.recipes && Array.isArray(parsed.recipes)) {
        return parsed.recipes;
    }

    return parsed;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
};