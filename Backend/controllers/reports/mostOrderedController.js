import { getMostOrderedProducts } from "../../models/orderItemModel.js";

export async function getMostOrdered(req, res) {
  const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
  const topProducts = await getMostOrderedProducts(quarter);
  return res.json({ quarter, top: topProducts });
}
