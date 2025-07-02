const { pool } = require("../lib/database");

async function hr(fastify) {
  // Get the visitors statistics (with optional ?date=YYYY-MM-DD)
  fastify.get("/hr/visit-stats", async (req, reply) => {
    try {
      const { date } = req.query;

      let dateParam = new Date(); // default to today
      if (date) {
        dateParam = new Date(date);
      }

      const year = dateParam.getFullYear();
      const month = dateParam.getMonth() + 1;

      const previousMonth = new Date(dateParam);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const lastMonth = previousMonth.getMonth() + 1;
      const lastMonthYear = previousMonth.getFullYear();

      const [totalOccupants] = await pool.execute(`
      SELECT COUNT(*) AS count FROM employees
    `);

      const [thisMonthVisitors] = await pool.execute(
        `SELECT COUNT(*) AS count FROM visits
       WHERE MONTH(visit_date) = ? AND YEAR(visit_date) = ?`,
        [month, year],
      );

      const [dailyAvgVisitors] = await pool.execute(
        `SELECT ROUND(COUNT(*) / DAY(LAST_DAY(?)), 0) AS avg
       FROM visits
       WHERE MONTH(visit_date) = ? AND YEAR(visit_date) = ?`,
        [dateParam, month, year],
      );

      const [lastMonthVisitors] = await pool.execute(
        `SELECT COUNT(*) AS count FROM visits
       WHERE MONTH(visit_date) = ? AND YEAR(visit_date) = ?`,
        [lastMonth, lastMonthYear],
      );

      return {
        totalOccupants: totalOccupants[0].count,
        thisMonthVisitors: thisMonthVisitors[0].count,
        dailyAvgVisitors: dailyAvgVisitors[0].avg,
        lastMonthVisitors: lastMonthVisitors[0].count,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });
}

module.exports = hr;
