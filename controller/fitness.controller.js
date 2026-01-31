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
      location,
    } = req.body;

    const userId = req.user?.id;
    const cover = req.coverUrl; 

    // validate body
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
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // validate image
    if (!cover) {
      return res.status(400).json({ message: "Cover is required" });
    }

    // auth
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
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
      location,
      cover,
      createdBy: userId,
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: classDoc,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


const updateClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    const updateData = { ...req.body };

    // ถ้ามีอัปโหลดรูปใหม่จาก Firebase
    if (req.coverUrl) {
      updateData.cover = req.coverUrl;
    }

    // ดักไม่ส่งอะไรมาเลย
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No data provided for update",
      });
    }

    const updatedClass = await FitnessClassModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json({
      message: "Class updated",
      class: updatedClass,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error to update fitness class",
      error: error.message,
    });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await FitnessClassModel.find().populate(
      "createdBy",
      "username",
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
      isAdmin ? { _id: id } : { _id: id, createdBy: userId },
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

const getMyClasses = async (req, res) => {
  try {
    const userId = req.user.id; // มาจาก verifyToken

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // เช็ค role
    if (user.role !== "trainer" && user.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden: trainer or admin only." });
    }

    // ดึง class ที่ trainer คนนี้สร้าง
    const classes = await FitnessClassModel.find({
      createdBy: userId,
    }).sort({ createdAt: -1 }); // เรียงล่าสุดก่อน

    return res.status(200).json({
      message: "Get my classes successfully",
      classes,
    });
  } catch (error) {
    console.error("Get my classes error:", error);
    return res.status(500).json({
      message: "Error to get my classes",
      error: error.message,
    });
  }
};



module.exports = { createClass, updateClass, getAllClasses, deleteClass, getMyClasses };
