import express from "express";
import * as assistant from "../controllers/assistantController.js";

const router = express.Router();

router.get("/", assistant.getAllAssistants);

router.post("/", assistant.addNewAssistant);

router.delete("/:assistant_id", assistant.deleteAssistant);

export default router;
