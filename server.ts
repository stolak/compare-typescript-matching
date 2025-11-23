import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { matchRecords } from "./matcher.js";
import type { BankRecord } from "./matcher.js";

const app = express();
const PORT = process.env.PORT || 3005;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Middleware to parse JSON bodies
app.use(express.json());

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Record Matching API",
      version: "1.0.0",
      description:
        "API for matching bank records using semantic similarity. Returns three scenarios: matched records, unmatched records from record1, and unmatched records from record2.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: SERVER_URL,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        BankRecord: {
          type: "object",
          required: ["itemid", "details", "amount"],
          properties: {
            itemid: {
              type: "string",
              description: "Unique identifier for the record",
              example: "ae628341-e022-4d18-9d7b-a46d140a55e5",
            },
            details: {
              type: "string",
              description: "Transaction details/narration",
              example:
                "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB - GTBank Plc Ref/Cheque No.: PSM00068676151167501249 Debits: 106,000.00",
            },
            amount: {
              type: "number",
              description: "Transaction amount",
              example: 106000,
            },
          },
        },
        MatchResult: {
          type: "object",
          properties: {
            record1Id: {
              type: "string",
              description: "ID of the record from record1",
            },
            record2Id: {
              type: "string",
              description: "ID of the matched record from record2",
            },
            score: {
              type: "number",
              description: "Similarity score (0-1)",
            },
            record1: {
              $ref: "#/components/schemas/BankRecord",
            },
            record2: {
              $ref: "#/components/schemas/BankRecord",
            },
          },
        },
        MatchingReport: {
          type: "object",
          properties: {
            matched: {
              type: "array",
              items: {
                $ref: "#/components/schemas/MatchResult",
              },
              description: "Records that matched between record1 and record2",
            },
            unmatchedInRecord1: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BankRecord",
              },
              description:
                "Records from record1 that didn't match any record in record2",
            },
            unmatchedInRecord2: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BankRecord",
              },
              description:
                "Records from record2 that didn't match any record in record1",
            },
          },
        },
        MatchRequest: {
          type: "object",
          required: ["record1", "record2"],
          properties: {
            record1: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BankRecord",
              },
              description: "First set of records to match",
            },
            record2: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BankRecord",
              },
              description: "Second set of records to match against",
            },
          },
        },
        MatchResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            report: {
              $ref: "#/components/schemas/MatchingReport",
            },
            summary: {
              type: "object",
              properties: {
                totalRecord1: {
                  type: "number",
                  description: "Total number of records in record1",
                },
                totalRecord2: {
                  type: "number",
                  description: "Total number of records in record2",
                },
                matched: {
                  type: "number",
                  description: "Number of matched records",
                },
                unmatchedInRecord1: {
                  type: "number",
                  description: "Number of unmatched records in record1",
                },
                unmatchedInRecord2: {
                  type: "number",
                  description: "Number of unmatched records in record2",
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Invalid input",
            },
            message: {
              type: "string",
              example: "Both record1 and record2 must be arrays",
            },
          },
        },
      },
    },
  },
  apis: ["./server.ts"], // Path to the API files
};

let swaggerSpec;
try {
  swaggerSpec = swaggerJsdoc(swaggerOptions);
  // Swagger UI setup
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger documentation loaded successfully");
} catch (error) {
  console.error("Error setting up Swagger:", error);
  // Continue without Swagger if there's an error
}

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

/**
 * @swagger
 * /api/match:
 *   post:
 *     summary: Match records between two sets
 *     tags: [Matching]
 *     description: |
 *       Matches records from record1 with records from record2 using semantic similarity.
 *       Returns three scenarios:
 *       1. Matched records - records that found a match
 *       2. Unmatched in record1 - records from record1 that didn't match
 *       3. Unmatched in record2 - records from record2 that didn't match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchRequest'
 *           example:
 *             record1:
 *               - itemid: "ae628341-e022-4d18-9d7b-a46d140a55e5"
 *                 details: "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB - GTBank Plc Ref/Cheque No.: PSM00068676151167501249 Debits: 106,000.00"
 *                 amount: 106000
 *               - itemid: "de96a753-f582-4116-9691-450a571c6248"
 *                 details: "GABRIEL SAMUEL/App To Access Bank RCCG HOUSE OF OBEDEDOM PARISH II Ref/Cheque No.: 000003240604164527003146 Credits: 17,000.00"
 *                 amount: 17000
 *             record2:
 *               - itemid: "29e2a7c0-1028-4432-b51e-f585b60ad0ee"
 *                 details: "Payment received from GABRIEL SAMUEL Credits: 17,000.00"
 *                 amount: 17000
 *               - itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654"
 *                 details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 106,000.00"
 *                 amount: 106000
 *     responses:
 *       200:
 *         description: Successful matching operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchResponse'
 *             example:
 *               success: true
 *               report:
 *                 matched:
 *                   - record1Id: "ae628341-e022-4d18-9d7b-a46d140a55e5"
 *                     record2Id: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654"
 *                     score: 0.4469
 *                     record1:
 *                       itemid: "ae628341-e022-4d18-9d7b-a46d140a55e5"
 *                       details: "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB..."
 *                       amount: 106000
 *                     record2:
 *                       itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654"
 *                       details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 106,000.00"
 *                       amount: 106000
 *                 unmatchedInRecord1: []
 *                 unmatchedInRecord2: []
 *               summary:
 *                 totalRecord1: 2
 *                 totalRecord2: 2
 *                 matched: 2
 *                 unmatchedInRecord1: 0
 *                 unmatchedInRecord2: 0
 *       400:
 *         description: Bad request - Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid input"
 *               message: "Both record1 and record2 must be arrays"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 *               message: "An error occurred while processing the request"
 */
app.post("/api/match", async (req, res) => {
  try {
    const { record1, record2 } = req.body;

    // Validate input
    if (!Array.isArray(record1) || !Array.isArray(record2)) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Both record1 and record2 must be arrays",
      });
    }

    // Validate that all records have required fields
    const validateRecord = (
      record: any,
      index: number,
      arrayName: string
    ): string | null => {
      if (!record || typeof record !== "object") {
        return `${arrayName}[${index}] is not a valid object`;
      }
      if (typeof record.itemid !== "string") {
        return `${arrayName}[${index}].itemid must be a string`;
      }
      if (typeof record.details !== "string") {
        return `${arrayName}[${index}].details must be a string`;
      }
      if (typeof record.amount !== "number") {
        return `${arrayName}[${index}].amount must be a number`;
      }
      return null;
    };

    for (let i = 0; i < record1.length; i++) {
      const error = validateRecord(record1[i], i, "record1");
      if (error) {
        return res
          .status(400)
          .json({ error: "Validation error", message: error });
      }
    }

    for (let i = 0; i < record2.length; i++) {
      const error = validateRecord(record2[i], i, "record2");
      if (error) {
        return res
          .status(400)
          .json({ error: "Validation error", message: error });
      }
    }

    // Perform matching
    const report = await matchRecords(
      record1 as BankRecord[],
      record2 as BankRecord[]
    );

    // Return the report as JSON
    res.json({
      success: true,
      report: {
        matched: report.matched,
        unmatchedInRecord1: report.unmatchedInRecord1,
        unmatchedInRecord2: report.unmatchedInRecord2,
      },
      summary: {
        totalRecord1: record1.length,
        totalRecord2: record2.length,
        matched: report.matched.length,
        unmatchedInRecord1: report.unmatchedInRecord1.length,
        unmatchedInRecord2: report.unmatchedInRecord2.length,
      },
    });
  } catch (error) {
    console.error("Error processing match request:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Match endpoint: POST http://localhost:${PORT}/api/match`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Handle server errors
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;

  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
