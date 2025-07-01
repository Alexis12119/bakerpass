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

  // Fetch Hosts
  fastify.get("/employees/hosts", async (request, reply) => {
    try {
      const { search, departmentId } = request.query;
      let query = `
      SELECT 
        e.id, 
        e.first_name,
        e.last_name,
        e.department_id,
        d.name AS departmentName,
        e.profile_image_url
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
    `;
      let queryParams = [];

      // Apply departmentId filter if provided
      if (departmentId && departmentId !== "All") {
        query += " WHERE e.department_id = ?";
        queryParams.push(departmentId);
      }

      // Apply search filter if provided
      if (search) {
        query += queryParams.length ? " AND" : " WHERE";
        query +=
          " (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)";
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Execute the query
      const [rows] = await pool.execute(query, queryParams);

      // Return the list of hosts with department name
      return reply.send(
        rows.map((row) => ({
          id: row.id,
          name: `${row.first_name} ${row.last_name}`, // Full name of the host
          department: row.departmentName, // Use the department name
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
