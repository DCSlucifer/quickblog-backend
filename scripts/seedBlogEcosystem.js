import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// ==================== SCHEMAS ====================

// QuickBlog Blog Schema
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subTitle: { type: String },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// QuickBlog Comment Schema
const commentSchema = new mongoose.Schema({
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    name: { type: String, required: true },
    email: { type: String },
    content: { type: String, required: true },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

// Sample_mflix Movie Schema
const movieSchema = new mongoose.Schema({
    title: String,
    plot: String,
    fullplot: String,
    genres: [String],
    poster: String,
    year: Number,
    imdb: { rating: Number }
});

// Sample_mflix Theater Schema
const theaterSchema = new mongoose.Schema({
    theaterId: Number,
    location: {
        address: {
            street1: String,
            city: String,
            state: String,
            zipcode: String
        },
        geo: {
            coordinates: [Number]
        }
    }
});

// Sample_mflix Comment Schema
const mflixCommentSchema = new mongoose.Schema({
    name: String,
    email: String,
    movie_id: mongoose.Schema.Types.ObjectId,
    text: String,
    date: Date
});

// Sample_mflix User Schema
const mflixUserSchema = new mongoose.Schema({
    name: String,
    email: String
});

// ==================== MAPPING FUNCTIONS ====================

const genreToCategory = {
    'Technology': 'Technology',
    'Sci-Fi': 'Technology',
    'Science Fiction': 'Technology',
    'Documentary': 'Technology',
    'Business': 'Startup',
    'Biography': 'Startup',
    'Drama': 'Lifestyle',
    'Romance': 'Lifestyle',
    'Comedy': 'Lifestyle',
    'Action': 'Lifestyle',
    'Adventure': 'Lifestyle',
    'Crime': 'Finance',
    'Thriller': 'Finance',
    'Mystery': 'Finance'
};

function getCategoryFromGenres(genres) {
    if (!genres || genres.length === 0) return 'Lifestyle';
    for (const genre of genres) {
        if (genreToCategory[genre]) return genreToCategory[genre];
    }
    return 'Lifestyle';
}

function convertMovieToBlog(movie) {
    const plot = movie.fullplot || movie.plot || 'No description available.';
    const genresText = movie.genres ? movie.genres.join(', ') : 'N/A';
    const rating = movie.imdb?.rating || 'N/A';
    const year = movie.year || 'Unknown';

    const description = `
        <h2>🎬 About This Film</h2>
        <p>${plot}</p>

        <h3>📊 Movie Details</h3>
        <ul>
            <li><strong>Release Year:</strong> ${year}</li>
            <li><strong>Genres:</strong> ${genresText}</li>
            <li><strong>IMDB Rating:</strong> ⭐ ${rating}/10</li>
        </ul>

        <h3>💡 Why Watch This?</h3>
        <p>This film offers a unique perspective and engaging storytelling. ${plot.split('.')[0]}. Perfect for movie enthusiasts!</p>

        <h3>🎭 What Critics Say</h3>
        <p>A must-watch for fans of ${movie.genres?.[0] || 'cinema'}. The storytelling and cinematography make this film a memorable experience.</p>
    `.trim();

    // Use Unsplash for movie images (cinema theme)
    const imageUrl = movie.poster ||
        `https://source.unsplash.com/800x400/?movie,cinema,film&sig=${Math.random()}`;

    return {
        title: `Film Review: ${movie.title}`,
        subTitle: `A ${year} ${movie.genres?.[0] || 'film'} worth watching`,
        description: description,
        category: getCategoryFromGenres(movie.genres),
        image: imageUrl,
        isPublished: true,
        _movieId: movie._id // Temporary field to link comments
    };
}

function convertTheaterToBlog(theater, index) {
    const address = theater.location?.address || {};
    const city = address.city || 'Unknown City';
    const state = address.state || 'Unknown State';
    const street = address.street1 || 'Main Street';

    const description = `
        <h2>🎭 Cinema Location</h2>
        <p>Discover this amazing cinema located in the heart of ${city}, ${state}. A perfect place for movie lovers to enjoy the latest blockbusters and classic films.</p>

        <h3>📍 Location Details</h3>
        <ul>
            <li><strong>Address:</strong> ${street}</li>
            <li><strong>City:</strong> ${city}</li>
            <li><strong>State:</strong> ${state}</li>
            <li><strong>Zip Code:</strong> ${address.zipcode || 'N/A'}</li>
        </ul>

        <h3>🎬 What Makes It Special</h3>
        <p>This cinema offers a premium movie-watching experience with state-of-the-art sound systems and comfortable seating. Located in ${city}, it's easily accessible and provides a wide selection of films.</p>

        <h3>⭐ Visitor Reviews</h3>
        <p>Guests love the atmosphere and the quality of screenings at this location. Whether you're watching the latest superhero movie or an indie film, this theater delivers an exceptional experience.</p>

        <h3>🎟️ Plan Your Visit</h3>
        <p>Check out the latest movie schedules and book your tickets in advance. This ${city} location is a favorite among locals and visitors alike!</p>
    `.trim();

    // Use Unsplash for theater/cinema images
    const imageUrl = `https://source.unsplash.com/800x400/?theater,cinema,auditorium&sig=${Math.random()}`;

    return {
        title: `Cinema Spotlight: ${city} Theater`,
        subTitle: `Your premier movie destination in ${city}, ${state}`,
        description: description,
        category: 'Lifestyle',
        image: imageUrl,
        isPublished: true
    };
}

function convertMflixCommentToBlogComment(mflixComment, blogId, userName) {
    // Shorten comment if too long
    let content = mflixComment.text || 'Great content!';
    if (content.length > 500) {
        content = content.substring(0, 497) + '...';
    }

    return {
        blog: blogId,
        name: userName || mflixComment.name || 'Anonymous',
        email: mflixComment.email || undefined,
        content: content,
        isApproved: Math.random() > 0.3 // 70% approved, 30% pending (realistic!)
    };
}

// ==================== MAIN FUNCTION ====================

async function seedBlogEcosystem() {
    try {
        console.log('═══════════════════════════════════════════════════');
        console.log('   🌟 BLOG ECOSYSTEM GENERATOR');
        console.log('   Create blogs + comments from sample_mflix data');
        console.log('═══════════════════════════════════════════════════\n');

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env file!');
        }

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // ==================== FETCH DATA FROM SAMPLE_MFLIX ====================

        console.log('📚 Fetching data from sample_mflix...\n');

        const mflixDb = mongoose.connection.useDb('sample_mflix');

        // Get Movies
        const MovieModel = mflixDb.model('Movie', movieSchema, 'movies');
        console.log('🎬 Fetching movies...');
        const movies = await MovieModel.find({
            plot: { $exists: true, $ne: null, $ne: '' },
            title: { $exists: true }
        }).limit(30).lean();
        console.log(`   ✅ Found ${movies.length} movies`);

        // Get Theaters
        const TheaterModel = mflixDb.model('Theater', theaterSchema, 'theaters');
        console.log('🎭 Fetching theaters...');
        const theaters = await TheaterModel.find({
            'location.address.city': { $exists: true }
        }).limit(20).lean();
        console.log(`   ✅ Found ${theaters.length} theaters`);

        // Get Comments
        const MflixCommentModel = mflixDb.model('MflixComment', mflixCommentSchema, 'comments');
        console.log('💬 Fetching comments...');
        const mflixComments = await MflixCommentModel.find({
            text: { $exists: true, $ne: null },
            name: { $exists: true }
        }).limit(200).lean();
        console.log(`   ✅ Found ${mflixComments.length} comments`);

        // Get Users
        const MflixUserModel = mflixDb.model('MflixUser', mflixUserSchema, 'users');
        console.log('👤 Fetching users...');
        const users = await MflixUserModel.find({
            name: { $exists: true }
        }).limit(100).lean();
        console.log(`   ✅ Found ${users.length} users\n`);

        // ==================== CREATE BLOGS IN QUICKBLOG ====================

        const quickblogDb = mongoose.connection.useDb('quickblog');
        const Blog = quickblogDb.model('Blog', blogSchema);
        const Comment = quickblogDb.model('Comment', commentSchema);

        console.log('🔄 Converting and saving blogs...\n');

        // Convert movies to blogs
        console.log('📝 Creating blog posts from movies...');
        const movieBlogs = movies.map(convertMovieToBlog);
        const savedMovieBlogs = await Blog.insertMany(movieBlogs);
        console.log(`   ✅ Created ${savedMovieBlogs.length} movie review blogs`);

        // Convert theaters to blogs
        console.log('📝 Creating blog posts from theaters...');
        const theaterBlogs = theaters.map(convertTheaterToBlog);
        const savedTheaterBlogs = await Blog.insertMany(theaterBlogs);
        console.log(`   ✅ Created ${savedTheaterBlogs.length} cinema spotlight blogs`);

        const allBlogs = [...savedMovieBlogs, ...savedTheaterBlogs];
        console.log(`\n🎉 Total blogs created: ${allBlogs.length}\n`);

        // ==================== CREATE COMMENTS ====================

        console.log('💬 Creating comments for blogs...\n');

        const blogComments = [];

        // Distribute comments across blogs
        let commentIndex = 0;

        for (const blog of allBlogs) {
            // Random number of comments per blog (0-5)
            const numComments = Math.floor(Math.random() * 6);

            for (let i = 0; i < numComments && commentIndex < mflixComments.length; i++) {
                const mflixComment = mflixComments[commentIndex];

                // Get random user name
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const userName = randomUser?.name || mflixComment.name;

                const blogComment = convertMflixCommentToBlogComment(
                    mflixComment,
                    blog._id,
                    userName
                );

                blogComments.push(blogComment);
                commentIndex++;
            }
        }

        if (blogComments.length > 0) {
            const savedComments = await Comment.insertMany(blogComments);
            const approvedCount = savedComments.filter(c => c.isApproved).length;
            const pendingCount = savedComments.length - approvedCount;

            console.log(`✅ Created ${savedComments.length} comments`);
            console.log(`   📌 Approved: ${approvedCount}`);
            console.log(`   ⏳ Pending: ${pendingCount}\n`);
        }

        // ==================== SUMMARY ====================

        console.log('═══════════════════════════════════════════════════');
        console.log('   ✨ ECOSYSTEM GENERATION COMPLETE!');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('📊 Summary:');
        console.log(`   🎬 Movie Blogs: ${savedMovieBlogs.length}`);
        console.log(`   🎭 Theater Blogs: ${savedTheaterBlogs.length}`);
        console.log(`   📝 Total Blogs: ${allBlogs.length}`);
        console.log(`   💬 Total Comments: ${blogComments.length}`);
        console.log(`   ✅ Approved Comments: ${blogComments.filter(c => c.isApproved).length}`);
        console.log(`   ⏳ Pending Comments: ${blogComments.filter(c => !c.isApproved).length}\n`);

        console.log('📂 Categories Distribution:');
        const categories = allBlogs.reduce((acc, blog) => {
            acc[blog.category] = (acc[blog.category] || 0) + 1;
            return acc;
        }, {});
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count} blogs`);
        });

        console.log('\n🎯 Next Steps:');
        console.log('   1. Start your server: npm run server');
        console.log('   2. Open admin panel: http://localhost:5173/admin');
        console.log('   3. View blogs and moderate comments!');
        console.log('   4. Check homepage: http://localhost:5173\n');

        console.log('🎉 Your blog is now ALIVE with content and comments!\n');

        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
seedBlogEcosystem();
