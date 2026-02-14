
// FIX: Using Type for structured JSON output as per Gemini API guidelines.
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Recipe } from "../types";

const parseJSON = (text: string): any => {
    try {
        // clean markdown if present
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return null;
    }
}

export const analyzeFoodInput = async (
    promptText: string,
    imageBase64?: string
): Promise<AIAnalysisResult | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // FIX: Use a multimodal model that supports image input as per Gemini API guidelines.
        // 'gemini-2.5-flash-image' is suitable for general image analysis tasks.
        const modelId = "gemini-2.5-flash-image";

        const parts: any[] = [];

        if (imageBase64) {
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            });
        }

        parts.push({
            // FIX: Updated prompt to be more explicit about the desired JSON structure,
            // as responseSchema is not supported for image models (nano banana series).
            text: `Analyze the following food input (text description or image). 
      Identify all food items visible or described. 
      For each item, estimate its portion size (e.g., '1 cup', '150g', '1 medium apple') and its nutritional values: calories, protein (g), carbs (g), and fat (g).
      Return the result strictly in JSON format. The JSON object should have a single key "items", which is an array of food item objects. Each food item object must have the following properties: "name" (string), "portion" (string), "calories" (number), "protein" (number), "carbs" (number), and "fat" (number).
      
      User Description: "${promptText}"`
        });

        // FIX: Removed the 'config' object with responseMimeType and responseSchema, as they are not
        // supported by image models like 'gemini-2.5-flash-image'.
        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts },
        });

        if (response.text) {
            return parseJSON(response.text);
        }
        return null;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
};

export const suggestRecipes = async (
    userQuery: string,
    lang: string = 'fr'
): Promise<Recipe[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // gemini-3-flash-preview is suitable for this text task and supports responseSchema.
        const modelId = "gemini-3-flash-preview";

        const langMap: Record<string, string> = {
            'fr': 'French',
            'en': 'English',
            'es': 'Spanish'
        };
        const targetLang = langMap[lang] || 'French';

        const prompt = `
        You are a creative chef. Propose 3 healthy and delicious recipes based on the following user input: "${userQuery}".
        If the input is empty, suggest 3 balanced meal options suitable for a healthy diet.
        
        CRITICAL: All text content (name, description, ingredients, instructions) MUST be written in ${targetLang}.
        `;

        // FIX: Using responseSchema and responseMimeType for reliable structured output on gemini-3 models.
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            prepTimeMinutes: { type: Type.NUMBER },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            macros: {
                                type: Type.OBJECT,
                                properties: {
                                    calories: { type: Type.NUMBER },
                                    protein: { type: Type.NUMBER },
                                    carbs: { type: Type.NUMBER },
                                    fat: { type: Type.NUMBER },
                                },
                                required: ["calories", "protein", "carbs", "fat"],
                            },
                        },
                        required: ["id", "name", "description", "prepTimeMinutes", "ingredients", "instructions", "macros"],
                    },
                },
            },
        });

        if (response.text) {
            const parsed = parseJSON(response.text);
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];

    } catch (error) {
        console.error("Gemini Recipe Error:", error);
        return [];
    }
};

export const generateRecipeImage = async (recipeName: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Use gemini-2.5-flash-image for image generation as per guidelines.
        const modelId = "gemini-2.5-flash-image";

        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [{ text: `A delicious, professional food photography shot of: ${recipeName}. High quality, appetizing, restaurant style, soft lighting.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });

        // FIX: Iterating through parts to find the inlineData as per multi-part response guidelines.
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Recipe Image Generation Failed:", e);
        return null;
    }
}

export const generateInsights = async (
    type: 'water' | 'food' | 'activity' | 'fasting' | 'sleep',
    dataSummary: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // gemini-3-flash-preview is suitable for basic text tasks.
        const modelId = "gemini-3-flash-preview";

        let systemInstruction = "";
        switch (type) {
            case 'water':
                systemInstruction = "Tu es un expert en hydratation. Analyse les données de consommation d'eau de l'utilisateur. Sois bref, encourageant et donne 1 ou 2 conseils concrets. Si la consommation est faible, explique les risques. Si elle est bonne, félicite.";
                break;
            case 'food':
                systemInstruction = "Tu es un nutritionniste expert. Analyse le journal alimentaire résumé ci-dessous. Commente l'équilibre calorique et des macronutriments. Donne 2 conseils pratiques pour améliorer l'alimentation.";
                break;
            case 'activity':
                systemInstruction = "Tu es un coach sportif. Analyse l'historique d'activité physique. Évalue la régularité et l'intensité. Propose une suggestion pour la prochaine séance ou pour la récupération.";
                break;
            case 'fasting':
                systemInstruction = "Tu es un spécialiste du jeûne intermittent. Analyse les habitudes de jeûne. Vérifie la régularité et la durée. Donne un conseil pour mieux gérer la faim ou optimiser les résultats métaboliques.";
                break;
            case 'sleep':
                systemInstruction = "Tu es un spécialiste du sommeil. Analyse les habitudes de sommeil. Commente la durée et la régularité. Donne un conseil pour améliorer la qualité du repos ou l'hygiène de sommeil.";
                break;
        }

        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Voici mes données récentes : ${dataSummary}. Analyse-les et donne-moi des conseils.`,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // FIX: response.text is a getter, used correctly.
        return response.text || "Désolé, je n'ai pas pu générer d'analyse pour le moment.";

    } catch (error) {
        console.error("Gemini Insights Error:", error);
        return "Une erreur est survenue lors de l'analyse IA. Veuillez réessayer plus tard.";
    }
}

export const chatWithCoach = async (
    message: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelId = "gemini-3-flash-preview";

        const systemInstruction = "Tu es un coach de santé personnel et bienveillant nommé OptiLife Coach. Ton but est d'aider l'utilisateur à atteindre ses objectifs de santé (poids, hydratation, sommeil, sport). Tu es motivant, empathique et tu donnes des conseils pratiques basés sur la science. Tes réponses doivent être concises et encourageantes.";

        // Construct the full conversation including the new message
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
            model: modelId,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text || "Désolé, je ne trouve pas de réponse.";

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.";
    }
};
