import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppUrl, shortUrlFor } from "@/lib/app-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("endereço público do app", () => {
  it("usa o APP_URL quando ele existe", () => {
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "encurtai.vercel.app");

    expect(getAppUrl().origin).toBe("http://localhost:3000");
  });

  it("sem APP_URL, usa o domínio de produção da Vercel com https", () => {
    vi.stubEnv("APP_URL", undefined);
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "encurtai.vercel.app");

    expect(getAppUrl().origin).toBe("https://encurtai.vercel.app");
  });

  it("avisa quando não tem nenhum dos dois", () => {
    vi.stubEnv("APP_URL", undefined);
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", undefined);

    expect(() => getAppUrl()).toThrow("Defina APP_URL");
  });

  it("monta o link curto com o apelido", () => {
    vi.stubEnv("APP_URL", "https://encurtai.vercel.app");

    expect(shortUrlFor("promo-natal")).toBe(
      "https://encurtai.vercel.app/promo-natal",
    );
  });
});
