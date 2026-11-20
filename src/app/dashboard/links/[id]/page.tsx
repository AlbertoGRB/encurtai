import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClicksChart } from "@/components/clicks-chart";
import { CopyButton } from "@/components/copy-button";
import { TopValues } from "@/components/top-values";
import { getAppUrl, shortUrlFor } from "@/lib/app-url";
import { auth } from "@/lib/auth";
import { findOwnLink, getLinkStats, STATS_DAYS } from "@/lib/stats";
import {
  browserLabel,
  countryLabel,
  deviceLabel,
  referrerLabel,
  shortDayLabel,
} from "@/lib/stats-format";

export const metadata: Metadata = {
  title: "Painel do link | encurtai",
};

export default async function LinkStatsPage({
  params,
}: PageProps<"/dashboard/links/[id]">) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/dashboard/links/${id}`)}`,
    );
  }

  // Link de outra pessoa, excluído ou inexistente: 404 nos três casos (RN09).
  const link = await findOwnLink(session.user.id, id);
  if (!link) notFound();

  const stats = await getLinkStats(link.id);
  const appHost = getAppUrl().host;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-3">
        <Link href="/dashboard" className="w-fit text-sm underline">
          ← Meus links
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
            {appHost}/{link.slug}
          </h1>
          {!link.active && (
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
              Desativado
            </span>
          )}
        </div>
        <p
          className="truncate text-zinc-600 dark:text-zinc-400"
          title={link.url}
        >
          {link.url}
        </p>
        <CopyButton text={shortUrlFor(link.slug)} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">
            Cliques nos últimos {STATS_DAYS} dias
          </h2>
          <p className="text-4xl font-semibold tabular-nums">{stats.total}</p>
          <p className="text-sm text-zinc-500">
            Prévias de apps e robôs de busca não entram na conta.
          </p>
        </div>

        <ClicksChart data={stats.perDay} />

        <details className="text-sm">
          <summary className="cursor-pointer">Ver os números por dia</summary>
          <table className="mt-3 w-full max-w-xs text-left">
            <thead>
              <tr>
                <th className="py-1 font-medium">Dia</th>
                <th className="py-1 text-right font-medium">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {stats.perDay.map((day) => (
                <tr key={day.day}>
                  <td className="py-0.5">{shortDayLabel(day.day)}</td>
                  <td className="py-0.5 text-right tabular-nums">
                    {day.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <div className="grid gap-10 sm:grid-cols-2">
        <TopValues
          title="Origens"
          items={stats.referrers.map((item) => ({
            label: referrerLabel(item.label),
            clicks: item.clicks,
          }))}
        />
        <TopValues
          title="Navegadores"
          items={stats.browsers.map((item) => ({
            label: browserLabel(item.label),
            clicks: item.clicks,
          }))}
        />
        <TopValues
          title="Aparelhos"
          items={stats.devices.map((item) => ({
            label: deviceLabel(item.label),
            clicks: item.clicks,
          }))}
        />
        <TopValues
          title="Países"
          items={stats.countries.map((item) => ({
            label: countryLabel(item.label),
            clicks: item.clicks,
          }))}
        />
      </div>
    </main>
  );
}
