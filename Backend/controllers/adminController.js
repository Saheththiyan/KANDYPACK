import * as admin from "../models/adminModel.js";

export async function getAllAdmins(req, res) {
  try {
    const admins = await admin.getAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addNewAdmin(req, res) {
  try {
    const adminData = req.body;

    const result = await admin.addAdmin(adminData);

    res
      .status(201)
      .json({ message: "New admin successfully added!", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}
