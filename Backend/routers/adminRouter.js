import express from "express";
import * as admin from "../controllers/adminController.js";

const router = express.Router();

router.get("/", admin.getAllAdmins);

export default router;
