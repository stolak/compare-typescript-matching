import OpenAI from "openai";
import type { BankRecord1, BankRecord2 } from "../types/index.js";
import log from "../utils/logger.js";
import { config } from "../config/index.js";

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
  "date": "string (transaction date in YYYY-MM-DD format)",
  "amount": "number (transaction amount as a number, not string)"
  "transactionType": "string (transaction type: credit or debit)"
}

Rules:
1. Extract or generate a unique itemid for each record (use UUID format if not present)
2. Extract the transaction details/narration into the "details" field
3. Extract the amount as a number (remove currency symbols, commas, convert to number)
4. Extract the transaction type as a string: "credit" or "debit"
5. Extract the transaction date as a string in YYYY-MM-DD format
4. If any field is missing, make reasonable inferences or use placeholder values
5. Return ONLY a valid JSON array directly, no wrapper object, no additional text or markdown
6. Ensure all amounts are numbers, not strings
7. where debit is mentioned and the value is greater than 0, that should be the amount
8. where credit is mentioned and the value is greater than 0, that should be the amount
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

const MAX_RECORDS_PER_CHUNK = 20;

/**
 * Splits an array into chunks of specified size
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Processes a single chunk of unstructured data through OpenAI
 */
async function processChunk(
  chunk: unknown[],
  chunkIndex: number,
  totalChunks: number
): Promise<BankRecord2[]> {
  const userPrompt = `Convert the following unstructured data to the required BankRecord format:\n\n${JSON.stringify(
    chunk,
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
    throw new Error(
      `No response from OpenAI for chunk ${chunkIndex + 1}/${totalChunks}`
    );
  }

  // Parse the JSON response
  let parsedResponse: { records?: BankRecord2[]; [key: string]: unknown };
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
        return JSON.parse(arrayMatch[0]) as BankRecord2[];
      }
      throw new Error(
        `Failed to parse OpenAI response for chunk ${
          chunkIndex + 1
        }/${totalChunks}: ${
          parseError instanceof Error ? parseError.message : "Unknown error"
        }`
      );
    }
  }

  // Handle different response formats
  let records: BankRecord2[];
  if (Array.isArray(parsedResponse)) {
    records = parsedResponse as BankRecord2[];
  } else if (Array.isArray(parsedResponse.records)) {
    records = parsedResponse.records;
  } else if (Array.isArray(parsedResponse.data)) {
    records = parsedResponse.data as BankRecord2[];
  } else {
    throw new Error(
      `Unexpected response format from OpenAI for chunk ${
        chunkIndex + 1
      }/${totalChunks}`
    );
  }

  return records;
}

/**
 * Validates and cleans bank records
 */
function validateAndCleanRecords(records: BankRecord2[]): BankRecord2[] {
  return records.map((record, index) => {
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
}

export async function convertToBankRecords(
  unstructuredData: unknown[]
): Promise<BankRecord2[]> {
  if (!config.openai.apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please set it in your environment variables."
    );
  }

  try {
    log.info(
      `Converting ${unstructuredData.length} unstructured records to BankRecord format`
    );

    // Split data into chunks of maximum 40 records
    const chunks = chunkArray(unstructuredData, MAX_RECORDS_PER_CHUNK);
    const totalChunks = chunks.length;

    if (totalChunks > 1) {
      log.info(
        `Splitting ${unstructuredData.length} records into ${totalChunks} chunks of max ${MAX_RECORDS_PER_CHUNK} records each`
      );
    }

    // Start processing all chunks in parallel
    const chunkPromises = chunks.map((chunk, index) => {
      if (!chunk) {
        return Promise.resolve([] as BankRecord2[]);
      }
      log.info(
        `Starting chunk ${index + 1}/${totalChunks} (${chunk.length} records)`
      );
      return processChunk(chunk, index, totalChunks);
    });

    // Await all chunks to complete in parallel
    const results = await Promise.allSettled(chunkPromises);

    // Process results and merge
    const allRecords: BankRecord2[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const chunkRecords = result.value;
        allRecords.push(...chunkRecords);
        log.info(
          `Successfully processed chunk ${index + 1}/${totalChunks}, got ${
            chunkRecords.length
          } records`
        );
      } else {
        const errorMessage = `Failed to process chunk ${
          index + 1
        }/${totalChunks}: ${
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason)
        }`;
        log.error(errorMessage);
        errors.push(errorMessage);
      }
    });

    // If all chunks failed, throw an error
    if (allRecords.length === 0 && errors.length > 0) {
      throw new Error(`All chunks failed to process:\n${errors.join("\n")}`);
    }

    // If some chunks failed, log a warning but return what we have
    if (errors.length > 0) {
      log.warn(
        `Processed ${allRecords.length} records with ${errors.length} chunk failures`
      );
    }

    // Validate and clean all records
    const validatedRecords = validateAndCleanRecords(allRecords);

    log.info(
      `Successfully converted ${validatedRecords.length} out of ${unstructuredData.length} records`
    );
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
