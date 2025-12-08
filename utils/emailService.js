import brevoClient from '../configs/email.js';
import * as Brevo from '@getbrevo/brevo';
import Subscriber from '../models/Subscriber.js';
import { newBlogTemplate, blogUpdateTemplate, welcomeEmailTemplate } from './emailTemplates.js';

// Get email sender info
const getFromEmail = () => process.env.EMAIL_FROM || 'noreply@quickblog.com';
const getSenderName = () => process.env.EMAIL_FROM_NAME || 'QuickBlog';

/**
 * Send email using Brevo API
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!brevoClient) {
        throw new Error('Email service not configured');
    }

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: getSenderName(), email: getFromEmail() };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    return await brevoClient.sendTransacEmail(sendSmtpEmail);
};

/**
 * Send notification email to all subscribers when a new blog is published
 */
export const sendNewBlogNotification = async (blog) => {
    try {
        if (!brevoClient) {
            console.log('📧 Email service not configured - skipping notification');
            return { success: false, reason: 'Email service not configured' };
        }

        const subscribers = await Subscriber.find({ isActive: true });
        if (subscribers.length === 0) {
            console.log('📧 No active subscribers');
            return { success: true, sent: 0 };
        }

        console.log(`📧 Sending new blog notification to ${subscribers.length} subscribers...`);

        let successCount = 0, failCount = 0;
        for (const subscriber of subscribers) {
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
        }

        console.log(`✅ New blog notification: ${successCount} sent, ${failCount} failed`);
        return { success: true, sent: successCount, failed: failCount };

    } catch (error) {
        console.error('❌ Error sending notification:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification email when a blog is updated
 */
export const sendBlogUpdateNotification = async (blog) => {
    try {
        if (!brevoClient) {
            console.log('📧 Email service not configured - skipping update notification');
            return { success: false, reason: 'Email service not configured' };
        }

        const subscribers = await Subscriber.find({ isActive: true });
        if (subscribers.length === 0) return { success: true, sent: 0 };

        console.log(`📧 Sending blog update notification to ${subscribers.length} subscribers...`);

        let successCount = 0, failCount = 0;
        for (const subscriber of subscribers) {
            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: `🔄 Updated: ${blog.title}`,
                    html: blogUpdateTemplate(blog, subscriber.email)
                });
                successCount++;
            } catch (error) {
                failCount++;
            }
        }

        console.log(`✅ Blog update notification: ${successCount} sent, ${failCount} failed`);
        return { success: true, sent: successCount, failed: failCount };

    } catch (error) {
        console.error('❌ Error sending update notification:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email to a new subscriber
 */
export const sendWelcomeEmail = async (email) => {
    try {
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
        console.error(`❌ Error sending welcome email:`, error.message);
        return { success: false, error: error.message };
    }
};
