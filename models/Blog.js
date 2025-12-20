import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true, trim: true},
    subTitle: {type: String, default: ''},
    description: {type: String, required: true},
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Startup', 'Lifestyle', 'Finance']
    },
    tags: {type: [String], default: []},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Reference to User model (to be created)
    image: {type: String, required: true},
    isPublished: {type: Boolean, required: true, default: false},
},{timestamps: true});

// Add indexes for better query performance
blogSchema.index({ createdAt: -1 }); // For sorting by date
blogSchema.index({ category: 1, isPublished: 1 }); // For filtering by category and published status
blogSchema.index({ title: 'text', description: 'text' }); // For text search

const Blog = mongoose.model('blog', blogSchema);

export default Blog;