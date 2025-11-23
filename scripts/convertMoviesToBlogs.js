import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Blog Schema (same as in Blog.js model)
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subTitle: { type: String },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

// Movie Schema (from sample_mflix)
const movieSchema = new mongoose.Schema({
    title: String,
    plot: String,
    fullplot: String,
    genres: [String],
    poster: String,
    year: Number,
    imdb: {
        rating: Number
    }
});

const Movie = mongoose.model('Movie', movieSchema, 'movies');

// Map movie genres to blog categories
const genreToCategory = {
    'Technology': 'Technology',
    'Sci-Fi': 'Technology',
    'Science Fiction': 'Technology',
    'Documentary': 'Technology',
    'Business': 'Startup',
    'Biography': 'Lifestyle',
    'Drama': 'Lifestyle',
    'Romance': 'Lifestyle',
    'Comedy': 'Lifestyle',
    'Action': 'Lifestyle',
    'Adventure': 'Lifestyle',
    'Crime': 'Finance',
    'Thriller': 'Finance',
    'Mystery': 'Finance'
};

// Get category from movie genres
function getCategoryFromGenres(genres) {
    if (!genres || genres.length === 0) return 'Lifestyle';

    for (const genre of genres) {
        if (genreToCategory[genre]) {
            return genreToCategory[genre];
        }
    }
    return 'Lifestyle'; // default
}

// Convert movie to blog post
function convertMovieToBlog(movie) {
    const plot = movie.fullplot || movie.plot || 'No description available.';
    const genresText = movie.genres ? movie.genres.join(', ') : 'N/A';
    const rating = movie.imdb?.rating || 'N/A';
    const year = movie.year || 'Unknown';

    // Create HTML description
    const description = `
        <h2>About This Film</h2>
        <p>${plot}</p>

        <h3>Details</h3>
        <ul>
            <li><strong>Year:</strong> ${year}</li>
            <li><strong>Genres:</strong> ${genresText}</li>
            <li><strong>IMDB Rating:</strong> ${rating}/10</li>
        </ul>

        <h3>Why Watch This?</h3>
        <p>This film offers a unique perspective and engaging storytelling that makes it worth your time. ${plot.split('.')[0]}.</p>
    `.trim();

    return {
        title: `Film Review: ${movie.title}`,
        subTitle: `A ${year} ${movie.genres?.[0] || 'film'} worth watching`,
        description: description,
        category: getCategoryFromGenres(movie.genres),
        image: movie.poster || 'https://via.placeholder.com/800x400?text=Movie+Poster',
        isPublished: true
    };
}

// Main function
async function convertMoviesToBlogs() {
    try {
        console.log('🎬 Starting Movies to Blogs Conversion...\n');

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env file!');
        }

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Switch to sample_mflix database to read movies
        const mflixDb = mongoose.connection.useDb('sample_mflix');
        const MovieModel = mflixDb.model('Movie', movieSchema, 'movies');

        // Fetch movies (limit to avoid too many)
        console.log('🎥 Fetching movies from sample_mflix...');
        const movies = await MovieModel.find({
            plot: { $exists: true, $ne: null, $ne: '' },
            title: { $exists: true },
            poster: { $exists: true, $ne: null }
        })
        .limit(50) // Get 50 movies (change this number if you want more/less)
        .lean();

        console.log(`✅ Found ${movies.length} movies with complete data\n`);

        if (movies.length === 0) {
            console.log('❌ No movies found! Check your sample_mflix database.');
            process.exit(1);
        }

        // Switch to quickblog database to save blogs
        const quickblogDb = mongoose.connection.useDb('quickblog');
        const BlogModel = quickblogDb.model('Blog', blogSchema);

        // Convert and save blogs
        console.log('🔄 Converting movies to blog posts...');
        const blogPosts = movies.map(convertMovieToBlog);

        console.log('💾 Saving blog posts to quickblog database...');
        const savedBlogs = await BlogModel.insertMany(blogPosts);

        console.log(`\n✅ SUCCESS! Created ${savedBlogs.length} blog posts!\n`);

        // Show some examples
        console.log('📝 Sample blog posts created:');
        savedBlogs.slice(0, 5).forEach((blog, index) => {
            console.log(`   ${index + 1}. ${blog.title} (${blog.category})`);
        });

        console.log('\n🎉 Conversion complete! You can now view these blogs in your QuickBlog app.\n');

        // Close connection
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
console.log('═══════════════════════════════════════════════════');
console.log('   🎬 MOVIES TO BLOGS CONVERTER');
console.log('   Convert sample_mflix movies to QuickBlog posts');
console.log('═══════════════════════════════════════════════════\n');

convertMoviesToBlogs();
