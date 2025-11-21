import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import log from "../utils/logger";

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle multer errors
  if (err.name === "MulterError") {
    const multerError = err as Error & { code?: string; field?: string };
    let statusCode = 400;
    let message = err.message;

    if (multerError.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 10MB";
    } else if (multerError.code === "LIMIT_FILE_COUNT") {
      message = "Too many files";
    } else if (multerError.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    }

    log.error(`Multer Error: ${message}`);
    res.status(statusCode).json({
      error: message,
      statusCode,
    });
    return;
  }

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

