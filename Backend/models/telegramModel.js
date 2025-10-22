import db from '../config/db.js';

export async function updateDriverChatId(driverId, chatId) {
  try {
    const [result] = await db.query(
      'UPDATE Driver SET chat_id = ? WHERE driver_id = ?',
      [chatId, driverId]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Driver not found' };
    }

    // Get driver name for response
    const [driver] = await db.query(
      'SELECT name FROM Driver WHERE driver_id = ?',
      [driverId]
    );

    return { 
      success: true, 
      name: driver[0]?.name || 'Driver',
      message: 'Chat ID updated successfully' 
    };
  } catch (error) {
    console.error('Update driver chat_id error:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function updateAssistantChatId(assistantId, chatId) {
  try {
    const [result] = await db.query(
      'UPDATE Assistant SET chat_id = ? WHERE assistant_id = ?',
      [chatId, assistantId]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Assistant not found' };
    }

    // Get assistant name for response
    const [assistant] = await db.query(
      'SELECT name FROM Assistant WHERE assistant_id = ?',
      [assistantId]
    );

    return { 
      success: true, 
      name: assistant[0]?.name || 'Assistant',
      message: 'Chat ID updated successfully' 
    };
  } catch (error) {
    console.error('Update assistant chat_id error:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function getDriverById(driverId) {
  try {
    const [rows] = await db.query(
      'SELECT driver_id, name, chat_id FROM Driver WHERE driver_id = ?',
      [driverId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Get driver error:', error);
    return null;
  }
}

export async function getAssistantById(assistantId) {
  try {
    const [rows] = await db.query(
      'SELECT assistant_id, name, chat_id FROM Assistant WHERE assistant_id = ?',
      [assistantId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Get assistant error:', error);
    return null;
  }
}

export async function getRegisteredDrivers() {
  try {
    const [rows] = await db.query(
      'SELECT driver_id, name, chat_id FROM Driver WHERE chat_id IS NOT NULL'
    );
    return rows;
  } catch (error) {
    console.error('Get registered drivers error:', error);
    return [];
  }
}

export async function getRegisteredAssistants() {
  try {
    const [rows] = await db.query(
      'SELECT assistant_id, name, chat_id FROM Assistant WHERE chat_id IS NOT NULL'
    );
    return rows;
  } catch (error) {
    console.error('Get registered assistants error:', error);
    return [];
  }
}