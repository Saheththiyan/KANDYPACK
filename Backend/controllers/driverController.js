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

export async function addNewDriver(req, res) {
  try {
    const driverData = req.body;

    const result = await driver.addDriver(driverData);

    res.status(201).json({
      message: "Driver added successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

export async function deleteDriver(req, res) {
  try {
    const { driver_id } = req.params;
    const result = await driver.removeDriver(driver_id);

    if (result.affectedRows == 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver deleted successfully!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function patchDriverDetails(req, res) {
  try {
    const driverData = req.body;
    const driver_id = req.params.driver_id;

    const result = await driver.patchDriver(driver_id, driverData);

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Driver not found or no fields to update" });
    }

    res
      .status(200)
      .json({ message: "Driver updated successfully!", data: driverData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}
