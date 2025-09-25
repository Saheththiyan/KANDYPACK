import * as driver from "../models/driverModel.js";

export async function getAllDrivers(req, res) {
  try {
    const drivers = await driver.getDrivers();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDriverByID(req, res) {
  try {
    const id = req.params.id;
    const driverOfID = await driver.getDriversByID(id);
    res.json(driverOfID);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function sortByHours(req, res) {
  try {
    const drivers = await driver.sortDriversByHour();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function activeDrivers(req, res) {
  try {
    const drivers = await driver.getActiveDrives();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
