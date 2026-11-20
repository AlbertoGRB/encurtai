import { findActiveLink } from "@/lib/links";
import { redis } from "@/lib/redis";

// ADR 0002: o link fica 24 h no cache, e o "não existe" fica 1 minuto,
// para quem testa apelidos aleatórios não chegar ao banco.
const FOUND_TTL_SECONDS = 24 * 60 * 60;
const MISSING_TTL_SECONDS = 60;

type CachedLink = { id: string; url: string } | { missing: true };

function cacheKey(slug: string) {
  return `link:${slug}`;
}

export async function findLinkForRedirect(slug: string) {
  const cached = await readCache(slug);
  if (cached) return "missing" in cached ? null : cached;

  const link = await findActiveLink(slug);
  if (link) {
    await writeCache(slug, link, FOUND_TTL_SECONDS);
  } else {
    await writeCache(slug, { missing: true }, MISSING_TTL_SECONDS);
  }
  return link;
}

// Chamado quando o link é desativado, reativado ou excluído, para a mudança valer na hora.
export async function forgetLink(slug: string) {
  await redis.del(cacheKey(slug));
}

// Se o Redis cair, o redirecionamento continua funcionando direto pelo banco.
async function readCache(slug: string) {
  try {
    return await redis.get<CachedLink>(cacheKey(slug));
  } catch (error) {
    console.error("Falha ao ler o cache do link", error);
    return null;
  }
}

async function writeCache(slug: string, value: CachedLink, ttlSeconds: number) {
  try {
    await redis.set(cacheKey(slug), value, { ex: ttlSeconds });
  } catch (error) {
    console.error("Falha ao gravar o cache do link", error);
  }
}
