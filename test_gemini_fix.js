
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Checking GEMINI_API_KEY...");
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing from environment variables.");
    process.exit(1);
}
console.log("GEMINI_API_KEY is present.");

async function testGemini() {
    try {
        console.log("Initializing GoogleGenerativeAI...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try gemini-1.5-flash-001
        try {
            console.log("Testing gemini-1.5-flash-001...");
            const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            const result1 = await model1.generateContent("Hello?");
            console.log("SUCCESS with gemini-1.5-flash-001:", (await result1.response).text());
            return;
        } catch (e) {
            console.log("Failed with gemini-1.5-flash-001:", e.message);
        }

        // Try gemini-pro
        try {
             console.log("Testing gemini-pro...");
             const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
             const result2 = await model2.generateContent("Hello?");
             console.log("SUCCESS with gemini-pro:", (await result2.response).text());
             return;
        } catch (e) {
             console.log("Failed with gemini-pro:", e.message);
        }

        // Try original gemini-2.0-flash-exp
         try {
             console.log("Testing gemini-2.0-flash-exp...");
             const model3 = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
             const result3 = await model3.generateContent("Hello?");
             console.log("SUCCESS with gemini-2.0-flash-exp:", (await result3.response).text());
             return;
        } catch (e) {
             console.log("Failed with gemini-2.0-flash-exp:", e.message);
        }


        // Try gemini-2.5-flash
        try {
             console.log("Testing gemini-2.5-flash...");
             const model4 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
             const result4 = await model4.generateContent("Hello?");
             console.log("SUCCESS with gemini-2.5-flash:", (await result4.response).text());
             return;
        } catch (e) {
             console.log("Failed with gemini-2.5-flash:", e.message);
        }

    } catch (error) {

        console.error("ERROR: Gemini API verification failed.");
        console.error(error);
    }
}

testGemini();
