import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  generate: {
    client: {
      outputDir: '../node_modules/.prisma/client',
    },
  },
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.DATABASE_URL,
  },
});
