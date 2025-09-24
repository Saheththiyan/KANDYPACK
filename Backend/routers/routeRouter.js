import express from "express";
import * as route from "../controllers/routeController.js";

const router = express.Router();

router.get("/", route.getAllRoutes);

export default router;
