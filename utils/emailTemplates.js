// Email template for new blog notifications
export const newBlogTemplate = (blog, unsubscribeEmail) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const unsubscribeUrl = `${clientUrl}/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                📝 QuickBlog
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">
                                New Blog Post Available
                            </p>
                        </td>
                    </tr>

                    <!-- Blog Image -->
                    ${blog.image ? `
                    <tr>
                        <td style="padding: 0;">
                            <img src="${blog.image}" alt="${blog.title}" style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;">
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!-- Category Badge -->
                            <div style="margin-bottom: 20px;">
                                <span style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${blog.category || 'General'}
                                </span>
                            </div>

                            <!-- Title -->
                            <h2 style="margin: 0 0 15px 0; color: #1a202c; font-size: 26px; font-weight: 700; line-height: 1.3;">
                                ${blog.title}
                            </h2>

                            <!-- Subtitle -->
                            ${blog.subTitle ? `
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.5;">
                                ${blog.subTitle}
                            </p>
                            ` : ''}

                            <!-- Description Preview -->
                            <p style="margin: 0 0 30px 0; color: #718096; font-size: 15px; line-height: 1.7;">
                                ${stripHtml(blog.description).substring(0, 200)}${blog.description.length > 200 ? '...' : ''}
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${clientUrl}/blog/${blog._id}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Read Full Article →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 15px 0; color: #718096; font-size: 13px;">
                                You're receiving this because you subscribed to QuickBlog newsletter.
                            </p>
                            <p style="margin: 0; font-size: 13px;">
                                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                                <span style="color: #cbd5e0; margin: 0 8px;">•</span>
                                <a href="${clientUrl}" style="color: #667eea; text-decoration: none;">Visit QuickBlog</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Email template for blog update notifications
export const blogUpdateTemplate = (blog, unsubscribeEmail) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const unsubscribeUrl = `${clientUrl}/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                🔄 QuickBlog
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">
                                Blog Post Updated
                            </p>
                        </td>
                    </tr>

                    <!-- Blog Image -->
                    ${blog.image ? `
                    <tr>
                        <td style="padding: 0;">
                            <img src="${blog.image}" alt="${blog.title}" style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;">
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!-- Update Badge -->
                            <div style="margin-bottom: 20px;">
                                <span style="display: inline-block; background-color: #f5576c; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Updated
                                </span>
                                <span style="display: inline-block; background-color: #e2e8f0; color: #4a5568; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px;">
                                    ${blog.category || 'General'}
                                </span>
                            </div>

                            <!-- Title -->
                            <h2 style="margin: 0 0 15px 0; color: #1a202c; font-size: 26px; font-weight: 700; line-height: 1.3;">
                                ${blog.title}
                            </h2>

                            <!-- Subtitle -->
                            ${blog.subTitle ? `
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.5;">
                                ${blog.subTitle}
                            </p>
                            ` : ''}

                            <!-- Update Notice -->
                            <p style="margin: 0 0 20px 0; color: #718096; font-size: 15px; line-height: 1.7;">
                                This blog post has been updated with new content. Check out what's changed!
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                                        <a href="${clientUrl}/blog/${blog._id}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Read Updated Article →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 15px 0; color: #718096; font-size: 13px;">
                                You're receiving this because you subscribed to QuickBlog newsletter.
                            </p>
                            <p style="margin: 0; font-size: 13px;">
                                <a href="${unsubscribeUrl}" style="color: #f5576c; text-decoration: none;">Unsubscribe</a>
                                <span style="color: #cbd5e0; margin: 0 8px;">•</span>
                                <a href="${clientUrl}" style="color: #f5576c; text-decoration: none;">Visit QuickBlog</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Email template for welcome message to new subscribers
export const welcomeEmailTemplate = (email) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const unsubscribeUrl = `${clientUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to QuickBlog</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">
                                🎉
                            </h1>
                            <h2 style="margin: 15px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                Welcome to QuickBlog!
                            </h2>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h3 style="margin: 0 0 20px 0; color: #1a202c; font-size: 22px; font-weight: 600;">
                                Thank you for subscribing! 🙌
                            </h3>

                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.7;">
                                We're thrilled to have you as part of our community! You'll now receive email notifications whenever we publish new blog posts.
                            </p>

                            <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.7;">
                                <strong>What to expect:</strong>
                            </p>

                            <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                                <li style="margin-bottom: 12px;">📧 Instant notifications when new blogs are published</li>
                                <li style="margin-bottom: 12px;">🔄 Updates on important blog revisions</li>
                                <li style="margin-bottom: 12px;">📚 Access to quality content across multiple categories</li>
                                <li style="margin-bottom: 12px;">✨ No spam, just valuable content</li>
                            </ul>

                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${clientUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Browse Latest Blogs →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 15px 0; color: #718096; font-size: 13px;">
                                You can unsubscribe at any time. We respect your privacy.
                            </p>
                            <p style="margin: 0; font-size: 13px;">
                                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                                <span style="color: #cbd5e0; margin: 0 8px;">•</span>
                                <a href="${clientUrl}" style="color: #667eea; text-decoration: none;">Visit QuickBlog</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Helper function to strip HTML tags from content
function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').trim();
}
