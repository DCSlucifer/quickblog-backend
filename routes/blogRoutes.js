import express from "express";
import { addBlog, addComment, deleteBlogById, generateContent, getAllBlogs, getBlogById, getBlogComments, togglePublish } from "../controllers/blogController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";

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
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog added successfully
 */
blogRouter.post("/add", upload.single('image'), auth, addBlog);

/**
 * @swagger
 * /api/blog/all:
 *   get:
 *     summary: Get all published blogs
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: List of blogs
 */
blogRouter.get('/all', getAllBlogs);

/**
 * @swagger
 * /api/blog/{blogId}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 */
blogRouter.get('/:blogId', getBlogById);

/**
 * @swagger
 * /api/blog/delete:
 *   post:
 *     summary: Delete a blog
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog deleted
 */
blogRouter.post('/delete', auth, deleteBlogById);

/**
 * @swagger
 * /api/blog/toggle-publish:
 *   post:
 *     summary: Toggle publish status of a blog
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Publish status updated
 */
blogRouter.post('/toggle-publish', auth, togglePublish);

/**
 * @swagger
 * /api/blog/add-comment:
 *   post:
 *     summary: Add a comment to a blog
 *     tags: [Blog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogId:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added
 */
blogRouter.post('/add-comment', addComment);

/**
 * @swagger
 * /api/blog/comments:
 *   post:
 *     summary: Get comments for a blog
 *     tags: [Blog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogId:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
blogRouter.post('/comments', getBlogComments);

/**
 * @swagger
 * /api/blog/generate:
 *   post:
 *     summary: Generate blog content using AI
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated content
 */
blogRouter.post('/generate', auth, generateContent);

export default blogRouter;