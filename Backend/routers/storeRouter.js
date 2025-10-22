import express from "express";
import * as store from "../controllers/storeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all store routes
router.use(authenticateToken);

router.get("/", store.getStoresByCity); // Now handles both all stores and filtered by city

router.post("/", store.addNewStore);

router.delete("/:store_id", store.deleteStore);

router.patch("/:store_id", store.patchStoreDetails);

export default router;
