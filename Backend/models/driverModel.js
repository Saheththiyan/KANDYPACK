import db from "../config/db.js";

export async function getDrivers() {
  const [drivers] = await db.query("SELECT * FROM Driver");
  return drivers;
}

export async function getDriversByID(id) {
  const [driver] = await db.query(
    `SELECT * FROM driver
    WHERE driver_id = ?`,
    [id]
  );
  return driver;
}

export async function sortDriversByHour() {
  const [drivers] = await db.query(
    `SELECT * FROM driver
    ORDER BY weekly_hours DESC`
  );
  return drivers;
}

export async function getActiveDrives() {
  const [drivers] = await db.query(
    `SELECT * FROM driver
    WHERE status = "active" `
  );
  return drivers;
}
