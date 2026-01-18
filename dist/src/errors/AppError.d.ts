import { GraphQLError } from 'graphql';
export declare enum ErrorCode {
    BAD_USER_INPUT = "BAD_USER_INPUT",
    UNAUTHENTICATED = "UNAUTHENTICATED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    ALREADY_EXISTS = "ALREADY_EXISTS",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    OCR_FAILED = "OCR_FAILED",
    UPLOAD_ERROR = "UPLOAD_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
export declare class AppError extends GraphQLError {
    constructor(message: string, code: ErrorCode);
}
//# sourceMappingURL=AppError.d.ts.map