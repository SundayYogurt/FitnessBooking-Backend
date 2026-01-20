const { Router } = require("express");
const router = Router();
const verifyToken = require("../middleware/authJwt.middleware");
const {
  createBooking,
  getBookingsByUser,
  cancelBooking,
} = require("../controller/booking.controller")
const {
  allowOwnerOrAdmin,
  allowUserOrAdmin,
} = require("../middleware/permission.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The booking ID.
 *           example: 60d21b4667d0d8992e610c85
 *         classId:
 *           type: string
 *           description: The ID of the fitness class.
 *           example: 60d21b4667d0d8992e610c86
 *         userId:
 *           type: string
 *           description: The ID of the user who made the booking.
 *           example: 60d21b4667d0d8992e610c87
 *         bookingDate:
 *           type: string
 *           format: date-time
 *           description: The date of the booking.
 *           example: "2024-01-01T00:00:00.000Z"
 *         bookingTime:
 *           type: string
 *           description: The time of the booking.
 *           example: "10:00"
 *         status:
 *           type: string
 *           description: The status of the booking.
 *           enum: [booked, cancelled]
 *           example: booked
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the booking was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the booking was last updated.
 *
 *     BookingCreate:
 *       type: object
 *       required:
 *         - bookingDate
 *         - bookingTime
 *       properties:
 *         bookingDate:
 *           type: string
 *           format: date
 *           description: The date for the booking.
 *           example: "2024-07-25"
 *         bookingTime:
 *           type: string
 *           description: The time for the booking.
 *           example: "14:00"
 */

/**
 * @swagger
 * /api/v1/booking/{classId}:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fitness class to book.
 *         example: 60d21b4667d0d8992e610c86
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingCreate'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booking created successfully
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/:id", verifyToken, allowUserOrAdmin, createBooking);




/**
 * @swagger
 * /api/v1/booking/my-bookings:
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */

router.get("/my-bookings", verifyToken, getBookingsByUser);

/**
 * @swagger
 * /api/v1/booking/{id}:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
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
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.patch("/:id", verifyToken, allowOwnerOrAdmin, cancelBooking);

module.exports = router;