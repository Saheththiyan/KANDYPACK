import db from "../config/db.js";

export async function getAssistants() {
  const [assistants] = await db.query("SELECT * FROM Assistant");
  return assistants;
}

export async function sortAssistantsByHour() {
  const [assistants] = await db.query(
    `SELECT * FROM Assistant
     ORDER BY weekly_hours DESC`
  );
  return assistants;
}

export async function getAssistantHour(from, to) {
  const [hours] = await db.query(
    "SELECT SUM(TIMESTAMPDIFF(HOUR, shift.start_time, shift.end_time)) AS total_hours " +
      "FROM ShiftLog shift " +
      "JOIN Assistant assistant ON shift.assistant_id = assistant.id " +
      "WHERE shift.date BETWEEN ? AND ? " +
      "GROUP BY assistant.id",
    [from, to]
  );
  return hours;
}

export async function addAssistant(assistantData) {
  const { name } = assistantData;

  const query = `
    INSERT INTO Assistant(name)
    VALUES (?)
  `;

  const [result] = await db.query(query, [name]);
  return result;
}

export async function removeAssistant(assistant_id) {
  const query = `
    DELETE FROM Assistant
    WHERE assistant_id = ?
  `;
  const [result] = await db.query(query, [assistant_id]);
  return result;
}

export async function patchAssistant(assitant_id, assistantData) {
  const columns = [];
  const values = [];

  // Dynamically build columns and values
  for (const [key, value] of Object.entries(assistantData)) {
    if (value !== undefined) {
      columns.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (columns.length === 0) return null;

  const query = `
    UPDATE Assistant
    SET ${columns.join(", ")}
    WHERE assistant_id = ?
  `;
  values.push(assitant_id);

  const [result] = await db.query(query, values);
  return result;
}
