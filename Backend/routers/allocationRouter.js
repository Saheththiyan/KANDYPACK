import express from "express";
import * as allocation from "../controllers/allocationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all allocation routes
router.use(authenticateToken);

router.get("/", allocation.getAllAllocations);
router.get("/unprocessed", allocation.getUnprocessedOrders);
router.get("/by-city", allocation.getOrdersByCity);
router.get("/route-store/:routeId", allocation.getOrdersByRouteStore);
router.post("/", allocation.postAllocation);

export default router;
