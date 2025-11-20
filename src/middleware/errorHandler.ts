import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import log from "../utils/logger";

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ApiError) {
    log.error(`API Error: ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  } else {
    log.error(`Unexpected Error: ${err.message}`, err.stack);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

