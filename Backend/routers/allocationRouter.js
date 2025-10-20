import express from "express";
import * as allocation from "../controllers/allocationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all allocation routes
router.use(authenticateToken);

router.get("/", allocation.getAllAllocations);

export default router;
