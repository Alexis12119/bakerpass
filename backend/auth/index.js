const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const { pool } = require("../lib/database");

const roleToTable = {
  Employee: "employees",
  "Human Resources": "human_resources",
  Security: "security_guards",
  Visitor: "visitors",
};

const otpStore = {};

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
  fastify.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 3, // 3 attempts
          timeWindow: "5 minutes", // 5-minute window
          errorResponseBuilder: (req, context) => {
            return {
              message: `Too many registration attempts. Please retry in ${Math.ceil(
                context.ttl / 1000 / 60,
              )} minute/s.`,
            };
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password, firstName, lastName, role, departmentId } =
        request.body;
      const tableName = roleToTable[role];

      if (!tableName) {
        fastify.log.warn({ email, role }, "Invalid role during registration");
        return reply.status(400).send({ message: "Invalid role" });
      }

      try {
        const [rows] = await pool.query(
          `SELECT * FROM ${tableName} WHERE email = ?`,
          [email],
        );
        if (rows.length > 0) {
          fastify.log.warn({ email }, "Attempt to register existing email");
          return reply
            .status(400)
            .send({ message: "Email already registered" });
        }

        if (password.length < 8) {
          fastify.log.warn({ email }, "Weak password");
          return reply
            .status(400)
            .send({ message: "Password must be at least 8 characters long." });
        }

        if (role === "Employee") {
          if (!departmentId) {
            fastify.log.warn({ email }, "Missing department for employee");
            return reply
              .status(400)
              .send({ message: "Department ID is required for employees" });
          }

          const [deptRows] = await pool.query(
            "SELECT name FROM departments WHERE id = ?",
            [departmentId],
          );
          if (deptRows.length === 0) {
            fastify.log.warn({ departmentId }, "Invalid department ID");
            return reply.status(400).send({ message: "Invalid department ID" });
          }
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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

        fastify.log.info({ email, role }, "Registration successful");
        return reply.status(201).send({ message: "Registration successful!" });
      } catch (error) {
        fastify.log.error({ err: error, email }, "Error during registration");
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    },
  );

  // Login Endpoint
  fastify.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 3, // 3 attempts
          timeWindow: "5 minutes", // 5-minute window
          errorResponseBuilder: (req, context) => {
            return {
              message: `Too many login attempts. Please retry in ${Math.ceil(
                context.ttl / 1000 / 60,
              )} minute/s.`,
            };
          },
        },
      },
    },
    async (request, reply) => {
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
            const isPasswordValid = await bcrypt.compare(
              password,
              user.password,
            );

            if (!isPasswordValid) {
              fastify.log.warn({ email, role }, "Invalid password");
              return reply.status(401).send({ message: "Invalid password" });
            }

            const token = fastify.jwt.sign(
              {
                id: user.id,
                role,
                firstName: user.first_name,
                lastName: user.last_name,
                profileImage: user.profile_image_url,
              },
              { expiresIn: "1h" },
            );

            fastify.log.info({ email, role }, "Login successful");

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
                role,
              });
            }

            return reply
              .status(200)
              .send({ message: "Login successful", token });
          }
        }

        fastify.log.warn({ email }, "Login failed: email not found");
        return reply.status(401).send({ message: "Invalid email or password" });
      } catch (error) {
        fastify.log.error({ err: error, email }, "Error during login");
        return reply.status(500).send({ message: "Internal Server Error" });
      }
    },
  );

  // Forgot Password - Generate OTP and Send Email
  fastify.post(
    "/forgot",
    {
      config: {
        rateLimit: {
          max: 3, // 3 attempts
          timeWindow: "5 minutes", // 5-minute window
          errorResponseBuilder: (req, context) => {
            return {
              message: `Too many forgot password attempts. Please retry in ${Math.ceil(
                context.ttl / 1000 / 60,
              )} minute/s.`,
            };
          },
        },
      },
    },
    async (request, reply) => {
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
          fastify.log.warn({ email }, "Forgot password: email not found");
          return reply.status(400).send({ message: "Email not found." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[email] = {
          code: otp,
          expiresAt: Date.now() + 10 * 60 * 1000,
        };

        const mailOptions = {
          from: `"Franklin Baker Appointment System" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your One-Time Password (OTP) for Password Reset",
          text: `Your OTP is: ${otp}`,
          html: `<h2>${otp}</h2><p>This OTP will expire in 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        fastify.log.info({ email }, "OTP sent for password reset");
        return reply.send({
          message: "OTP sent to your email.",
          role: foundRole,
        });
      } catch (error) {
        fastify.log.error({ err: error, email }, "Error sending OTP");
        return reply.status(500).send({ message: "Error sending OTP." });
      }
    },
  );

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
      delete otpStore[email];
      return reply
        .status(400)
        .send({ message: "OTP has expired. Please request a new one." });
    }

    if (record.code !== otp) {
      return reply.status(400).send({ message: "Invalid OTP." });
    }

    delete otpStore[email];
    fastify.log.info({ email }, "OTP verified successfully");
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
      const [rows] = await pool.query(
        `SELECT * FROM ${tableName} WHERE email = ?`,
        [email],
      );

      if (rows.length === 0) {
        return reply.status(404).send({ message: "User not found." });
      }

      const user = rows[0];
      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) {
        return reply.status(400).send({
          message: "New password must be different from the old one.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await pool.query(`UPDATE ${tableName} SET password = ? WHERE email = ?`, [
        hashedPassword,
        email,
      ]);

      fastify.log.info({ email }, "Password reset successful");
      return reply.send({
        message: "Password reset successful. You can now log in.",
      });
    } catch (error) {
      fastify.log.error({ err: error, email }, "Error during password reset");
      return reply.status(500).send({ message: "Error resetting password." });
    }
  });
}

module.exports = auth;
