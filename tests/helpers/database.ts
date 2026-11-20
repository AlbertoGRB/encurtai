import { db } from "@/lib/db";

// Os testes de integração e ponta a ponta apagam as tabelas.
// Só rodam contra um banco na própria máquina (ou no serviço do CI).
const databaseHost = new URL(process.env.DATABASE_URL ?? "postgresql://-")
  .hostname;
if (databaseHost !== "localhost" && databaseHost !== "127.0.0.1") {
  throw new Error(
    "Os testes apagam dados e só rodam com DATABASE_URL apontando para localhost.",
  );
}

export async function resetDatabase() {
  await db.click.deleteMany();
  await db.link.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();
}

export function createUser(name = "Ana") {
  return db.user.create({ data: { name } });
}
