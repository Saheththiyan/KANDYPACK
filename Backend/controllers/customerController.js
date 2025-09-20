import * as customer from "../models/customerModel.js";

export async function getAllCustomers(req, res) {
  try {
    const customers = await customer.getCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
