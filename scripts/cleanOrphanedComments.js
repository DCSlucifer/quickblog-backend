import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanOrphanedComments() {
    try {
        console.log('🧹 Cleaning orphaned comments (comments with deleted blogs)...\n');

        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found!');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const quickblogDb = mongoose.connection.useDb('quickblog');

        // Get raw collections
        const commentsCollection = quickblogDb.collection('comments');
        const blogsCollection = quickblogDb.collection('blogs');

        // Get all blog IDs
        const blogs = await blogsCollection.find({}).toArray();
        const blogIds = blogs.map(b => b._id.toString());
        console.log(`📊 Found ${blogIds.length} blogs in database\n`);

        // Get all comments
        const allComments = await commentsCollection.find({}).toArray();
        console.log(`📊 Total comments: ${allComments.length}\n`);

        // Find orphaned comments (blog ID not in blogIds)
        const orphanedComments = allComments.filter(c => {
            const blogIdStr = c.blog ? c.blog.toString() : null;
            return !blogIdStr || !blogIds.includes(blogIdStr);
        });

        console.log(`🔍 Orphaned comments (deleted blogs): ${orphanedComments.length}\n`);

        if (orphanedComments.length === 0) {
            console.log('✅ No orphaned comments found!');
            await mongoose.connection.close();
            return;
        }

        // Show orphaned comments
        console.log('📝 Orphaned comments to delete:');
        orphanedComments.forEach((c, i) => {
            const content = c.content ? c.content.substring(0, 50) : 'No content';
            console.log(`   ${i + 1}. "${c.name || 'Unknown'}": ${content}...`);
        });

        // Delete orphaned comments
        console.log('\n🗑️ Deleting orphaned comments...');
        const orphanedIds = orphanedComments.map(c => c._id);
        const result = await commentsCollection.deleteMany({ _id: { $in: orphanedIds } });

        console.log(`\n✅ Deleted ${result.deletedCount} orphaned comments!`);

        // Show remaining
        const remainingCount = await commentsCollection.countDocuments();
        console.log(`📊 Remaining comments: ${remainingCount}`);

        await mongoose.connection.close();
        console.log('\n👋 Done!');

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

cleanOrphanedComments();
