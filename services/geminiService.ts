import { GoogleGenAI } from "@google/genai";
import { AIModel } from "../types";

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeImage = async (imageBlob: Blob): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key chưa được cấu hình.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await blobToBase64(imageBlob);

    const response = await ai.models.generateContent({
      model: AIModel.FLASH,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageBlob.type,
              data: base64Data
            }
          },
          {
            text: "Hãy mô tả hình ảnh này một cách ngắn gọn (dưới 30 từ) bằng tiếng Việt để dùng làm chú thích ảnh."
          }
        ]
      }
    });

    return response.text || "Không thể tạo mô tả.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lỗi khi phân tích hình ảnh.";
  }
};