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