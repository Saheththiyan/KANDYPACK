import { getMostOrderedProducts } from "../../models/orderItemModel.js";

export async function getMostOrdered(req, res) {
  const year = parseInt(req.query.year);
  const quarter = parseInt(req.query.quarter);
  const limit = parseInt(req.query.limit) || 5;

  if (!year || !quarter) {
    return res.status(400).json({ error: 'Year and quarter are required' });
  }

  try {
    const topProducts = await getMostOrderedProducts(year, quarter, limit);
    return res.json({ year, quarter, top: topProducts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch most ordered products' });
  }
}
