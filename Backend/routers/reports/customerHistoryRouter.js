import express from "express";
import * as customerHistoryController from "../../controllers/reports/customerHistoryController.js";

const router = express.Router();

// GET /reports/customer-history/:customerId?from=2024-01-01&to=2024-12-31
router.get("/:customerId", customerHistoryController.getCustomerHistory);

export default router;
