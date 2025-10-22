import db from "../config/db.js";

export async function getDeliverires() {
  const [delivers] = await db.query("SELECT * FROM Delivers");
  return delivers;
}


export async function assignOrdersToDelivery(deliveryId, orderIds) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const orderId of orderIds) {
      await connection.query(
        `INSERT INTO Delivers (delivery_id, order_id, delivered_time) 
         VALUES (?, ?, NULL)`,
        [deliveryId, orderId]
      );
    }
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}