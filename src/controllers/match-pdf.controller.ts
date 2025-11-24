import type { Request, Response, NextFunction } from "express";
import { matchRecords } from "../services/matching.service.js";
import { forwardPdfToExternalService } from "../services/pdf.service.js";
import { convertToBankRecords } from "../services/openai.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import type { BankRecord1, BankRecord2 } from "../types/index.js";
import log from "../utils/logger.js";

export async function matchPdfController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    const record1Json = req.body.record1;

    // Validate PDF file
    if (!file) {
      throw new ApiError(400, "No PDF file provided");
    }

    if (file.mimetype !== "application/pdf") {
      throw new ApiError(400, "Only PDF files are allowed");
    }

    // Validate record1
    if (!record1Json) {
      throw new ApiError(400, "record1 is required");
    }

    let record1: BankRecord1[];
    try {
      // Parse record1 from JSON string
      record1 = typeof record1Json === "string" 
        ? JSON.parse(record1Json) 
        : record1Json;
    } catch (error) {
      throw new ApiError(400, "record1 must be a valid JSON array");
    }

    if (!Array.isArray(record1)) {
      throw new ApiError(400, "record1 must be an array");
    }

    if (record1.length === 0) {
      throw new ApiError(400, "record1 array cannot be empty");
    }

    // Validate record1 structure
    for (let i = 0; i < record1.length; i++) {
      const record = record1[i];
      if (!record || typeof record !== "object") {
        throw new ApiError(400, `record1[${i}] is not a valid object`);
      }
      if (typeof record.itemid !== "string") {
        throw new ApiError(400, `record1[${i}].itemid must be a string`);
      }
      if (typeof record.details !== "string") {
        throw new ApiError(400, `record1[${i}].details must be a string`);
      }
      if (typeof record.amount !== "number") {
        throw new ApiError(400, `record1[${i}].amount must be a number`);
      }
      if (typeof record.date !== "string") {
        throw new ApiError(400, `record1[${i}].date must be a string (YYYY-MM-DD format)`);
      }
    }

    log.info(
      `Processing match request with ${record1.length} records and PDF: ${file.originalname}`
    );

    // Step 1: Forward PDF to external service
    log.info("Forwarding PDF to external service...");
    const externalResponse = await forwardPdfToExternalService(file);

    // Step 2: Extract unstructured data from external response
    // The external service might return data in different formats
    let unstructuredData: unknown[] = [];
    
    if (Array.isArray(externalResponse)) {
      unstructuredData = externalResponse;
    } else if (
      typeof externalResponse === "object" &&
      externalResponse !== null
    ) {
      // Try common response formats
      if ("data" in externalResponse && Array.isArray(externalResponse.data)) {
        unstructuredData = externalResponse.data as unknown[];
      } else if (
        "records" in externalResponse &&
        Array.isArray(externalResponse.records)
      ) {
        unstructuredData = externalResponse.records as unknown[];
      } else {
        // If it's an object but not in expected format, wrap it in an array
        unstructuredData = [externalResponse];
      }
    } else {
      throw new ApiError(
        500,
        "External service returned invalid data format"
      );
    }

    if (unstructuredData.length === 0) {
      throw new ApiError(500, "External service returned empty data");
    }

    log.info(
      `Received ${unstructuredData.length} records from external service`
    );

    // Step 3: Convert unstructured data to BankRecord2 format
    log.info("Converting unstructured data to BankRecord2 format...");
    const record2: BankRecord2[] = await convertToBankRecords(unstructuredData);

    log.info(`Converted to ${record2.length} BankRecord2 records`);

    // Step 4: Match records
    log.info("Matching records...");
    const report = await matchRecords(record1, record2);

    // Step 5: Return response in the same format as matchRecordsController
    const response = ApiResponse.success(
      {
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
      },
      "Matching completed successfully"
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
}

