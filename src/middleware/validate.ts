import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import type { BankRecord } from "../types/index.js";

export interface MatchRequest {
  record1: BankRecord[];
  record2: BankRecord[];
}

export function validateMatchRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { record1, record2 } = req.body;

  // Validate input
  if (!Array.isArray(record1) || !Array.isArray(record2)) {
    throw new ApiError(400, "Both record1 and record2 must be arrays");
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
      throw new ApiError(400, error);
    }
  }

  for (let i = 0; i < record2.length; i++) {
    const error = validateRecord(record2[i], i, "record2");
    if (error) {
      throw new ApiError(400, error);
    }
  }

  next();
}
