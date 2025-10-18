import express from "express";
import * as store from "../controllers/storeController.js";

const router = express.Router();

router.get("/", store.getAllStores);

router.post("/", store.addNewStore);

router.delete("/:store_id", store.deleteStore);

export default router;
