import express from "express";
import * as deliver from "../controllers/deliversController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all delivers routes
router.use(authenticateToken);

router.get("/", deliver.getAllDeliverires);

export default router;
