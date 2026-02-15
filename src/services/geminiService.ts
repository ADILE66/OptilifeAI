import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysisResult, Recipe } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("CRITICAL: Gemini API Key is missing! Check your .env file or Vercel environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

const parseJSON = (text: string): any => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse AI JSON response. Raw text:", text, e);
        return null;
    }
}

export const analyzeFoodInput = async (
    promptText: string,
    imageBase64?: string
): Promise<AIAnalysisResult | null> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
            text: `Analyze the following food input (text description or image). 
      Identify all food items visible or described. 
      For each item, estimate its portion size (e.g., '1 cup', '150g', '1 medium apple') and its nutritional values: calories, protein (g), carbs (g), and fat (g).
      Return the result strictly in JSON format. The JSON object should have a single key "items", which is an array of food item objects. Each food item object must have the following properties: "name" (string), "portion" (string), "calories" (number), "protein" (number), "carbs" (number), and "fat" (number).
      
      User Description: "${promptText}"`
        });

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        return parseJSON(text);

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
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

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
        
        Return the recipes in as a JSON array of objects with the following structure:
        {
            "id": "string",
            "name": "string",
            "description": "string",
            "prepTimeMinutes": number,
            "ingredients": ["string"],
            "instructions": ["string"],
            "macros": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number
            }
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const parsed = parseJSON(text);
        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error("Gemini Recipe Error:", error);
        return [];
    }
};

export const generateRecipeImage = async (recipeName: string): Promise<string | null> => {
    // Gemini 1.5 Flash doesn't generate images directly in this SDK way, 
    // it's for text/multimodal input. Usually image generation is a separate service or Imagen.
    // We'll use a high-quality placeholder or a search-like tool if available, but for now, 
    // let's return a nice high-quality food image from Unsplash.
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&q=80`;
}

export const generateInsights = async (
    type: 'water' | 'food' | 'activity' | 'fasting' | 'sleep' | 'weight',
    dataSummary: string
): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
            case 'weight':
                systemInstruction = "Tu es un expert en physiologie. Analyse l'évolution du poids. Commente la tendance (perte, gain ou stagnation) de manière bienveillante. Donne un conseil sur la composition corporelle ou la patience métabolique.";
                break;
        }

        const prompt = `${systemInstruction}\n\nVoici mes données récentes :\n${dataSummary}\n\nAnalyse-les et donne-moi des conseils brefs et impactants.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "Désolé, je n'ai pas pu générer d'analyse pour le moment.";

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemInstruction = "Tu es un coach de santé personnel et bienveillant nommé OptiLife Coach. Ton but est d'aider l'utilisateur à atteindre ses objectifs de santé (poids, hydratation, sommeil, sport). Tu es motivant, empathique et tu donnes des conseils pratiques basés sur la science. Tes réponses doivent être concises et encourageantes.";

        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role,
                parts: h.parts
            })),
            systemInstruction: systemInstruction
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text() || "Désolé, je ne trouve pas de réponse.";

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.";
    }
};
