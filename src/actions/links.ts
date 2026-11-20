"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAppUrl, shortUrlFor } from "@/lib/app-url";
import { auth } from "@/lib/auth";
import { forgetLink } from "@/lib/link-cache";
import { createLink, deleteLink, setLinkActive } from "@/lib/links";
import { createLinkRateLimit, LINKS_PER_HOUR } from "@/lib/rate-limit";
import { customSlugSchema } from "@/lib/slug";
import { destinationUrlSchema } from "@/lib/url";
import { formatWaitTime } from "@/lib/wait-time";

// No erro, os valores digitados voltam para o formulário não ficar em branco.
export type CreateLinkState =
  | { status: "idle" }
  | { status: "error"; message: string; values: { url: string; slug: string } }
  | { status: "created"; shortUrl: string };

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createLinkAction(
  _previousState: CreateLinkState,
  formData: FormData,
): Promise<CreateLinkState> {
  const values = {
    url: String(formData.get("url") ?? ""),
    slug: String(formData.get("slug") ?? "").trim(),
  };

  const userId = await getUserId();
  if (!userId) {
    return {
      status: "error",
      message: "Sua sessão expirou. Entre de novo.",
      values,
    };
  }

  const schema = z.object({
    url: destinationUrlSchema(getAppUrl().hostname),
    slug: customSlugSchema.optional(),
  });
  const parsed = schema.safeParse({
    url: values.url,
    slug: values.slug === "" ? undefined : values.slug,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message, values };
  }

  // O limite é conferido depois da validação: um erro de digitação não gasta a cota.
  const { success, reset } = await createLinkRateLimit.limit(userId);
  if (!success) {
    return {
      status: "error",
      message: `Você já criou ${LINKS_PER_HOUR} links na última hora. Tente de novo ${formatWaitTime(reset)}.`,
      values,
    };
  }

  const link = await createLink({ userId, ...parsed.data });
  if (!link) {
    return { status: "error", message: "Apelido indisponível.", values };
  }

  revalidatePath("/dashboard");
  return { status: "created", shortUrl: shortUrlFor(link.slug) };
}

// Ações chamadas com .bind(null, link.id): os argumentos vêm do navegador e são conferidos aqui.
const linkIdSchema = z.string().min(1);

export async function setLinkActiveAction(linkId: string, active: boolean) {
  const userId = await getUserId();
  if (!userId) return;

  const slug = await setLinkActive(
    userId,
    linkIdSchema.parse(linkId),
    z.boolean().parse(active),
  );
  if (slug) await linkChanged(slug);
}

export async function deleteLinkAction(linkId: string) {
  const userId = await getUserId();
  if (!userId) return;

  const slug = await deleteLink(userId, linkIdSchema.parse(linkId));
  if (slug) await linkChanged(slug);
}

// O cache sai na hora: o link desativado ou excluído para de redirecionar no mesmo instante.
async function linkChanged(slug: string) {
  await forgetLink(slug);
  revalidatePath("/dashboard");
}
