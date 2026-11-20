import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/callback-url";

describe("endereço de volta depois do login", () => {
  it("mantém um caminho do próprio app, com busca e âncora", () => {
    expect(safeCallbackUrl("/dashboard/links/abc?periodo=7d#mapa")).toBe(
      "/dashboard/links/abc?periodo=7d#mapa",
    );
  });

  it("usa o painel quando não vem nada", () => {
    expect(safeCallbackUrl(undefined)).toBe("/dashboard");
    expect(safeCallbackUrl("")).toBe("/dashboard");
  });

  it("usa o painel quando vem mais de um valor", () => {
    expect(safeCallbackUrl(["/dashboard", "https://golpe.com"])).toBe(
      "/dashboard",
    );
  });

  it.each([
    "https://golpe.com",
    "//golpe.com",
    "/\\golpe.com",
    "\\\\golpe.com",
    "/\t/golpe.com",
    "javascript:alert(1)",
    "http://encurtai.local.golpe.com/dashboard",
  ])("recusa %s, que leva para outro site", (value) => {
    expect(safeCallbackUrl(value)).toBe("/dashboard");
  });
});
