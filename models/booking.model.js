const mongoose = require("mongoose");

const { Schema, model } = mongoose; //ดึง Schema (กำหนดโครงสร้างข้อมูล) และ model (สร้างตัวแทน collection) ออกจาก mongoose เพื่อใช้งานง่ายขึ้น
const BookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "FitnessClass",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  }
);

//กัน user คนเดิมจองคลาสเดิมซ้ำ
BookingSchema.index({ userId: 1, classId: 1 }, { unique: true });

const BookingModel = model("Booking", BookingSchema);

module.exports = BookingModel;
