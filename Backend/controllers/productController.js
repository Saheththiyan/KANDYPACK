import * as product from "../models/productModel.js";

export async function getAllProducts(req, res) {
  try {
    const products = await product.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addNewProduct(req, res) {
  try {
    const productData = req.body;

    const result = await product.addProduct(productData);

    res.status(201).json({
      message: "New product successfully added!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}
