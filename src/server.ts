import "dotenv/config";
import app from "./app";
import { config } from "./config/index";
import log from "./utils/logger";

// Error handling
process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  log.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
const server = app.listen(config.port, () => {
  log.info(`Server is running on http://localhost:${config.port}`);
  log.info(`Health check: http://localhost:${config.port}/health`);
  log.info(`Match endpoint: POST http://localhost:${config.port}${config.api.prefix}/match`);
  log.info(`Swagger UI: http://localhost:${config.port}/api-docs`);
  log.info(`\nPress Ctrl+C to stop the server\n`);
});

// Handle server errors
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof config.port === "string" ? "Pipe " + config.port : "Port " + config.port;

  switch (error.code) {
    case "EACCES":
      log.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      log.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

