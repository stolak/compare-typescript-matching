export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    // Only assign if value is not undefined to satisfy exactOptionalPropertyTypes
    if (data !== undefined) {
      this.data = data;
    }
    if (message !== undefined) {
      this.message = message;
    }
    if (error !== undefined) {
      this.error = error;
    }
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(message: string, error?: string): ApiResponse<null> {
    const response = new ApiResponse<null>(false);
    response.message = message;
    if (error !== undefined) {
      response.error = error;
    }
    return response;
  }
}

