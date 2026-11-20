import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";

const RANDOM_SLUG_ATTEMPTS = 3;

function isPrismaError(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

// P2002: violou um índice único (aqui, o apelido já existe).
const UNIQUE_VIOLATION = "P2002";
// P2025: o registro do where não existe (ou não é deste usuário).
const RECORD_NOT_FOUND = "P2025";

type CreateLinkInput = {
  userId: string;
  url: string;
  slug?: string;
};

// Devolve null quando o apelido escolhido já está em uso.
// Links excluídos continuam no banco, então o apelido deles também conta como em uso.
export async function createLink({ userId, url, slug }: CreateLinkInput) {
  if (slug) {
    try {
      return await db.link.create({ data: { userId, url, slug } });
    } catch (error) {
      if (isPrismaError(error, UNIQUE_VIOLATION)) return null;
      throw error;
    }
  }

  // São mais de 34 bilhões de combinações, mas uma colisão pode acontecer. Aí tenta outro apelido.
  for (let attempt = 1; ; attempt++) {
    try {
      return await db.link.create({
        data: { userId, url, slug: generateSlug() },
      });
    } catch (error) {
      const canRetry =
        isPrismaError(error, UNIQUE_VIOLATION) &&
        attempt < RANDOM_SLUG_ATTEMPTS;
      if (!canRetry) throw error;
    }
  }
}

export function listLinks(userId: string) {
  return db.link.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      url: true,
      active: true,
      createdAt: true,
      _count: { select: { clicks: { where: { isBot: false } } } },
    },
  });
}

// O where inclui o userId: o link de outra pessoa se comporta como se não existisse.
// Devolve o apelido do link alterado (para limpar o cache) ou null.
async function updateOwnLink(
  userId: string,
  linkId: string,
  data: Prisma.LinkUpdateInput,
) {
  try {
    const link = await db.link.update({
      where: { id: linkId, userId, deletedAt: null },
      data,
      select: { slug: true },
    });
    return link.slug;
  } catch (error) {
    if (isPrismaError(error, RECORD_NOT_FOUND)) return null;
    throw error;
  }
}

export function setLinkActive(userId: string, linkId: string, active: boolean) {
  return updateOwnLink(userId, linkId, { active });
}

// Exclusão lógica: a linha fica, para o apelido nunca levar a um destino de outra pessoa.
export function deleteLink(userId: string, linkId: string) {
  return updateOwnLink(userId, linkId, {
    active: false,
    deletedAt: new Date(),
  });
}

export function findActiveLink(slug: string) {
  return db.link.findUnique({
    where: { slug, active: true, deletedAt: null },
    select: { id: true, url: true },
  });
}
