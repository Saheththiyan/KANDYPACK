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

export async function deleteAdmin(req, res) {
  try {
    const { admin_id } = req.params;
    const result = await admin.removeAdmin(admin_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function patchAdminDetails(req, res) {
  try {
    const adminData = req.body;
    const admin_id = req.params.admin_id;

    const result = await admin.patchAdmin(admin_id, adminData);

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Admin not found or no fields to update" });
    }

    res.status(200).json({
      message: "Admin details updated successfully!",
      data: adminData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}
