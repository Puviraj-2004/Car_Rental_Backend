"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ErrorCode = void 0;
const graphql_1 = require("graphql");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["BAD_USER_INPUT"] = "BAD_USER_INPUT";
    ErrorCode["UNAUTHENTICATED"] = "UNAUTHENTICATED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["OCR_FAILED"] = "OCR_FAILED";
    ErrorCode["UPLOAD_ERROR"] = "UPLOAD_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class AppError extends graphql_1.GraphQLError {
    constructor(message, code) {
        super(message, {
            extensions: {
                code,
                timestamp: new Date().toISOString(),
            },
        });
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map