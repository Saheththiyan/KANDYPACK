import express from "express";
import * as order from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all order routes
router.use(authenticateToken);

router.get("/", order.getAllOrders);
router.post("/", order.createOrder);

export default router;
