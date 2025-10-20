import * as truck from "../models/truckModel.js";

export async function getAllTrucks(req, res) {
  try {
    const trucks = await truck.getTrucks();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addNewTruck(req, res) {
  try {
    const truckData = req.body;

    const result = await truck.addTruck(truckData);

    res
      .status(201)
      .json({ message: "New truck successfully added!", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Somthing went wrong", error: error.message });
  }
}

export async function deleteTruck(req, res) {
  try {
    const { truck_id } = req.params;
    const result = await truck.removeTruck(truck_id);

    if (result.affectedRows == 0) {
      return res.status(404).json({ message: "Truck not Found" });
    }

    return res.status(200).json({ message: "Truck successfully removed" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function patchTruckDetails(req, res) {
  try {
    const truck_id = req.params.truck_id;
    const truckData = req.body;

    const result = await truck.patchTruck(truck_id, truckData);

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Truck not found or no fields to update" });
    }

    res
      .status(200)
      .json({ message: "Truck updated successfully!", data: truckData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}
