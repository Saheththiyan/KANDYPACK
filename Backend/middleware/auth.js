import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware to verify JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request object
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    return res.status(403).json({
      success: false,
      message: "Invalid token"
    });
  }
}

// Middleware to check if user is admin (optional - for admin-only routes)
export function requireAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
  next();
}

// Combined middleware: authenticate + require admin
export function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, (err) => {
    if (err) return;
    requireAdmin(req, res, next);
  });
}