import express from "express";
import * as cityRouteController from "../../controllers/reports/cityRouteController.js";

const router = express.Router();

// GET /reports/city-route?quarter=2024 Q4
router.get("/", cityRouteController.getCityRouteBreakdown);

export default router;
