
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import Blog from './models/Blog.js';

const runTest = async () => {
    await connectDB();

    const q = "20/10";
    console.log(`Testing strict search strategies for q="${q}"...\n`);

    try {
        // Strategy 1: Phrased Text Search (Quotes)
        console.log("--- Strategy 1: Phrased Text Search (\"20/10\") ---");
        const phrasedSearch = await Blog.find({
            $text: { $search: `"${q}"` },
            isPublished: true
        }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });

        console.log(`Found ${phrasedSearch.length} blogs.`);
        phrasedSearch.forEach(b => console.log(`   [${b.score || 'N/A'}] ${b.title}`));

        // Strategy 2: Regex Search (Title OR Description)
        console.log("\n--- Strategy 2: Regex Search (Title OR Description) ---");
        const regex = new RegExp(q, 'i'); // Case-insensitive
        const regexSearch = await Blog.find({
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }
            ],
            isPublished: true
        });

        console.log(`Found ${regexSearch.length} blogs.`);
        regexSearch.forEach(b => console.log(`   ${b.title}`));

        // Strategy 3: Text Search with High Threshold
        console.log("\n--- Strategy 3: Text Search (Standard) > 2.0 Score ---");
        const standardSearch = await Blog.find({
            $text: { $search: q },
            isPublished: true
        }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });

        const filtered = standardSearch.filter(b => b.score > 2.0);
        console.log(`Found ${filtered.length} blogs (out of ${standardSearch.length} raw matches).`);
        filtered.forEach(b => console.log(`   [${b.score.toFixed(2)}] ${b.title}`));

    } catch (err) {
        console.error("Global Error:", err);
    } finally {
        mongoose.disconnect();
    }
};

runTest();
