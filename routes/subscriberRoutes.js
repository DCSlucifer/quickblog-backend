import express from "express";
import { subscribe, getAllSubscribers, unsubscribe, deleteSubscriber } from "../controllers/subscriberController.js";
import auth from "../middleware/auth.js";

const subscriberRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: Newsletter subscription management endpoints
 */

/**
 * @swagger
 * /api/subscriber/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     description: Add an email address to the newsletter subscription list. Reactivates inactive subscriptions.
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to subscribe
 *                 example: user@example.com
 *           example:
 *             email: user@example.com
 *     responses:
 *       201:
 *         description: Successfully subscribed to newsletter
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
 *                   example: Successfully subscribed to our newsletter! Thank you for joining us.
 *       400:
 *         description: Email already subscribed or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: This email is already subscribed to our newsletter!
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
subscriberRouter.post("/subscribe", subscribe);

/**
 * @swagger
 * /api/subscriber/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     description: Mark an email address as inactive in the newsletter subscription list
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to unsubscribe
 *                 example: user@example.com
 *           example:
 *             email: user@example.com
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Successfully unsubscribed. Sorry to see you go!
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Email not found in our subscriber list
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
subscriberRouter.post("/unsubscribe", unsubscribe);

/**
 * @swagger
 * /api/subscriber/all:
 *   get:
 *     summary: Get all newsletter subscribers
 *     description: Retrieve all newsletter subscribers. Optionally filter by active status. Requires admin authentication.
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status (optional)
 *     responses:
 *       200:
 *         description: Successfully retrieved subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Total number of subscribers
 *                   example: 42
 *                 subscribers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439013
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       subscribedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-23T14:39:00.000Z
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
subscriberRouter.get("/all", auth, getAllSubscribers);

/**
 * @swagger
 * /api/subscriber/delete:
 *   post:
 *     summary: Delete a subscriber permanently
 *     description: Permanently remove a subscriber from the database. Requires admin authentication.
 *     tags: [Newsletter]
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
 *                 description: MongoDB ObjectId of the subscriber
 *                 example: 507f1f77bcf86cd799439013
 *           example:
 *             id: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Subscriber deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Subscriber deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Subscriber not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Subscriber not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
subscriberRouter.post("/delete", auth, deleteSubscriber);

export default subscriberRouter;
