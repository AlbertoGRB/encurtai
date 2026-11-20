import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { db } from "@/lib/db";
import { createUser, resetDatabase } from "../helpers/database";

// O login do GitHub não dá para automatizar. O teste cria o usuário e a sessão direto no banco,
// do mesmo jeito que o Auth.js faz depois do login, e entrega o cookie para o navegador.
export default async function globalSetup() {
  await resetDatabase();

  const user = await createUser("Ana");
  const sessionToken = randomUUID();
  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await mkdir("tests/e2e/.auth", { recursive: true });
  await writeFile(
    "tests/e2e/.auth/user.json",
    JSON.stringify({
      cookies: [
        {
          name: "authjs.session-token",
          value: sessionToken,
          domain: "localhost",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    }),
  );

  await db.$disconnect();
}
