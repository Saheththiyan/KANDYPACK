import { getCustomerOrderHistory } from "../../models/orderModel.js";

export async function getCustomerHistory(req, res) {
  const { customerId } = req.params;
  const { from, to } = req.query;

  const orders = await getCustomerOrderHistory(customerId);
  return res.json({ customerId, from, to, orders });
}
