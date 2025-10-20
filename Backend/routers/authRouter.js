import express from "express";
import { login, registerCustomer } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/customer-register", registerCustomer);

export default router;
