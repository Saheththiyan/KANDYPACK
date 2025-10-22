import * as allocation from "../models/allocationModel.js";

export async function getAllAllocations(req, res) {
  try {
    const allocations = await allocation.getAllocations();
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUnprocessedOrders(req, res) {
  try {
    const orders = await allocation.getUnprocessedOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
