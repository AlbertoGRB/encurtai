// Endereço público do app. Monta o link curto e serve para recusar links do próprio encurtai.
// Na Vercel, sem APP_URL, vale o domínio de produção que a própria Vercel informa.
export function getAppUrl(): URL {
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const value =
    process.env.APP_URL ?? (vercelDomain ? `https://${vercelDomain}` : "");
  if (!value) {
    throw new Error(
      "Defina APP_URL no .env, por exemplo http://localhost:3000",
    );
  }
  return new URL(value);
}

export function shortUrlFor(slug: string): string {
  return new URL(`/${slug}`, getAppUrl()).toString();
}
