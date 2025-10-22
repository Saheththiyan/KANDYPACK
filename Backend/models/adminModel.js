import db from "../config/db.js";
import bcrypt from "bcryptjs";

export async function getAdmins() {
  const [admins] = await db.query("SELECT * FROM Admin");
  return admins;
}

export async function getAdminByEmail(email) {
  const [admins] = await db.query("SELECT * FROM Admin WHERE email = ?", [
    email,
  ]);

  return admins[0];
}

export async function getAdminById(id) {
  const [admins] = await db.query(
    "SELECT admin_id, username, email FROM Admin WHERE admin_id = ?",
    [id]
  );
  return admins[0] || null;
}

export async function validateAdminPassword(admin, password) {
  return bcrypt.compare(password, admin.password);
}

export async function updateAdminProfile(adminId, updates = {}) {
  const columns = [];
  const values = [];

  const mapping = {
    username: "username",
    email: "email",
  };

  for (const [key, column] of Object.entries(mapping)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      columns.push(`${column} = ?`);
      values.push(updates[key] ?? null);
    }
  }

  if (!columns.length) {
    return null;
  }

  await db.query(
    `
      UPDATE Admin
      SET ${columns.join(", ")}
      WHERE admin_id = ?
    `,
    [...values, adminId]
  );

  return getAdminById(adminId);
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

export async function removeAdmin(admin_id) {
  const query = `
    DELETE FROM Admin
    WHERE admin_id = ?
  `;

  const [result] = await db.query(query, [admin_id]);
  return result;
}

export async function patchAdmin(admin_id, adminData) {
  const columns = [];
  const values = [];

  // Dynamically build columns and values
  for (const [key, value] of Object.entries(adminData)) {
    if (value !== undefined) {
      columns.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (columns.length === 0) return null;

  const query = `
    UPDATE Admin
    SET ${columns.join(", ")}
    WHERE admin_id = ?
  `;
  values.push(admin_id);

  const [result] = await db.query(query, values);
  return result;
}
