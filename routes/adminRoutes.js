import express from "express";
import { adminLogin, deleteComment, adminDashboard, getAllComments, getAllBlogsAdmin, approveComment, deleteBlogAdmin } from "../controllers/adminController.js";
import auth from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and management endpoints
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin and return JWT token.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
adminRouter.post('/login', adminLogin);
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard stats
 *     description: Retrieve statistics for the admin dashboard. Requires admin authentication.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
adminRouter.get('/dashboard', auth, authorizeRoles('admin', 'super_admin', 'moderator'), adminDashboard);

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs (admin)
 *     description: Retrieve all blogs including unpublished ones. Requires admin authentication.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of blogs
 *       500:
 *         description: Server error
 */
adminRouter.get('/blogs', auth, authorizeRoles('admin', 'super_admin', 'moderator'), getAllBlogsAdmin);

/**
 * @swagger
 * /api/admin/comments:
 *   get:
 *     summary: Get all comments (admin)
 *     description: Retrieve all comments. Requires admin authentication.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       500:
 *         description: Server error
 */
adminRouter.get('/comments', auth, authorizeRoles('admin', 'super_admin', 'moderator'), getAllComments);

/**
 * @swagger
 * /api/admin/approve-comment:
 *   post:
 *     summary: Approve a comment
 *     description: Approve a pending comment. Requires admin privileges.
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
 *     responses:
 *       200:
 *         description: Comment approved
 *       500:
 *         description: Server error
 */
adminRouter.post('/approve-comment', auth, authorizeRoles('admin', 'super_admin', 'moderator'), approveComment);

/**
 * @swagger
 * /api/admin/delete-comment:
 *   post:
 *     summary: Delete a comment
 *     description: Permanently delete a comment. Requires admin privileges.
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
 *     responses:
 *       200:
 *         description: Comment deleted
 *       500:
 *         description: Server error
 */
adminRouter.post('/delete-comment', auth, authorizeRoles('super_admin', 'moderator'), deleteComment);

/**
 * @swagger
 * /api/admin/blog/delete/{id}:
 *   delete:
 *     summary: Delete a blog (Admin)
 *     description: Delete a blog from admin panel. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted
 *       500:
 *         description: Server error
 */
adminRouter.delete('/blog/delete/:id', auth, authorizeRoles('admin', 'super_admin'), deleteBlogAdmin);

export default adminRouter;