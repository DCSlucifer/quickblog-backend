import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

// Admin login handler - validates credentials and generates JWT token
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verify admin credentials against environment variables
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        // Generate JWT token for authenticated session
        const token = jwt.sign({ email }, process.env.JWT_SECRET)
        res.json({ success: true, token })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Fetch all blogs for admin panel - sorted by creation date
export const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.json({ success: true, blogs })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Fetch all comments with associated blog details for admin review
export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find({}).populate("blog").sort({ createdAt: -1 })
        res.json({ success: true, comments })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Fetch dashboard statistics and recent blogs for admin overview
export const getDashboard = async (req, res) => {
    try {
        // Get 5 most recent blogs
        const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
        
        // Count total blogs, comments, and drafts
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments()
        const drafts = await Blog.countDocuments({ isPublished: false })

        const dashboardData = {
            blogs, 
            comments, 
            drafts, 
            recentBlogs
        }
        res.json({ success: true, dashboardData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Delete a specific comment by ID
export const deleteCommentById = async (req, res) => {
    try {
        const { id } = req.body;
        await Comment.findByIdAndDelete(id);
        res.json({ success: true, message: "Comment deleted successfully" })
    } catch (error) {
       res.json({ success: false, message: error.message }) 
    }
}

// Approve a comment to make it visible on the blog
export const approveCommentById = async (req, res) => {
    try {
        const { id } = req.body;
        await Comment.findByIdAndUpdate(id, { isApproved: true });
        res.json({ success: true, message: "Comment approved successfully" })
    } catch (error) {
       res.json({ success: false, message: error.message }) 
    }
}