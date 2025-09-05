const { pool } = require("../lib/database");
const clients = require("../lib/wsClients");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs-timezone-iana-plugin");
dayjs.extend(utc);
dayjs.extend(timezone);

async function visitors(fastify) {
  // Helper: log with IP
  const logWithIp = (req, msg, extra = {}) => {
    fastify.log.info({ ip: req.ip, ...extra }, msg);
  };

  // Update Visitor Profile
  fastify.put("/visitors/:id", async (request, reply) => {
    const { id } = request.params;
    const { firstName, lastName, contactNumber, address } = request.body;

    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (firstName != null)
      (fieldsToUpdate.push("first_name = ?"), valuesToUpdate.push(firstName));
    if (lastName != null)
      (fieldsToUpdate.push("last_name = ?"), valuesToUpdate.push(lastName));
    if (contactNumber != null)
      (fieldsToUpdate.push("contact_number = ?"),
        valuesToUpdate.push(contactNumber));
    if (address != null)
      (fieldsToUpdate.push("address = ?"), valuesToUpdate.push(address));

    if (fieldsToUpdate.length === 0) {
      return reply.code(400).send({ message: "No data to update" });
    }

    valuesToUpdate.push(id);

    try {
      await pool.query(
        `UPDATE visitors SET ${fieldsToUpdate.join(", ")} WHERE id = ?`,
        valuesToUpdate,
      );
      logWithIp(request, `Visitor profile updated`, { visitorId: id });
      return reply.send({ message: "Profile updated successfully." });
    } catch (error) {
      fastify.log.error(
        { error, ip: request.ip },
        "Failed to update visitor profile",
      );
      return reply.status(500).send({ message: "Failed to update profile." });
    }
  });

  // Add a new visit endpoint
  fastify.post("/visits", async (request, reply) => {
    try {
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        address,
        visitedEmployeeId,
        visitPurposeId,
        selectedTimeSlot,
        deviceType,
        deviceBrand,
      } = request.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !visitPurposeId ||
        !visitedEmployeeId ||
        !selectedTimeSlot
      ) {
        return reply.code(400).send({ message: "Missing required fields" });
      }

      const [slotCheck] = await pool.execute(
        `SELECT start_time, end_time, date FROM time_slots WHERE id = ? AND employee_id = ?`,
        [selectedTimeSlot, visitedEmployeeId],
      );

      if (slotCheck.length === 0) {
        return reply
          .code(400)
          .send({ message: "Invalid or mismatched time slot" });
      }

      const formatTime = (t) => {
        const [h, m] = t.split(":");
        const date = new Date();
        date.setHours(+h, +m);
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      };

      const { start_time, end_time, date: slotDate } = slotCheck[0];
      const expectedTime = `${formatTime(start_time)} - ${formatTime(end_time)}`;

      const [existingVisitor] = await pool.execute(
        `SELECT id FROM visitors WHERE email = ?`,
        [email],
      );

      let visitorId = existingVisitor[0]?.id;
      if (!visitorId) {
        const [insertVisitor] = await pool.execute(
          `INSERT INTO visitors (email, password, first_name, last_name, contact_number, address)
           VALUES (?, '', ?, ?, ?, ?)`,
          [email, firstName, lastName, contactNumber || "", address || ""],
        );
        visitorId = insertVisitor.insertId;
      }

      const [visitResult] = await pool.execute(
        `INSERT INTO visits (visitor_id, visited_employee_id, purpose_id, visit_date, expected_time, time_slot_id, device_type, device_brand)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          visitorId,
          visitedEmployeeId,
          visitPurposeId,
          slotDate,
          expectedTime,
          selectedTimeSlot,
          deviceType || null,
          deviceBrand || null,
        ],
      );

      clients.forEach((socket) => {
        if (socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "update",
              notify: {
                status: "success",
                message: "New visitor has been added!",
              },
            }),
          );
        }
      });

      logWithIp(request, "Visit created", {
        visitId: visitResult.insertId,
        visitorId,
      });
      return reply.code(201).send({
        message: "Visit created successfully",
        visitId: visitResult.insertId,
      });
    } catch (error) {
      fastify.log.error({ error, ip: request.ip }, "Failed to create visit");
      return reply
        .status(500)
        .send({ message: "Internal Server Error", error: error.message });
    }
  });

  // Fetch Visitors
  fastify.get("/visitors", async (request, reply) => {
    const { employeeId } = request.query;
    try {
      let query = `
        SELECT 
          v.id AS visit_id, v.visit_date, v.visitor_id, v.visited_employee_id,
          p.name AS purpose, v.time_in, v.time_out, v.expected_time,
          vs.name AS status, vi.first_name AS visitorFirstName, vi.last_name AS visitorLastName,
          vi.email, vi.profile_image_url, e.first_name AS employeeFirstName,
          e.last_name AS employeeLastName, d.name AS employeeDepartment,
          a.name AS approval_status
        FROM visits v
        JOIN visitors vi ON v.visitor_id = vi.id
        JOIN employees e ON v.visited_employee_id = e.id
        JOIN purposes p ON v.purpose_id = p.id
        JOIN departments d ON e.department_id = d.id
        JOIN approval_status a ON v.approval_status_id = a.id
        JOIN visit_statuses vs ON v.status_id = vs.id
        WHERE NOT EXISTS (
          SELECT 1 FROM high_care_requests hcr WHERE hcr.visit_id = v.id AND hcr.is_approved = FALSE
        )
      `;

      const params = [];
      if (employeeId) {
        query += " AND v.visited_employee_id = ?";
        params.push(employeeId);
      }

      query += " ORDER BY v.visit_date DESC, v.id DESC";
      const [rows] = await pool.execute(query, params);

      logWithIp(request, "Fetched visitor records", { count: rows.length });
      return reply.send(rows);
    } catch (error) {
      fastify.log.error(
        { error, ip: request.ip },
        "Error fetching visitor records",
      );
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Update visitor status
  fastify.put("/visitors/:id/status", async (request, reply) => {
    try {
      const { id } = request.params;
      const { status, validIdTypeId } = request.body;
      const now = dayjs().tz("Asia/Manila").format("HH:mm:ss");

      // Get the new status ID
      const [statusRows] = await pool.execute(
        `SELECT id FROM visit_statuses WHERE LOWER(name) = LOWER(?) LIMIT 1`,
        [status],
      );

      if (statusRows.length === 0) {
        return reply.status(400).send({ message: "Invalid status name" });
      }

      const statusId = statusRows[0].id;

      // Get current visit info
      const [visitRows] = await pool.execute(
        `SELECT time_in FROM visits WHERE id = ? LIMIT 1`,
        [id],
      );

      if (visitRows.length === 0) {
        return reply.status(404).send({ message: "Visit not found" });
      }

      const visit = visitRows[0];

      let query = "";
      let values = [];

      if (["checked in", "ongoing"].includes(status.toLowerCase())) {
        const timeIn = visit.time_in ? visit.time_in : now;

        query = `
        UPDATE visits 
        SET status_id = ?, time_in = ?, valid_id_type_id = ? 
        WHERE id = ?
      `;
        values = [statusId, timeIn, validIdTypeId || null, id];
      } else if (status.toLowerCase() === "checked out") {
        query = `
        UPDATE visits 
        SET status_id = ?, time_out = ?, time_slot_id = NULL 
        WHERE id = ?
      `;
        values = [statusId, now, id];
      } else {
        return reply.status(400).send({ message: "Invalid status update" });
      }

      await pool.execute(query, values);

      clients.forEach((socket) => {
        if (socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "update",
              notify: {
                status: "success",
              },
            }),
          );
        }
      });

      logWithIp(request, `Visit status updated`, { visitId: id, status });
      return reply.send({
        success: true,
        message: "Status updated successfully",
      });
    } catch (error) {
      fastify.log.error(
        { error, ip: request.ip },
        "Failed to update visitor status",
      );
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Update approval status for latest visit
  fastify.put("/visitors/:id/approval", async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    const visitorId = Number(id);

    if (
      !visitorId ||
      ![
        "Approved",
        "Blocked",
        "Cancelled",
        "Nurse Approved",
        "Partial Approved",
      ].includes(status)
    ) {
      return reply.code(400).send({ error: "Invalid visitor ID or status" });
    }

    try {
      const [statusRows] = await pool.execute(
        "SELECT id FROM approval_status WHERE name = ?",
        [status],
      );
      if (statusRows.length === 0) {
        return reply.code(400).send({ error: "Invalid status name" });
      }

      const approvalStatusId = statusRows[0].id;

      let query = `UPDATE visits SET approval_status_id = ?`;
      if (["Cancelled", "Blocked"].includes(status))
        query += `, time_slot_id = NULL`;
      query += ` WHERE id = ?`;

      const [result] = await pool.execute(query, [approvalStatusId, visitorId]);

      if (result.affectedRows === 0) {
        return reply
          .code(404)
          .send({ error: "No visit found for this visitor" });
      }

      clients.forEach((socket) => {
        if (socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "update",
              notify: {
                status: "success",
              },
            }),
          );
        }
      });

      logWithIp(request, "Approval status updated", {
        visitId: visitorId,
        status,
      });
      return reply.send({
        message: `Visitor ${status.toLowerCase()} successfully.`,
      });
    } catch (err) {
      fastify.log.error(
        { err, ip: request.ip },
        "Failed to update approval status",
      );
      return reply
        .code(500)
        .send({ error: "Failed to update approval status" });
    }
  });

  // Get visitors by date
  fastify.get("/visitors-date", async (request, reply) => {
    let { date, employeeId } = request.query;
    if (!date) date = new Date().toISOString().slice(0, 10);

    try {
      let query = `
        SELECT 
          v.id AS visit_id, v.visit_date, v.visitor_id, v.visited_employee_id,
          p.name AS purpose, v.time_in, v.time_out, v.expected_time,
          vs.name AS status, vi.first_name AS visitorFirstName, vi.last_name AS visitorLastName,
          vi.contact_number, vi.address, vi.email,
          e.first_name AS employeeFirstName, e.last_name AS employeeLastName,
          d.name AS employeeDepartment, a.name AS approval_status
        FROM visits v
        JOIN visitors vi ON v.visitor_id = vi.id
        JOIN employees e ON v.visited_employee_id = e.id
        JOIN purposes p ON v.purpose_id = p.id
        JOIN departments d ON e.department_id = d.id
        JOIN approval_status a ON v.approval_status_id = a.id
        JOIN visit_statuses vs ON v.status_id = vs.id
        WHERE v.visit_date = ?
      `;

      const params = [date];
      if (employeeId) {
        query += " AND v.visited_employee_id = ?";
        params.push(employeeId);
      }

      query += " ORDER BY v.visit_date DESC, v.id DESC";
      const [rows] = await pool.execute(query, params);

      logWithIp(request, "Fetched visitors by date", {
        date,
        employeeId,
        count: rows.length,
      });
      return reply.send(rows);
    } catch (error) {
      fastify.log.error(
        { error, ip: request.ip },
        "Error fetching visitors by date",
      );
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Insert or update visit comment
  fastify.post("/visit/:visitId/comment", async (request, reply) => {
    const visitId = request.params.visitId;
    const { content } = request.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [[visit]] = await connection.execute(
        "SELECT comment_id FROM visits WHERE id = ?",
        [visitId],
      );

      let commentId = visit?.comment_id;

      if (commentId) {
        await connection.execute(
          "UPDATE comments SET content = ? WHERE id = ?",
          [content, commentId],
        );
      } else {
        const [insert] = await connection.execute(
          "INSERT INTO comments (content) VALUES (?)",
          [content],
        );
        commentId = insert.insertId;
        await connection.execute(
          "UPDATE visits SET comment_id = ? WHERE id = ?",
          [commentId, visitId],
        );
      }

      await connection.commit();
      logWithIp(request, "Saved visit comment", { visitId });
      return reply.send({ message: "Comment saved successfully." });
    } catch (err) {
      await connection.rollback();
      fastify.log.error({ err, ip: request.ip }, "Failed to save comment");
      return reply.status(500).send({ error: "Failed to save comment." });
    } finally {
      connection.release();
    }
  });

  // Get schedule for visitor
  fastify.get("/visitor-schedule", async (req, reply) => {
    const { id } = req.query;
    const [rows] = await pool.execute(
      `SELECT vs.id AS visit_id,
              v.first_name AS host_name,
              d.name AS department,
              p.name AS purpose,
              ts.start_time,
              ts.end_time,
              a.name AS approval_status
       FROM visits vs
       JOIN visitors vi ON vi.id = vs.visitor_id
       JOIN employees v ON v.id = vs.visited_employee_id
       JOIN departments d ON d.id = v.department_id
       JOIN purposes p ON p.id = vs.purpose_id
       JOIN time_slots ts ON ts.id = vs.time_slot_id
       JOIN approval_status a ON a.id = vs.approval_status_id
       WHERE vs.id = ?
         AND a.name IN ('Approved', 'Waiting For Approval', 'Nurse Approved', 'Partial Approved')
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return reply.code(404).send({ message: "No visit found" });
    }

    logWithIp(req, "Fetched visitor schedule", { visitId: id });
    return {
      hostName: rows[0].host_name,
      department: rows[0].department,
      purpose: rows[0].purpose,
      timeIn: rows[0].start_time,
      timeOut: rows[0].end_time,
      approvalStatus: rows[0].approval_status,
      qrCodeData: rows[0].visit_id,
    };
  });

  // Update approval status by visit ID
  fastify.put("/visits/:id/approval", async (request, reply) => {
    const visitId = request.params.id;
    const { statusName } = request.body;

    try {
      const [statusRows] = await pool.execute(
        "SELECT id FROM approval_status WHERE name = ?",
        [statusName],
      );
      if (statusRows.length === 0) {
        return reply.status(400).send({ message: "Invalid approval status" });
      }

      const statusId = statusRows[0].id;
      const shouldClearSlot = ["blocked", "cancelled"].includes(
        statusName.toLowerCase(),
      );

      const updateQuery = shouldClearSlot
        ? "UPDATE visits SET approval_status_id = ?, time_slot_id = NULL WHERE id = ?"
        : "UPDATE visits SET approval_status_id = ? WHERE id = ?";

      await pool.execute(updateQuery, [statusId, visitId]);

      clients.forEach((socket) => {
        if (socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "update",
              notify: {
                status: "success",
              },
            }),
          );
        }
      });

      logWithIp(request, "Approval status updated", { visitId, statusName });
      return reply.send({ message: "Approval status updated successfully" });
    } catch (error) {
      fastify.log.error(
        { error, ip: request.ip },
        "Failed to update approval status",
      );
      return reply
        .status(500)
        .send({ message: "Failed to update approval status" });
    }
  });
}

module.exports = visitors;
