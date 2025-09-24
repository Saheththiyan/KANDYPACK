import * as item from "../models/orderItemModel.js";

export async function getAllItems(req, res) {
  try {
    const items = await item.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
