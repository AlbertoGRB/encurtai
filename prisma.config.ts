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
    // No Neon, DATABASE_URL passa por um pool de conexões, e as migrações
    // precisam da conexão direta, que a integração da Vercel cria como
    // DATABASE_URL_UNPOOLED. Sem ela, como no desenvolvimento, vale a DATABASE_URL.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
