import express from "express";
import * as customer from "../controllers/customerController.js";

const router = express.Router();

router.get("/", customer.getAllCustomers);
router.delete("/:id", customer.deleteCustomer);

export default router;
