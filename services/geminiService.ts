
// Fix: Added Type import and implemented responseSchema for structured JSON output
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklySubtasks = async (goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this goal into a weekly plan (Monday to Friday). Return a JSON object where keys are the days of the week and values are arrays of 2-3 specific subtasks. Goal: "${goal}"`,
      config: {
        responseMimeType: "application/json",
        // Recommended method for JSON: providing a responseSchema
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
    // Accessing .text as a property as per guidelines
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const summarizeNotes = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this note in 3 bullet points: "${content}"`,
    });
    // Accessing .text as a property as per guidelines
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate summary.";
  }
};
