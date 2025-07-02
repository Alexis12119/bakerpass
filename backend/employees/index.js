const { pool } = require("../lib/database");

async function employees(fastify) {
  // Fetch Employees (With Optional Filters)
  fastify.get("/employees", async (request, reply) => {
    try {
      const { search, department } = request.query;
      let query = `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        e.profile_image_url,
        d.name AS department,
        COUNT(v.id) AS total_visitors,
        COUNT(DISTINCT v.visit_date) AS active_days,
        ROUND(COUNT(v.id) / NULLIF(COUNT(DISTINCT v.visit_date), 0), 1) AS avg_visitors
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN visits v ON v.visited_employee_id = e.id
    `;

      const queryParams = [];
      const conditions = [];

      if (department && department !== "All") {
        conditions.push("d.name = ?");
        queryParams.push(department);
      }

      if (search) {
        conditions.push(
          "(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)",
        );
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (conditions.length) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " GROUP BY e.id";

      const [rows] = await pool.execute(query, queryParams);

      return reply.send(
        rows.map((row) => ({
          id: row.id,
          name: `${row.first_name} ${row.last_name}`,
          department: row.department,
          total_visitors: row.total_visitors || 0,
          avg_visitors: row.avg_visitors || 0,
          profileImage: row.profile_image_url,
        })),
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Fetch only employees who were already assigned to visits
  fastify.get("/employees/all", async (request, reply) => {
    try {
      const { search, departmentId } = request.query;

      let query = `
      SELECT 
        DISTINCT e.id, 
        e.first_name,
        e.last_name,
        e.department_id,
        d.name AS departmentName,
        e.profile_image_url
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      INNER JOIN visits v ON v.visited_employee_id = e.id
    `;

      const conditions = [];
      const queryParams = [];

      if (departmentId && departmentId !== "All") {
        conditions.push("e.department_id = ?");
        queryParams.push(departmentId);
      }

      if (search) {
        conditions.push(
          "(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)",
        );
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (conditions.length) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY e.first_name ASC, e.last_name ASC";

      const [rows] = await pool.execute(query, queryParams);

      return reply.send(
        rows.map((row) => ({
          id: row.id,
          name: `${row.first_name} ${row.last_name}`,
          department: row.departmentName,
          profileImage: row.profile_image_url,
        })),
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Fetch Hosts with at least one available time slot
  fastify.get("/employees/available", async (request, reply) => {
    try {
      const { search, departmentId } = request.query;

      let query = `
      SELECT 
        DISTINCT e.id, 
        e.first_name,
        e.last_name,
        e.department_id,
        d.name AS departmentName,
        e.profile_image_url
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      INNER JOIN time_slots ts ON ts.employee_id = e.id
      LEFT JOIN (
        SELECT time_slot_id FROM visits WHERE time_slot_id IS NOT NULL
      ) AS booked ON booked.time_slot_id = ts.id
    `;

      const conditions = [
        "booked.time_slot_id IS NULL", // Ensure time slot is unbooked
        "ts.start_time IS NOT NULL AND ts.start_time != ''", // Valid start time
        "ts.end_time IS NOT NULL AND ts.end_time != ''", // Valid end time
      ];
      const queryParams = [];

      if (departmentId && departmentId !== "All") {
        conditions.push("e.department_id = ?");
        queryParams.push(departmentId);
      }

      if (search) {
        conditions.push(
          "(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)",
        );
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (conditions.length) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY e.first_name ASC, e.last_name ASC";

      const [rows] = await pool.execute(query, queryParams);

      return reply.send(
        rows.map((row) => ({
          id: row.id,
          name: `${row.first_name} ${row.last_name}`,
          department: row.departmentName,
          profileImage: row.profile_image_url,
        })),
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET available time slots for a specific host
  fastify.get("/hosts/:id/available-timeslots", async (request, reply) => {
    const { id } = request.params;
    const hostId = Number(id);

    if (!hostId) {
      return reply.code(400).send({ error: "Invalid host ID" });
    }

    try {
      // Get all time slot IDs already used by this host
      const [takenSlots] = await pool.execute(
        `SELECT time_slot_id FROM visits WHERE visited_employee_id = ? AND time_slot_id IS NOT NULL`,
        [hostId],
      );

      const takenSlotIds = takenSlots.map((row) => row.time_slot_id);

      // Get all available time slots not already booked
      const query = takenSlotIds.length
        ? `SELECT id, date, start_time, end_time FROM time_slots WHERE employee_id = ? AND id NOT IN (${takenSlotIds.map(() => "?").join(",")})`
        : `SELECT id, date, start_time, end_time FROM time_slots WHERE employee_id = ?`;

      const [availableSlots] = await pool.execute(
        query,
        takenSlotIds.length ? [hostId, ...takenSlotIds] : [hostId],
      );

      reply.send(availableSlots);
    } catch (err) {
      console.error("Error fetching available time slots:", err);
      reply.code(500).send({ error: "Failed to fetch available time slots" });
    }
  });

  // Add a new available date (no time slots yet)
  fastify.post("/timeslots/date", async (request, reply) => {
    const { employeeId, date } = request.body;

    if (!employeeId || !date) {
      return reply.code(400).send({ error: "Missing employeeId or date" });
    }

    try {
      // Optionally, insert a dummy timeslot with null times, or insert into a new `available_dates` table
      await pool.execute(
        "INSERT INTO time_slots (employee_id, date, start_time, end_time) VALUES (?, ?, '', '')",
        [employeeId, date],
      );
      reply.code(201).send({ message: "Date added" });
    } catch (err) {
      console.error("Error adding date:", err);
      reply.code(500).send({ error: "Failed to add date" });
    }
  });

  // GET all time slots for an employee (with date)
  fastify.get("/employees/:id/timeslots", async (request, reply) => {
    const { id } = request.params;
    try {
      const [rows] = await pool.execute(
        "SELECT id, date, start_time, end_time FROM time_slots WHERE employee_id = ? ORDER BY date ASC, start_time ASC",
        [id],
      );
      reply.send(rows || []);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      reply.code(500).send({ error: "Failed to fetch time slots" });
    }
  });

  // Add a new time slot (with date)
  fastify.post("/timeslots", async (request, reply) => {
    const { employeeId, date, startTime, endTime } = request.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return reply.code(400).send({ error: "Missing required fields" });
    }

    try {
      await pool.execute(
        "INSERT INTO time_slots (employee_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
        [employeeId, date, startTime, endTime],
      );
      reply.code(201).send({ message: "Time slot added" });
    } catch (err) {
      console.error("Error adding time slot:", err);
      reply.code(500).send({ error: "Failed to add time slot" });
    }
  });

  // Update a time slot (with date)
  fastify.put("/timeslots/:id", async (request, reply) => {
    const { id } = request.params;
    const { employeeId, date, startTime, endTime } = request.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return reply.code(400).send({ error: "Missing required fields" });
    }

    try {
      const [result] = await pool.execute(
        "UPDATE time_slots SET employee_id = ?, date = ?, start_time = ?, end_time = ? WHERE id = ?",
        [employeeId, date, startTime, endTime, id],
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: "Time slot not found" });
      }

      reply.send({ message: "Time slot updated successfully" });
    } catch (err) {
      console.error("Error updating time slot:", err);
      reply.code(500).send({ error: "Failed to update time slot" });
    }
  });

  // Delete a time slot
  fastify.delete("/timeslots/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const [result] = await pool.execute(
        "DELETE FROM time_slots WHERE id = ?",
        [id],
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: "Time slot not found" });
      }

      reply.send({ message: "Time slot deleted" });
    } catch (err) {
      console.error("Error deleting time slot:", err);
      reply.code(500).send({ error: "Failed to delete time slot" });
    }
  });
}

module.exports = employees;
