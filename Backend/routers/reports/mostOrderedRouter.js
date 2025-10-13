import express from "express";
import * as mostOrderedController from "../../controllers/reports/mostOrderedController.js";

const router = express.Router();

// GET /reports/most-ordered?quarter=2024 Q4
router.get("/", mostOrderedController.getMostOrdered);

export default router;
