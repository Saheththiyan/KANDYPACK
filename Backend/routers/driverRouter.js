import express from "express";
import * as driver from "../controllers/driverController.js";

const router = express.Router();

router.get("/", driver.getAllDrivers);

export default router;
