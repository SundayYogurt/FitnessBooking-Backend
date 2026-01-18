const { Router } = require("express");
const router = Router();
const verifyToken = require("../middleware/authJwt.middleware");
const {
  allowClassOwnerOrAdmin,
  allowAdmin,
  allowTrainerOrAdmin,
} = require("../middleware/permission.middleware");
const {
  createClass,
  updateClass,
  getAllClasses,
  deleteClass,
} = require("../controller/fitness.controller");


const { uploadToFirebase, upload } = require("../middleware/file.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     FitnessClass:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The fitness class ID.
 *           example: 60d21b4667d0d8992e610c85
 *         className:
 *           type: string
 *           description: The name of the fitness class.
 *           example: Yoga
 *         trainerName:
 *           type: string
 *           description: The name of the trainer.
 *           example: "John Doe"
 *         price:
 *           type: number
 *           description: The price of the class.
 *           example: 500
 *         phone:
 *           type: string
 *           description: "The phone number of the trainer."
 *           example: "0812345678"
 *         duration:
 *           type: number
 *           description: "The duration of the class."
 *           example: 60 
 *         classType:
 *           type: string
 *           description: "The type of the class."
 *           example: "Yoga"
 *         capacity:
 *           type: number
 *           description: "The capacity of the class."
 *           example: 20
 *         description:
 *           type: string
 *           description: A description of the fitness class.
 *           example: A relaxing yoga class for all levels.
 *         classDate:
 *           type: string
 *           format: date-time
 *           description: "The date of the class."
 *           example: "2024-01-01T10:00:00.000Z"
 *         status:
 *           type: string
 *           description: "The status of the class."
 *           example: "available"
 *         image:
 *           type: string
 *           description: "The image of the class."
 *           example: "https://example.com/image.jpg"
 *         location:
 *           type: string
 *           description: "The location of the class."
 *           example: "Bangkok"
 *         createdBy:
 *           type: string
 *           description: The ID of the user who created the class.
 *           example: 60d21b4667d0d8992e610c87
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the class was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the class was last updated.
 *
 *     FitnessClassCreate:
 *       type: object
 *       required:
 *         - className
 *         - trainerName
 *         - price
 *         - phone
 *         - duration
 *         - classType
 *         - capacity
 *         - description
 *         - classDate
 *         - status
 *         - image
 *         - location
 *       properties:
 *         className:
 *           type: string
 *           example: Yoga
 *         trainerName:
 *           type: string
 *           example: "John Doe"
 *         price:
 *           type: number
 *           example: 500
 *         phone:
 *           type: string
 *           example: "0812345678"
 *         duration:
 *           type: string
 *           example: "60 minutes"
 *         classType:
 *           type: string
 *           example: "Yoga"
 *         capacity:
 *           type: number
 *           example: 20
 *         description:
 *           type: string
 *           example: A relaxing yoga class for all levels.
 *         classDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T10:00:00.000Z"
 *         status:
 *           type: string
 *           example: "available"
 *         image:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         location:
 *           type: string
 *           example: "Bangkok"
 *
 *     FitnessClassUpdate:
 *       type: object
 *       properties:
 *         className:
 *           type: string
 *           example: Advanced Yoga
 *         trainerName:
 *           type: string
 *           example: Jane Doe
 *         price:
 *           type: number
 *           example: 599
 *         phone:
 *           type: string
 *           example: "0899999999"
 *         duration:
 *           type: string
 *           example: "90 minutes"
 *         classType:
 *           type: string
 *           example: Pilates
 *         capacity:
 *           type: integer
 *           example: 15
 *         description:
 *           type: string
 *           example: Updated class description
 *         classDate:
 *           type: string
 *           format: date-time
 *           example: 2024-02-01T09:00:00Z
 *         image:
 *           type: string
 *           example: https://example.com/new-image.jpg
 *         location:
 *           type: string
 *           example: Chiang Mai
 */

/**
 * @swagger
 * /api/v1/fitness_class:
 *   post:
 *     summary: Create a new fitness class
 *     tags: [Fitness Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FitnessClassCreate'
 *     responses:
 *       201:
 *         description: Fitness class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FitnessClass'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Trainer or Admin only)
 */
router.post("/", verifyToken, allowTrainerOrAdmin, upload, uploadToFirebase, createClass);

/**
 * @swagger
 * /api/v1/fitness_class/{id}:
 *   patch:
 *     summary: Update a fitness class
 *     tags: [Fitness Classes]
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
 *             $ref: '#/components/schemas/FitnessClassUpdate'
 *     responses:
 *       200:
 *         description: Fitness class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FitnessClass'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Fitness class not found
 */
router.patch("/:id", verifyToken, allowClassOwnerOrAdmin, upload ,uploadToFirebase, updateClass);

/**
 * @swagger
 * /api/v1/fitness_class:
 *   get:
 *     summary: Get all fitness classes
 *     tags: [Fitness Classes]
 *     responses:
 *       200:
 *         description: A list of fitness classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FitnessClass'
 */
router.get("/", getAllClasses);

/**
 * @swagger
 * /api/v1/fitness_class/{id}:
 *   delete:
 *     summary: Delete a fitness class
 *     tags: [Fitness Classes]
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
 *         description: Fitness class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fitness class deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Fitness class not found
 */
router.delete("/:id", verifyToken, allowAdmin, deleteClass);

module.exports = router;
