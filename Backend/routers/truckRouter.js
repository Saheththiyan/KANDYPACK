import express from "express";
import * as truck from "../controllers/truckController.js";

const router = express.Router();

router.get("/", truck.getAllTrucks);

export default router;
