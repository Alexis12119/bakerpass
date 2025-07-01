const clients = require("./wsClients.js");

async function websocket(fastify) {
  fastify.register(require("@fastify/websocket"), {
    options: { maxPayload: 1048576 },
  });

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
}

module.exports = websocket;
