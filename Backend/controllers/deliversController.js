import * as deliver from "../models/deliversModel.js";

export async function getAllDeliverires(req, res) {
  try {
    const delivers = await deliver.getDeliverires();
    res.json(delivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
