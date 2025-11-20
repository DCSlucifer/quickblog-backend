// Import necessary dependencies
import fs from 'fs'
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';

// Add new blog with image upload to ImageKit
export const addBlog = async (req, res) => {
    try {
        const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
        const imageFile = req.file;

        // Validate required fields
        if (!title || !description || !category || !imageFile) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        const fileBuffer = fs.readFileSync(imageFile.path)

        // Upload image to ImageKit cloud storage
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })

        // Apply optimization through ImageKit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' }, // Auto compression
                { format: 'webp' },  // Convert to modern format
                { width: '1280' }    // Width resizing
            ]
        });

        const image = optimizedImageUrl;

        // Create new blog entry in database
        await Blog.create({ title, subTitle, description, category, image, isPublished })

        res.json({ success: true, message: "Blog added successfully" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Fetch all published blogs for public view
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true })
        res.json({ success: true, blogs })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Fetch a specific blog by its ID
export const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
        
        // Check if blog exists
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }
        res.json({ success: true, blog })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Delete a blog and all its associated comments
export const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.body;
        await Blog.findByIdAndDelete(id);

        // Clean up: Delete all comments associated with the blog
        await Comment.deleteMany({ blog: id });

        res.json({ success: true, message: 'Blog deleted successfully' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Toggle blog publish status between published and draft
export const togglePublish = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        
        // Toggle publish status
        blog.isPublished = !blog.isPublished;
        await blog.save();
        
        res.json({ success: true, message: 'Blog status updated' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Add a new comment to a blog (requires admin approval)
export const addComment = async (req, res) => {
    try {
        const { blog, name, content } = req.body;
        await Comment.create({ blog, name, content });
        res.json({ success: true, message: 'Comment added for review' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Fetch all approved comments for a specific blog
export const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.body;
        const comments = await Comment.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, comments })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Generate blog content using Google Gemini AI based on prompt
export const generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;
        const content = await main(prompt + ' Generate a blog content for this topic in simple text format')
        res.json({ success: true, content })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}