const { pool } = require("../lib/database");
const fs = require("fs");
const path = require("path");
const clients = require("../lib/wsClients");

const logPath = path.join(__dirname, "../logs/app.log");

// Ensure log directory exists
if (!fs.existsSync(path.dirname(logPath))) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
}

async function hr(fastify) {
  // Visit statistics
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

      fastify.log.info(
        `Generating visit stats for: currentMonth=${month}/${year}, previousMonth=${lastMonth}/${lastMonthYear}`,
      );

      const [totalOccupants] = await pool.execute(
        `SELECT COUNT(*) AS count FROM employees`,
      );

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

      const result = {
        totalOccupants: totalOccupants[0].count,
        thisMonthVisitors: thisMonthVisitors[0].count,
        dailyAvgVisitors: dailyAvgVisitors[0].avg,
        lastMonthVisitors: lastMonthVisitors[0].count,
      };

      fastify.log.info({ result }, "Visit stats generated successfully");

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error, "Error generating HR visit statistics");
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Log viewer
  fastify.get("/hr/logs", async (req, reply) => {
    try {
      if (!fs.existsSync(logPath)) {
        return reply.send([]); // No logs yet
      }

      const rawLogs = fs.readFileSync(logPath, "utf-8");

      const parsedLogs = rawLogs
        .trim()
        .split("\n")
        .reverse()
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return {
              level: "info",
              message: line,
              timestamp: new Date().toISOString(),
            };
          }
        });

      return reply.send(parsedLogs.slice(0, 100));
    } catch (err) {
      // fallback if req.log is not available
      (req.log || fastify.log).error({ err }, "Failed to read logs");
      return reply.status(500).send({ message: "Failed to read logs" });
    }
  });

  // Log clearer
  fastify.delete("/hr/logs", async (req, reply) => {
    try {
      if (fs.existsSync(logPath)) {
        fs.truncateSync(logPath, 0); // Clears the log file contents
      }
      clients.forEach((socket) => {
        if (socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "update",
              notify: {
                status: "success",
                message: "Logs have been cleared by HR.",
              },
            }),
          );
        }
      });
      fastify.log.info("Logs cleared via HR interface");
      return reply.send({ message: "Logs cleared successfully." });
    } catch (err) {
      (req.log || fastify.log).error({ err }, "Failed to clear logs");
      return reply.status(500).send({ message: "Failed to clear logs" });
    }
  });
}

module.exports = hr;
