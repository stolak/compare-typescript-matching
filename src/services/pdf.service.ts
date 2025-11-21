import log from "../utils/logger";

const EXTERNAL_CONVERT_URL = process.env.EXTERNAL_CONVERT_URL || "http://localhost:5003/convert";

/**
 * Forwards a PDF file to an external conversion endpoint
 * @param file - The uploaded PDF file
 * @returns The response from the external endpoint
 */
export async function forwardPdfToExternalService(
  file: Express.Multer.File
): Promise<unknown> {
  try {
    log.info(`Forwarding PDF file "${file.originalname}" to ${EXTERNAL_CONVERT_URL}`);

    // Create FormData to send the file
    const formData = new FormData();
    
    // Create a Blob from the buffer for Node.js
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(file.buffer);
    const blob = new Blob([uint8Array], { type: file.mimetype });
    formData.append("file", blob, file.originalname);

    // Forward the request to the external endpoint
    const response = await fetch(EXTERNAL_CONVERT_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `External service returned ${response.status}: ${errorText}`
      );
    }

    // Try to parse as JSON, fallback to text if not JSON
    const contentType = response.headers.get("content-type");
    let responseData: unknown;
    
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    log.info(`Successfully received response from external service`);
    return responseData;
  } catch (error) {
    log.error("Error forwarding PDF to external service:", error);
    throw new Error(
      `Failed to forward PDF to external service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

