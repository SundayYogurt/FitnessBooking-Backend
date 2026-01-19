const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/auth.config");
// เช็๋ค ว่ามี secret มน env ไหม

if (!secret) {
  throw new Error("secret is not defined in .env");
}

const register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    // validate
    if (!username || !password || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check password ไม่ต่ำกว่า 6
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters, contain 1 uppercase letter and 1 special character",
      });
    }

    //validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number format",
      });
    }

    //  check ซ้ำ
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existing = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "email or phone number already exists" });
    }

    //hashedPassword
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      username,
      password: hashedPassword,
      email,
      phone,
      role: "user",
    }); // hash ก่อน save

    // ส่งกลับไป
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Username, email, or phone already exists",
      });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // validate
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        username: userDoc.username,
        id: userDoc._id.toString(),
        role: userDoc.role,
      },
      secret,
      { expiresIn: expiresIn },
    );

    return res.status(200).json({
      message: "Login successfully",
      user: {
        id: userDoc._id,
        username: userDoc.username,
        role: userDoc.role, //ส่ง role กลับไปให้ Frontend
      },
      accessToken: token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone } = req.body;

    // validate
    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const updateData = {}; // สร้าง object เฉพาะ field ที่ client ส่งมา เพื่อเอาไป update ใน DB
    if (username) updateData.username = username; //ถ้า client ส่ง username มา
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    // ดัก client ยิง API มา แต่ไม่ส่งอะไรเลย
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No data provided for update",
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }, // $set = อัปเดตเฉพาะ field ที่มีใน updateData
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username, email, or phone already exists",
      });
    }
    return res
      .status(500)
      .json({ message: "Error to update user profile", error: error.message });
  }
};

const becomeToTrainer = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "trainer") {
      return res.status(400).json({ message: "Already a trainer" });
    }

    if (user.trainerRequest === "pending") {
      return res.status(400).json({ message: "Request already pending" });
    }

    user.trainerRequest = "pending";
    await user.save();

    return res.status(200).json({
      message: "Trainer request submitted",
      status: user.trainerRequest,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to request trainer", error: error.message });
  }
};


const getRequestFromUser = async (req, res) => {
  try {
    const user = await UserModel.find({ trainerRequest: "pending" }).select("username trainerRequest");

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "Get all user pending request successfully",
      user,
    });
  } catch (error) {
    console.error("get all user peding request error:", error);
    return res.status(500).json({
      message: "Failed to get all user request",error: error.message,
    });
  }
};
const approveTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.trainerRequest === "approved") {
      return res.status(400).json({
        message: "User has already been approved",
      });
    }

    if (user.trainerRequest !== "pending") {
      return res.status(400).json({
        message: "User has no pending trainer request",
      });
    }

    user.role = "trainer";
    user.trainerRequest = "approved";
    await user.save();

    return res.status(200).json({
      message: "Trainer approved",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to approve trainer", error: error.message });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  becomeToTrainer,
  approveTrainer,
  getRequestFromUser,
};
