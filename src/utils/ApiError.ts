export class ApiError {
  public readonly success = false;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}
