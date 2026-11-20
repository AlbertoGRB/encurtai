import { describe, expect, it } from "vitest";
import { describeClick } from "@/lib/user-agent";

const CHROME_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const SAFARI_IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function click(headers: Record<string, string>) {
  return describeClick(new Headers(headers));
}

describe("leitura do clique", () => {
  it("lê navegador, sistema e aparelho de um computador", () => {
    expect(click({ "user-agent": CHROME_WINDOWS })).toMatchObject({
      browser: "Chrome",
      os: "Windows",
      device: "desktop",
      isBot: false,
    });
  });

  it("junta o Safari do celular com o Safari", () => {
    expect(click({ "user-agent": SAFARI_IPHONE })).toMatchObject({
      browser: "Safari",
      os: "iOS",
      device: "mobile",
    });
  });

  it("reconhece tablet", () => {
    expect(click({ "user-agent": SAFARI_IPAD }).device).toBe("tablet");
  });

  it.each([
    ["prévia do WhatsApp", "WhatsApp/2.23.20.0"],
    [
      "Googlebot",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    ],
    [
      "prévia do Facebook",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    ],
    ["curl", "curl/8.4.0"],
    ["user-agent vazio", ""],
  ])("marca %s como robô", (_nome, userAgent) => {
    expect(click({ "user-agent": userAgent }).isBot).toBe(true);
  });

  it("guarda só o domínio da origem, sem www", () => {
    const data = click({
      "user-agent": CHROME_WINDOWS,
      referer: "https://www.instagram.com/p/abc123/?utm_source=ig",
    });

    expect(data.referrerHost).toBe("instagram.com");
  });

  it.each(["", "não é url", "android-app://com.google.android.gm/"])(
    "ignora origem %j",
    (referer) => {
      const data = click({ "user-agent": CHROME_WINDOWS, referer });
      expect(data.referrerHost).toBeNull();
    },
  );

  it("lê o país do cabeçalho da Vercel e ignora valor estranho", () => {
    expect(
      click({ "user-agent": CHROME_WINDOWS, "x-vercel-ip-country": "BR" })
        .country,
    ).toBe("BR");
    expect(
      click({ "user-agent": CHROME_WINDOWS, "x-vercel-ip-country": "brasil" })
        .country,
    ).toBeNull();
    expect(click({ "user-agent": CHROME_WINDOWS }).country).toBeNull();
  });

  it("não guarda IP", () => {
    const data = click({
      "user-agent": CHROME_WINDOWS,
      "x-forwarded-for": "200.100.50.25",
    });

    expect(JSON.stringify(data)).not.toContain("200.100.50.25");
  });
});
