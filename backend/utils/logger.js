const clients = require("../lib/wsClients");

let logger = null;

function setLogger(fastifyLogger) {
  logger = fastifyLogger;

  const originalInfo = logger.info;
  const originalWarn = logger.warn;
  const originalError = logger.error;
  const originalDebug = logger.debug;

  logger.info = function (...args) {
    broadcastLog("info", ...args);
    return originalInfo.apply(logger, args);
  };

  logger.warn = function (...args) {
    broadcastLog("warn", ...args);
    return originalWarn.apply(logger, args);
  };

  logger.error = function (...args) {
    broadcastLog("error", ...args);
    return originalError.apply(logger, args);
  };

  logger.debug = function (...args) {
    broadcastLog("debug", ...args);
    return originalDebug.apply(logger, args);
  };
}

function getColorForLevel(level) {
  switch (level) {
    case "error":
      return "red";
    case "warn":
      return "orange";
    case "info":
      return "blue";
    case "debug":
      return "green";
    default:
      return "gray";
  }
}

function getLevelNumber(level) {
  switch (level) {
    case "error":
      return 50;
    case "warn":
      return 40;
    case "info":
      return 30;
    case "debug":
      return 20;
    default:
      return 10;
  }
}

function broadcastLog(level, ...args) {
  const [metaOrMsg, maybeMsg] = args;

  let log = {
    level: getLevelNumber(level),
    levelName: level.toUpperCase(),
    color: getColorForLevel(level),
    timestamp: new Date().toISOString(),
  };

  if (typeof metaOrMsg === "string") {
    log.message = metaOrMsg;
  } else if (typeof maybeMsg === "string") {
    log = { ...log, ...metaOrMsg, message: maybeMsg };
  } else {
    log = { ...log, message: JSON.stringify(metaOrMsg) };
  }

  clients.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(
        JSON.stringify({
          type: "log",
          entry: log,
        }),
      );
    }
  });
}

// Optional helpers
function logInfo(message, meta = {}) {
  logger && logger.info(meta, message);
}
function logWarn(message, meta = {}) {
  logger && logger.warn(meta, message);
}
function logError(message, meta = {}) {
  logger && logger.error(meta, message);
}

module.exports = {
  setLogger,
  logInfo,
  logWarn,
  logError,
};
