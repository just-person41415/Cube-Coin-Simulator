import { GoogleGenAI, Type, Modality } from "@google/genai";
import { fileToGenerativePart } from "../utils";

// Initialize the client
// process.env.API_KEY is assumed to be present as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Stream chat response
   */
  async *streamChat(history: { role: string; parts: { text: string }[] }[], message: string) {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are a helpful, witty, and concise AI assistant demonstrating your capabilities.",
      }
    });

    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      yield chunk.text;
    }
  },

  /**
   * Analyze image with text prompt
   */
  async analyzeImage(file: File, prompt: string) {
    const base64Data = await fileToGenerativePart(file);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Standard flash is great for vision
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text;
  },

  /**
   * Generate structured JSON data
   */
  async generateRecipes(cuisine: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 unique and popular ${cuisine} recipes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              cuisine: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["name", "cuisine", "difficulty", "prepTime", "ingredients"]
          }
        }
      }
    });
    return response.text;
  },

  /**
   * Generate Speech (TTS)
   */
  async generateSpeech(text: string): Promise<string | undefined> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Voices: Puck, Charon, Kore, Fenrir, Zephyr
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
};