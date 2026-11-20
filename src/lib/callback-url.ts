const DEFAULT_CALLBACK_URL = "/dashboard";

// Endereço fictício, só para o URL conseguir resolver caminhos relativos.
const INTERNAL_BASE = "http://encurtai.local";

// Para onde voltar depois do login. Só aceita caminho do próprio app.
// Qualquer coisa que resolva para outro site (https://golpe.com, //golpe.com, /\golpe.com)
// cai no painel, para o login não virar um redirecionamento aberto.
export function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return DEFAULT_CALLBACK_URL;
  }
  if (!URL.canParse(value, INTERNAL_BASE)) return DEFAULT_CALLBACK_URL;

  const url = new URL(value, INTERNAL_BASE);
  if (url.origin !== INTERNAL_BASE) return DEFAULT_CALLBACK_URL;

  return url.pathname + url.search + url.hash;
}
