import express from "express";
import { login, registerCustomer, getProfile, updateProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticateToken, getProfile);
router.put("/me", authenticateToken, updateProfile);
router.post("/customer-register", registerCustomer);

export default router;
