import { NextResponse } from "next/server";
import { linkNotFoundResponse } from "@/lib/link-not-found";
import { findLinkForRedirect } from "@/lib/link-cache";
import { isSlugFormat } from "@/lib/slug";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/[slug]">,
) {
  const slug = (await params).slug.toLowerCase();

  // Endereço que nem tem formato de apelido não chega ao banco.
  if (!isSlugFormat(slug)) return linkNotFoundResponse();

  const link = await findLinkForRedirect(slug);
  if (!link) return linkNotFoundResponse();

  return NextResponse.redirect(link.url, 302);
}
