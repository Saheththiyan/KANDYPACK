import * as deliver from "../models/deliversModel.js";
import { sendTelegramMessage } from "../utils/sendTelegram.js";

export async function getAllDeliverires(req, res) {
  try {
    const delivers = await deliver.getDeliverires();
    res.json(delivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function assignOrdersToDelivery(req, res) {
  try {
    const { deliveryId, orderIds } = req.body;
    
    if (!deliveryId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ 
        error: 'Valid deliveryId and orderIds array are required'
      });
    }
    
    await deliver.assignOrdersToDelivery(deliveryId, orderIds);

    sendTelegramMessage(`Orders ${orderIds.join(', ')} have been assigned to delivery ID ${deliveryId}.`);
    
    res.json({ 
      success: true, 
      message: 'Orders assigned to delivery successfully'
    });
  } catch (err) {
    console.error('Error assigning orders to delivery:', err);
    res.status(500).json({ error: err.message });
  }
}