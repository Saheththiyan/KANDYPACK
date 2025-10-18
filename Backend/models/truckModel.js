import db from "../config/db.js";

export async function getTrucks() {
  const [trucks] = await db.query("SELECT * FROM Truck");
  return trucks;
}

export async function getTruckUsage(month) {
  const [usage] = await db.query(
    `SELECT t.truck_id AS truckId, 
            t.license_plate AS licensePlate,
            t.capacity,
            t.status,
            COUNT(ds.delivery_id) AS totalDeliveries,
            COUNT(CASE WHEN ds.status = 'Completed' THEN 1 END) AS completedDeliveries,
            COUNT(CASE WHEN ds.status = 'In Progress' THEN 1 END) AS inProgressDeliveries
     FROM Truck t
     LEFT JOIN Delivery_Schedule ds ON t.truck_id = ds.truck_id 
       AND DATE_FORMAT(ds.delivery_date, '%Y-%m') = ?
     GROUP BY t.truck_id, t.license_plate, t.capacity, t.status
     ORDER BY totalDeliveries DESC`,
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
