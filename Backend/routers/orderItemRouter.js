import express from "express";
import * as item from "../controllers/orderItemController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all order item routes
router.use(authenticateToken);

router.get("/", item.getAllItems);

export default router;
