// Endereço público do app. Monta o link curto e serve para recusar links do próprio encurtai.
export function getAppUrl(): URL {
  const value = process.env.APP_URL;
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
