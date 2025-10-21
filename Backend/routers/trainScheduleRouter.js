import express from "express";
import * as schedule from "../controllers/trainScheduleController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all train schedule routes
router.use(authenticateToken);

router.get("/", schedule.getSchedulesByCity); // Now handles both all schedules and filtered by city

export default router;
