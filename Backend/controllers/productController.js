import * as product from "../models/productModel.js";

export async function getAllProducts(req, res) {
  try {
    const products = await product.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
