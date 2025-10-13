import express from "express";
import * as staffHoursController from "../../controllers/reports/staffHoursController.js";

const router = express.Router();

// GET /reports/staff-hours?from=2024-01-01&to=2024-03-31
router.get("/driver", staffHoursController.getDriverHours);
router.get("/assistant", staffHoursController.getAssistantHours);

export default router;
