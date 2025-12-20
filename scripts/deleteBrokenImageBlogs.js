import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    category: String,
    isPublished: Boolean
}, { timestamps: true });

async function deleteBrokenImageBlogs() {
    try {
        console.log('🗑️ Deleting blogs with broken Unsplash images...\n');

        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found!');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const quickblogDb = mongoose.connection.useDb('quickblog');
        const Blog = quickblogDb.model('Blog', blogSchema, 'blogs');

        // Find blogs with broken Unsplash URLs
        const brokenBlogs = await Blog.find({
            image: { $regex: 'source.unsplash.com', $options: 'i' }
        }).lean();

        console.log(`📊 Found ${brokenBlogs.length} blogs with broken Unsplash images:\n`);

        brokenBlogs.forEach((blog, index) => {
            console.log(`   ${index + 1}. ${blog.title}`);
        });

        if (brokenBlogs.length === 0) {
            console.log('✅ No blogs with broken images found!');
            await mongoose.connection.close();
            return;
        }

        // Delete them
        console.log('\n🗑️ Deleting...');
        const result = await Blog.deleteMany({
            image: { $regex: 'source.unsplash.com', $options: 'i' }
        });

        console.log(`\n✅ Deleted ${result.deletedCount} blogs successfully!`);

        // Show remaining blogs count
        const remainingCount = await Blog.countDocuments();
        console.log(`📊 Remaining blogs: ${remainingCount}`);

        await mongoose.connection.close();
        console.log('\n👋 Done!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

deleteBrokenImageBlogs();
