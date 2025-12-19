import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  generate: {
    client: {
      outputDir: '../node_modules/.prisma/client',
    },
  },
  database: {
    shadowDatabaseUrl: process.env.DATABASE_URL,
  },
});
