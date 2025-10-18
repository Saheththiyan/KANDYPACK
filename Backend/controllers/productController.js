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

export async function deleteProduct(req, res) {
  try {
    const { product_id } = req.params;
    const result = await product.removeProduct(product_id);

    if (result.affectedRows == 0) {
      return res.status(404).json({ message: "Product not Found" });
    }

    res.status(200).json({ message: "Product successfully removed!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}
