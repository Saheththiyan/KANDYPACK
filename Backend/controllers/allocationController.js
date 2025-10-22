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

export async function getOrdersByCity(req, res) {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'city is required' });
    const orders = await allocation.getOrdersByCity(city);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrdersByRouteStore(req, res) {
  try {
    const routeId = req.params.routeId;
    if (!routeId) return res.status(400).json({ error: 'Route ID is required' });
    
    const orders = await allocation.getOrdersByRouteStore(routeId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function postAllocation(req, res) {
  try {
    const { train_schedule_id, order_id, store_id, space_consumed } = req.body;
    if (!train_schedule_id || !order_id || !store_id) {
      return res.status(400).json({ error: 'train_schedule_id, order_id and store_id are required' });
    }
    const result = await allocation.createAllocation({ train_schedule_id, order_id, store_id, space_consumed });
    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
