import db from "../config/db.js";

export async function getAssistants() {
  const [assistants] = await db.query("SELECT * FROM Assistant");
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