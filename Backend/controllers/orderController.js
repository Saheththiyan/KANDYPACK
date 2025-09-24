import * as order from "../models/orderModel.js";

export async function getAllOrders(req, res) {
  try {
    const orders = await order.getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
