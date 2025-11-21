import type { Request, Response, NextFunction } from "express";
import { forwardPdfToExternalService } from "../services/pdf.service";
import { ApiResponse } from "../utils/ApiResponse";
import log from "../utils/logger";

export async function convertPdfController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res
        .status(400)
        .json(ApiResponse.error("Invalid input", "No PDF file provided"));
      return;
    }

    // Additional check if the file is a PDF (multer should have filtered, but double-check)
    if (file.mimetype !== "application/pdf") {
      res
        .status(400)
        .json(
          ApiResponse.error(
            "Invalid file type",
            "Only PDF files are allowed"
          )
        );
      return;
    }

    log.info(`Received PDF file: ${file.originalname} (${file.size} bytes)`);

    // Forward to external service
    const externalResponse = await forwardPdfToExternalService(file);

    // Return the response from the external service as-is
    res.json(externalResponse);
  } catch (error) {
    next(error);
  }
}

