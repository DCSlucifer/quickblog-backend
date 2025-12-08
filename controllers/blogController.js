// Import necessary dependencies
import fs from 'fs'
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';
import { sendNewBlogNotification, sendBlogUpdateNotification } from '../utils/emailService.js';

// Add new blog with image upload to ImageKit
export const addBlog = async (req, res) => {
    try {
        const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
        const imageFile = req.file;

        // Validate required fields (validation middleware already checked, but double-check)
        if (!title || !description || !category || !imageFile) {
            return res.status(400).json({ success: false, message: "Missing required fields" })
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
        const newBlog = await Blog.create({ title, subTitle, description, category, image, isPublished })

        // Send notification if blog is published (async - won't block)
        if (isPublished) {
            sendNewBlogNotification(newBlog).catch(err => console.log('Blog notification failed:', err.message));
        }

        // Clean up: Delete temporary file after successful upload
        fs.unlinkSync(imageFile.path);

        res.status(201).json({ success: true, message: "Blog added successfully" })

    } catch (error) {
        // Clean up: Delete temporary file even if upload failed
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch all published blogs for public view with pagination
export const getAllBlogs = async (req, res) => {
    try {
        // Optional pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build query
        const query = { isPublished: true };
        if (category) {
            query.category = category;
        }

        // Fetch blogs with pagination
        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination metadata
        const total = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            blogs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalBlogs: total,
                blogsPerPage: limit
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch a specific blog by its ID
export const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)

        // Check if blog exists
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        res.status(200).json({ success: true, blog })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Delete a blog and all its associated comments
export const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Clean up: Delete all comments associated with the blog
        await Comment.deleteMany({ blog: id });

        res.status(200).json({ success: true, message: 'Blog deleted successfully' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// Toggle blog publish status between published and draft
export const togglePublish = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Toggle publish status
        blog.isPublished = !blog.isPublished;
        await blog.save();

        // Send notification if blog was just published
        if (blog.isPublished) {
            sendNewBlogNotification(blog).catch(err => console.log('Publish notification failed:', err.message));
        }

        res.status(200).json({ success: true, message: 'Blog status updated' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// Add a new comment to a blog (requires admin approval)
export const addComment = async (req, res) => {
    try {
        const { blog, name, content } = req.body;
        await Comment.create({ blog, name, content });
        res.status(201).json({ success: true, message: 'Comment added for review' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch all approved comments for a specific blog
export const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.body;
        const comments = await Comment.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, comments })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Generate blog content using Google Gemini AI based on prompt
export const generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;
        const content = await main(prompt + ' Generate a blog content for this topic in simple text format')
        res.status(200).json({ success: true, content })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update an existing blog
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog || '{}');
        const imageFile = req.file;

        // Find existing blog
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Update fields if provided
        if (title) blog.title = title;
        if (subTitle !== undefined) blog.subTitle = subTitle;
        if (description) blog.description = description;
        if (category) blog.category = category;
        if (isPublished !== undefined) blog.isPublished = isPublished;

        // If new image is uploaded, replace the old one
        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path);

            // Upload new image to ImageKit
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: "/blogs"
            });

            // Apply optimization
            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            });

            blog.image = optimizedImageUrl;

            // Clean up temporary file
            fs.unlinkSync(imageFile.path);
        }

        // Save updated blog
        await blog.save();

        // Send update notification if blog is published
        if (blog.isPublished) {
            sendBlogUpdateNotification(blog).catch(err => console.log('Update notification failed:', err.message));
        }

        res.status(200).json({ success: true, message: 'Blog updated successfully', blog })

    } catch (error) {
        // Clean up temp file if error occurs
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message })
    }
}

// Search blogs by title, description, or category
export const searchBlogs = async (req, res) => {
    try {
        const { q, category, page = 1, limit = 10 } = req.query;

        if (!q && !category) {
            return res.status(400).json({
                success: false,
                message: 'Search query (q) or category is required'
            });
        }

        // Build search query
        const searchQuery = { isPublished: true };

        // Add text search if query provided
        if (q) {
            searchQuery.$text = { $search: q };
        }

        // Add category filter if provided
        if (category) {
            searchQuery.category = category;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute search with pagination
        const blogs = await Blog.find(searchQuery)
            .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Blog.countDocuments(searchQuery);

        res.status(200).json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalResults: total,
                resultsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}