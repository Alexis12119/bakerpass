const fs = require("fs");
const readline = require("readline");
const path = require("path");
const clients = require("../lib/wsClients");

const logPath = path.join(__dirname, "../logs/app.log");

function broadcastLogLine(line) {
  clients.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(
        JSON.stringify({
          type: "log",
          entry: line,
        }),
      );
    }
  });
}

function startLogWatcher() {
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, ""); // create empty log file if it doesn't exist
  }

  let fileSize = fs.statSync(logPath).size;

  fs.watch(logPath, { encoding: "utf-8" }, (eventType) => {
    if (eventType !== "change") return;

    const newSize = fs.statSync(logPath).size;

    if (newSize > fileSize) {
      const stream = fs.createReadStream(logPath, {
        start: fileSize,
        end: newSize,
        encoding: "utf-8",
      });

      const rl = readline.createInterface({ input: stream });

      rl.on("line", (line) => {
        try {
          const parsed = JSON.parse(line.trim());
          broadcastLogLine(parsed);
        } catch {
          broadcastLogLine({
            level: "info",
            message: line.trim(),
            timestamp: new Date().toISOString(),
          });
        }
      });

      fileSize = newSize;
    }
  });

  console.log("[logWatcher] Watching for changes in app.log");
}

module.exports = { startLogWatcher };
