import express from "express";
import * as product from "../controllers/productController.js";
//import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all product routes
//router.use(authenticateToken);

router.get("/", product.getAllProducts);

router.post("/", product.addNewProduct);

router.delete("/:product_id", product.deleteProduct);

export default router;
