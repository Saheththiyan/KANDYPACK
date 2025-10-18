import * as product from "../models/productModel.js";

export async function getAllProducts(req, res) {
  try {
    const {
      search = "",
      sortBy = "name",
      page = "1",
      pageSize = "16",
    } = req.query;

    const result = await product.getProducts({
      search,
      sortBy,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
