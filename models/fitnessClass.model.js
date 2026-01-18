const mongoose = require("mongoose");

const { Schema, model } = mongoose; //ดึง Schema (กำหนดโครงสร้างข้อมูล) และ model (สร้างตัวแทน collection) ออกจาก mongoose เพื่อใช้งานง่ายขึ้น
const FitnessClassSchema = new Schema(
  {
    className: { type: String, required: true },
    trainerName: { type: String, required: true },
    price: { type: Number, required: true },
    phone: { type: String, required: true },
    duration: { type: Number, required: true }, // นาที
    classType: { type: String, required: true },
    capacity: { type: Number, required: true },
    description: { type: String, required: true },
    classDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    image: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  },
  {
    timestamps: true,
  }
);

const FitnessClassModel = model("FitnessClass", FitnessClassSchema);

module.exports = FitnessClassModel;
