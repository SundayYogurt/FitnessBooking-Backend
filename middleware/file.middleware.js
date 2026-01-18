const multer = require("multer");
const path = require("path");
const { bucket } = require("../config/firebase.admin");
require("dotenv").config();

// multer memory upload (field: cover)
const upload = multer({
  storage: multer.memoryStorage(), // เก็บไฟล์ไว้ใน RAM
  limits: { fileSize: 1_000_000 }, // 1MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("cover"); // รับไฟล์เดียว field ชื่อ cover

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif|webp/;

  const extName = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) return cb(null, true);
  cb(new Error("Images only! (jpeg, jpg, png, gif, webp)"));
}

// middleware: upload to firebase and attach url to req
async function uploadToFirebase(req, res, next) {
  if (!req.file) return next();

  try {
    const safeName = `${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(`uploads/${safeName}`);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    await file.makePublic();

    req.coverUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    next();
  } catch (err) {
    console.error("Firebase upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
}

module.exports = {
  upload,
  uploadToFirebase,
};
