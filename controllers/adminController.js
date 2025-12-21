import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

// Admin login handler - validates credentials and generates JWT token
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if any users exist, if not, create default Super Admin
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = await User.create({
                    name: 'Super Admin',
                    email,
                    password: hashedPassword,
                    role: 'super_admin'
                });
                const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
                return res.status(200).json({ success: true, token, message: "Super Admin Created and Logged In" });
            }
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ success: true, token });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch all blogs for admin panel - sorted by creation date or comment count
export const getAllBlogsAdmin = async (req, res) => {
    try {
        const { category, status, sort } = req.query;
        let matchStage = {};

        if (category) matchStage.category = category;
        if (status) matchStage.isPublished = status === 'published';

        let sortStage = { createdAt: -1 }; // Default Newest
        if (sort === 'oldest') sortStage = { createdAt: 1 };
        if (sort === 'most-comments') sortStage = { commentCount: -1 };

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
            {
                $sort: sortStage
            },
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
                    category: 1,
                    isPublished: 1,
                    createdAt: 1,
                    image: 1,
                    commentCount: 1,
                    "author.name": 1
                }
            }
        ]);

        res.status(200).json({ success: true, blogs })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch all comments with associated blog details for admin review with filtering
export const getAllComments = async (req, res) => {
    try {
        const { status, startDate, endDate, blogId } = req.query;
        let query = {};

        if (status) query.isApproved = status === 'approved';
        if (blogId) query.blog = blogId;
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const comments = await Comment.find(query).populate("blog", "title").sort({ createdAt: -1 })
        res.status(200).json({ success: true, comments })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Fetch dashboard statistics and recent blogs for admin overview
export const adminDashboard = async (req, res) => {
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
        res.status(200).json({ success: true, dashboardData })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Delete a specific comment by ID
// Delete a specific comment by ID
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.body;
        await Comment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Comment deleted successfully" })
    } catch (error) {
       res.status(500).json({ success: false, message: error.message })
    }
}

// Approve a comment to make it visible on the blog
export const approveComment = async (req, res) => {
    try {
        const { id } = req.body;
        await Comment.findByIdAndUpdate(id, { isApproved: true });
        res.status(200).json({ success: true, message: "Comment approved successfully" })
    } catch (error) {
       res.status(500).json({ success: false, message: error.message })
    }
}

// Delete a blog from admin panel
export const deleteBlogAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await Blog.findByIdAndDelete(id);
        // Also delete associated comments? Ideally yes, but keeping simple.
        await Comment.deleteMany({ blog: id });
        res.status(200).json({ success: true, message: "Blog deleted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}