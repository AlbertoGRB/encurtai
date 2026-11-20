import { describe, expect, it } from "vitest";
import { customSlugSchema, generateSlug } from "@/lib/slug";

function errorOf(input: string) {
  const result = customSlugSchema.safeParse(input);
  return result.success ? null : result.error.issues[0].message;
}

describe("apelido aleatório", () => {
  it("tem 7 caracteres, sem 0, o, 1 e l", () => {
    for (let i = 0; i < 1000; i++) {
      expect(generateSlug()).toMatch(/^[2-9a-km-np-z]{7}$/);
    }
  });

  it("não se repete em sequência", () => {
    const slugs = new Set(Array.from({ length: 1000 }, () => generateSlug()));
    expect(slugs.size).toBe(1000);
  });
});

describe("apelido escolhido", () => {
  it.each(["abc", "promo-natal", "black-friday-2026", "a".repeat(30)])(
    "aceita %s",
    (slug) => {
      expect(customSlugSchema.parse(slug)).toBe(slug);
    },
  );

  it("passa para minúsculas e tira os espaços", () => {
    expect(customSlugSchema.parse("  Promo-Natal ")).toBe("promo-natal");
  });

  it("recusa menos de 3 e mais de 30 caracteres", () => {
    expect(errorOf("ab")).toBe(
      "O apelido precisa ter pelo menos 3 caracteres.",
    );
    expect(errorOf("a".repeat(31))).toBe(
      "O apelido pode ter no máximo 30 caracteres.",
    );
  });

  it.each([
    "promo natal",
    "promo_natal",
    "promoção",
    "promo/natal",
    "promo.natal",
  ])("recusa caractere fora do permitido em %s", (slug) => {
    expect(errorOf(slug)).toBe("Use só letras minúsculas, números e hífen.");
  });

  it("recusa hífen no começo ou no fim", () => {
    expect(errorOf("-promo")).toBe(
      "O apelido não pode começar nem terminar com hífen.",
    );
    expect(errorOf("promo-")).toBe(
      "O apelido não pode começar nem terminar com hífen.",
    );
  });

  it.each(["dashboard", "login", "api", "API"])(
    "recusa a palavra reservada %s",
    (slug) => {
      expect(errorOf(slug)).toBe("Apelido indisponível.");
    },
  );
});
