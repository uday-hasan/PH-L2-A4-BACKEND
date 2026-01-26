export class ApiResponse {
  public readonly success = true;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: unknown;

  constructor(statusCode: number, message: string, data?: unknown) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
