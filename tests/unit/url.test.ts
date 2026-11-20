import { describe, expect, it } from "vitest";
import { destinationUrlSchema, MAX_URL_LENGTH } from "@/lib/url";

const schema = destinationUrlSchema("encurtai.vercel.app");

function errorOf(input: string) {
  const result = schema.safeParse(input);
  return result.success ? null : result.error.issues[0].message;
}

describe("URL de destino", () => {
  it("aceita http e https", () => {
    expect(schema.parse("https://example.com/promo?utm_source=instagram")).toBe(
      "https://example.com/promo?utm_source=instagram",
    );
    expect(schema.parse("http://example.com")).toBe("http://example.com");
  });

  it("tira os espaços colados junto com a URL", () => {
    expect(schema.parse("  https://example.com  ")).toBe("https://example.com");
  });

  it("recusa URL vazia", () => {
    expect(errorOf("   ")).toBe("Informe a URL de destino.");
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://example.com/arquivo",
    "example.com",
    "https://",
  ])("recusa %s", (input) => {
    expect(errorOf(input)).toMatch(/^URL inválida/);
  });

  it("recusa URL com usuário e senha, que esconde o destino real", () => {
    expect(errorOf("https://banco.com@golpe.com")).toMatch(/^URL inválida/);
  });

  it("aceita até 2.048 caracteres e recusa acima disso", () => {
    const base = "https://example.com/";
    const atLimit = base + "a".repeat(MAX_URL_LENGTH - base.length);

    expect(schema.safeParse(atLimit).success).toBe(true);
    expect(errorOf(atLimit + "a")).toBe(
      "A URL pode ter no máximo 2.048 caracteres.",
    );
  });

  it("recusa link do próprio encurtador, mesmo em maiúsculas", () => {
    expect(errorOf("https://encurtai.vercel.app/abc1234")).toBe(
      "Não dá para encurtar um link do próprio encurtai.",
    );
    expect(errorOf("HTTPS://ENCURTAI.VERCEL.APP/abc1234")).toBe(
      "Não dá para encurtar um link do próprio encurtai.",
    );
  });
});
