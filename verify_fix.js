
import 'dotenv/config';
import main from './configs/gemini.js';

async function verifyImplementation() {
    try {
        console.log("Testing actual server/configs/gemini.js implementation...");
        console.log("Using model: gemini-2.5-flash"); // As per recent update

        const prompt = "Perform a quick status check. Reply with 'OK'.";
        const response = await main(prompt);

        console.log("Response:", response);
        console.log("SUCCESS: Implementation verified.");
    } catch (error) {
        console.error("ERROR: Implementation verification failed.");
        console.error(error);
    }
}

verifyImplementation();
