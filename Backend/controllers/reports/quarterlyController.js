import {
  getAvailableOrderYears,
  getQuarterMonthlyBreakdown,
  getQuarterlySalesSummary,
} from "../../models/orderModel.js";

export async function getQuarterlySales(req, res) {
  try {
    const requestedYear = Number(req.query.year) || new Date().getFullYear();
    const requestedQuarter = req.query.quarter
      ? Number(req.query.quarter)
      : null;
    const validQuarter =
      requestedQuarter && [1, 2, 3, 4].includes(requestedQuarter)
        ? requestedQuarter
        : null;

    const [years, summaryRows] = await Promise.all([
      getAvailableOrderYears(),
      getQuarterlySalesSummary(requestedYear),
    ]);

    const sortedSummary = summaryRows.sort(
      (a, b) => a.quarter - b.quarter
    );

    let previousRevenue = 0;
    const summary = sortedSummary.map((row) => {
      const revenue = Number(row.totalRevenue ?? 0);
      const growth =
        previousRevenue > 0
          ? ((revenue - previousRevenue) / previousRevenue) * 100
          : 0;
      previousRevenue = revenue;

      return {
        quarter: row.quarter,
        label: `${requestedYear} Q${row.quarter}`,
        totalRevenue: revenue,
        totalOrders: Number(row.totalOrders ?? 0),
        totalUnits: Number(row.totalUnits ?? 0),
        growth: Number.isFinite(growth) ? Number(growth.toFixed(2)) : 0,
      };
    });

    const derivedQuarter =
      validQuarter ||
      summary.find(
        (item) => item.totalRevenue > 0 || item.totalUnits > 0
      )?.quarter ||
      1;

    const breakdown = await getQuarterMonthlyBreakdown(
      requestedYear,
      derivedQuarter
    );

    return res.json({
      success: true,
      data: {
        year: requestedYear,
        years,
        selectedQuarter: derivedQuarter,
        quarters: summary,
        breakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching quarterly sales:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load quarterly sales" });
  }
}
