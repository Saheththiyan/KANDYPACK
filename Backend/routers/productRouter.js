import express from "express";
import * as product from "../controllers/productController.js";

const router = express.Router();

router.get("/", product.getAllProducts);

router.post("/", product.addNewProduct);

router.delete("/:product_id", product.deleteProduct);

export default router;
