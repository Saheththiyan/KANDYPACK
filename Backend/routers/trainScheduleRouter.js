import express from "express";
import * as schedule from "../controllers/trainScheduleController.js";

const router = express.Router();

router.get("/", schedule.getAllSchedules);

export default router;
