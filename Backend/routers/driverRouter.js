import express from "express";
import * as driver from "../controllers/driverController.js";

const router = express.Router();

router.get("/", driver.getAllDrivers);
router.get("/hours", driver.sortByHours);
router.get("/active", driver.activeDrivers);
router.get("/:id", driver.getDriverByID);

router.post("/", driver.addNewDriver);

export default router;
