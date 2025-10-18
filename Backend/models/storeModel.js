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
}

export async function removeStore(store_id) {
  const query = `
    DELETE FROM Store
    WHERE store_id = ?
  `;

  const [result] = await db.query(query, [store_id]);
  return result;
}
