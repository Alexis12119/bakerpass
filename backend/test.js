const Fastify = require("fastify");
const WebSocket = require("ws");
const fastify = Fastify({ logger: true });

// Start HTTP server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("HTTP server running on port 3000");

    // WebSocket server
    const wss = new WebSocket.Server({ server: fastify.server, path: "/ws" });

    wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket");

      ws.send(JSON.stringify({ type: "welcome", message: "Hello from server" }));

      // Example: broadcast a fake event after 5 seconds
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "new-visit", data: { id: 1, name: "John" } }));
      }, 5000);

      ws.on("close", () => console.log("Client disconnected"));
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.get('/', async (request, reply) => {
  return { message: 'Welcome to the Fastify server!' };
});

start();
