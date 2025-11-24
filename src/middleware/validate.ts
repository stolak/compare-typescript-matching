import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import type { BankRecord1, BankRecord2 } from "../types/index.js";

export interface MatchRequest {
  record1: BankRecord1[];
  record2: BankRecord2[];
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
  const validateRecord1 = (
    record: any,
    index: number
  ): string | null => {
    if (!record || typeof record !== "object") {
      return `record1[${index}] is not a valid object`;
    }
    if (typeof record.itemid !== "string") {
      return `record1[${index}].itemid must be a string`;
    }
    if (typeof record.details !== "string") {
      return `record1[${index}].details must be a string`;
    }
    if (typeof record.amount !== "number") {
      return `record1[${index}].amount must be a number`;
    }
    if (typeof record.date !== "string") {
      return `record1[${index}].date must be a string (YYYY-MM-DD format)`;
    }
    return null;
  };

  const validateRecord2 = (
    record: any,
    index: number
  ): string | null => {
    if (!record || typeof record !== "object") {
      return `record2[${index}] is not a valid object`;
    }
    if (typeof record.itemid !== "string") {
      return `record2[${index}].itemid must be a string`;
    }
    if (typeof record.details !== "string") {
      return `record2[${index}].details must be a string`;
    }
    if (typeof record.amount !== "number") {
      return `record2[${index}].amount must be a number`;
    }
    if (typeof record.date !== "string") {
      return `record2[${index}].date must be a string (YYYY-MM-DD format)`;
    }
    if (typeof record.transactionType !== "string") {
      return `record2[${index}].transactionType must be a string`;
    }
    if (!["credit", "debit"].includes(record.transactionType)) {
      return `record2[${index}].transactionType must be either "credit" or "debit"`;
    }
    return null;
  };

  for (let i = 0; i < record1.length; i++) {
    const error = validateRecord1(record1[i], i);
    if (error) {
      throw new ApiError(400, error);
    }
  }

  for (let i = 0; i < record2.length; i++) {
    const error = validateRecord2(record2[i], i);
    if (error) {
      throw new ApiError(400, error);
    }
  }

  next();
}
