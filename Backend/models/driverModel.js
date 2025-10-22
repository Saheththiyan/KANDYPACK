import db from "../config/db.js";

export async function getDrivers() {
  const [drivers] = await db.query("SELECT * FROM Driver");
  return drivers;
}

export async function getDriversByID(id) {
  const [driver] = await db.query(
    `SELECT * FROM Driver
    WHERE driver_id = ?`,
    [id]
  );
  return driver;
}

export async function sortDriversByHour() {
  const [drivers] = await db.query(
    "SELECT * FROM Driver"
  );
  return drivers;
}

export async function getActiveDrives() {
  const [drivers] = await db.query(
    `SELECT * FROM Driver
    WHERE status = "Active" `
  );
  return drivers;
}

export async function addDriver(driverData) {
  const { name, license_no, weekly_hours, status } = driverData;

  const query = `
    INSERT INTO Driver (name, license_no, weekly_hours, status)
    VALUES (?,?,?,?)
  `;

  const [result] = await db.query(query, [
    name,
    license_no,
    weekly_hours,
    status,
  ]);
  return result;
}

export async function removeDriver(driver_id) {
  const query = `
    DELETE FROM Driver 
    WHERE driver_id = ?
  `;

  const [result] = await db.query(query, [driver_id]);
  return result;
}
export async function patchDriver(driver_id, driverData) {
  const columns = [];
  const values = [];

  // Dynamically build columns and values
  for (const [key, value] of Object.entries(driverData)) {
    if (value !== undefined) {
      columns.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (columns.length === 0) return null;

  const query = `
    UPDATE Driver
    SET ${columns.join(", ")}
    WHERE driver_id = ?
  `;
  values.push(driver_id);

  const [result] = await db.query(query, values);
  return result;
}

export async function getDriversByStore(store_id) {
  const [drivers] = await db.query(
    "SELECT * FROM Driver WHERE store_id = ?",
    [store_id]
  );
  return drivers;
}
