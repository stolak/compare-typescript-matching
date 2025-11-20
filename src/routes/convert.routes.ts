import { Router } from "express";
import { convertUnstructuredController } from "../controllers/convert.controller";
import { validateConvertRequest } from "../middleware/validateConvert";

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

export default router;

