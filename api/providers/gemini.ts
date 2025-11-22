import { Recipe } from '../../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const callGeminiForRecipe = async (
  prompt: string,
  systemInstruction: string
): Promise<Recipe | Recipe[]> => {
  const apiKey = localStorage.getItem('chefCulina_geminiApiKey');
  
  if (!apiKey) {
    throw new Error("NO_API_KEY_GEMINI");
  }

  // Construct the prompt with schema enforcement instructions
  const fullPrompt = `${systemInstruction}\n\n${prompt}\n\nEnsure the response is strictly valid JSON with no markdown formatting, matching the schema provided previously.`;

  const payload = {
    contents: [{
      parts: [{
        text: fullPrompt
      }]
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};