import express from "express";
import * as truckUsageController from "../../controllers/reports/truckUsageController.js";

const router = express.Router();

// GET /reports/truck-usage?month=2024-09
router.get("/", truckUsageController.getTruckUsage);

export default router;
