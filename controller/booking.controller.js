const mongoose = require("mongoose");
const BookingModel = require("../models/booking.model");
const FitnessClassModel = require("../models/fitnessClass.model");
const UserModel = require("../models/user.model");

  const createBooking = async (req, res) => {
    try {
      const { classId } = req.params;
      const { bookingDate, bookingTime } = req.body;
      const userId = req.user?.id;

      // auth
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!classId) {
        return res.status(400).json({ message: "Class not found"})
      }
      // validate body
      if (!bookingDate || !bookingTime) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid classId" });
      }

      // check user
      const userExists = await UserModel.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      // check class
      const classExists = await FitnessClassModel.exists({ _id: classId });
      if (!classExists) {
        return res.status(404).json({ message: "Class not found" });
      }
      // สร้าง การ booking
      const bookingDoc = await BookingModel.create({
        userId,
        classId,
        bookingDate,
        bookingTime,
      });

      // ตอบกลับ  status 201  กับ bookigDoc
      return res.status(201).json({
        message: "Booking created successfully",
        booking: bookingDoc,
      });
    } catch (error) {
      // booking ซ้ำ
      if (error.code === 11000) {
        return res.status(400).json({
          message: "You already booked this class",
          error: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({ message: "Error createing booking", error: error.message  });
    }
  };

const getBookingsByUser = async (req, res) => {
  try {
    // ดึง id ผ่าน req.user
    const userId = req.user?.id;

    // auth validate
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // check userId จาก db
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    //query booking
    const bookings = await BookingModel.find({ userId })
      .populate("userId", "username")
      .populate("classId", "className classDate");

    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: "Error getting bookings" , error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "booking id is required" });
    }

    // หา booking ก่อน
    const booking = await BookingModel.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // เช็คเจ้าของ booking
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ถ้า cancel ไปแล้ว
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    // update status
    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error to cancel booking", error: error.message  });
  }
};


module.exports = { createBooking , getBookingsByUser , cancelBooking};
