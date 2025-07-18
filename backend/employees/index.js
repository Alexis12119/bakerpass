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
      fastify.log.error(error, "Error fetching employee list");
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
      fastify.log.error(error, "Error fetching employees assigned to visits");
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Fetch Employees with at least one available time slot
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
        "booked.time_slot_id IS NULL",
        "ts.start_time IS NOT NULL AND ts.start_time != ''",
        "ts.end_time IS NOT NULL AND ts.end_time != ''",
        "ts.date >= CURDATE()",
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
      fastify.log.error(error, "Error fetching available hosts");
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // GET available time slots for a specific employee
  fastify.get("/employees/:id/available-timeslots", async (request, reply) => {
    const { id } = request.params;
    const hostId = Number(id);

    if (!hostId) {
      return reply.code(400).send({ error: "Invalid host ID" });
    }

    try {
      const [takenSlots] = await pool.execute(
        `SELECT time_slot_id FROM visits WHERE visited_employee_id = ? AND time_slot_id IS NOT NULL`,
        [hostId],
      );

      const takenSlotIds = takenSlots.map((row) => row.time_slot_id);

      // const query = takenSlotIds.length
      //   ? `SELECT id, date, start_time, end_time FROM time_slots WHERE employee_id = ? AND id NOT IN (${takenSlotIds.map(() => "?").join(",")})`
      //   : `SELECT id, date, start_time, end_time FROM time_slots WHERE employee_id = ?`;
      //
      const baseQuery = `
  SELECT id, date, start_time, end_time
  FROM time_slots
  WHERE employee_id = ?
    AND date >= CURDATE()
`;

      const query = takenSlotIds.length
        ? `${baseQuery} AND id NOT IN (${takenSlotIds.map(() => "?").join(",")})`
        : baseQuery;

      const [availableSlots] = await pool.execute(
        query,
        takenSlotIds.length ? [hostId, ...takenSlotIds] : [hostId],
      );

      reply.send(availableSlots);
    } catch (err) {
      fastify.log.error(err, "Error fetching available time slots");
      reply.code(500).send({ error: "Failed to fetch available time slots" });
    }
  });

  // Add a new available date
  fastify.post("/timeslots/date", async (request, reply) => {
    const { employeeId, date } = request.body;

    if (!employeeId || !date) {
      return reply.code(400).send({ error: "Missing employeeId or date" });
    }

    try {
      const [existing] = await pool.execute(
        "SELECT id FROM time_slots WHERE employee_id = ? AND date = ? LIMIT 1",
        [employeeId, date],
      );

      if (existing.length > 0) {
        return reply.code(409).send({ error: "Date already exists" });
      }

      await pool.execute(
        "INSERT INTO time_slots (employee_id, date, start_time, end_time) VALUES (?, ?, '', '')",
        [employeeId, date],
      );

      reply.code(201).send({ message: "Date added" });
    } catch (err) {
      fastify.log.error(err, "Error adding date");
      reply.code(500).send({ error: "Failed to add date" });
    }
  });

  // GET all time slots for an employee
  fastify.get("/employees/:id/timeslots", async (request, reply) => {
    const { id } = request.params;
    try {
      const [rows] = await pool.execute(
        "SELECT id, date, start_time, end_time FROM time_slots WHERE employee_id = ? AND date >= CURDATE() ORDER BY date ASC, start_time ASC",
        [id],
      );
      reply.send(rows || []);
    } catch (err) {
      fastify.log.error(err, "Error fetching time slots");
      reply.code(500).send({ error: "Failed to fetch time slots" });
    }
  });

  // Add a new time slot
  fastify.post("/timeslots", async (request, reply) => {
    const { employeeId, date, startTime, endTime } = request.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return reply.code(400).send({ error: "Missing required fields" });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];

    try {
      const [conflicts] = await pool.execute(
        `
        SELECT id FROM time_slots
        WHERE employee_id = ?
          AND date = ?
          AND start_time = ?
          AND end_time = ?
        `,
        [employeeId, formattedDate, startTime, endTime],
      );

      if (conflicts.length > 0) {
        return reply.code(409).send({ error: "The Date was already Taken" });
      }

      await pool.execute(
        "INSERT INTO time_slots (employee_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
        [employeeId, formattedDate, startTime, endTime],
      );

      reply.code(201).send({ message: "Time slot added" });
    } catch (err) {
      fastify.log.error(err, "Error adding time slot");
      reply.code(500).send({ error: "Failed to add time slot" });
    }
  });

  // Update a time slot
  fastify.put("/timeslots/:id", async (request, reply) => {
    const { id } = request.params;
    const { employeeId, date, startTime, endTime } = request.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return reply.code(400).send({ error: "Missing required fields" });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];
    try {
      const [conflicts] = await pool.execute(
        `
        SELECT id FROM time_slots
        WHERE employee_id = ?
          AND date = ?
          AND id != ?
          AND start_time = ?
          AND end_time = ?
        `,
        [employeeId, formattedDate, id, startTime, endTime],
      );

      if (conflicts.length > 0) {
        return reply.code(409).send({
          error:
            "This time slot overlaps with another one. Please choose a different time.",
        });
      }

      const [result] = await pool.execute(
        "UPDATE time_slots SET employee_id = ?, date = ?, start_time = ?, end_time = ? WHERE id = ?",
        [employeeId, formattedDate, startTime, endTime, id],
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({ error: "Time slot not found" });
      }

      reply.send({ message: "Time slot updated successfully" });
    } catch (err) {
      fastify.log.error(err, "Error updating time slot");
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
      fastify.log.error(err, "Error deleting time slot");
      reply.code(500).send({ error: "Failed to delete time slot" });
    }
  });
}

module.exports = employees;
