import express from "express";
import * as assistant from "../controllers/assistantController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all assistant routes
router.use(authenticateToken);

router.get("/", assistant.getAssistantsByStore); // Now handles both all assistants and filtered by store

router.post("/", assistant.addNewAssistant);

router.delete("/:assistant_id", assistant.deleteAssistant);

router.patch("/:assistant_id", assistant.patchAssistantDetails);

export default router;
