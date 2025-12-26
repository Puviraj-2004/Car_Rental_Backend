"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnerOrAdmin = exports.isAdmin = exports.isAuthenticated = void 0;
const graphql_1 = require("graphql");
// 1. Check if User is Logged In
const isAuthenticated = (context) => {
    if (!context.userId) {
        throw new graphql_1.GraphQLError('Authentication required. Please login.', {
            extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
    }
};
exports.isAuthenticated = isAuthenticated;
// 2. Check if User is Admin
const isAdmin = (context) => {
    (0, exports.isAuthenticated)(context); // First check login
    if (context.role !== 'ADMIN') {
        throw new graphql_1.GraphQLError('Access denied. Admin rights required.', {
            extensions: { code: 'FORBIDDEN', http: { status: 403 } },
        });
    }
};
exports.isAdmin = isAdmin;
// 3. Check if User owns the data OR is Admin
const isOwnerOrAdmin = (context, ownerId) => {
    (0, exports.isAuthenticated)(context);
    if (context.role !== 'ADMIN' && context.userId !== ownerId) {
        throw new graphql_1.GraphQLError('Access denied. You do not own this resource.', {
            extensions: { code: 'FORBIDDEN', http: { status: 403 } },
        });
    }
};
exports.isOwnerOrAdmin = isOwnerOrAdmin;
//# sourceMappingURL=authguard.js.map