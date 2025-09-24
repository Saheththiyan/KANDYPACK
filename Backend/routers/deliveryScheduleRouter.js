import express from "express";
import * as schedule from "../controllers/deliveryScheduleController.js";

const router = express.Router();

router.get("/", schedule.getAllschedules);

export default router;
