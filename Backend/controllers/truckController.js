import * as truck from "../models/truckModel.js";

export async function getAllTrucks(req, res) {
  try {
    const trucks = await truck.getTrucks();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
