import db from "../config/db.js";

export async function getStores() {
  const [stores] = await db.query("SELECT * FROM Store");
  return stores;
}
export async function addStore(storeData) {
  const { name, city, address, capacity } = storeData;

  const query = `
    INSERT INTO Store(name, city, address, capacity)
    VALUES (?,?,?,?)
  `;
  const [result] = await db.query(query, [name, city, address, capacity]);
  return result;
}

export async function removeStore(store_id) {
  const query = `
    DELETE FROM Store
    WHERE store_id = ?
  `;

  const [result] = await db.query(query, [store_id]);
  return result;
}

export async function patchStore(store_id, storeData) {
  const columns = [];
  const values = [];

  // Dynamically build columns and values
  for (const [key, value] of Object.entries(storeData)) {
    if (value !== undefined) {
      columns.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (columns.length === 0) return null;

  const query = `
    UPDATE Store
    SET ${columns.join(", ")}
    WHERE store_id = ?
  `;
  values.push(store_id);

  const [result] = await db.query(query, values);
  return result;
}

export async function getStoresByCity(city) {
  const [stores] = await db.query(
    "SELECT * FROM Store WHERE city = ?",
    [city]
  );
  return stores;
}
