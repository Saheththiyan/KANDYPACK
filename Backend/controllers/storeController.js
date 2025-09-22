import * as store from "../models/storeModel.js";

export async function getAllStores(req, res) {
  try {
    const stores = await store.getStores();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
