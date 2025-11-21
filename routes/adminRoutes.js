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
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
adminRouter.post("/login", adminLogin);

/**
 * @swagger
 * /api/admin/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all comments
 */
adminRouter.get("/comments", auth, getAllComments);

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all blogs
 */
adminRouter.get("/blogs", auth, getAllBlogsAdmin);

/**
 * @swagger
 * /api/admin/delete-comment:
 *   post:
 *     summary: Delete a comment by ID
 *     tags: [Admin]
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
 *         description: Comment deleted
 */
adminRouter.post("/delete-comment", auth, deleteCommentById);

/**
 * @swagger
 * /api/admin/approve-comment:
 *   post:
 *     summary: Approve a comment by ID
 *     tags: [Admin]
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
 *         description: Comment approved
 */
adminRouter.post("/approve-comment", auth, approveCommentById);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
adminRouter.get("/dashboard", auth, getDashboard);


export default adminRouter;