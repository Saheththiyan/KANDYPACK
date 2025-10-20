import express from "express";
import * as schedule from "../controllers/deliveryScheduleController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all delivery schedule routes
router.use(authenticateToken);

router.get("/", schedule.getAllschedules);

export default router;
