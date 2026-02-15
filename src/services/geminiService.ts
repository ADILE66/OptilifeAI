import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AIAnalysisResult, Recipe } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY.includes('AIzaSyAyyX_FX3CN')) {
    console.warn("Gemini API Key might be using a placeholder or is missing. Current key prefix:", API_KEY?.substring(0, 10));
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

const parseJSON = (text: string): any => {
    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Gemini JSON Parse Error. Raw text:", text);
        return null;
    }
}

export const pingAI = async (): Promise<boolean> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'OK'");
        return !!result.response.text();
    } catch (e) {
        console.error("AI Ping Failed:", e);
        return false;
    }
}

export const analyzeFoodInput = async (
    promptText: string,
    imageBase64?: string
): Promise<AIAnalysisResult | null> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

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
            text: `Identify food items and estimate nutrition. Description: "${promptText}". 
            Return JSON: {"items": [{"name": string, "portion": string, "calories": number, "protein": number, "carbs": number, "fat": number}]}`
        });

        const result = await model.generateContent(parts);
        const response = await result.response;
        return parseJSON(response.text());

    } catch (error) {
        console.error("Gemini Food Analysis Detailed Error:", error);
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

        const langMap: Record<string, string> = { 'fr': 'French', 'en': 'English', 'es': 'Spanish' };
        const targetLang = langMap[lang] || 'French';

        const prompt = `Propose 3 healthy recipes for: "${userQuery}". Language: ${targetLang}.
        Return a JSON array of objects: {id, name, description, prepTimeMinutes: number, ingredients: string[], instructions: string[], macros: {calories, protein, carbs, fat}}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsed = parseJSON(response.text());
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Gemini Recipe Error:", error);
        return [];
    }
};

export const generateRecipeImage = async (recipeName: string): Promise<string | null> => {
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`;
}

export const generateInsights = async (
    type: 'water' | 'food' | 'activity' | 'fasting' | 'sleep' | 'weight',
    dataSummary: string
): Promise<string> => {
    try {
        let systemInstruction = "";
        switch (type) {
            case 'water': systemInstruction = "Expert hydratation. Sois bref, encourageant."; break;
            case 'food': systemInstruction = "Nutritionniste expert. Analyse l'équilibre."; break;
            case 'activity': systemInstruction = "Coach sportif. Suggestion session/récup."; break;
            case 'fasting': systemInstruction = "Spécialiste jeûne intermittent. Conseil faim/métabolisme."; break;
            case 'sleep': systemInstruction = "Spécialiste sommeil. Conseil hygiène repos."; break;
            case 'weight': systemInstruction = "Expert physiologie. Analyse tendance bienveillante."; break;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        const prompt = `Voici mes données récentes : ${dataSummary}. Analyse-les et donne-moi des conseils brefs et impactants.`;
        const result = await model.generateContent(prompt);
        return result.response.text() || "Désolé, échec de l'analyse.";
    } catch (error) {
        console.error("Gemini Insights Error:", error);
        return "Erreur IA. Réessayez plus tard.";
    }
}

export const chatWithCoach = async (
    message: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "Tu es OptiLife Coach, expert santé bienveillant. Réponds de façon concise et motivante en français."
        });

        const chat = model.startChat({
            history: history.map(h => ({ role: h.role, parts: h.parts })),
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Le coach rencontre un problème technique. Réessayez un peu plus tard.";
    }
};
