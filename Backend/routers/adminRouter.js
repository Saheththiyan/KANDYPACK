import express from "express";
import * as admin from "../controllers/adminController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply admin authentication to all admin routes
router.use(authenticateAdmin);

router.get("/", admin.getAllAdmins);

router.post("/", admin.addNewAdmin);

export default router;
