import swaggerJsdoc from "swagger-jsdoc";
import { config } from "../config/index.js";

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Record Matching API",
      version: "1.0.0",
      description:
        "API for matching bank records using semantic similarity. Matching criteria includes exact amount match, date within ±5 days, and semantic similarity score >= 0.25. Returns three scenarios: matched records, unmatched records from record1, and unmatched records from record2.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: config.serverUrl,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        BankRecord1: {
          type: "object",
          required: ["itemid", "details", "amount", "date"],
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
            date: {
              type: "string",
              description: "Transaction date in YYYY-MM-DD format",
              example: "2024-06-08",
            },
          },
        },
        BankRecord2: {
          type: "object",
          required: ["itemid", "details", "amount", "date", "transactionType"],
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
            date: {
              type: "string",
              description: "Transaction date in YYYY-MM-DD format",
              example: "2025-01-15",
            },
            transactionType: {
              type: "string",
              description: "Transaction type: credit or debit",
              example: "debit",
              enum: ["credit", "debit"],
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
              $ref: "#/components/schemas/BankRecord1",
            },
            record2: {
              $ref: "#/components/schemas/BankRecord2",
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
                $ref: "#/components/schemas/BankRecord1",
              },
              description:
                "Records from record1 that didn't match any record in record2",
            },
            unmatchedInRecord2: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BankRecord2",
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
                $ref: "#/components/schemas/BankRecord1",
              },
              description: "First set of records to match (must include date)",
            },
            record2: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BankRecord2",
              },
              description:
                "Second set of records to match against (must include date and transactionType)",
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
            data: {
              type: "object",
              properties: {
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
            message: {
              type: "string",
              example: "Matching completed successfully",
            },
          },
        },
        ConvertResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                records: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/BankRecord2",
                  },
                  description:
                    "Converted BankRecord2 array (includes itemid, details, amount, date, and transactionType)",
                },
                count: {
                  type: "number",
                  description: "Number of converted records",
                },
              },
            },
            message: {
              type: "string",
              example:
                "Successfully converted unstructured data to BankRecord2 format",
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
            statusCode: {
              type: "number",
              example: 400,
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
