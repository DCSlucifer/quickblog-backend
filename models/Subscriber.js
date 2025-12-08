import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

// Add index for faster email lookups
// subscriberSchema.index({ email: 1 }); // Not needed - 'unique: true' already creates index
subscriberSchema.index({ isActive: 1 });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;
