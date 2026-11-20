import { describe, expect, it } from "vitest";
import {
  browserLabel,
  countryLabel,
  deviceLabel,
  referrerLabel,
  shortDayLabel,
} from "@/lib/stats-format";

describe("rótulos do painel", () => {
  it("traduz o tipo de aparelho", () => {
    expect(deviceLabel("mobile")).toBe("Celular");
    expect(deviceLabel("desktop")).toBe("Computador");
    expect(deviceLabel(null)).toBe("Desconhecido");
  });

  it("mostra o nome do país em português", () => {
    expect(countryLabel("BR")).toBe("Brasil");
    expect(countryLabel("US")).toBe("Estados Unidos");
    expect(countryLabel(null)).toBe("Desconhecido");
  });

  it("explica o clique sem origem", () => {
    expect(referrerLabel("instagram.com")).toBe("instagram.com");
    expect(referrerLabel(null)).toBe("Direto ou app");
  });

  it("mostra navegador desconhecido", () => {
    expect(browserLabel("Chrome")).toBe("Chrome");
    expect(browserLabel(null)).toBe("Desconhecido");
  });

  it("encurta a data do eixo do gráfico", () => {
    expect(shortDayLabel("2026-11-05")).toBe("05/11");
  });
});
