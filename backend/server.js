require("dotenv").config();
const cors = require("@fastify/cors");
const cloudinary = require("cloudinary").v2;
const { pool } = require("./lib/database");
const auth = require("./auth/index");
const employees = require("./employees/index");
const visitors = require("./visitors/index");
const nurse = require("./nurse/index");
const hr = require("./hr/index");
const websocket = require("./lib/websocket");
const { setLogger } = require("./utils/logger");

const fs = require("fs");
const path = require("path");
const pino = require("pino");
const Fastify = require("fastify");

// Ensure logs directory exists
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFilePath = path.join(logDir, "app.log");

const prettyTransport = pino.transport({
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  },
});

const fileStream = pino.destination({
  dest: logFilePath,
  sync: false,
});

const logger = pino(
  {
    level: "info",
  },
  pino.multistream([{ stream: prettyTransport }, { stream: fileStream }]),
);

const fastify = Fastify({
  trustProxy: ["172.16.0.0/12", "192.168.0.0/16", "10.0.0.0/8"],
  logger: false, // disable default
});

fastify.log = logger;
setLogger(logger);

fastify.register(require("@fastify/rate-limit"), {
  global: false,
  skipOnError: true,
  addHeadersOnExceeding: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  addHeaders: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
});

setLogger(fastify.log);
fastify.register(auth);
fastify.register(employees);
fastify.register(visitors);
fastify.register(nurse);
fastify.register(hr);
fastify.register(websocket);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

fastify.register(require("@fastify/multipart"), {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Health check
fastify.get("/health", async (_request, reply) => {
  return reply.send({ status: "ok" });
});

// Register CORS
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

fastify.register(require("@fastify/formbody"));
fastify.register(require("@fastify/jwt"), {
  secret: process.env.JWT_KEY,
});

fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: "Unauthorized" });
  }
});

fastify.get(
  "/auth/verify",
  {
    preHandler: [
      async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          return reply.status(401).send({ message: "Unauthorized" });
        }
      },
    ],
  },
  async (request) => {
    return { user: request.user };
  },
);

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

// Get all purposes
fastify.get("/purposes", async (_request, reply) => {
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
fastify.get("/departments", async (_request, reply) => {
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
fastify.get("/approval_status", async (_request, reply) => {
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

// Get all valid ID types
fastify.get("/valid-id-types", async (_request, _reply) => {
  const [rows] = await pool.execute("SELECT id, name FROM valid_id_types");
  return rows;
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

    reply.send(visits);
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: "Failed to retrieve visit history" });
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
