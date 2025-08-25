
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash'; // General text tasks

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }
    // FIX: Correct initialization with named apiKey parameter
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      // FIX: Using correct API call as per guidelines
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          // For creative text like descriptions, a bit of temperature can be good.
          // For low latency, disable thinking. For this task, default thinking is fine.
          temperature: 0.7, 
          topK: 40,
          topP: 0.95,
        }
      });
      
      // FIX: Directly access the text property as per guidelines.
      const textOutput = response.text;

      if (typeof textOutput === 'string') {
        return textOutput.trim();
      } else {
        // If response.text is not a string, it's an unexpected state or error.
        console.error("Gemini API response.text was not a string or was undefined:", response);
        throw new Error("No valid text content found in Gemini response. The 'text' property was missing or not a string.");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error instanceof Error) {
        // FIX: Avoid using deprecated GoogleGenAIError if it was ever considered.
        // Standard Error handling is fine.
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("An unknown error occurred with the Gemini API.");
    }
  }

  // Example for JSON parsing, if needed for other features
  // Not used in the current landmark description suggestion
  private parseJsonResponse<T,>(apiResponse: GenerateContentResponse): T | null {
    // FIX: Ensure .text is used for JSON string extraction before parsing
    let jsonStr = apiResponse.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Handles optional language and newlines
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); // Trim the extracted content itself
    }

    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e, "Raw text:", apiResponse.text);
      return null;
    }
  }
}