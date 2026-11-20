import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env em vez de env(): o `prisma generate` roda no postinstall,
    // antes de existir um .env, e não precisa do banco.
    url: process.env.DATABASE_URL,
  },
});
