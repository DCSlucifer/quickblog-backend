import brevoClient from '../configs/email.js';
import Subscriber from '../models/Subscriber.js';
import { newBlogTemplate, blogUpdateTemplate, welcomeEmailTemplate } from './emailTemplates.js';

// Get FROM email address from environment or use default
const getFromEmail = () => {
    return process.env.EMAIL_FROM || 'noreply@quickblog.com';
};

// Get sender name from environment or use default
const getSenderName = () => {
    return process.env.EMAIL_FROM_NAME || 'QuickBlog';
};

/**
 * Send email using Brevo API
 * @param {Object} options - Email options (to, subject, html)
 * @returns {Promise<Object>} - Result of email send operation
 */
const sendEmail = async ({ to, subject, html }) => {
    const sendSmtpEmail = {
        sender: {
            name: getSenderName(),
            email: getFromEmail()
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
    };

    try {
        return await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        // Log detailed error information
        console.error('📧 Brevo API Error Details:');
        console.error('   Status:', error.status || error.statusCode);
        console.error('   Message:', error.message);
        if (error.response && error.response.body) {
            console.error('   Response:', JSON.stringify(error.response.body, null, 2));
        }
        if (error.body) {
            console.error('   Body:', JSON.stringify(error.body, null, 2));
        }
        throw error;
    }
};

/**
 * Send notification email to all active subscribers when a new blog is published
 * @param {Object} blog - Blog object with title, description, image, etc.
 * @returns {Promise<Object>} - Result of email send operation
 */
export const sendNewBlogNotification = async (blog) => {
    try {
        // Check if email service is configured
        if (!brevoClient) {
            console.log('📧 Email service not configured - skipping new blog notification');
            return { success: false, reason: 'Email service not configured' };
        }

        // Get all active subscribers
        const subscribers = await Subscriber.find({ isActive: true });

        if (subscribers.length === 0) {
            console.log('📧 No active subscribers - skipping notification');
            return { success: true, sent: 0, reason: 'No subscribers' };
        }

        console.log(`📧 Sending new blog notification to ${subscribers.length} subscribers...`);

        // Send emails in batches to avoid overwhelming the service
        const batchSize = 50;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            // Send to each subscriber in the batch
            const sendPromises = batch.map(async (subscriber) => {
                try {
                    await sendEmail({
                        to: subscriber.email,
                        subject: `📝 New Blog: ${blog.title}`,
                        html: newBlogTemplate(blog, subscriber.email)
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send to ${subscriber.email}:`, error.message);
                    failCount++;
                }
            });

            // Wait for batch to complete
            await Promise.allSettled(sendPromises);

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`✅ New blog notification complete: ${successCount} sent, ${failCount} failed`);

        return {
            success: true,
            sent: successCount,
            failed: failCount,
            total: subscribers.length
        };

    } catch (error) {
        console.error('❌ Error sending new blog notification:', error.message);
        // Don't throw - just log and return failure
        return { success: false, error: error.message };
    }
};

/**
 * Send notification email when a blog is updated
 * @param {Object} blog - Updated blog object
 * @returns {Promise<Object>} - Result of email send operation
 */
export const sendBlogUpdateNotification = async (blog) => {
    try {
        // Check if email service is configured
        if (!brevoClient) {
            console.log('📧 Email service not configured - skipping blog update notification');
            return { success: false, reason: 'Email service not configured' };
        }

        // Get all active subscribers
        const subscribers = await Subscriber.find({ isActive: true });

        if (subscribers.length === 0) {
            console.log('📧 No active subscribers - skipping update notification');
            return { success: true, sent: 0, reason: 'No subscribers' };
        }

        console.log(`📧 Sending blog update notification to ${subscribers.length} subscribers...`);

        // Send emails in batches
        const batchSize = 50;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            const sendPromises = batch.map(async (subscriber) => {
                try {
                    await sendEmail({
                        to: subscriber.email,
                        subject: `🔄 Updated: ${blog.title}`,
                        html: blogUpdateTemplate(blog, subscriber.email)
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send to ${subscriber.email}:`, error.message);
                    failCount++;
                }
            });

            await Promise.allSettled(sendPromises);

            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`✅ Blog update notification complete: ${successCount} sent, ${failCount} failed`);

        return {
            success: true,
            sent: successCount,
            failed: failCount,
            total: subscribers.length
        };

    } catch (error) {
        console.error('❌ Error sending blog update notification:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email to a new subscriber
 * @param {String} email - Subscriber's email address
 * @returns {Promise<Object>} - Result of email send operation
 */
export const sendWelcomeEmail = async (email) => {
    try {
        // Check if email service is configured
        if (!brevoClient) {
            console.log('📧 Email service not configured - skipping welcome email');
            return { success: false, reason: 'Email service not configured' };
        }

        console.log(`📧 Sending welcome email to ${email}...`);

        await sendEmail({
            to: email,
            subject: '🎉 Welcome to QuickBlog Newsletter!',
            html: welcomeEmailTemplate(email)
        });

        console.log(`✅ Welcome email sent to ${email}`);

        return { success: true };

    } catch (error) {
        console.error(`❌ Error sending welcome email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};
