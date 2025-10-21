import express from "express";
import * as truck from "../controllers/truckController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all truck routes
router.use(authenticateToken);

router.get("/", truck.getTrucksByStore); // Now handles both all trucks and filtered by store

router.post("/", truck.addNewTruck);

router.delete("/:truck_id", truck.deleteTruck);

router.patch("/:truck_id", truck.patchTruckDetails);

export default router;
