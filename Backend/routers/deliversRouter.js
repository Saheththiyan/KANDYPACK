import express from "express";
import * as deliver from "../controllers/deliversController.js";

const router = express.Router();

router.get("/", deliver.getAllDeliverires);

export default router;
