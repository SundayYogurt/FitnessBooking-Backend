const jwt = require("jsonwebtoken");
const { secret } = require("../config/auth.config");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Bearer <token>
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT error:", error);
    return res.status(403).json({ message: "Access forbidden" });
  }
};

module.exports = verifyToken;
