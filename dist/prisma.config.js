"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("@next/env");
const path_1 = require("path");
// Load environment variables
(0, env_1.loadEnvConfig)(process.cwd());
exports.default = {
    schema: (0, path_1.resolve)('./prisma/schema.prisma'),
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./dev.db',
        },
    },
};
//# sourceMappingURL=prisma.config.js.map