import * as driver from "../models/driverModel.js";

export async function getAllDrivers(req, res) {
  try {
    const drivers = await driver.getDrivers();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
