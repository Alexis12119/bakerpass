const { pool } = require("../lib/database");
const clients = require("../lib/wsClients");

async function nurse(fastify) {
  // Submit health declaration
  fastify.post("/health/:visitId/submit", async (request, reply) => {
    const visitId = request.params.visitId;
    const nurseId = request.body.nurseId;

    const {
      fever,
      cough,
      openWound,
      nausea,
      skinBoils,
      skinAllergies,
      diarrhea,
      openSores,
      otherAllergies,
      recentPlaces,
      mobilePhone,
      camera,
      medicines,
      notebook,
      earrings,
      necklace,
      ring,
      id_card,
      ballpen,
      wristwatch,
      otherProhibited,
    } = request.body;

    if (!nurseId) {
      return reply.status(400).send({ message: "Missing nurse ID" });
    }

    try {
      const [rows] = await pool.execute(
        `SELECT id FROM high_care_requests WHERE visit_id = ? ORDER BY id DESC LIMIT 1`,
        [visitId],
      );

      if (rows.length === 0) {
        return reply
          .status(404)
          .send({ message: "High care request not found for this visit" });
      }

      const highCareRequestId = rows[0].id;

      const [symptomsExist] = await pool.execute(
        `SELECT id FROM high_care_symptoms WHERE high_care_request_id = ?`,
        [highCareRequestId],
      );

      if (symptomsExist.length > 0) {
        return reply
          .status(400)
          .send({ message: "Health declaration already submitted" });
      }

      await pool.execute(
        `INSERT INTO high_care_symptoms (
          high_care_request_id,
          fever,
          cough,
          open_wound,
          nausea,
          other_allergies,
          recent_places,
          skin_boils,
          skin_allergies,
          diarrhea,
          open_sores
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          highCareRequestId,
          fever ? 1 : 0,
          cough ? 1 : 0,
          openWound ? 1 : 0,
          nausea ? 1 : 0,
          otherAllergies || null,
          recentPlaces || null,
          skinBoils ? 1 : 0,
          skinAllergies ? 1 : 0,
          diarrhea ? 1 : 0,
          openSores ? 1 : 0,
        ],
      );

      await pool.execute(
        `INSERT INTO high_care_prohibited_items (
          high_care_request_id,
          mobile_phone,
          camera,
          medicines,
          notebook,
          earrings,
          other_prohibited_items,
          ring,
          id_card,
          ballpen,
          wristwatch,
          necklace
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          highCareRequestId,
          mobilePhone ? 1 : 0,
          camera ? 1 : 0,
          medicines ? 1 : 0,
          notebook ? 1 : 0,
          earrings ? 1 : 0,
          otherProhibited || null,
          ring ? 1 : 0,
          id_card ? 1 : 0,
          ballpen ? 1 : 0,
          wristwatch ? 1 : 0,
          necklace ? 1 : 0,
        ],
      );

      fastify.log.info(`Health declaration submitted for visit ${visitId}`);

      return reply.send({
        message: "Health declaration successfully submitted.",
      });
    } catch (error) {
      fastify.log.error(error, "Error submitting health declaration");
      return reply.status(500).send({
        message: "Failed to submit health declaration",
        error: error.message,
      });
    }
  });

  // Create high care request
  fastify.post("/highcare/:visitId/request", async (request, reply) => {
    const visitId = request.params.visitId;
    const { nurseId, areas, equipment, permissionType, comments } =
      request.body;

    try {
      const [result] = await pool.execute(
        `INSERT INTO high_care_requests (
          visit_id, approved_by_nurse_id, is_approved, areas, equipment, permission_type, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          visitId,
          nurseId,
          1,
          JSON.stringify(areas),
          JSON.stringify(equipment),
          permissionType,
          comments,
        ],
      );

      const highCareRequestId = result.insertId;

      fastify.log.info(
        { visitId, highCareRequestId },
        "High care request created",
      );

      return reply.send({
        message: "High care request created successfully",
        highCareRequestId,
      });
    } catch (error) {
      fastify.log.error(error, "Failed to create high care request");
      return reply
        .status(500)
        .send({ message: "Failed to create high care request" });
    }
  });

  // Get high care visits
  fastify.get("/nurse/high-care-visits", async (request, reply) => {
    let { date, employeeId } = request.query;

    if (!date) {
      date = new Date().toISOString().slice(0, 10);
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
          vi.email, 
          e.first_name AS employeeFirstName, 
          e.last_name AS employeeLastName,
          d.name AS employeeDepartment,
          a.name AS approval_status,
          hcr.id AS high_care_request_id,
          hcr.is_approved AS high_care_approved,
          hcr.approved_at AS high_care_approved_at,
          hcr.approved_by_nurse_id
        FROM visits v
        JOIN visitors vi ON v.visitor_id = vi.id
        JOIN employees e ON v.visited_employee_id = e.id
        JOIN purposes p ON v.purpose_id = p.id
        JOIN departments d ON e.department_id = d.id
        JOIN approval_status a ON v.approval_status_id = a.id
        JOIN visit_statuses vs ON v.status_id = vs.id
        LEFT JOIN high_care_requests hcr ON hcr.visit_id = v.id
        WHERE v.visit_date = ?
      `;

      const params = [date];

      if (employeeId) {
        query += " AND v.visited_employee_id = ?";
        params.push(employeeId);
      }

      query += " ORDER BY v.visit_date DESC, v.id DESC;";

      const [rows] = await pool.execute(query, params);

      fastify.log.info(
        `Fetched ${rows.length} high care visits for ${date}${
          employeeId ? ` (employeeId=${employeeId})` : ""
        }`,
      );

      return reply.send(rows);
    } catch (error) {
      fastify.log.error(error, "Failed to fetch high care visits");
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });

  // Approve visit as nurse
  fastify.put("/nurse/:visitId/approval", async (request, reply) => {
    const visitId = request.params.visitId;

    try {
      const [rows] = await pool.execute(
        `SELECT id FROM approval_status WHERE name = 'Nurse Approved'`,
      );

      if (rows.length === 0) {
        return reply.status(400).send({ message: "Approval status not found" });
      }

      const nurseApprovedStatusId = rows[0].id;

      await pool.execute(
        `UPDATE visits SET approval_status_id = ? WHERE id = ?`,
        [nurseApprovedStatusId, visitId],
      );

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

      fastify.log.info(`Visit ${visitId} marked as Nurse Approved`);

      return reply.send({ message: "Visitor marked as Nurse Approved" });
    } catch (error) {
      fastify.log.error(error, "Failed to approve visit as nurse");
      return reply
        .status(500)
        .send({ message: "Failed to mark as Nurse Approved" });
    }
  });
}

module.exports = nurse;
