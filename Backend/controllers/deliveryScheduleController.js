import * as schedule from "../models/deliveryScheduleModel.js";

export async function getAllschedules(req, res) {
  try {
    const schedules = await schedule.getSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSchedulesWithDetails(req, res) {
  try {
    const schedules = await schedule.getSchedulesWithDetails();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrdersByRouteStore(req, res) {
  try {
    const { routeId } = req.params;
    if (!routeId) {
      return res.status(400).json({ error: 'Route ID is required' });
    }
    
    const orders = await schedule.getOrdersByRouteStore(routeId);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders by route store:', err);
    res.status(500).json({ error: err.message });
  }
}
