import Subscriber from '../models/Subscriber.js';

// Subscribe to newsletter - Public endpoint
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if email is already subscribed
        const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed to our newsletter!'
                });
            } else {
                // Reactivate inactive subscription
                existingSubscriber.isActive = true;
                existingSubscriber.subscribedAt = new Date();
                await existingSubscriber.save();

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! You have been resubscribed to our newsletter.'
                });
            }
        }

        // Create new subscriber
        const newSubscriber = await Subscriber.create({ email: email.toLowerCase() });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to our newsletter! Thank you for joining us.'
        });

    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all subscribers - Admin only
export const getAllSubscribers = async (req, res) => {
    try {
        const { active } = req.query;

        // Build query - optionally filter by active status
        const query = {};
        if (active !== undefined) {
            query.isActive = active === 'true';
        }

        const subscribers = await Subscriber.find(query)
            .sort({ subscribedAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: subscribers.length,
            subscribers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Unsubscribe from newsletter - Public endpoint
export const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const subscriber = await Subscriber.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isActive: false },
            { new: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Email not found in our subscriber list'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed. Sorry to see you go!'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete subscriber permanently - Admin only
export const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Subscriber ID is required'
            });
        }

        const subscriber = await Subscriber.findByIdAndDelete(id);

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscriber deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
