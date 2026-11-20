import { after, NextResponse } from "next/server";
import { recordClick } from "@/lib/clicks";
import { findLinkForRedirect } from "@/lib/link-cache";
import { linkNotFoundResponse } from "@/lib/link-not-found";
import { isSlugFormat } from "@/lib/slug";
import { describeClick } from "@/lib/user-agent";

export async function GET(
  request: Request,
  { params }: RouteContext<"/[slug]">,
) {
  const slug = (await params).slug.toLowerCase();

  // Endereço que nem tem formato de apelido não chega ao banco.
  if (!isSlugFormat(slug)) return linkNotFoundResponse();

  const link = await findLinkForRedirect(slug);
  if (!link) return linkNotFoundResponse();

  // ADR 0003: responde primeiro e grava o clique depois.
  // Se a gravação falhar, o visitante já foi redirecionado e nem percebe (RNF02).
  const click = describeClick(request.headers);
  after(async () => {
    try {
      await recordClick(link.id, click);
    } catch (error) {
      console.error("Falha ao gravar o clique", error);
    }
  });

  return NextResponse.redirect(link.url, 302);
}
