export class HttpError extends Error {
  public status: number;
  public details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const createHttpError = {
  badRequest: (message = 'Bad Request', details?: unknown) => new HttpError(400, message, details),
  unauthorized: (message = 'Unauthorized', details?: unknown) => new HttpError(401, message, details),
  forbidden: (message = 'Forbidden', details?: unknown) => new HttpError(403, message, details),
  notFound: (message = 'Not Found', details?: unknown) => new HttpError(404, message, details),
  conflict: (message = 'Conflict', details?: unknown) => new HttpError(409, message, details),
  tooManyRequests: (message = 'Too Many Requests', details?: unknown) => new HttpError(429, message, details),
  internal: (message = 'Internal server error', details?: unknown) => new HttpError(500, message, details),
};


