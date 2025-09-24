import express from "express";
import * as item from "../controllers/orderItemController.js";

const router = express.Router();

router.get("/", item.getAllItems);

export default router;
