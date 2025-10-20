import express from "express";
import * as driver from "../controllers/driverController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all driver routes
router.use(authenticateToken);

router.get("/", driver.getAllDrivers);
router.get("/hours", driver.sortByHours);
router.get("/active", driver.activeDrivers);
router.get("/:id", driver.getDriverByID);

router.post("/", driver.addNewDriver);

router.delete("/:driver_id", driver.deleteDriver);

router.patch("/:driver_id", driver.patchDriverDetails);

export default router;
