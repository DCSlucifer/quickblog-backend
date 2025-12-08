import express from "express";
import { adminLogin, approveCommentById, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard } from "../controllers/adminController.js";
import auth from "../middleware/auth.js";

const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user and receive a JWT token for accessing protected endpoints. Token expires in 24 hours.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             validLogin:
 *               summary: Valid admin credentials
 *               value:
 *                 email: admin@quickblog.com
 *                 password: admin123
 *     responses:
 *       200:
 *         description: Login successful - Returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHF1aWNrYmxvZy5jb20iLCJpYXQiOjE2MzQwNjI4MDB9.abc123
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid Credentials
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.post("/login", adminLogin);

/**
 * @swagger
 * /api/admin/comments:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve all comments from all blogs with populated blog details. Requires admin authentication. Comments are sorted by creation date (newest first).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all comments
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Comment'
 *                       - type: object
 *                         properties:
 *                           blog:
 *                             $ref: '#/components/schemas/Blog'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.get("/comments", auth, getAllComments);

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs (Admin view)
 *     description: Retrieve all blogs including drafts and unpublished content. Requires admin authentication. Blogs are sorted by creation date (newest first).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all blogs
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.get("/blogs", auth, getAllBlogsAdmin);

/**
 * @swagger
 * /api/admin/delete-comment:
 *   post:
 *     summary: Delete a comment by ID
 *     description: Permanently delete a specific comment. Requires admin authentication.
 *     tags: [Admin]
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
 *                 description: MongoDB ObjectId of the comment
 *                 example: 507f1f77bcf86cd799439012
 *           example:
 *             id: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Comment successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Comment deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.post("/delete-comment", auth, deleteCommentById);

/**
 * @swagger
 * /api/admin/approve-comment:
 *   post:
 *     summary: Approve a comment by ID
 *     description: Approve a comment to make it visible on the blog. Requires admin authentication.
 *     tags: [Admin]
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
 *                 description: MongoDB ObjectId of the comment
 *                 example: 507f1f77bcf86cd799439012
 *           example:
 *             id: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Comment successfully approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Comment approved successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.post("/approve-comment", auth, approveCommentById);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve comprehensive dashboard data including total blogs, comments, drafts, and 5 most recent blogs. Requires admin authentication.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dashboardData:
 *                   $ref: '#/components/schemas/DashboardData'
 *             example:
 *               success: true
 *               dashboardData:
 *                 blogs: 47
 *                 comments: 132
 *                 drafts: 8
 *                 recentBlogs:
 *                   - _id: 507f1f77bcf86cd799439011
 *                     title: Introduction to React Hooks
 *                     category: Technology
 *                     isPublished: true
 *                     createdAt: 2024-01-15T10:30:00.000Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.get("/dashboard", auth, getDashboard);

export default adminRouter;