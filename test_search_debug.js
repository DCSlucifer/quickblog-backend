
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import Blog from './models/Blog.js';

const runTest = async () => {
    await connectDB();

    const q = "20/10";
    console.log(`Searching for q="${q}"...`);

    try {
        // Test 1: Simple text search
        const simpleSearch = await Blog.find({
            $text: { $search: q },
            isPublished: true
        });
        console.log(`Test 1 (Simple): Found ${simpleSearch.length} blogs.`);
        simpleSearch.forEach(b => console.log(` - [${b._id}] ${b.title}`));

        // Test 2: Sort by textScore WITHOUT projection (Current Code)
        console.log("\nTest 2 (Sort without projection)...");
        try {
            const sortWithoutProj = await Blog.find({
                $text: { $search: q },
                isPublished: true
            }).sort({ score: { $meta: 'textScore' } });

            console.log(`Test 2: Success. Found ${sortWithoutProj.length} blogs.`);
        } catch (e) {
            console.log(`Test 2 FAILED: ${e.message}`);
        }

        // Test 3: Sort by textScore WITH projection
        console.log("\nTest 3 (Sort WITH projection)...");
        try {
            const sortWithProj = await Blog.find(
                {
                    $text: { $search: q },
                    isPublished: true
                },
                { score: { $meta: 'textScore' } } // Projection
            ).sort({ score: { $meta: 'textScore' } });

            console.log(`Test 3: Success. Found ${sortWithProj.length} blogs.`);
            if (sortWithProj.length > 0) {
                console.log("Sample keys:", Object.keys(sortWithProj[0].toObject()));
            }
        } catch (e) {
            console.log(`Test 3 FAILED: ${e.message}`);
        }

    } catch (err) {
        console.error("Global Error:", err);
    } finally {
        mongoose.disconnect();
    }
};

runTest();
