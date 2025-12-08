// Helper to strip HTML tags for preview text
const stripHtml = (html) => {
    return html?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || '';
};

// Get client URL from environment
const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Email template for new blog notification
 */
export const newBlogTemplate = (blog, subscriberEmail) => {
    const blogUrl = `${getClientUrl()}/blog/${blog._id}`;
    const unsubscribeUrl = `${getClientUrl()}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
        <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;">📝 QuickBlog</h1>
                <p style="color:#ffffff;margin:10px 0 0;opacity:0.9;">New Blog Post Available</p>
            </td>
        </tr>
        ${blog.image ? `
        <tr>
            <td style="padding:0;">
                <img src="${blog.image}" alt="${blog.title}" style="width:100%;height:200px;object-fit:cover;">
            </td>
        </tr>` : ''}
        <tr>
            <td style="padding:30px;">
                <h2 style="color:#333;margin:0 0 10px;font-size:24px;">${blog.title}</h2>
                ${blog.subTitle ? `<p style="color:#666;margin:0 0 15px;font-size:16px;">${blog.subTitle}</p>` : ''}
                <p style="color:#555;line-height:1.6;margin:0 0 20px;">${stripHtml(blog.description)}</p>
                <a href="${blogUrl}" style="display:inline-block;background:#667eea;color:#ffffff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Read Full Article →</a>
            </td>
        </tr>
        <tr>
            <td style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0;">
                    You received this email because you subscribed to QuickBlog.<br>
                    <a href="${unsubscribeUrl}" style="color:#667eea;">Unsubscribe</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * Email template for blog update notification
 */
export const blogUpdateTemplate = (blog, subscriberEmail) => {
    const blogUrl = `${getClientUrl()}/blog/${blog._id}`;
    const unsubscribeUrl = `${getClientUrl()}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
        <tr>
            <td style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);padding:30px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;">🔄 QuickBlog</h1>
                <p style="color:#ffffff;margin:10px 0 0;opacity:0.9;">Blog Post Updated</p>
            </td>
        </tr>
        <tr>
            <td style="padding:30px;">
                <span style="background:#f5576c;color:#fff;padding:4px 10px;border-radius:3px;font-size:12px;">UPDATED</span>
                <h2 style="color:#333;margin:15px 0 10px;font-size:24px;">${blog.title}</h2>
                <p style="color:#555;line-height:1.6;margin:0 0 20px;">${stripHtml(blog.description)}</p>
                <a href="${blogUrl}" style="display:inline-block;background:#f5576c;color:#ffffff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Read Updated Article →</a>
            </td>
        </tr>
        <tr>
            <td style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0;">
                    <a href="${unsubscribeUrl}" style="color:#f5576c;">Unsubscribe</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * Welcome email template for new subscribers
 */
export const welcomeEmailTemplate = (email) => {
    const blogUrl = getClientUrl();
    const unsubscribeUrl = `${getClientUrl()}/unsubscribe?email=${encodeURIComponent(email)}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
        <tr>
            <td style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);padding:40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:32px;">🎉 Welcome!</h1>
                <p style="color:#ffffff;margin:15px 0 0;font-size:18px;opacity:0.9;">Thanks for subscribing to QuickBlog</p>
            </td>
        </tr>
        <tr>
            <td style="padding:30px;text-align:center;">
                <h2 style="color:#333;margin:0 0 15px;">You're now part of our community!</h2>
                <p style="color:#555;line-height:1.6;margin:0 0 25px;">
                    You'll receive notifications when we publish new blog posts.<br>
                    Stay tuned for interesting content!
                </p>
                <a href="${blogUrl}" style="display:inline-block;background:#11998e;color:#ffffff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Browse Latest Blogs →</a>
            </td>
        </tr>
        <tr>
            <td style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0;">
                    <a href="${unsubscribeUrl}" style="color:#11998e;">Unsubscribe</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
