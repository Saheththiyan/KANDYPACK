import express from "express";
import * as cityRouteController from "../../controllers/reports/cityRouteSalesController.js";

const router = express.Router();

// GET /reports/city-route?quarter=2024 Q4
router.get("/", cityRouteController.getCityRouteSalesBreakdown);
// router.get("/route-sales", cityRouteController.getRouteSalesBreakdown);

export default router;
