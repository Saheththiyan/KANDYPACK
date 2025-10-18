import express from "express";
import * as store from "../controllers/storeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all store routes
router.use(authenticateToken);

router.get("/", store.getAllStores);

router.post("/", store.addNewStore);

router.delete("/:store_id", store.deleteStore);

export default router;
