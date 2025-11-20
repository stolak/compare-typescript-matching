import type { Request, Response, NextFunction } from "express";
import { matchRecords } from "../services/matching.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import type { BankRecord } from "../types/index";

export async function matchRecordsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { record1, record2 } = req.body;

    const report = await matchRecords(
      record1 as BankRecord[],
      record2 as BankRecord[]
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
