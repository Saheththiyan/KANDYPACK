import express from "express";
import * as quarterlyController from "../../controllers/reports/quarterlyController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// GET /reports/quarterly?year=2024 - requires authentication
router.get("/", authenticateToken, quarterlyController.getQuarterlySales);

export default router;
