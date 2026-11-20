// Quanto falta para o limite liberar, arredondado para cima: "em 12 minutos".
export function formatWaitTime(resetAt: number, now = Date.now()) {
  const minutes = Math.max(1, Math.ceil((resetAt - now) / 60_000));
  return minutes === 1 ? "em 1 minuto" : `em ${minutes} minutos`;
}
