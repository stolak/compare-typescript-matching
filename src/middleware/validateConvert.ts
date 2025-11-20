import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function validateConvertRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { data } = req.body;

  if (!data) {
    throw new ApiError(400, "Missing required field: data");
  }

  if (!Array.isArray(data)) {
    throw new ApiError(400, "Data must be an array");
  }

  if (data.length === 0) {
    throw new ApiError(400, "Data array cannot be empty");
  }

  // Validate that each item is an object
  for (let i = 0; i < data.length; i++) {
    if (!data[i] || typeof data[i] !== "object" || Array.isArray(data[i])) {
      throw new ApiError(
        400,
        `Data[${i}] must be an object`
      );
    }
  }

  next();
}

