const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const { pool } = require("../lib/database"); // Correct relative path

const roleToTable = {
  Employee: "employees",
  "Human Resources": "human_resources",
  Security: "security_guards",
  Visitor: "visitors",
};

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

async function auth(fastify) {
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
      return reply
        .status(400)
        .send({ message: "OTP expired or not requested." });
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
        return reply.status(400).send({
          message: "New password must be different from the old one.",
        });
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
}

module.exports = auth;
