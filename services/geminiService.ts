
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  /**
   * Generates a professional description for a role using Gemini.
   * Creates a fresh GoogleGenAI instance right before the API call as per guidelines.
   */
  static async researchRole(title: string, department: string) {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("Missing API Key. Please add VITE_API_KEY to your .env file.");
      return "AI research unavailable: Missing API Key.";
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a concise (2-3 sentences) professional description for a ${title} in the ${department} department. Focus on modern industry standards and key responsibilities.`,
      });

      // Use the .text property directly instead of text()
      return response.text || "No description generated.";
    } catch (error) {
      console.error("Gemini Role Research Error:", error);
      return "Could not fetch AI insights at this time.";
    }
  }

  /**
   * Fetches typical industry roles for a given department.
   * Utilizes responseSchema for reliable JSON generation.
   */
  static async getIndustryRoles(department: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `List typical job roles for a ${department} department in a tech company. Provide a JSON list of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        },
      });
      // Use the .text property directly
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Industry Roles Error:", error);
      return [];
    }
  }
}
