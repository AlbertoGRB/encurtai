import { beforeEach, describe, expect, it, vi } from "vitest";

// Redis e banco falsos: aqui só interessa a regra do cache.
const { fakeRedis, findActiveLink, store } = vi.hoisted(() => {
  const store = new Map<string, unknown>();
  return {
    store,
    findActiveLink: vi.fn(),
    fakeRedis: {
      get: vi.fn(async (key: string) => store.get(key) ?? null),
      set: vi.fn(async (key: string, value: unknown) => {
        store.set(key, value);
        return "OK";
      }),
      del: vi.fn(async (key: string) => {
        store.delete(key);
        return 1;
      }),
    },
  };
});

vi.mock("@/lib/redis", () => ({ redis: fakeRedis }));
vi.mock("@/lib/links", () => ({ findActiveLink }));

import { findLinkForRedirect, forgetLink } from "@/lib/link-cache";

const LINK = { id: "link-1", url: "https://example.com" };

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe("cache do redirecionamento", () => {
  it("busca no banco e guarda o link por 24 horas", async () => {
    findActiveLink.mockResolvedValue(LINK);

    expect(await findLinkForRedirect("promo")).toEqual(LINK);
    expect(fakeRedis.set).toHaveBeenCalledWith("link:promo", LINK, {
      ex: 86400,
    });
  });

  it("na segunda visita usa o cache, sem ir ao banco", async () => {
    findActiveLink.mockResolvedValue(LINK);

    await findLinkForRedirect("promo");
    expect(await findLinkForRedirect("promo")).toEqual(LINK);
    expect(findActiveLink).toHaveBeenCalledTimes(1);
  });

  it("guarda o apelido inexistente por 1 minuto", async () => {
    findActiveLink.mockResolvedValue(null);

    expect(await findLinkForRedirect("nada")).toBeNull();
    expect(await findLinkForRedirect("nada")).toBeNull();
    expect(fakeRedis.set).toHaveBeenCalledWith(
      "link:nada",
      { missing: true },
      { ex: 60 },
    );
    expect(findActiveLink).toHaveBeenCalledTimes(1);
  });

  it("se o Redis falhar, redireciona pelo banco", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fakeRedis.get.mockRejectedValueOnce(new Error("fora do ar"));
    fakeRedis.set.mockRejectedValueOnce(new Error("fora do ar"));
    findActiveLink.mockResolvedValue(LINK);

    expect(await findLinkForRedirect("promo")).toEqual(LINK);
  });

  it("esquece o link quando ele muda", async () => {
    findActiveLink.mockResolvedValue(LINK);
    await findLinkForRedirect("promo");

    await forgetLink("promo");

    expect(store.has("link:promo")).toBe(false);
  });
});
