import express from "express";
import * as truck from "../controllers/truckController.js";

const router = express.Router();

router.get("/", truck.getAllTrucks);

router.post("/", truck.addNewTruck);

router.delete("/:truck_id", truck.deleteTruck);

export default router;
