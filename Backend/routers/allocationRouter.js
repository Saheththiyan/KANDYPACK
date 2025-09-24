import express from "express";
import * as allocation from "../controllers/allocationController.js";

const router = express.Router();

router.get("/", allocation.getAllAllocations);

export default router;
