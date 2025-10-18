import db from "../config/db.js";

export async function getProducts({
  search = "",
  sortBy = "name",
  page = 1,
  pageSize = 16,
}) {
  const p = Math.max(1, Number(page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pageSize) || 12));
  const offset = (p - 1) * limit;

  const hasSearch = search && search.trim().length > 0;
  const whereSql = hasSearch ? "WHERE LOWER(name) LIKE ?" : "";
  const whereParams = hasSearch ? [`%${search.trim().toLowerCase()}%`] : [];

  let orderBy = "ORDER BY name ASC";
  if (sortBy === "price-low") orderBy = "ORDER BY unit_price ASC, name ASC";
  if (sortBy === "price-high") orderBy = "ORDER BY unit_price DESC, name ASC";

  const dataSql = `
    SELECT product_id, name, description, unit_price, space_unit, stock
    FROM Product
    ${whereSql}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const dataParams = [...whereParams, limit, offset];

  const countSql = `
    SELECT COUNT(*) AS count
    FROM Product
    ${whereSql}
  `;

  const [rows] = await db.query(dataSql, dataParams);
  const [countRows] = await db.query(countSql, whereParams);

  const total = Number(countRows[0]?.count || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return { products: rows, total, page: p, pageSize: limit, totalPages };
}
