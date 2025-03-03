const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const moment = require("moment");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "visitor_app",
  password: process.env.DB_PASSWORD || "123",
  database: process.env.DB_NAME || "visitor_management",
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database and tables
async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Create database if not exists
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`,
    );
    await connection.query(`USE ${dbConfig.database}`);

    // Create visitors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        purpose VARCHAR(100) NOT NULL,
        contact VARCHAR(50) NOT NULL,
        timeIn DATETIME DEFAULT CURRENT_TIMESTAMP,
        timeOut DATETIME NULL
      )
    `);

    console.log("Database and tables initialized");
    await connection.end();
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

// API Routes
// Get all visitors
app.get("/api/visitors", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM visitors ORDER BY timeIn DESC",
    );

    // Format dates
    const formattedRows = rows.map((row) => ({
      ...row,
      timeIn: moment(row.timeIn).format("M/D/YYYY, h:mm:ss A"),
      timeOut: row.timeOut
        ? moment(row.timeOut).format("M/D/YYYY, h:mm:ss A")
        : null,
    }));

    connection.release();
    res.json(formattedRows);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// Add a new visitor
app.post("/api/visitors", async (req, res) => {
  const { name, purpose, contact } = req.body;

  if (!name || !purpose || !contact) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO visitors (name, purpose, contact) VALUES (?, ?, ?)",
      [name, purpose, contact],
    );

    // Get the newly added visitor
    const [rows] = await connection.query(
      "SELECT * FROM visitors WHERE id = ?",
      [result.insertId],
    );

    connection.release();

    // Format dates for the response
    const visitor = rows[0];
    visitor.timeIn = moment(visitor.timeIn).format("M/D/YYYY, h:mm:ss A");
    visitor.timeOut = visitor.timeOut
      ? moment(visitor.timeOut).format("M/D/YYYY, h:mm:ss A")
      : null;

    res.status(201).json(visitor);
  } catch (error) {
    console.error("Error adding visitor:", error);
    res.status(500).json({ error: "Failed to add visitor" });
  }
});

// Time out a visitor
app.put("/api/visitors/:id/timeout", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    // Update the timeOut field
    await connection.query(
      "UPDATE visitors SET timeOut = CURRENT_TIMESTAMP WHERE id = ? AND timeOut IS NULL",
      [id],
    );

    // Get the updated visitor
    const [rows] = await connection.query(
      "SELECT * FROM visitors WHERE id = ?",
      [id],
    );

    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    // Format dates for the response
    const visitor = rows[0];
    visitor.timeIn = moment(visitor.timeIn).format("M/D/YYYY, h:mm:ss A");
    visitor.timeOut = visitor.timeOut
      ? moment(visitor.timeOut).format("M/D/YYYY, h:mm:ss A")
      : null;

    res.json(visitor);
  } catch (error) {
    console.error("Error timing out visitor:", error);
    res.status(500).json({ error: "Failed to time out visitor" });
  }
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

// Database connection and seeding for development
async function seedDatabase() {
  try {
    const connection = await pool.getConnection();

    // Check if we have data already
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM visitors",
    );

    if (rows[0].count === 0) {
      console.log("Seeding database with sample data...");

      // Sample data
      const sampleVisitors = [
        {
          name: "Alexis Corporal",
          purpose: "Meeting",
          contact: "09122590509",
          timeIn: "2025-02-28 20:41:35",
          timeOut: "2025-02-28 20:50:51",
        },
        {
          name: "Arkyn Corporal",
          purpose: "Maintenance",
          contact: "09125590509",
          timeIn: "2025-02-28 20:58:22",
          timeOut: "2025-02-28 20:58:23",
        },
        {
          name: "Alrich Corporal",
          purpose: "Interview",
          contact: "09062691579",
          timeIn: "2025-02-28 21:02:10",
          timeOut: "2025-02-28 21:02:36",
        },
        {
          name: "Julie Ann Corporal",
          purpose: "Other",
          contact: "09225500111",
          timeIn: "2025-03-01 06:54:31",
          timeOut: null,
        },
      ];

      for (const visitor of sampleVisitors) {
        await connection.query(
          "INSERT INTO visitors (name, purpose, contact, timeIn, timeOut) VALUES (?, ?, ?, ?, ?)",
          [
            visitor.name,
            visitor.purpose,
            visitor.contact,
            visitor.timeIn,
            visitor.timeOut,
          ],
        );
      }

      console.log("Sample data seeded successfully");
    }

    connection.release();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Call the seed function after a delay to ensure database is initialized
setTimeout(seedDatabase, 2000);
