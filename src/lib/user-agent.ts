import { userAgent } from "next/server";

export type DeviceType = "desktop" | "mobile" | "tablet" | "other";

export type ClickData = {
  referrerHost: string | null;
  browser: string | null;
  os: string | null;
  device: DeviceType;
  country: string | null;
  isBot: boolean;
};

// Tudo que o painel precisa saber de um clique, lido dos cabeçalhos.
// Não guarda IP nem a URL completa de origem (RNF03).
export function describeClick(headers: Headers): ClickData {
  const agent = userAgent({ headers });
  // "Mobile Safari" e "Safari" viram uma barra só no gráfico.
  const browser = agent.browser.name?.replace(/^Mobile /, "") ?? null;

  return {
    referrerHost: referrerHost(headers.get("referer")),
    browser,
    os: agent.os.name ?? null,
    device: deviceType(agent.device.type),
    country: countryCode(headers.get("x-vercel-ip-country")),
    // Robô conhecido (prévia do WhatsApp, buscadores) ou programa sem navegador (curl, scripts).
    isBot: agent.isBot || browser === null,
  };
}

// Da origem, fica só o domínio: https://www.instagram.com/p/abc vira instagram.com.
function referrerHost(referer: string | null) {
  if (!referer || !URL.canParse(referer)) return null;

  const url = new URL(referer);
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url.hostname.replace(/^www\./, "");
}

function deviceType(type: string | undefined): DeviceType {
  if (type === undefined) return "desktop";
  if (type === "mobile" || type === "tablet") return type;
  return "other";
}

// A Vercel manda o país do visitante neste cabeçalho, com duas letras (BR, PT, US).
function countryCode(value: string | null) {
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}
