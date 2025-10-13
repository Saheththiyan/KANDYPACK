import { getMostOrderedProducts } from "../../models/productModel.js";

export async function getMostOrdered(req, res) {
  const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
  const topProducts = await getMostOrderedProducts();
  return res.json({ quarter, top: topProducts });
}
