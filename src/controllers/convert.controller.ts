import type { Request, Response, NextFunction } from "express";
import { convertToBankRecords } from "../services/openai.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export async function convertUnstructuredController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      res
        .status(400)
        .json(ApiResponse.error("Invalid input", "Data must be an array"));
      return;
    }

    if (data.length === 0) {
      res
        .status(400)
        .json(ApiResponse.error("Invalid input", "Data array cannot be empty"));
      return;
    }

    const bankRecords = await convertToBankRecords(data);

    const response = ApiResponse.success(
      {
        records: bankRecords,
        count: bankRecords.length,
      },
      "Successfully converted unstructured data to BankRecord format"
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
}
