import * as admin from "../models/adminModel.js";

export async function getAllAdmins(req, res) {
  try {
    const admins = await admin.getAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
