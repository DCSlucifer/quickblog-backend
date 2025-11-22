import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
    name:  { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true }, // Added email field (optional)
    content: { type: String, required: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: false },
},{timestamps: true});

// Add indexes for better query performance
commentSchema.index({ blog: 1, isApproved: 1 }); // For querying approved comments by blog
commentSchema.index({ createdAt: -1 }); // For sorting by date

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;