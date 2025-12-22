"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.isAdmin = exports.checkRole = void 0;
const checkRole = (requiredRole) => {
    return (context) => {
        if (!context.userId) {
            throw new Error('Authentication required');
        }
        if (context.role !== requiredRole && context.role !== 'ADMIN') {
            throw new Error(`Access denied. Required role: ${requiredRole}`);
        }
        return true;
    };
};
exports.checkRole = checkRole;
const isAdmin = (context) => {
    if (!context.userId) {
        throw new Error('Authentication required');
    }
    if (context.role !== 'ADMIN') {
        throw new Error('Admin access required');
    }
    return true;
};
exports.isAdmin = isAdmin;
const isAuthenticated = (context) => {
    if (!context.userId) {
        throw new Error('Authentication required');
    }
    return true;
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=roleMiddleware.js.map