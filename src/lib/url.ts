import { z } from "zod";

export const MAX_URL_LENGTH = 2048;

function parseHttpUrl(value: string): URL | null {
  if (!URL.canParse(value)) return null;

  const url = new URL(value);

  // Só http e https. Isso barra javascript:, data: e outros esquemas que viram ataque no clique.
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  // Em https://banco.com@golpe.com o destino real é golpe.com. Usuário e senha na URL não são aceitos.
  if (url.username || url.password) return null;

  return url;
}

export function destinationUrlSchema(appHost: string) {
  return z
    .string()
    .trim()
    .min(1, { error: "Informe a URL de destino.", abort: true })
    .max(MAX_URL_LENGTH, {
      error: "A URL pode ter no máximo 2.048 caracteres.",
      abort: true,
    })
    .refine((value) => parseHttpUrl(value) !== null, {
      error:
        "URL inválida. Use um endereço que comece com http:// ou https://.",
      abort: true,
    })
    .refine((value) => new URL(value).hostname !== appHost.toLowerCase(), {
      error: "Não dá para encurtar um link do próprio encurtai.",
    });
}
