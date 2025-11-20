import OpenAI from "openai";
import type { BankRecord } from "../types/index";
import log from "../utils/logger";
import { config } from "../config/index";

if (!config.openai.apiKey) {
  log.warn("OPENAI_API_KEY is not set. Convert endpoint will not work.");
}

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!config.openai.apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Please set it in your environment variables."
      );
    }
    openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  return openai;
}

const SYSTEM_PROMPT = `You are a data transformation assistant. Your task is to convert unstructured bank transaction data into a structured format.

The output must be a JSON array of objects with the following structure:
{
  "itemid": "string (unique identifier, generate UUID if not provided)",
  "details": "string (transaction narration/details)",
  "amount": "number (transaction amount as a number, not string)"
}

Rules:
1. Extract or generate a unique itemid for each record (use UUID format if not present)
2. Extract the transaction details/narration into the "details" field
3. Extract the amount as a number (remove currency symbols, commas, convert to number)
4. If any field is missing, make reasonable inferences or use placeholder values
5. Return ONLY a valid JSON array directly, no wrapper object, no additional text or markdown
6. Ensure all amounts are numbers, not strings
7. The response must be a JSON array starting with [ and ending with ]

Example input:
[
  {"Transaction ID": "TXN001", "Description": "Payment to John", "Amount": "1,000.00"},
  {"Ref": "REF002", "Narration": "Salary credit", "Value": "$500"}
]

Example output:
[
  {"itemid": "TXN001", "details": "Payment to John", "amount": 1000},
  {"itemid": "REF002", "details": "Salary credit", "amount": 500}
]`;

export async function convertToBankRecords(
  unstructuredData: unknown[]
): Promise<BankRecord[]> {
  if (!config.openai.apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please set it in your environment variables."
    );
  }

  try {
    log.info(
      `Converting ${unstructuredData.length} unstructured records to BankRecord format`
    );

    const userPrompt = `Convert the following unstructured data to the required BankRecord format:\n\n${JSON.stringify(
      unstructuredData,
      null,
      2
    )}`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let parsedResponse: { records?: BankRecord[]; [key: string]: unknown };
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      // Sometimes OpenAI returns JSON wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        // Try to extract JSON array directly
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          return JSON.parse(arrayMatch[0]) as BankRecord[];
        }
        throw parseError;
      }
    }

    // Handle different response formats
    let records: BankRecord[];
    if (Array.isArray(parsedResponse)) {
      records = parsedResponse as BankRecord[];
    } else if (Array.isArray(parsedResponse.records)) {
      records = parsedResponse.records;
    } else if (Array.isArray(parsedResponse.data)) {
      records = parsedResponse.data as BankRecord[];
    } else {
      throw new Error("Unexpected response format from OpenAI");
    }

    // Validate and clean the records
    const validatedRecords = records.map((record, index) => {
      if (!record.itemid) {
        record.itemid = `generated-${Date.now()}-${index}`;
      }
      const amountValue = record.amount as string | number;
      if (typeof amountValue === "string") {
        record.amount = parseFloat(amountValue.replace(/[^0-9.-]/g, "")) || 0;
      }
      if (typeof record.details !== "string") {
        record.details = String(record.details || "");
      }
      return record;
    });

    log.info(`Successfully converted ${validatedRecords.length} records`);
    return validatedRecords;
  } catch (error) {
    log.error("Error converting unstructured data:", error);
    throw new Error(
      `Failed to convert unstructured data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
