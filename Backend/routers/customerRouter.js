import express from "express";
import * as customer from "../controllers/customerController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticateToken);

router.get("/", customer.getAllCustomers);
router.delete("/:id", customer.deleteCustomer);

export default router;
