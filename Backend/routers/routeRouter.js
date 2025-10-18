import express from "express";
import * as route from "../controllers/routeController.js";

const router = express.Router();

router.get("/", route.getAllRoutes);

router.post("/", route.addNewRoute);

router.delete("/:route_id", route.deleteRoute);

export default router;
