import express from "express";
import * as order from "../controllers/orderController.js";

const router = express.Router();

router.get("/", order.getAllOrders);

export default router;
