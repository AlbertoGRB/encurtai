import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  createLink,
  deleteLink,
  findActiveLink,
  listLinks,
  setLinkActive,
} from "@/lib/links";
import { createUser, resetDatabase } from "../helpers/database";

const URL_DESTINO = "https://example.com/promo";

beforeEach(async () => {
  await resetDatabase();
});

describe("criar link", () => {
  it("gera um apelido aleatório quando nenhum é escolhido", async () => {
    const user = await createUser();
    const link = await createLink({ userId: user.id, url: URL_DESTINO });

    expect(link?.slug).toMatch(/^[2-9a-km-np-z]{7}$/);
    expect(link?.active).toBe(true);
  });

  it("usa o apelido escolhido", async () => {
    const user = await createUser();
    const link = await createLink({
      userId: user.id,
      url: URL_DESTINO,
      slug: "promo-natal",
    });

    expect(link?.slug).toBe("promo-natal");
  });

  it("devolve null quando o apelido já está em uso, mesmo por outra pessoa", async () => {
    const ana = await createUser("Ana");
    const bruno = await createUser("Bruno");
    await createLink({ userId: ana.id, url: URL_DESTINO, slug: "promo" });

    const repetido = await createLink({
      userId: bruno.id,
      url: URL_DESTINO,
      slug: "promo",
    });

    expect(repetido).toBeNull();
  });

  it("não libera o apelido de um link excluído", async () => {
    const user = await createUser();
    const link = await createLink({
      userId: user.id,
      url: URL_DESTINO,
      slug: "promo",
    });
    await deleteLink(user.id, link!.id);

    const novo = await createLink({
      userId: user.id,
      url: "https://outro.com",
      slug: "promo",
    });

    expect(novo).toBeNull();
  });
});

describe("listar links", () => {
  it("mostra só os links do usuário, sem os excluídos, do mais novo para o mais antigo", async () => {
    const ana = await createUser("Ana");
    const bruno = await createUser("Bruno");
    const antigo = await createLink({ userId: ana.id, url: URL_DESTINO });
    await db.link.update({
      where: { id: antigo!.id },
      data: { createdAt: new Date("2026-01-01") },
    });
    const novo = await createLink({ userId: ana.id, url: URL_DESTINO });
    const excluido = await createLink({ userId: ana.id, url: URL_DESTINO });
    await deleteLink(ana.id, excluido!.id);
    await createLink({ userId: bruno.id, url: URL_DESTINO });

    const links = await listLinks(ana.id);

    expect(links.map((link) => link.id)).toEqual([novo!.id, antigo!.id]);
  });

  it("conta os cliques sem os de robôs", async () => {
    const user = await createUser();
    const link = await createLink({ userId: user.id, url: URL_DESTINO });
    await db.click.createMany({
      data: [
        { linkId: link!.id },
        { linkId: link!.id },
        { linkId: link!.id, isBot: true },
      ],
    });

    const [listado] = await listLinks(user.id);

    expect(listado._count.clicks).toBe(2);
  });
});

describe("desativar, reativar e excluir", () => {
  it("o link desativado deixa de ser encontrado e volta quando é reativado", async () => {
    const user = await createUser();
    const link = await createLink({
      userId: user.id,
      url: URL_DESTINO,
      slug: "promo",
    });

    expect(await setLinkActive(user.id, link!.id, false)).toBe("promo");
    expect(await findActiveLink("promo")).toBeNull();

    expect(await setLinkActive(user.id, link!.id, true)).toBe("promo");
    expect(await findActiveLink("promo")).toEqual({
      id: link!.id,
      url: URL_DESTINO,
    });
  });

  it("o link excluído não é encontrado e não pode ser reativado", async () => {
    const user = await createUser();
    const link = await createLink({
      userId: user.id,
      url: URL_DESTINO,
      slug: "promo",
    });

    expect(await deleteLink(user.id, link!.id)).toBe("promo");
    expect(await findActiveLink("promo")).toBeNull();
    expect(await setLinkActive(user.id, link!.id, true)).toBeNull();
  });

  it("não altera o link de outra pessoa", async () => {
    const ana = await createUser("Ana");
    const bruno = await createUser("Bruno");
    const link = await createLink({
      userId: ana.id,
      url: URL_DESTINO,
      slug: "promo",
    });

    expect(await setLinkActive(bruno.id, link!.id, false)).toBeNull();
    expect(await deleteLink(bruno.id, link!.id)).toBeNull();
    expect(await findActiveLink("promo")).not.toBeNull();
  });
});
