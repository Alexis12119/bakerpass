let logger = null;

function setLogger(fastifyLogger) {
  logger = fastifyLogger;
}

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
