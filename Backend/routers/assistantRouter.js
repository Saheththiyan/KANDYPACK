import express from "express";
import * as assistant from "../controllers/assistantController.js";

const router = express.Router();

router.get("/", assistant.getAllAssistants);

export default router;
