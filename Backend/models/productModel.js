import db from "../config/db.js";

export async function getProducts() {
  const [products] = await db.query("SELECT * FROM product");
  return products;
}
