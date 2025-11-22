import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { swaggerSpec } from "./docs/swagger.js";
import log from "./utils/logger.js";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Swagger UI setup
try {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  log.info("Swagger documentation loaded successfully");
} catch (error) {
  log.error("Error setting up Swagger:", error);
  // Continue without Swagger if there's an error
}

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: API is running
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// API routes
app.use(config.api.prefix, routes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

