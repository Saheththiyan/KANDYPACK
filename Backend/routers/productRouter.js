import express from "express";
import * as product from "../controllers/productController.js";

const router = express.Router();

router.get("/", product.getAllProducts);

export default router;
