import db from "../config/db.js";

export async function getProducts() {
  const [products] = await db.query("SELECT * FROM Product");
  return products;
}

export async function addProduct(productData) {
  const { name, description, unit_price, space_unit } = productData;

  const query = `
    INSERT INTO Product(name, description, unit_price, space_unit)
    VALUES (?,?,?,?)
  `;
  const [result] = await db.query(query, [
    name,
    description,
    unit_price,
    space_unit,
  ]);
  return result;
}
