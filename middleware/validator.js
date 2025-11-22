import mongoose from 'mongoose';

// Validate MongoDB ObjectId format
export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}

// Validate blog creation request
export const validateBlogData = (req, res, next) => {
    const { blog } = req.body;

    if (!blog) {
        return res.status(400).json({
            success: false,
            message: "Blog data is required"
        });
    }

    try {
        const blogData = JSON.parse(blog);
        const { title, description, category } = blogData;

        // Validate required fields
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Blog title is required"
            });
        }

        if (!description || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Blog description is required"
            });
        }

        if (!category || category.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Blog category is required"
            });
        }

        // Validate category is one of the allowed values
        const allowedCategories = ['Technology', 'Startup', 'Lifestyle', 'Finance'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Category must be one of: ${allowedCategories.join(', ')}`
            });
        }

        // Validate title length
        if (title.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Blog title must be less than 200 characters"
            });
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog data format"
        });
    }
}

// Validate comment data
export const validateCommentData = (req, res, next) => {
    const { blog, name, content } = req.body;

    if (!blog || !validateObjectId(blog)) {
        return res.status(400).json({
            success: false,
            message: "Valid blog ID is required"
        });
    }

    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    if (name.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Name must be less than 100 characters"
        });
    }

    if (!content || content.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Comment content is required"
        });
    }

    if (content.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Comment must be less than 1000 characters"
        });
    }

    next();
}

// Validate ID in request body
export const validateIdInBody = (req, res, next) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID is required"
        });
    }

    if (!validateObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }

    next();
}

// Validate blogId in request params
export const validateBlogIdParam = (req, res, next) => {
    const { blogId } = req.params;

    if (!blogId) {
        return res.status(400).json({
            success: false,
            message: "Blog ID is required"
        });
    }

    if (!validateObjectId(blogId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog ID format"
        });
    }

    next();
}

// Validate login credentials
export const validateLoginData = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    next();
}
