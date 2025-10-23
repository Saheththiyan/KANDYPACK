import { getTruckUsage } from "../../models/truckModel.js";

export async function getTruckUsages(req, res) {
  const year = req.query.year;
  const month = req.query.month;
  // TODO: aggregate trips, kilometers and load factors per truck
  const trucks = await getTruckUsage(year, month);
  return res.json({ month, trucks });
}


