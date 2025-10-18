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
    `SELECT * FROM Driver
     ORDER BY weekly_hours DESC`
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
  const { name, license_no } = driverData;

  const query = `
    INSERT INTO Driver (name, license_no)
    VALUES (?,?)
  `;

  const [result] = await db.query(query, [name, license_no]);
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
