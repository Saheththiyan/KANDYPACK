import db from "../config/db.js";

export async function getSchedules() {
  const [schedules] = await db.query("SELECT * FROM Delivery_Schedule");
  return schedules;
}

export async function getSchedulesWithDetails() {
  const [schedules] = await db.query(`
    SELECT ds.delivery_id, ds.route_id, r.stops, r.store_id, ds.truck_id, t.license_plate,
           ds.driver_id, d.name AS driver_name, ds.assistant_id, a.name AS assistant_name,
           ds.delivery_date, ds.status
    FROM Delivery_Schedule ds
    LEFT JOIN Route r ON ds.route_id = r.route_id
    LEFT JOIN Truck t ON ds.truck_id = t.truck_id
    LEFT JOIN Driver d ON ds.driver_id = d.driver_id
    LEFT JOIN Assistant a ON ds.assistant_id = a.assistant_id
    WHERE ds.status = 'Scheduled'
  `);

  return schedules;
}

export async function getOrdersByRouteStore(routeId) {
  const [results] = await db.query('CALL GetOrdersByRouteStore(?)', [routeId]);
  return results[0]; // First result set from the stored procedure
}
