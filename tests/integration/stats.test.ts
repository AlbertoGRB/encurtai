import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createLink, deleteLink } from "@/lib/links";
import { clicksPerDay, findOwnLink, getLinkStats } from "@/lib/stats";
import { createUser, resetDatabase } from "./helpers";

// "2026-11-20" no horário de Brasília, que é UTC-3 o ano todo (sem horário de verão desde 2019).
function dayInBrazil(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function createLinkWithOwner() {
  const user = await createUser();
  const link = await createLink({
    userId: user.id,
    url: "https://example.com",
  });
  return { user, link: link! };
}

beforeEach(async () => {
  await resetDatabase();
});

describe("cliques por dia", () => {
  it("traz os 30 dias, terminando hoje, com zero nos dias sem clique", async () => {
    const { link } = await createLinkWithOwner();

    const perDay = await clicksPerDay(link.id);

    expect(perDay).toHaveLength(30);
    expect(perDay.at(-1)?.day).toBe(dayInBrazil(new Date()));
    expect(perDay.every((day) => day.clicks === 0)).toBe(true);
  });

  it("conta cada clique no seu dia, sem robôs e sem cliques de mais de 30 dias", async () => {
    const { link } = await createLinkWithOwner();
    await db.click.createMany({
      data: [
        { linkId: link.id, createdAt: daysAgo(0) },
        { linkId: link.id, createdAt: daysAgo(0) },
        { linkId: link.id, createdAt: daysAgo(3) },
        { linkId: link.id, createdAt: daysAgo(3), isBot: true },
        { linkId: link.id, createdAt: daysAgo(45) },
      ],
    });

    const perDay = await clicksPerDay(link.id);
    const byDay = Object.fromEntries(perDay.map((d) => [d.day, d.clicks]));

    expect(byDay[dayInBrazil(daysAgo(0))]).toBe(2);
    expect(byDay[dayInBrazil(daysAgo(3))]).toBe(1);
    expect(perDay.reduce((sum, d) => sum + d.clicks, 0)).toBe(3);
  });

  it("usa o dia de Brasília: 23h30 de ontem aqui ainda é ontem", async () => {
    const { link } = await createLinkWithOwner();
    const [year, month, day] = dayInBrazil(new Date()).split("-").map(Number);
    // 23h30 de ontem em Brasília = 02h30 de hoje em UTC
    const lateYesterday = new Date(Date.UTC(year, month - 1, day, 2, 30));
    await db.click.create({
      data: { linkId: link.id, createdAt: lateYesterday },
    });

    const perDay = await clicksPerDay(link.id);

    expect(perDay.at(-2)?.clicks).toBe(1);
    expect(perDay.at(-1)?.clicks).toBe(0);
  });
});

describe("resumo do painel", () => {
  it("lista os valores mais clicados, sem robôs, com o vazio como null", async () => {
    const { link } = await createLinkWithOwner();
    await db.click.createMany({
      data: [
        { linkId: link.id, referrerHost: "instagram.com", device: "mobile" },
        { linkId: link.id, referrerHost: "instagram.com", device: "mobile" },
        { linkId: link.id, referrerHost: null, device: "desktop" },
        { linkId: link.id, referrerHost: "t.co", device: "mobile" },
        { linkId: link.id, referrerHost: "google.com", isBot: true },
      ],
    });

    const stats = await getLinkStats(link.id);

    expect(stats.total).toBe(4);
    expect(stats.referrers).toEqual([
      { label: "instagram.com", clicks: 2 },
      { label: "t.co", clicks: 1 },
      { label: null, clicks: 1 },
    ]);
    expect(stats.devices).toEqual([
      { label: "mobile", clicks: 3 },
      { label: "desktop", clicks: 1 },
    ]);
  });

  it("mostra no máximo 5 valores", async () => {
    const { link } = await createLinkWithOwner();
    await db.click.createMany({
      data: ["BR", "PT", "US", "AR", "MX", "CL"].map((country) => ({
        linkId: link.id,
        country,
      })),
    });

    const stats = await getLinkStats(link.id);

    expect(stats.countries).toHaveLength(5);
  });
});

describe("dono do link", () => {
  it("só o dono encontra o link, e o excluído não aparece", async () => {
    const { user, link } = await createLinkWithOwner();
    const other = await createUser("Bruno");

    expect(await findOwnLink(user.id, link.id)).not.toBeNull();
    expect(await findOwnLink(other.id, link.id)).toBeNull();

    await deleteLink(user.id, link.id);
    expect(await findOwnLink(user.id, link.id)).toBeNull();
  });
});
