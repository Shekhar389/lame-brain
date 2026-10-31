import type { ApiErrorDetail } from '@repo/shared';

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly details?: ApiErrorDetail[];

  constructor(message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, identifier?: string) {
    const msg = identifier ? `${resource} with identifier "${identifier}" was not found.` : `${resource} was not found.`;
    super(msg);
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(message = 'Validation failed', details?: ApiErrorDetail[]) {
    super(message, details);
  }
}

export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;

  constructor(service: string, message: string, details?: ApiErrorDetail[]) {
    super(`${service}: ${message}`, details);
  }
}
