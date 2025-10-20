import * as order from "../models/orderModel.js";

export async function getAllOrders(req, res) {
  try {
    const orders = await order.getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createOrder(req, res) {
  const { customer_id, items, required_date } = req.body;

  if (!customer_id || !items || !Array.isArray(items) || items.length === 0 || !required_date) {
    return res.status(400).json({ error: "Missing required fields: customer_id, items, required_date" });
  }

  // Validate items structure
  for (const item of items) {
    if (!item.productId || !item.quantity || !item.price) {
      return res.status(400).json({ error: "Each item must have productId, quantity, and price" });
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const newOrder = await order.createOrder(customer_id, items, totalAmount, required_date);
    res.status(201).json({ 
      success: true,
      order: newOrder 
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      success: false,
      error: "Failed to create order",
      details: err.message 
    });
  }
}
