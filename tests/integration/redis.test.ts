import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findLinkForRedirect, forgetLink } from "@/lib/link-cache";
import { createLink, setLinkActive } from "@/lib/links";
import { createLinkRateLimit, LINKS_PER_HOUR } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";
import { createUser, resetDatabase } from "../helpers/database";

// Apelido diferente a cada execução, para não esbarrar em chaves de outra rodada.
const slug = `teste-${randomUUID().slice(0, 8)}`;

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await redis.del(`link:${slug}`);
});

describe("cache do redirecionamento no Redis", () => {
  it("guarda o link e para de redirecionar assim que ele é desativado", async () => {
    const user = await createUser();
    const link = await createLink({
      userId: user.id,
      url: "https://example.com",
      slug,
    });

    expect(await findLinkForRedirect(slug)).toEqual({
      id: link!.id,
      url: "https://example.com",
    });
    expect(await redis.get(`link:${slug}`)).toEqual({
      id: link!.id,
      url: "https://example.com",
    });

    await setLinkActive(user.id, link!.id, false);
    await forgetLink(slug);

    expect(await findLinkForRedirect(slug)).toBeNull();
  });

  it("guarda que o apelido não existe por 1 minuto", async () => {
    expect(await findLinkForRedirect(slug)).toBeNull();

    expect(await redis.get(`link:${slug}`)).toEqual({ missing: true });
    expect(await redis.ttl(`link:${slug}`)).toBeLessThanOrEqual(60);
  });
});

describe("limite de links por hora", () => {
  it(`deixa criar ${LINKS_PER_HOUR} e barra o seguinte`, async () => {
    const userId = `teste-${randomUUID()}`;

    for (let i = 0; i < LINKS_PER_HOUR; i++) {
      expect((await createLinkRateLimit.limit(userId)).success).toBe(true);
    }
    const blocked = await createLinkRateLimit.limit(userId);

    expect(blocked.success).toBe(false);
    expect(blocked.reset).toBeGreaterThan(Date.now());
  });
});
