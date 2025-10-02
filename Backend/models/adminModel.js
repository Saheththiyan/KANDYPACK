import db from "../config/db.js";

export async function getAdmins() {
  const [admins] = await db.query("SELECT * FROM Admin");
  return admins;
}
