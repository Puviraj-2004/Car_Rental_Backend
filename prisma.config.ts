import { loadEnvConfig } from '@next/env';
import { resolve } from 'path';

// Load environment variables
loadEnvConfig(process.cwd());

export default {
  schema: resolve('./prisma/schema.prisma'),
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
};
