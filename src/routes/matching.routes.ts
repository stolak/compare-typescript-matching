import { Router } from "express";
import { matchRecordsController } from "../controllers/matching.controller.js";
import { matchPdfController } from "../controllers/match-pdf.controller.js";
import { validateMatchRequest } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";

const router = Router();

/**
 * @swagger
 * /api/match:
 *   post:
 *     summary: Match records between two sets
 *     tags: [Matching]
 *     description: |
 *       Matches records from record1 with records from record2 using semantic similarity.
 *       Matching criteria:
 *       - Amount must match exactly
 *       - Dates must be within ±5 days of each other
 *       - Semantic similarity score must be >= 0.25
 *       Returns three scenarios:
 *       1. Matched records - records that found a match
 *       2. Unmatched in record1 - records from record1 that didn't match
 *       3. Unmatched in record2 - records from record2 that didn't match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchRequest'
 *           example:
 *             record1:
 *               - itemid: "ae628341-e022-4d18-9d7b-a46d140a55e5"
 *                 details: "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB - GTBank Plc Ref/Cheque No.: PSM00068676151167501249 Debits: 106,000.00"
 *                 amount: 106000
 *                 date: "2025-01-15"
 *               - itemid: "de96a753-f582-4116-9691-450a571c6248"
 *                 details: "GABRIEL SAMUEL/App To Access Bank RCCG HOUSE OF OBEDEDOM PARISH II Ref/Cheque No.: 000003240604164527003146 Credits: 17,000.00"
 *                 amount: 17000
 *                 date: "2025-01-20"
 *             record2:
 *               - itemid: "29e2a7c0-1028-4432-b51e-f585b60ad0ee"
 *                 details: "Payment received from GABRIEL SAMUEL Credits: 17,000.00"
 *                 amount: 17000
 *                 date: "2025-01-22"
 *                 transactionType: "credit"
 *               - itemid: "26cb0a06-6588-4c07-a8bb-79b6ae7f2654"
 *                 details: "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 106,000.00"
 *                 amount: 106000
 *                 date: "2025-01-16"
 *                 transactionType: "debit"
 *     responses:
 *       200:
 *         description: Successful matching operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchResponse'
 *       400:
 *         description: Bad request - Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/match", validateMatchRequest, matchRecordsController);

/**
 * @swagger
 * /api/match-pdf:
 *   post:
 *     summary: Match records with PDF conversion
 *     tags: [Matching]
 *     description: |
 *       Accepts BankRecord1 array and a PDF file. The PDF is forwarded to an external service,
 *       converted to BankRecord2 format using OpenAI, and then matched with record1.
 *       Matching criteria:
 *       - Amount must match exactly
 *       - Dates must be within ±5 days of each other
 *       - Semantic similarity score must be >= 0.25
 *       Returns three scenarios:
 *       1. Matched records - records that found a match
 *       2. Unmatched in record1 - records from record1 that didn't match
 *       3. Unmatched in record2 - records from record2 that didn't match
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [record1, file]
 *             properties:
 *               record1:
 *                 type: string
 *                 description: JSON string array of BankRecord1 objects (itemid, details, amount, date)
 *                 example: '[{"itemid":"ae628341-e022-4d18-9d7b-a46d140a55e5","details":"TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB","amount":106000,"date":"2025-01-15"},{"itemid":"de96a753-f582-4116-9691-450a571c6248","details":"GABRIEL SAMUEL/App To Access Bank RCCG HOUSE OF OBEDEDOM PARISH II","amount":17000,"date":"2025-01-20"}]'
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to convert and match
 *     responses:
 *       200:
 *         description: Successful matching operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchResponse'
 *             example:
 *               success: true
 *               data:
 *                 report:
 *                   matched:
 *                     - record1Id: "ae628341-e022-4d18-9d7b-a46d140a55e5"
 *                       record2Id: "29e2a7c0-1028-4432-b51e-f585b60ad0ee"
 *                       score: 0.85
 *                       record1:
 *                         itemid: "ae628341-e022-4d18-9d7b-a46d140a55e5"
 *                         details: "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB"
 *                         amount: 106000
 *                         date: "2025-01-15"
 *                       record2:
 *                         itemid: "29e2a7c0-1028-4432-b51e-f585b60ad0ee"
 *                         details: "Payment to AKINBOBOLA STEPHEN OLAWOLE"
 *                         amount: 106000
 *                         date: "2025-01-16"
 *                         transactionType: "debit"
 *                   unmatchedInRecord1: []
 *                   unmatchedInRecord2: []
 *                 summary:
 *                   totalRecord1: 2
 *                   totalRecord2: 2
 *                   matched: 1
 *                   unmatchedInRecord1: 1
 *                   unmatchedInRecord2: 1
 *               message: "Matching completed successfully"
 *       400:
 *         description: Bad request - Invalid input, missing file, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error, external service error, or OpenAI API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/match-pdf", upload.single("file"), matchPdfController);

export default router;
