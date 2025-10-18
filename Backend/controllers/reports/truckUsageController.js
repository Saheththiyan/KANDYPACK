import { getTruckUsage } from "../../models/truckModel.js";

export async function getTruckUsages(req, res, month) {
  // const month = req.query.month;
  // TODO: aggregate trips, kilometers and load factors per truck
  const trucks = await getTruckUsage(month);
  return res.json({ month, trucks });
}


