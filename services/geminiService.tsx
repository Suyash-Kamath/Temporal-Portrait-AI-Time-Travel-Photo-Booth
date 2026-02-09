
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { HistoricalEra, ImageAnalysis } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzePortrait = async (base64Image: string): Promise<ImageAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-3-pro-preview";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: "Analyze this person's portrait. Describe their prominent facial features, expression, and overall vibe. Then, suggest which historical era from this list they would fit best into: Ancient Egypt, Renaissance, Viking Age, 1920s, or 1960s. Return the result in a strict JSON format with fields: 'description', 'suggestedEra', and 'visualTraits' (an array of strings).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          suggestedEra: { type: Type.STRING },
          visualTraits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["description", "suggestedEra", "visualTraits"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const transportToEra = async (
  base64Image: string,
  era: HistoricalEra
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash-image";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: era.prompt,
        },
      ],
    },
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Failed to generate temporal portrait.");
  return imageUrl;
};

export const editTemporalPortrait = async (
  currentBase64: string,
  editPrompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash-image";

  // Clean the data URL if present
  const base64Data = currentBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Data,
          },
        },
        {
          text: editPrompt,
        },
      ],
    },
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Temporal edit failed.");
  return imageUrl;
};
