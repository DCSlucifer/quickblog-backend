import express from "express";
import { addBlog, addComment, deleteBlogById, generateContent, getAllBlogs, getBlogById, getBlogComments, togglePublish, updateBlog, searchBlogs } from "../controllers/blogController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const blogRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Blog management endpoints
 */

/**
 * @swagger
 * /api/blog/add:
 *   post:
 *     summary: Add a new blog
 *     description: Create a new blog post with image upload. The image is automatically optimized and converted to WebP format via ImageKit. Requires admin authentication.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [blog, image]
 *             properties:
 *               blog:
 *                 type: string
 *                 description: JSON string containing blog data
 *                 example: '{"title":"Introduction to React Hooks","subTitle":"A comprehensive guide","description":"<p>Content here...</p>","category":"Technology","isPublished":true}'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Blog cover image (JPEG, PNG, WebP)
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Blog added successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.post("/add", upload.single('image'), auth, authorizeRoles('admin', 'super_admin'), addBlog);

/**
 * @swagger
 * /api/blog/all:
 *   get:
 *     summary: Get all published blogs
 *     description: Retrieve all published blogs with pagination support. Optionally filter by category.
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of blogs per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Technology, Startup, Lifestyle, Finance]
 *         description: Filter blogs by category
 *     responses:
 *       200:
 *         description: Successfully retrieved blogs with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *             example:
 *               success: true
 *               blogs:
 *                 - _id: 507f1f77bcf86cd799439011
 *                   title: Introduction to React Hooks
 *                   category: Technology
 *                   isPublished: true
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 5
 *                 totalBlogs: 47
 *                 blogsPerPage: 10
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.get('/all', getAllBlogs);

/**
 * @swagger
 * /api/blog/search:
 *   get:
 *     summary: Search blogs
 *     description: Search blogs by title, query, category, tags, or author
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Tags filter
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Author filter
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.get('/search', searchBlogs);

/**
 * @swagger
 * /api/blog/{blogId}:
 *   get:
 *     summary: Get a blog by ID
 *     description: Retrieve detailed information about a specific blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the blog
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Successfully retrieved blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.get('/:blogId', getBlogById);

/**
 * @swagger
 * /api/blog/delete:
 *   post:
 *     summary: Delete a blog
 *     description: Permanently delete a blog and all its associated comments. Requires admin authentication.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB ObjectId of the blog
 *                 example: 507f1f77bcf86cd799439011
 *           example:
 *             id: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Blog and associated comments deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Blog deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.post('/delete', auth, authorizeRoles('admin', 'super_admin'), deleteBlogById);

/**
 * @swagger
 * /api/blog/toggle-publish:
 *   post:
 *     summary: Toggle publish status of a blog
 *     description: Switch a blog between published and draft status. Requires admin authentication.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB ObjectId of the blog
 *                 example: 507f1f77bcf86cd799439011
 *           example:
 *             id: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Blog publish status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Blog status updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.post('/toggle-publish', auth, authorizeRoles('admin', 'super_admin'), togglePublish);

/**
 * @swagger
 * /api/blog/add-comment:
 *   post:
 *     summary: Add a comment to a blog
 *     description: Submit a new comment on a blog post. Comments require admin approval before being visible.
 *     tags: [Blog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blog, name, content]
 *             properties:
 *               blog:
 *                 type: string
 *                 description: MongoDB ObjectId of the blog
 *                 example: 507f1f77bcf86cd799439011
 *               name:
 *                 type: string
 *                 description: Commenter's name (max 100 characters)
 *                 example: John Doe
 *               content:
 *                 type: string
 *                 description: Comment text (max 1000 characters)
 *                 example: Great article! Very informative.
 *           example:
 *             blog: 507f1f77bcf86cd799439011
 *             name: John Doe
 *             content: Great article! Very informative.
 *     responses:
 *       201:
 *         description: Comment submitted for review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Comment added for review
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.post('/add-comment', addComment);

/**
 * @swagger
 * /api/blog/comments:
 *   post:
 *     summary: Get approved comments for a blog
 *     description: Retrieve all approved comments for a specific blog post, sorted by creation date (newest first)
 *     tags: [Blog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blogId]
 *             properties:
 *               blogId:
 *                 type: string
 *                 description: MongoDB ObjectId of the blog
 *                 example: 507f1f77bcf86cd799439011
 *           example:
 *             blogId: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *             example:
 *               success: true
 *               comments:
 *                 - _id: 507f1f77bcf86cd799439012
 *                   blog: 507f1f77bcf86cd799439011
 *                   name: John Doe
 *                   content: Great article!
 *                   isApproved: true
 *                   createdAt: 2024-01-15T11:00:00.000Z
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.post('/comments', getBlogComments);

/**
 * @swagger
 * /api/blog/generate:
 *   post:
 *     summary: Generate blog content using AI
 *     description: Use Google Gemini AI to generate blog content based on a text prompt. Requires admin authentication.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Topic or outline for the AI to generate content about
 *                 example: Write a blog post about the benefits of React Hooks in modern web development
 *           example:
 *             prompt: Write a blog post about the benefits of React Hooks in modern web development
 *     responses:
 *       200:
 *         description: Content generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 content:
 *                   type: string
 *                   description: AI-generated blog content in plain text format
 *                   example: React Hooks have revolutionized the way developers write React components...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.post('/generate', auth, generateContent);

/**
 * @swagger
 * /api/blog/update/{id}:
 *   put:
 *     summary: Update an existing blog
 *     description: Update blog details including title, content, category, and optionally replace the cover image. Only provided fields will be updated. Requires admin authentication.
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the blog to update
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               blog:
 *                 type: string
 *                 description: JSON string containing blog data (only include fields you want to update)
 *                 example: '{"title":"Updated Title","description":"<p>Updated content...</p>","category":"Technology","isPublished":true}'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New blog cover image (optional - only if replacing the image)
 *           examples:
 *             updateTitleOnly:
 *               summary: Update only the title
 *               value:
 *                 blog: '{"title":"New Title"}'
 *             updateWithImage:
 *               summary: Update content and replace image
 *               value:
 *                 blog: '{"title":"Updated Title","description":"<p>New content</p>"}'
 *                 image: (binary file)
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *             example:
 *               success: true
 *               message: Blog updated successfully
 *               blog:
 *                 _id: 507f1f77bcf86cd799439011
 *                 title: Updated Blog Title
 *                 subTitle: Updated subtitle
 *                 description: <p>Updated content here...</p>
 *                 category: Technology
 *                 image: https://ik.imagekit.io/quickblog/blogs/updated-image.webp
 *                 isPublished: true
 *                 createdAt: 2024-01-15T10:30:00.000Z
 *                 updatedAt: 2024-01-15T14:30:00.000Z
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Blog not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
blogRouter.put('/update/:id', upload.single('image'), auth, updateBlog);

export default blogRouter;