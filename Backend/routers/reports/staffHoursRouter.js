import express from "express";
import * as staffHoursController from "../../controllers/reports/staffHoursController.js";

const router = express.Router();

router.get("/driver", staffHoursController.getDriverHours);
router.get("/assistant", staffHoursController.getAssistantHours);

export default router;
