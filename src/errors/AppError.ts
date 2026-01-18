import { GraphQLError } from 'graphql';

export enum ErrorCode {
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  OCR_FAILED = 'OCR_FAILED',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export class AppError extends GraphQLError {
  constructor(message: string, code: ErrorCode) {
    super(message, {
      extensions: {
        code,
        timestamp: new Date().toISOString(),
      },
    });
    Object.setPrototypeOf(this, AppError.prototype);
  }
}