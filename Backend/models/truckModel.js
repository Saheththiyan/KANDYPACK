import db from "../config/db.js";

export async function getTrucks() {
  const [trucks] = await db.query("SELECT * FROM Truck");
  return trucks;
}

export async function getTruckUsage(month) {
  const [usage] = await db.query(
    `SELECT t.id AS truckId, t.licensePlate,
            COUNT(tr.id) AS trips,
            SUM(tr.distance) AS totalKilometers,
            AVG(tr.loadFactor) AS avgLoadFactor
     FROM Truck t
     LEFT JOIN Trip tr ON t.id = tr.truckId AND DATE_FORMAT(tr.date, '%Y-%m') = ?
     GROUP BY t.id, t.licensePlate`,
    [month]
  );
  return usage;
}

export async function addTruck(truckData) {
  const { license_plate, capacity, status } = truckData;

  const query = `
    INSERT INTO Truck(license_plate, capacity, status)
    VALUES (?,?,?)
  `;
  const [result] = await db.query(query, [license_plate, capacity, status]);
  return result;
}

export async function removeTruck(truck_id) {
  const query = `
    DELETE FROM Truck
    WHERE truck_id = ?
  `;
  const [result] = await db.query(query, [truck_id]);
  return result;
}
