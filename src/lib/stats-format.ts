// Como cada valor guardado no clique aparece no painel.

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Computador",
  mobile: "Celular",
  tablet: "Tablet",
  other: "Outro",
};

const countryNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });

export function deviceLabel(device: string | null) {
  if (!device) return "Desconhecido";
  return DEVICE_LABELS[device] ?? device;
}

export function countryLabel(code: string | null) {
  if (!code) return "Desconhecido";
  return countryNames.of(code) ?? code;
}

// Sem origem é quem digitou o link, abriu de um app que não informa a origem (como o WhatsApp)
// ou veio de um site que esconde a origem.
export function referrerLabel(host: string | null) {
  return host ?? "Direto ou app";
}

export function browserLabel(name: string | null) {
  return name ?? "Desconhecido";
}

// "2026-11-20" vira "20/11".
export function shortDayLabel(day: string) {
  const [, month, dayOfMonth] = day.split("-");
  return `${dayOfMonth}/${month}`;
}
