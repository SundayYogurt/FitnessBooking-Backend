const FitnessClassModel = require("../models/fitnessClass.model");


const allowOwnerOrAdmin = (req, res, next) => {
  const { id: userId, role } = req.user;
  const { id: targetId } = req.params;

  const isOwner = String(userId) === String(targetId);
  const isAdmin = role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

const allowClassOwnerOrAdmin = async (req, res, next) => {
  const { id: classId } = req.params;
  const { id: userId, role } = req.user;

  if (role === "admin") return next();

  const classDoc = await FitnessClassModel.findById(classId);
  if (!classDoc) {
    return res.status(404).json({ message: "Class not found" });
  }

  if (classDoc.createdBy.toString() !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

const allowAdmin = (req, res, next) => {
  const { role } = req.user;

  if (!role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

    if (role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

const allowTrainerOrAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== "trainer" && role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

const allowUserOrAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== "user" && role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

module.exports = { allowOwnerOrAdmin , allowClassOwnerOrAdmin, allowAdmin, allowTrainerOrAdmin, allowUserOrAdmin};
