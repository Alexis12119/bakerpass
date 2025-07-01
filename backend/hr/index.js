const { pool } = require("../lib/database");

async function hr(fastify) {
  // Get the visitors information
  fastify.get("/hr/visit-stats", async (_req, _reply) => {
    const [totalOccupants] = await pool.execute(`
    SELECT COUNT(*) AS count FROM employees
  `);

    const [thisMonthVisitors] = await pool.execute(`
    SELECT COUNT(*) AS count FROM visits
    WHERE MONTH(visit_date) = MONTH(CURRENT_DATE()) AND YEAR(visit_date) = YEAR(CURRENT_DATE())
  `);

    const [dailyAvgVisitors] = await pool.execute(`
    SELECT ROUND(COUNT(*) / DAY(LAST_DAY(CURRENT_DATE())), 0) AS avg
    FROM visits
    WHERE MONTH(visit_date) = MONTH(CURRENT_DATE()) AND YEAR(visit_date) = YEAR(CURRENT_DATE())
  `);

    const [lastMonthVisitors] = await pool.execute(`
    SELECT COUNT(*) AS count FROM visits
    WHERE MONTH(visit_date) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      AND YEAR(visit_date) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
  `);

    return {
      totalOccupants: totalOccupants[0].count,
      thisMonthVisitors: thisMonthVisitors[0].count,
      dailyAvgVisitors: dailyAvgVisitors[0].avg,
      lastMonthVisitors: lastMonthVisitors[0].count,
    };
  });
}

module.exports = hr;
