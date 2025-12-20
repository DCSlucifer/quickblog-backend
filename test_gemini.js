
import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

console.log("Checking GEMINI_API_KEY...");
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing from environment variables.");
    process.exit(1);
}
console.log("GEMINI_API_KEY is present.");

async function testGemini() {
    try {
        console.log("Initializing GoogleGenAI...");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        console.log("Sending test prompt...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Response received:", response.text());
        console.log("SUCCESS: Gemini API is working.");
    } catch (error) {
        console.error("ERROR: Gemini API verification failed.");
        console.error(error);
    }
}

testGemini();
