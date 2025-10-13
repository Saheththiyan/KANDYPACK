import { getQuarterlyOrders } from "../../models/orderModel.js";

export function getQuarterlySales(req, res) {
  const year = req.query.year || new Date().getFullYear();
  const orders = getQuarterlyOrders(year);
  orders
    .then((data) => {
      return res.json({
        year,
        data: data.map((item) => ({
          quarter: `${year} Q${item.quarter}`,
          value: item.totalRevenue,
          volume: item.totalOrders,
        })),
      });
    })
    .catch((error) => {
      console.error("Error fetching quarterly sales:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}
