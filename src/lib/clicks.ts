import { db } from "@/lib/db";
import type { ClickData } from "@/lib/user-agent";

export async function recordClick(linkId: string, data: ClickData) {
  await db.click.create({ data: { linkId, ...data } });
}
