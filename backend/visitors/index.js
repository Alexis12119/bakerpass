const { pool } = require("../lib/database");
const clients = require("../lib/wsClients");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs-timezone-iana-plugin");
dayjs.extend(utc);
dayjs.extend(timezone);

async function visitors(fastify) {
  // Update Visitor Profile
  fastify.put("/visitors/:id", async (request, reply) => {
    const { id } = request.params;
    const { firstName, lastName, contactNumber, address } = request.body;

    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (firstName != null) {
      fieldsToUpdate.push("first_name= ?");
      valuesToUpdate.push(firstName);
    }

    if (lastName != null) {
      fieldsToUpdate.push("last_name = ?");
      valuesToUpdate.push(lastName);
    }

    if (contactNumber != null) {
      fieldsToUpdate.push("contact_number = ?");
      valuesToUpdate.push(contactNumber);
    }

    if (address != null) {
      fieldsToUpdate.push("address = ?");
      valuesToUpdate.push(address);
    }

    valuesToUpdate.push(id); // Add the ID at the end for the WHERE clause

    if (fieldsToUpdate.length === 0) {
      return reply.status(400).send({ message: "No data to update" });
    }

    try {
      await pool.query(
        `UPDATE visitors SET ${fieldsToUpdate.join(", ")} WHERE id = ?`,
        valuesToUpdate,
      );

      return reply.send({ message: "Profile updated successfully." });
    } catch (error) {
      fastify.log.error(error);
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
        selectedTimeSlot, // time_slots.id
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
        return reply.status(400).send({ message: "Missing required fields" });
      }

      const visitDate = new Date().toISOString().split("T")[0];

      // Ensure time slot is valid for this employee
      const [slotCheck] = await pool.execute(
        `SELECT start_time, end_time FROM time_slots WHERE id = ? AND employee_id = ?`,
        [selectedTimeSlot, visitedEmployeeId],
      );

      if (slotCheck.length === 0) {
        return reply
          .status(400)
          .send({ message: "Invalid or mismatched time slot" });
      }

      const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(":");
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      };

      const { start_time, end_time } = slotCheck[0];
      const expectedTime = `${formatTime(start_time)} - ${formatTime(end_time)}`;

      // Check if visitor exists
      const [existingVisitor] = await pool.execute(
        `SELECT id FROM visitors WHERE email = ?`,
        [email],
      );

      let visitorId;
      if (existingVisitor.length > 0) {
        visitorId = existingVisitor[0].id; // reuse existing visitor
      } else {
        // Insert new visitor
        const [visitorResult] = await pool.execute(
          `INSERT INTO visitors (email, password, first_name, last_name, contact_number, address)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            email,
            "", // password is optional
            firstName,
            lastName,
            contactNumber || "",
            address || "",
          ],
        );
        visitorId = visitorResult.insertId;
      }

      // Insert visit
      const [visitResult] = await pool.execute(
        `INSERT INTO visits (visitor_id, visited_employee_id, purpose_id, visit_date, expected_time, time_slot_id, device_type, device_brand)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          visitorId,
          visitedEmployeeId,
          visitPurposeId,
          visitDate,
          expectedTime,
          selectedTimeSlot,
          deviceType || null,
          deviceBrand || null,
        ],
      );

      const visitId = visitResult.insertId;

      // Notify clients of update
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

      return reply.status(201).send({
        message: "Visit created successfully",
        visitId,
      });
    } catch (error) {
      fastify.log.error(error, "Error creating visit");
      return reply.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });

  // Fetch Visitors
  fastify.get("/visitors", async (request, reply) => {
    const { employeeId } = request.query;

    try {
      let query = `
      SELECT 
        v.id AS visit_id, 
        v.visit_date, 
        v.visitor_id, 
        v.visited_employee_id,
        p.name AS purpose, 
        v.time_in,
        v.time_out,
        v.expected_time,
        vs.name AS status,
        vi.first_name AS visitorFirstName,
        vi.last_name AS visitorLastName,
        vi.email, 
        vi.profile_image_url,    
        e.first_name AS employeeFirstName,
        e.last_name AS employeeLastName,
        d.name AS employeeDepartment,
        a.name AS approval_status
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      JOIN employees e ON v.visited_employee_id = e.id
      JOIN purposes p ON v.purpose_id = p.id
      JOIN departments d ON e.department_id = d.id
      JOIN approval_status a ON v.approval_status_id = a.id
      JOIN visit_statuses vs ON v.status_id = vs.id
      WHERE NOT EXISTS (
        SELECT 1
        FROM high_care_requests hcr
        WHERE hcr.visit_id = v.id AND hcr.is_approved = FALSE
      )
    `;

      const params = [];

      if (employeeId) {
        query += " AND v.visited_employee_id = ?";
        params.push(employeeId);
      }

      query += " ORDER BY v.visit_date DESC, v.id DESC;";

      const [rows] = await pool.execute(query, params);
      return reply.send(rows);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Add an endpoint to update visitor status
  fastify.put("/visitors/:id/status", async (request, reply) => {
    try {
      const { id } = request.params;
      const { status, validIdTypeId } = request.body;

      const now = dayjs().tz("Asia/Manila");
      const timeStr = now.format("HH:mm:ss");

      // 1. Get the status_id from status name
      const [statusRows] = await pool.execute(
        `SELECT id FROM visit_statuses WHERE LOWER(name) = LOWER(?) LIMIT 1`,
        [status],
      );

      if (statusRows.length === 0) {
        return reply.status(400).send({ message: "Invalid status name" });
      }

      const status_id = statusRows[0].id;

      // 2. Build the update query depending on status
      let query = "";
      let values = [];

      if (
        status.toLowerCase() === "checked in" ||
        status.toLowerCase() === "ongoing"
      ) {
        query = `
        UPDATE visits
        SET status_id = ?, time_in = ?, valid_id_type_id = ?
        WHERE id = ?
      `;
        values = [status_id, timeStr, validIdTypeId || null, id];
      } else if (status.toLowerCase() === "checked out") {
        query = `
        UPDATE visits
        SET status_id = ?, time_out = ?, time_slot_id = NULL
        WHERE id = ?
      `;
        values = [status_id, timeStr, id];
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
                message: "Status updated successfully",
              },
            }),
          );
        }
      });
      return reply.send({
        success: true,
        message: "Status updated successfully",
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // UPDATE approval status of latest visit for a visitor
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
      // Get approval_status_id by name
      const [statusRows] = await pool.execute(
        "SELECT id FROM approval_status WHERE name = ?",
        [status],
      );

      if (statusRows.length === 0) {
        return reply.code(400).send({ error: "Invalid status name" });
      }

      const approvalStatusId = statusRows[0].id;

      // Build base query
      let updateQuery = `
      UPDATE visits 
      SET approval_status_id = ?
    `;

      // If Cancelled, also clear time_slot_id
      if (status === "Cancelled" || status === "Blocked") {
        updateQuery += `, time_slot_id = NULL `;
      }

      updateQuery += ` WHERE id = ?`;

      // Run update
      const [updateResult] = await pool.execute(updateQuery, [
        approvalStatusId,
        visitorId,
      ]);

      if (updateResult.affectedRows === 0) {
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
                message: "Status updated successfully",
              },
            }),
          );
        }
      });

      reply.send({ message: `Visitor ${status.toLowerCase()} successfully.` });
    } catch (err) {
      console.error("Error updating approval status:", err);
      reply.code(500).send({ error: "Failed to update approval status" });
    }
  });

  // Get Employee Visits with Date Filter
  fastify.get("/visitors-date", async (request, reply) => {
    let { date, employeeId } = request.query;

    // Default to today if date is not provided
    if (!date) {
      date = new Date().toISOString().slice(0, 10); // yyyy-MM-dd format
    }

    try {
      let query = `
      SELECT 
        v.id AS visit_id, 
        v.visit_date, 
        v.visitor_id, 
        v.visited_employee_id,
        p.name AS purpose, 
        v.time_in,
        v.time_out,
        v.expected_time,
        vs.name AS status,
        vi.first_name AS visitorFirstName, 
        vi.last_name AS visitorLastName,
        vi.contact_number,
        vi.address,
        vi.email, 
        e.first_name AS employeeFirstName, 
        e.last_name AS employeeLastName,
        d.name AS employeeDepartment,
        a.name AS approval_status
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

      query += " ORDER BY v.visit_date DESC, v.id DESC;";

      const [rows] = await pool.execute(query, params);
      return reply.send(rows);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Insert/Update Comment
  fastify.post("/visit/:visitId/comment", async (request, reply) => {
    const visitId = request.params.visitId;
    const { content } = request.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if visit already has a comment
      const [[visit]] = await connection.execute(
        "SELECT comment_id FROM visits WHERE id = ?",
        [visitId],
      );

      let commentId = visit?.comment_id;

      if (commentId) {
        // Update existing comment
        await connection.execute(
          "UPDATE comments SET content = ? WHERE id = ?",
          [content, commentId],
        );
      } else {
        // Insert new comment
        const [insertResult] = await connection.execute(
          "INSERT INTO comments (content) VALUES (?)",
          [content],
        );
        commentId = insertResult.insertId;

        await connection.execute(
          "UPDATE visits SET comment_id = ? WHERE id = ?",
          [commentId, visitId],
        );
      }

      await connection.commit();
      reply.send({ message: "Comment saved successfully." });
    } catch (err) {
      await connection.rollback();
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to save comment." });
    } finally {
      connection.release();
    }
  });

  // Get Visitor Schedule
  fastify.get("/visitor-schedule", async (req, reply) => {
    const { email } = req.query;

    const [rows] = await pool.execute(
      `
    SELECT vs.id AS visit_id,
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
    WHERE vi.email = ?
      AND a.name IN ('Approved', 'Waiting For Approval', 'Nurse Approved', 'Partial Approved')
    LIMIT 1
    `,
      [email],
    );

    if (rows.length === 0) {
      return reply.code(404).send({ message: "No visit found" });
    }

    return {
      host_name: rows[0].host_name,
      department: rows[0].department,
      purpose: rows[0].purpose,
      time_in: rows[0].start_time,
      time_out: rows[0].end_time,
      approval_status: rows[0].approval_status,
      qr_code_data: rows[0].visit_id, // Use visit id here instead of email
    };
  });

  // Update approval status
  fastify.put("/visits/:id/approval", async (request, reply) => {
    const visitId = request.params.id;
    const { statusName } = request.body;

    try {
      // Find the approval_status ID based on the name
      const [statusRows] = await pool.execute(
        "SELECT id FROM approval_status WHERE name = ?",
        [statusName],
      );

      if (statusRows.length === 0) {
        return reply.status(400).send({ message: "Invalid approval status" });
      }

      const statusId = statusRows[0].id;

      // If status is Blocked or Cancelled, set time_slot_id to null
      const shouldClearTimeSlot =
        statusName.toLowerCase() === "blocked" ||
        statusName.toLowerCase() === "cancelled";

      if (shouldClearTimeSlot) {
        await pool.execute(
          "UPDATE visits SET approval_status_id = ?, time_slot_id = NULL WHERE id = ?",
          [statusId, visitId],
        );
      } else {
        await pool.execute(
          "UPDATE visits SET approval_status_id = ? WHERE id = ?",
          [statusId, visitId],
        );
      }

      clients.forEach((socket) => {
        if (socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "update",
              notify: {
                status: "success",
                message: "Approval status updated successfully",
              },
            }),
          );
        }
      });

      return reply.send({ message: "Approval status updated successfully" });
    } catch (error) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ message: "Failed to update approval status" });
    }
  });
}

module.exports = visitors;
