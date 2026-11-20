import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

const TIME_ZONE = "America/Sao_Paulo";
export const STATS_DAYS = 30;
const TOP_VALUES = 5;

// O banco guarda as datas em UTC. O período começa à meia-noite de Brasília de 29 dias atrás,
// para "hoje" e "ontem" no gráfico serem os dias de quem está olhando, não os de Londres.
const periodStart = Prisma.sql`
  ((((now() AT TIME ZONE ${TIME_ZONE})::date - ${STATS_DAYS - 1}::int)::timestamp
    AT TIME ZONE ${TIME_ZONE}) AT TIME ZONE 'UTC')
`;

export type DailyClicks = { day: string; clicks: number };
export type TopValue = { label: string | null; clicks: number };

// Só o dono vê o painel (RN09): o link de outra pessoa volta como null, igual a um link inexistente.
export function findOwnLink(userId: string, linkId: string) {
  return db.link.findFirst({
    where: { id: linkId, userId, deletedAt: null },
    select: { id: true, slug: true, url: true, active: true, createdAt: true },
  });
}

// Cliques por dia nos últimos 30 dias, com os dias sem clique aparecendo como zero.
export function clicksPerDay(linkId: string) {
  return db.$queryRaw<DailyClicks[]>`
    WITH days AS (
      SELECT generate_series(
        (now() AT TIME ZONE ${TIME_ZONE})::date - ${STATS_DAYS - 1}::int,
        (now() AT TIME ZONE ${TIME_ZONE})::date,
        interval '1 day'
      )::date AS day
    ),
    per_day AS (
      SELECT (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TIME_ZONE})::date AS day,
             COUNT(*)::int AS clicks
      FROM "Click"
      WHERE "linkId" = ${linkId}
        AND "isBot" = false
        AND "createdAt" >= ${periodStart}
      GROUP BY 1
    )
    SELECT to_char(days.day, 'YYYY-MM-DD') AS day,
           COALESCE(per_day.clicks, 0) AS clicks
    FROM days
    LEFT JOIN per_day USING (day)
    ORDER BY days.day
  `;
}

// Colunas que viram gráfico. A lista fixa impede montar SQL com um nome vindo de fora.
const BREAKDOWN_COLUMNS = {
  referrerHost: Prisma.raw(`"referrerHost"`),
  browser: Prisma.raw(`"browser"`),
  device: Prisma.raw(`"device"`),
  country: Prisma.raw(`"country"`),
};

// Os 5 valores com mais cliques de uma coluna. O valor vazio (sem origem, país desconhecido) vem como null.
function topValues(linkId: string, field: keyof typeof BREAKDOWN_COLUMNS) {
  const column = BREAKDOWN_COLUMNS[field];
  return db.$queryRaw<TopValue[]>`
    SELECT ${column} AS label, COUNT(*)::int AS clicks
    FROM "Click"
    WHERE "linkId" = ${linkId}
      AND "isBot" = false
      AND "createdAt" >= ${periodStart}
    GROUP BY ${column}
    ORDER BY clicks DESC, label
    LIMIT ${TOP_VALUES}
  `;
}

export async function getLinkStats(linkId: string) {
  const [perDay, referrers, browsers, devices, countries] = await Promise.all([
    clicksPerDay(linkId),
    topValues(linkId, "referrerHost"),
    topValues(linkId, "browser"),
    topValues(linkId, "device"),
    topValues(linkId, "country"),
  ]);
  const total = perDay.reduce((sum, day) => sum + day.clicks, 0);

  return { total, perDay, referrers, browsers, devices, countries };
}
