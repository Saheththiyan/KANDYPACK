import { getTruckUsage } from "../../models/truckModel.js";

export async function getTruckUsage(req, res) {
  const month = req.query.month;
  // TODO: aggregate trips, kilometers and load factors per truck
  const trucks = await getTruckUsage(month);
  return res.json({ month, trucks });
}


