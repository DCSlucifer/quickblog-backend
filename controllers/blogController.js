// Import necessary dependencies
import fs from 'fs'
import mongoose from 'mongoose';
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
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

// Get all blogs (Public) - supports filtering and sorting
export const getAllBlogs = async (req, res) => {
    try {
        const { category, sort, page = 1, limit = 12 } = req.query;
        let matchStage = { isPublished: true };

        if (category) matchStage.category = category;

        // Improved Tag Filtering (if passed via query even if UI removed)
        if (req.query.tags) {
            const tagsArray = req.query.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            if (tagsArray.length > 0) {
                matchStage.tags = { $in: tagsArray };
            }
        }

        // Author Filtering (Backwards compatibility / Direct API usage)
        if (req.query.author) {
            const authorInput = req.query.author.trim();
            if (mongoose.Types.ObjectId.isValid(authorInput)) {
                matchStage.author = new mongoose.Types.ObjectId(authorInput);
            }
            // Note: Complex name search not supported in this simple match stage without pre-query,
            // but UI removed author input anyway. keeping ID support.
        }

        // Sorting Logic
        let sortStage = { createdAt: -1 }; // Default Newest
        if (sort === 'oldest') sortStage = { createdAt: 1 };
        if (sort === 'most-comments') sortStage = { commentCount: -1 };

        // Pagination calculation
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Aggregation Pipeline
        const blogs = await Blog.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "blog",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    commentCount: { $size: "$comments" }
                }
            },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: {
                    path: "$author",
                    preserveNullAndEmptyArrays: true
                }
            },
             {
                $project: {
                    title: 1,
                    description: 1,
                    category: 1,
                    isPublished: 1,
                    createdAt: 1,
                    image: 1,
                    tags: 1,
                    commentCount: 1,
                    "author.name": 1,
                    "author.email": 1
                }
            }
        ]);

        // Get total count for pagination
        const total = await Blog.countDocuments(matchStage);

        res.status(200).json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBlogs: total,
                blogsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch a specific blog by its ID
export const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId).populate('author', 'name email'); // Populate author details

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
        const { blog, name, email, content } = req.body;
        await Comment.create({ blog, name, email, content });
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

// Generate blog content using Google Gemini AI based on prompt and image
export const generateContent = async (req, res) => {
    try {
        const { title, subTitle, image } = req.body;

        // System Prompt + User Inputs
        const prompt = `
        Role: Expert SEO Writer.
        Task: Write an engaging blog post based on the user's title and the visual context of the provided image.

        Title: ${title}
        Subtitle: ${subTitle}

        Output: HTML formatted body. Do not include markdown code blocks. Just the HTML content.
        `;

        const content = await main(prompt, image)
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
        const { q, category, sort, page = 1, limit = 10 } = req.query;
        const pipeline = [];

        // 1. Match Stage (Text Search must be first)
        let matchStage = { isPublished: true };

        if (q) {
            matchStage.$text = { $search: `"${q}"` };
        }

        if (category) {
            matchStage.category = category;
        }

        pipeline.push({ $match: matchStage });

        // 2. Project Score (if text search) - Essential for sorting by relevance later
        if (q) {
            pipeline.push({
                $addFields: { score: { $meta: "textScore" } }
            });
        }

        // 3. Additional Filters (Tags, Author)
        if (req.query.tags) {
            const tagsArray = req.query.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            if (tagsArray.length > 0) {
                pipeline.push({ $match: { tags: { $in: tagsArray } } });
            }
        }

        if (req.query.author) {
             const authorInput = req.query.author.trim();
             if (mongoose.Types.ObjectId.isValid(authorInput)) {
                 pipeline.push({ $match: { author: new mongoose.Types.ObjectId(authorInput) } });
             } else {
                  const users = await User.find({ name: { $regex: authorInput, $options: 'i' } }).select('_id');
                  const userIds = users.map(user => user._id);
                  if (userIds.length > 0) {
                       pipeline.push({ $match: { author: { $in: userIds } } });
                  } else {
                       // Force empty result if author not found
                       return res.status(200).json({
                           success: true,
                           blogs: [],
                           pagination: {
                               currentPage: parseInt(page),
                               totalPages: 0,
                               totalResults: 0,
                               resultsPerPage: parseInt(limit)
                           }
                       });
                  }
             }
        }

        // 4. Lookup Comments & Count
        pipeline.push({
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "blog",
                as: "comments"
            }
        });
        pipeline.push({
             $addFields: { commentCount: { $size: "$comments" } }
        });

        // 5. Sorting
        let sortStage = {};
        if (sort === 'most-comments') {
            sortStage = { commentCount: -1 };
        } else if (sort === 'oldest') {
            sortStage = { createdAt: 1 };
        } else if (sort === 'newest') {
            sortStage = { createdAt: -1 };
        } else {
            // Default sort logic
            if (q) {
                sortStage = { score: { $meta: "textScore" } };
            } else {
                sortStage = { createdAt: -1 };
            }
        }
        pipeline.push({ $sort: sortStage });

        // 6. Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        // 7. Lookup Author Details
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        });
        pipeline.push({
            $unwind: { path: "$author", preserveNullAndEmptyArrays: true }
        });

        // 8. Final Projection
        pipeline.push({
            $project: {
                title: 1,
                description: 1,
                category: 1,
                isPublished: 1,
                createdAt: 1,
                image: 1,
                tags: 1,
                commentCount: 1,
                score: 1,
                "author.name": 1,
                "author.email": 1
            }
        });

        // Execute Aggregation
        const blogs = await Blog.aggregate(pipeline);

        // Get total count
        const countQuery = { ...matchStage };
        if (req.query.tags) {
             const tagsArray = req.query.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
             if (tagsArray.length > 0) countQuery.tags = { $in: tagsArray };
        }
         if (req.query.author) {
             const authorInput = req.query.author.trim();
             if (mongoose.Types.ObjectId.isValid(authorInput)) {
                 countQuery.author = authorInput;
             } else {
                  const users = await User.find({ name: { $regex: authorInput, $options: 'i' } }).select('_id');
                  const userIds = users.map(user => user._id);
                  countQuery.author = { $in: userIds };
             }
        }

        const total = await Blog.countDocuments(countQuery);

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