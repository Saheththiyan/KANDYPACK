import * as store from "../models/storeModel.js";

export async function getAllStores(req, res) {
  try {
    const stores = await store.getStores();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addNewStore(req, res) {
  try {
    const storeData = req.body;

    const result = await store.addStore(storeData);

    res
      .status(201)
      .json({ message: "New store successfully added!", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}

export async function deleteStore(req, res) {
  try {
    const { store_id } = req.params;
    const result = await store.removeStore(store_id);

    if (result.affectedRows == 0) {
      return res.status(404).json({ message: "Product not Found" });
    }

    return res.status(200).json({ message: "Product successfully removed" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function patchStoreDetails(req, res) {
  try {
    const store_id = req.params.store_id;
    const storeData = req.body;

    const result = await store.patchStore(store_id, storeData);

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Store not found or no fields to update" });
    }

    res.status(200).json({
      message: "Store data updated successfully!",
      data: storeData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}
