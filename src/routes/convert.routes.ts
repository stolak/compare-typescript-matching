import { Router } from "express";
import { convertUnstructuredController } from "../controllers/convert.controller.js";
import { convertPdfController } from "../controllers/pdf.controller.js";
import { validateConvertRequest } from "../middleware/validateConvert.js";
import { upload } from "../middleware/upload.js";

const router = Router();

/**
 * @swagger
 * /api/convert:
 *   post:
 *     summary: Convert unstructured data to BankRecord format using OpenAI
 *     tags: [Conversion]
 *     description: |
 *       Receives an unstructured array of objects and uses OpenAI to convert them
 *       into the structured BankRecord format with itemid, details, and amount fields.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 type: array
 *                 description: Array of unstructured objects to convert
 *                 items:
 *                   type: object
 *                 example:
 *                   - Transaction ID: "TXN001"
 *                     Description: "Payment to John Doe"
 *                     Amount: "1,000.00"
 *                   - Ref: "REF002"
 *                     Narration: "Salary credit"
 *                     Value: "$500"
 *     responses:
 *       200:
 *         description: Successfully converted unstructured data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConvertResponse'
 *             example:
 *               success: true
 *               data:
 *                 records:
 *                   - itemid: "TXN001"
 *                     details: "Payment to John Doe"
 *                     amount: 1000
 *                   - itemid: "REF002"
 *                     details: "Salary credit"
 *                     amount: 500
 *                 count: 2
 *               message: "Successfully converted unstructured data to BankRecord format"
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or OpenAI API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/convert", validateConvertRequest, convertUnstructuredController);

/**
 * @swagger
 * /api/convert-pdf:
 *   post:
 *     summary: Convert PDF file by forwarding to external service
 *     tags: [Conversion]
 *     description: |
 *       Accepts a PDF file upload and forwards it to an external conversion service
 *       at localhost:5003/convert, then returns the response from that service.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to convert
 *     responses:
 *       200:
 *         description: Successfully forwarded PDF and received response from external service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Response from external conversion service
 *       400:
 *         description: Bad request - No file provided or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or external service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/convert-pdf", upload.single("file"), convertPdfController);

export default router;

