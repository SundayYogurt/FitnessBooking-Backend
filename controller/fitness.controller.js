const mongoose = require("mongoose");
const FitnessClassModel = require("../models/fitnessClass.model");
const UserModel = require("../models/user.model");

const createClass = async (req, res) => {
  try {
    const {
      className,
      trainerName,
      price,
      phone,
      duration,
      classType,
      capacity,
      description,
      classDate,
      status,
      image,
      location,
    } = req.body;
    const userId = req.user?.id;

    // validate
    if (
      !className ||
      !trainerName ||
      !price ||
      !phone ||
      !duration ||
      !classType ||
      !capacity ||
      !description ||
      !classDate ||
      !status ||
      !image ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const classDoc = await FitnessClassModel.create({
      className,
      trainerName,
      price,
      phone,
      duration,
      classType,
      capacity,
      description,
      classDate,
      status,
      image,
      location,
      createdBy: userId,
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: classDoc,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      className,
      trainerName,
      price,
      phone,
      duration,
      classType,
      capacity,
      description,
      classDate,
      status,
      image,
      location,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    if (!id) {
      return res.status(400).json({ message: "class id is required" });
    }

    const updateData = {}; // สร้าง object เฉพาะ field ที่ client ส่งมา เพื่อเอาไป update ใน DB
    if (className) updateData.className = className; //ถ้า client ส่ง username มา
    if (trainerName) updateData.trainerName = trainerName;
    if (price) updateData.price = price;
    if (phone) updateData.phone = phone;
    if (duration) updateData.duration = duration;
    if (classType) updateData.classType = classType;
    if (capacity) updateData.capacity = capacity;
    if (description) updateData.description = description;
    if (classDate) updateData.classDate = classDate;
    if (status) updateData.status = status;
    if (image) updateData.image = image;
    if (location) updateData.location = location;

    // ดัก client ยิง API มา แต่ไม่ส่งอะไรเลย
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No data provided for update",
      });
    }

    const updateClass = await FitnessClassModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // $set = อัปเดตเฉพาะ field ที่มีใน updateData
    );

    if (!updateClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json({
      message: "Class updated",
      updateClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "All fields already exists",
      });
    }
    return res
      .status(500)
      .json({ message: "Error to update fitness class", error: error.message });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await FitnessClassModel.find().populate(
      "createdBy",
      "username"
    );

    return res.status(200).json({
      message: "Get all classes successfully",
      classes,
    });
  } catch (error) {
    console.error("getAllClasses error:", error);
    return res.status(500).json({
      message: "Failed to get all classes",
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const isAdmin = req.user.role === "admin";

    if (!id) {
      return res.status(400).json({ message: "class id is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const deletedClass = await FitnessClassModel.findOneAndDelete(
      isAdmin ? { _id: id } : { _id: id, createdBy: userId }
    );

    if (!deletedClass) {
      return res.status(404).json({
        message: "Class not found or not owned by this user",
      });
    }

    return res.status(200).json({
      message: "Class deleted successfully",
      deletedClass,
    });
  } catch (error) {
    console.error("Delete class error:", error);
    return res.status(500).json({
      message: "Failed to delete this class",
    });
  }
};

module.exports = { createClass, updateClass, getAllClasses, deleteClass };
