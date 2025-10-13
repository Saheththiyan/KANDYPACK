// Controller for quarterly sales report (value and volume)
export function getQuarterlySales(req, res) {
  const year = req.query.year || new Date().getFullYear();
  // TODO: replace with actual DB queries to compute value and volume per quarter
  return res.json({
    year,
    data: [
      { quarter: `${year} Q1`, value: 0, volume: 0 },
      { quarter: `${year} Q2`, value: 0, volume: 0 },
      { quarter: `${year} Q3`, value: 0, volume: 0 },
      { quarter: `${year} Q4`, value: 0, volume: 0 },
    ],
  });
}
