import express from "express";
import * as quarterlyController from "../../controllers/reports/quarterlyController.js";

const router = express.Router();

// GET /reports/quarterly?year=2024
router.get("/", quarterlyController.getQuarterlySales);

export default router;
