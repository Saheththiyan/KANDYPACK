import db from "../config/db.js";
import bcrypt from "bcryptjs";

export async function getAdmins() {
  const [admins] = await db.query("SELECT * FROM Admin");
  return admins;
}

export async function getAdminByEmail(email) {
  const [admins] = await db.query(`SELECT * FROM admin WHERE email = ?`, [
    email,
  ]);

  return admins[0];
}

export async function validateAdminPassword(admin, password) {
  // return bcrypt.compare(password, admin.password);
  return admin.password == password;
}
