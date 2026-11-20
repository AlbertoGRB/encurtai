import { describe, expect, it } from "vitest";
import { formatWaitTime } from "@/lib/wait-time";

const AGORA = Date.parse("2026-11-20T15:00:00Z");
const minutos = (n: number) => n * 60_000;

describe("tempo até o limite liberar", () => {
  it("arredonda para cima", () => {
    expect(formatWaitTime(AGORA + minutos(11) + 1, AGORA)).toBe(
      "em 12 minutos",
    );
  });

  it("usa o singular para 1 minuto", () => {
    expect(formatWaitTime(AGORA + minutos(1), AGORA)).toBe("em 1 minuto");
  });

  it("nunca mostra zero, mesmo se faltar menos de um minuto", () => {
    expect(formatWaitTime(AGORA + 5_000, AGORA)).toBe("em 1 minuto");
    expect(formatWaitTime(AGORA - 5_000, AGORA)).toBe("em 1 minuto");
  });
});
