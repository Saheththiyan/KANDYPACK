import db from "../config/db.js";
import bcrypt from "bcryptjs";

export async function getAdmins() {
  const [admins] = await db.query("SELECT * FROM Admin");
  return admins;
}

export async function getAdminByEmail(email) {
  const [admins] = await db.query(`SELECT * FROM Admin WHERE email = ?`, [
    email,
  ]);

  return admins[0];
}

export async function validateAdminPassword(admin, password) {
  return bcrypt.compare(password, admin.password);
  // return admin.password == password;
}

export async function addAdmin(adminData) {
  const { username, email, password } = adminData;

  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

  const query = `
    INSERT INTO Admin(username, email, password)
    VALUES(?,?,?)
  `;
  const [result] = await db.query(query, [username, email, hashedPassword]);
  return result;
}
