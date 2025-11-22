import { Recipe } from '../../types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export const callDeepSeekForRecipe = async (
  prompt: string,
  systemInstruction: string
): Promise<Recipe | Recipe[]> => {
  const apiKey = localStorage.getItem('chefCulina_deepseekApiKey');
  
  if (!apiKey) {
    throw new Error("NO_API_KEY_DEEPSEEK");
  }

  // DeepSeek V2/V3 Chat
  const payload = {
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt + "\n\nProvide the output strictly as a valid JSON object/array with no markdown code fencing." }
    ],
    // stream: false
  };

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    let textResponse = data.choices?.[0]?.message?.content;

    if (!textResponse) {
      throw new Error("Empty response from DeepSeek");
    }

    // Clean potential markdown code blocks if the model ignores instructions
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(textResponse);
    if (parsed.recipes && Array.isArray(parsed.recipes)) {
        return parsed.recipes;
    }
    return parsed;
  } catch (error) {
    console.error("Error calling DeepSeek:", error);
    throw error;
  }
};