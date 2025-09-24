import * as allocation from "../models/allocationModel.js";

export async function getAllAllocations(req, res) {
  try {
    const allocations = await allocation.getAllocations();
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
