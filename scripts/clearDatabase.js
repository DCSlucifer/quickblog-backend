import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const blogSchema = new mongoose.Schema({}, { strict: false });
const commentSchema = new mongoose.Schema({}, { strict: false });

async function clearDatabase() {
    try {
        console.log('🗑️  CLEARING DATABASE...\n');

        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env file!');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const quickblogDb = mongoose.connection.useDb('quickblog');
        const Blog = quickblogDb.model('Blog', blogSchema);
        const Comment = quickblogDb.model('Comment', commentSchema);

        const blogCount = await Blog.countDocuments();
        const commentCount = await Comment.countDocuments();

        console.log(`Found ${blogCount} blogs and ${commentCount} comments\n`);

        if (blogCount > 0 || commentCount > 0) {
            console.log('Deleting...');
            await Blog.deleteMany({});
            await Comment.deleteMany({});
            console.log('✅ Deleted all blogs and comments!\n');
        } else {
            console.log('Database already empty\n');
        }

        await mongoose.connection.close();
        console.log('👋 Done! Now run: node scripts/seedBlogEcosystem.js\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

clearDatabase();
