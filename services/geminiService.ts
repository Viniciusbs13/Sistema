
import { GoogleGenAI, Type } from "@google/genai";

// Proteção para evitar crash se process.env não existir (comum em builds estáticos)
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateWeeklySubtasks = async (goal: string) => {
  if (!ai) {
    console.warn("Gemini AI não inicializado: Falta API_KEY.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this goal into a weekly plan (Monday to Friday). Return a JSON object where keys are the days of the week and values are arrays of 2-3 specific subtasks. Goal: "${goal}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Monday: { type: Type.ARRAY, items: { type: Type.STRING } },
            Tuesday: { type: Type.ARRAY, items: { type: Type.STRING } },
            Wednesday: { type: Type.ARRAY, items: { type: Type.STRING } },
            Thursday: { type: Type.ARRAY, items: { type: Type.STRING } },
            Friday: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const summarizeNotes = async (content: string) => {
  if (!ai) return "IA não configurada. Adicione a API_KEY nas variáveis de ambiente.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this note in 3 bullet points: "${content}"`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate summary.";
  }
};
