import type { Request, Response, NextFunction } from "express";
import { matchRecords } from "../services/matching.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import type { BankRecord1, BankRecord2 } from "../types/index.js";

export async function matchRecordsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { record1, record2 } = req.body;

    const report = await matchRecords(
      record1 as BankRecord1[],
      record2 as BankRecord2[]
    );

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
