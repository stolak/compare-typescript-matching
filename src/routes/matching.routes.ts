import { Router } from "express";
import { matchRecordsController } from "../controllers/matching.controller.js";
import { validateMatchRequest } from "../middleware/validate.js";

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

export default router;
