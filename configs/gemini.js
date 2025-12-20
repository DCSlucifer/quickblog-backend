import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main(prompt, imageBase64) {
  // Use the 'gemini-2.5-flash' model
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const parts = [prompt];

  // Add image if provided
  if (imageBase64) {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    parts.push({
      inlineData: {
        mimeType: "image/png", // Assuming PNG or standard image type
        data: base64Data
      }
    });
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  return response.text();
}

export default main;