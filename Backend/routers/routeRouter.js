import express from "express";
import * as route from "../controllers/routeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all route routes
router.use(authenticateToken);

router.get("/", route.getAllRoutes);

router.post("/", route.addNewRoute);

router.delete("/:route_id", route.deleteRoute);

export default router;
