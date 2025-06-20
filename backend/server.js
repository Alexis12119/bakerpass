require("dotenv").config();
const Fastify = require("fastify");
const mysql = require("mysql2/promise");
const cors = require("@fastify/cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs-timezone-iana-plugin");
const fastify = Fastify({ logger: true });
const bcrypt = require("bcrypt");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const cloudinary = require("cloudinary").v2;
dayjs.extend(utc);
dayjs.extend(timezone);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

fastify.register(require("@fastify/multipart"));

// Register CORS
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
});
fastify.register(require("@fastify/formbody"));
fastify.register(require("@fastify/websocket"), {
  options: { maxPayload: 1048576 },
});

fastify.register(require("@fastify/jwt"), {
  secret: process.env.JWT_KEY,
});

const clients = new Set();

fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: "Unauthorized" });
  }
});

fastify.get(
  "/auth/verify",
  { preHandler: [fastify.authenticate] },
  async (request, reply) => {
    return { user: request.user };
  },
);
fastify.register(async function (fastify) {
  fastify.get("/ws/updates", { websocket: true }, (socket, req) => {
    clients.add(socket);

    socket.on("close", () => {
      clients.delete(socket);
    });

    socket.send(
      JSON.stringify({ type: "connected", message: "WebSocket connected" }),
    );
  });
});

// Create a pool of database connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const roleToTable = {
  Employee: "employees",
  "Human Resources": "human_resources",
  Security: "security_guards",
  Visitor: "visitors",
};

// Register Endpoint
fastify.post("/register", async (request, reply) => {
  const { email, password, firstName, lastName, role, departmentId } =
    request.body;
  const tableName = roleToTable[role];

  if (!tableName) {
    return reply.status(400).send({ message: "Invalid role" });
  }

  try {
    // Check if email is already taken
    const [rows] = await pool.query(
      `SELECT * FROM ${tableName} WHERE email = ?`,
      [email],
    );
    if (rows.length > 0) {
      return reply.status(400).send({ message: "Email already registered" });
    }

    // Validate password length
    if (password.length < 8) {
      return reply.status(400).send({
        message: "Password must be at least 8 characters long.",
      });
    }

    // If role is Employee, validate departmentId
    if (role === "Employee") {
      if (!departmentId) {
        return reply
          .status(400)
          .send({ message: "Department ID is required for employees" });
      }

      const [deptRows] = await pool.query(
        "SELECT name FROM departments WHERE id = ?",
        [departmentId],
      );

      if (deptRows.length === 0) {
        return reply.status(400).send({ message: "Invalid department ID" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    if (role === "Employee") {
      await pool.query(
        `INSERT INTO ${tableName} (email, password, first_name, last_name, department_id) VALUES (?, ?, ?, ?, ?)`,
        [email, hashedPassword, firstName, lastName, departmentId],
      );
    } else {
      await pool.query(
        `INSERT INTO ${tableName} (email, password, first_name, last_name) VALUES (?, ?, ?, ?)`,
        [email, hashedPassword, firstName, lastName],
      );
    }

    return reply.status(201).send({ message: "Registration successful!" });
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
});

// Login Endpoint
fastify.post("/login", async (request, reply) => {
  const { email, password } = request.body;
  console.log(email, password);

  const userTables = [
    { table: "visitors", role: "Visitor" },
    { table: "employees", role: "Employee" },
    { table: "security_guards", role: "Security" },
    { table: "human_resources", role: "Human Resources" },
    { table: "nurses", role: "Nurse" },
  ];

  try {
    for (const { table, role } of userTables) {
      const [rows] = await pool.query(
        `SELECT * FROM ${table} WHERE email = ?`,
        [email],
      );

      if (rows.length > 0) {
        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return reply.status(401).send({ message: "Invalid password" });
        }

        const token = fastify.jwt.sign(
          {
            id: user.id,
            role: role,
            firstName: user.first_name,
            lastName: user.last_name,
            profileImage: user.profile_image_url,
          },
          { expiresIn: "1h" },
        );

        if (role === "Visitor") {
          return reply.status(200).send({
            message: "Login successful",
            token,
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            contactNumber: user.contact_number,
            address: user.address,
            profileImage: user.profile_image_url,
            role: role,
          });
        } else {
          // For other roles, just send message and token
          return reply.status(200).send({
            message: "Login successful",
            token,
          });
        }
      }
    }

    return reply.status(401).send({ message: "Invalid email or password" });
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
});

// OTP Handling
const otpStore = {};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// Forgot Password - Generate OTP and Send Email
fastify.post("/forgot", async (request, reply) => {
  const { email } = request.body;

  const userTables = [
    { table: "visitors", role: "Visitor" },
    { table: "employees", role: "Employee" },
    { table: "security_guards", role: "Security" },
    { table: "human_resources", role: "Human Resources" },
    { table: "nurses", role: "Nurse" },
  ];

  try {
    let foundUser = null;
    let foundRole = null;

    for (const { table, role } of userTables) {
      const [rows] = await pool.query(
        `SELECT * FROM ${table} WHERE email = ?`,
        [email],
      );

      if (rows.length > 0) {
        foundUser = rows[0];
        foundRole = role;
        break;
      }
    }

    if (!foundUser) {
      return reply.status(400).send({ message: "Email not found." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    const mailOptions = {
      from: `"Franklin Baker Appointment System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP) for Password Reset",
      text: `Hello,

We received a request to reset the password for your ${foundRole} account.

Your One-Time Password (OTP) is: ${otp}

Please enter this code in the password reset form to proceed. This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

Best regards,  
Franklin Baker Appointment System Team`,
      html: `
    <p>Hello,</p>
    <p>We received a request to reset the password for your <strong>${foundRole}</strong> account.</p>
    <p><strong>Your One-Time Password (OTP) is:</strong></p>
    <h2>${otp}</h2>
    <p>Please enter this code in the password reset form to proceed. This OTP will expire in 10 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <br />
    <p>Best regards,<br/>Franklin Baker Appointment System Team</p>
  `,
    };

    await transporter.sendMail(mailOptions);

    return reply.send({
      message: "OTP sent to your email.",
      role: foundRole,
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: "Error sending OTP." });
  }
});

// Verify OTP
fastify.post("/verify-otp", async (request, reply) => {
  const { email, otp } = request.body;

  const record = otpStore[email];

  if (!record) {
    return reply.status(400).send({ message: "OTP expired or not requested." });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email]; // Clean up expired entry
    return reply
      .status(400)
      .send({ message: "OTP has expired. Please request a new one." });
  }

  if (record.code !== otp) {
    return reply.status(400).send({ message: "Invalid OTP." });
  }

  delete otpStore[email]; // Clean up after successful verification

  return reply.send({ message: "OTP verified. Proceed to reset password." });
});

// Reset Password
fastify.post("/reset", async (request, reply) => {
  const { email, newPassword, role } = request.body;

  if (!roleToTable[role]) {
    return reply.status(400).send({ message: "Invalid role." });
  }

  if (newPassword.length < 8) {
    return reply
      .status(400)
      .send({ message: "Password must be at least 8 characters long." });
  }

  try {
    const tableName = roleToTable[role];

    // Fetch the existing user
    const [rows] = await pool.query(
      `SELECT * FROM ${tableName} WHERE email = ?`,
      [email],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ message: "User not found." });
    }

    const user = rows[0];

    // Check if the new password is the same as the old one
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return reply
        .status(400)
        .send({ message: "New password must be different from the old one." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the password
    await pool.query(`UPDATE ${tableName} SET password = ? WHERE email = ?`, [
      hashedPassword,
      email,
    ]);

    return reply.send({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: "Error resetting password." });
  }
});

// Upload profile image
fastify.post("/upload-profile-image", async (request, reply) => {
  const data = await request.file();
  const { userId, role } = request.query;

  if (!data || !userId || !role) {
    return reply.status(400).send({ message: "Missing file, userId, or role" });
  }

  const userTables = {
    Visitor: "visitors",
    Employee: "employees",
    Security: "security_guards",
    "Human Resources": "human_resources",
    Nurse: "nurses",
  };

  const table = userTables[role];
  if (!table) {
    return reply.status(400).send({ message: "Invalid role" });
  }

  try {
    const buffer = await data.toBuffer();

    // Retry logic for Cloudinary upload
    const uploadWithRetry = async (retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `${table}_profiles`,
                resource_type: "image",
                timeout: 60000,
                eager_async: true,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              },
            );

            const timeoutId = setTimeout(() => {
              reject(new Error("Cloudinary upload timeout"));
            }, 60000);

            uploadStream.on("finish", () => {
              clearTimeout(timeoutId);
            });

            uploadStream.end(buffer);
          });
        } catch (error) {
          request.log.warn(`Upload attempt ${i + 1} failed:`, error.message);
          if (i === retries - 1) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    };

    const uploadResult = await uploadWithRetry();

    // Save URL in DB
    const updateQuery = `UPDATE ${table} SET profile_image_url = ? WHERE id = ?`;
    await pool.execute(updateQuery, [uploadResult.secure_url, userId]);

    // Get updated user data from database
    const selectQuery = `SELECT id, first_name , last_name, profile_image_url as profileImage FROM ${table} WHERE id = ?`;
    const [rows] = await pool.execute(selectQuery, [userId]);
    const updatedUser = rows[0];

    // Generate new JWT token with updated profile image
    const tokenPayload = {
      id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: role,
      profileImage: updatedUser.profileImage,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const newToken = fastify.jwt.sign(tokenPayload, process.env.JWT_SECRET);

    return reply.send({
      message: "Upload successful",
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      token: newToken, // Send new token
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: role,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (err) {
    request.log.error(err);

    let errorMessage = "Internal Server Error";
    if (err.code === "ETIMEDOUT" || err.code === "ENETUNREACH") {
      errorMessage = "Network connectivity issue. Please try again later.";
    } else if (err.message && err.message.includes("timeout")) {
      errorMessage = "Upload timeout. Please try again with a smaller file.";
    } else if (err.message) {
      errorMessage = err.message;
    }

    return reply.status(500).send({
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

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
        ROUND(AVG(r.rating), 1) AS rating,
        COUNT(v.id) AS total_visitors,
        COUNT(DISTINCT v.visit_date) AS active_days,
        ROUND(COUNT(v.id) / NULLIF(COUNT(DISTINCT v.visit_date), 0), 1) AS avg_visitors
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN ratings r ON r.rated_employee_id = e.id
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
        rating: row.rating || 0,
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
      query += " (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)";
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
      isHighCare,

      // High care modal fields
      fever,
      cough,
      openWound,
      nausea,
      otherAllergies,
      recentPlaces,
      mobilePhone,
      camera,
      medicines,
      notebook,
      earrings,
      otherProhibited,

      // New symptoms
      skinBoils,
      skinAllergies,
      diarrhea,
      openSores,

      // New prohibited items
      ring,
      id_card,
      ballpen,
      wristwatch,
      necklace,
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
      `INSERT INTO visits (visitor_id, visited_employee_id, purpose_id, visit_date, expected_time, time_slot_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        visitorId,
        visitedEmployeeId,
        visitPurposeId,
        visitDate,
        expectedTime,
        selectedTimeSlot,
      ],
    );
    clients.forEach((socket) => {
      if (socket.readyState === 1) {
        // 1 means OPEN
        socket.send("update");
      }
    });

    const visitId = visitResult.insertId;

    // If high care is requested
    if (isHighCare === "Yes") {
      // Insert into high_care_requests
      const [highCareResult] = await pool.execute(
        `INSERT INTO high_care_requests (visit_id) VALUES (?)`,
        [visitId],
      );

      const highCareRequestId = highCareResult.insertId;

      // Insert into high_care_symptoms
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

      // Insert into high_care_prohibited_items
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
    }

    clients.forEach((socket) => {
      if (socket.readyState === 1) {
        // 1 means OPEN
        socket.send("update");
      }
    });
    return reply.status(201).send({
      message: "Visit created successfully",
      visitId,
    });
  } catch (error) {
    fastify.log.error(error, "Error creating visit"); // <- this logs full details
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
        e.lastName AS employeeLastName,
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
        // 1 means OPEN
        socket.send("update");
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

// Get all purposes
fastify.get("/purposes", async (request, reply) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name FROM purposes ORDER BY name",
    );
    return reply.send(rows);
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: "Failed to fetch purposes" });
  }
});

// Get all departments
fastify.get("/departments", async (request, reply) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name FROM departments ORDER BY name",
    );
    return reply.send(rows);
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ message: "Failed to fetch departments" });
  }
});

// Get all approval statuses
fastify.get("/approval_status", async (request, reply) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM approval_status ORDER BY name",
    );
    return reply.send(rows);
  } catch (error) {
    fastify.log.error(error);
    return reply
      .status(500)
      .send({ message: "Failed to fetch approval_status" });
  }
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

    // Update the visit's approval_status_id
    await pool.execute(
      "UPDATE visits SET approval_status_id = ? WHERE id = ?",
      [statusId, visitId],
    );
    clients.forEach((socket) => {
      if (socket.readyState === 1) {
        // 1 means OPEN
        socket.send("update");
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

// Create a high care request
fastify.post("/highcare/:visitId/request", async (request, reply) => {
  const visitId = request.params.visitId;
  const { nurseId, areas, equipment, permissionType, comments } = request.body;

  try {
    await pool.execute(
      `
      INSERT INTO high_care_requests 
        (visit_id, approved_by_nurse_id, is_approved, approved_at, areas, equipment, permission_type, comments) 
      VALUES (?, ?, 1, NOW(), ?, ?, ?, ?)
      `,
      [
        visitId,
        nurseId,
        JSON.stringify(areas),
        JSON.stringify(equipment),
        permissionType,
        comments,
      ],
    );

    return reply.send({ message: "High care request recorded." });
  } catch (error) {
    fastify.log.error(error);
    return reply
      .status(500)
      .send({ message: "Failed to insert high care request." });
  }
});

// Get all time slots for an employee
fastify.get("/employees/:id/timeslots", async (request, reply) => {
  const { id } = request.params;
  try {
    console.log(`Fetching time slots for employee with ID: ${id}`);
    const [rows] = await pool.execute(
      "SELECT * FROM time_slots WHERE employee_id = ?",
      [id],
    );

    console.log("Time slots fetched:", rows);
    // Ensure that the response is an array, even if no rows are found
    reply.send(rows || []);
  } catch (err) {
    console.error("Error fetching time slots:", err);
    reply.code(500).send({ error: "Failed to fetch time slots" });
  }
});

// Add a new time slot
fastify.post("/timeslots", async (request, reply) => {
  const { employeeId, startTime, endTime } = request.body;
  try {
    await pool.execute(
      "INSERT INTO time_slots (employee_id, start_time, end_time) VALUES (?, ?, ?)",
      [employeeId, startTime, endTime],
    );
    reply.code(201).send({ message: "Time slot added" });
  } catch (err) {
    console.error("Error adding time slot:", err);
    reply.code(500).send({ error: "Failed to add time slot" });
  }
});

// Update a time slot
fastify.put("/timeslots/:id", async (request, reply) => {
  const { id } = request.params; // Time slot ID from URL parameter
  const { startTime, endTime, employeeId } = request.body; // Receive parameters from request body

  // Check if any required fields are missing
  if (!startTime || !endTime || !employeeId) {
    return reply.code(400).send({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE time_slots SET start_time = ?, end_time = ?, employee_id = ? WHERE id = ?",
      [startTime, endTime, employeeId, id], // Pass the parameters to the SQL query
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
    const [result] = await pool.execute("DELETE FROM time_slots WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return reply.code(404).send({ error: "Time slot not found" });
    }

    reply.send({ message: "Time slot deleted" });
  } catch (err) {
    console.error("Error deleting time slot:", err);
    reply.code(500).send({ error: "Failed to delete time slot" });
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
    // Get all time slot IDs already used by this host (via visits)
    const [takenSlots] = await pool.execute(
      `SELECT time_slot_id FROM visits WHERE visited_employee_id = ? AND time_slot_id IS NOT NULL`,
      [hostId],
    );
    console.log(takenSlots);

    const takenSlotIds = takenSlots.map((row) => row.time_slot_id);

    // Get all available time slots not already booked
    const query = takenSlotIds.length
      ? `SELECT id, start_time, end_time FROM time_slots WHERE employee_id = ? AND id NOT IN (${takenSlotIds.map(() => "?").join(",")})`
      : `SELECT id, start_time, end_time FROM time_slots WHERE employee_id = ?`;

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

// UPDATE approval status of latest visit for a visitor
fastify.put("/visitors/:id/approval", async (request, reply) => {
  const { id } = request.params;
  const { status } = request.body;

  const visitorId = Number(id);

  if (!visitorId || !["Approved", "Blocked", "Cancelled"].includes(status)) {
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
      return reply.code(404).send({ error: "No visit found for this visitor" });
    }
    clients.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send("update");
      }
    });

    reply.send({ message: `Visitor ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error("Error updating approval status:", err);
    reply.code(500).send({ error: "Failed to update approval status" });
  }
});

// Get all high care visits
fastify.get("/nurse/high-care-visits", async (request, reply) => {
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
        vi.email, 
        e.first_name AS employeeFirstName, 
        e.last_name AS employeeLastName,
        d.name AS employeeDepartment,
        a.name AS approval_status,
        hcr.id AS high_care_request_id,
        hcr.is_approved AS high_care_approved,
        hcr.approved_at AS high_care_approved_at,
        hcr.approved_by_nurse_id
      FROM high_care_requests hcr
      JOIN visits v ON hcr.visit_id = v.id
      JOIN visitors vi ON v.visitor_id = vi.id
      JOIN employees e ON v.visited_employee_id = e.id
      JOIN purposes p ON v.purpose_id = p.id
      JOIN departments d ON e.department_id = d.id
      JOIN approval_status a ON v.approval_status_id = a.id
      JOIN visit_statuses vs ON v.status_id = vs.id
      WHERE hcr.is_approved = FALSE
        AND v.visit_date = ?
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

fastify.put("/nurse/:id/approval", async (request, reply) => {
  const visitId = request.params.id;
  const { status, nurseId } = request.body;

  if (!nurseId) {
    return reply.status(400).send({ message: "Missing nurse ID" });
  }

  try {
    if (status === "Yes") {
      await pool.execute(
        `UPDATE high_care_requests
         SET is_approved = 1, approved_by_nurse_id = ?, approved_at = NOW()
         WHERE visit_id = ?`,
        [nurseId, visitId],
      );
    } else if (status === "No") {
      await pool.execute(
        `UPDATE high_care_requests
         SET is_approved = 0, approved_by_nurse_id = ?, approved_at = NOW()
         WHERE visit_id = ?`,
        [nurseId, visitId],
      );
    }

    return reply.send({ message: "High care approval updated successfully" });
  } catch (error) {
    fastify.log.error(error);
    return reply
      .status(500)
      .send({ message: "Failed to update high care approval" });
  }
});

// Get all valid ID types
fastify.get("/valid-id-types", async (request, reply) => {
  const [rows] = await pool.execute("SELECT id, name FROM valid_id_types");
  return rows;
});

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
      AND a.name IN ('Approved', 'Waiting For Approval')
    LIMIT 1
    `,
    [email],
  );
  console.log(rows);

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

fastify.get("/history", async (request, reply) => {
  const { email } = request.query;

  try {
    const [visitor] = await pool.execute(
      "SELECT id FROM visitors WHERE email = ?",
      [email],
    );

    if (visitor.length === 0) {
      return reply.code(404).send({ error: "Visitor not found" });
    }

    const visitorId = visitor[0].id;

    const [visits] = await pool.execute(
      ` SELECT 
  v.id AS visit_id,
  e.first_name AS employee_first_name,
  e.last_name AS employee_last_name,
  d.name AS department_name,
  v.visit_date,
  v.time_in,
  v.time_out,
  v.comment_id,
  c.content AS comment
FROM visits v
JOIN employees e ON v.visited_employee_id = e.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN comments c ON v.comment_id = c.id
WHERE v.visitor_id = ?
ORDER BY v.visit_date DESC
      `,
      [visitorId],
    );
    console.log(visits);

    reply.send(visits);
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: "Failed to retrieve visit history" });
  }
});

// Get the visitors information
fastify.get("/hr/visit-stats", async (req, reply) => {
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
        AND NOT EXISTS (
          SELECT 1
          FROM high_care_requests hcr
          WHERE hcr.visit_id = v.id AND hcr.is_approved = FALSE
        )
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
      await connection.execute("UPDATE comments SET content = ? WHERE id = ?", [
        content,
        commentId,
      ]);
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

// Start Server
const PORT = process.env.PORT || 5000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running on port ${PORT}`);
});
