const { Router } = require("express");
const router = Router();
const verifyToken = require("../middleware/authJwt.middleware");
const {
  register,
  login,
  updateProfile,
  becomeToTrainer,
  approveTrainer,
  getRequestFromUser,
} = require("../controller/user.controller");
const {
  allowOwnerOrAdmin,
  allowAdmin,
} = require("../middleware/permission.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username.
 *         password:
 *           type: string
 *           description: The user's password.
 *         email:
 *           type: string
 *           description: The user's email.
 *         phone:
 *           type: string
 *           description: the user's phone number.
 *
 *
 */

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *     security: []
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     username:
 *                       type: string
 *                       example: john.doe
 *                     role:
 *                       type: string
 *                       example: user
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       401:
 *         description: Unauthorized
 *     security: []
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/user/profile/{id}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              username:
 *                  type: string
 *              email:
 *                  type: string
 *              phone:
 *                  type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/profile/:id", verifyToken, allowOwnerOrAdmin, updateProfile);


/**
 * @swagger
 * /api/v1/user/become-trainer:
 *   post:
 *     summary: Request to become a trainer
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request submitted successfully
 *       400:
 *         description: User is already a trainer or has a pending request
 *       401:
 *         description: Unauthorized
 */
router.post("/become-trainer", verifyToken, becomeToTrainer);

/**
 * @swagger
 * /api/v1/user/admin/approve-trainer/{id}:
 *   patch:
 *     summary: Approve a user's request to become a trainer
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to approve.
 *     responses:
 *       200:
 *         description: User approved as a trainer successfully
 *       400:
 *         description: Invalid user ID or user not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch("/admin/approve-trainer/:id",verifyToken,allowAdmin,approveTrainer,);
/**
 * @swagger
 * /api/v1/user/request:
 *   get:
 *     summary: Get all pending trainer request users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with pending trainer requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/request", verifyToken, allowAdmin, getRequestFromUser);

module.exports = router;
