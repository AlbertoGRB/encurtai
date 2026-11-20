import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { setLinkActiveAction } from "@/actions/links";
import { CopyButton } from "@/components/copy-button";
import { CreateLinkForm } from "@/components/create-link-form";
import { DeleteLinkButton } from "@/components/delete-link-button";
import { getAppUrl, shortUrlFor } from "@/lib/app-url";
import { auth, signOut } from "@/lib/auth";
import { listLinks } from "@/lib/links";

export const metadata: Metadata = {
  title: "Meus links | encurtai",
};

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fdashboard");

  const links = await listLinks(session.user.id);
  const appHost = getAppUrl().host;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Olá, {session.user.name ?? "divulgador"}
        </p>
        <form action={signOutAction}>
          <button type="submit" className={buttonClass}>
            Sair
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Novo link</h1>
        <CreateLinkForm appHost={appHost} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Meus links</h2>

        {links.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Você ainda não tem links. Crie o primeiro acima.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {links.map((link) => {
              const shortUrl = shortUrlFor(link.slug);
              const clicks = link._count.clicks;

              return (
                <li key={link.id} className="flex flex-col gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={shortUrl} className="font-medium underline">
                      {appHost}/{link.slug}
                    </a>
                    {!link.active && (
                      <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                        Desativado
                      </span>
                    )}
                  </div>
                  <p
                    className="truncate text-sm text-zinc-600 dark:text-zinc-400"
                    title={link.url}
                  >
                    {link.url}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {clicks} {clicks === 1 ? "clique" : "cliques"} · criado em{" "}
                    {dateFormat.format(link.createdAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className={buttonClass}
                    >
                      Ver painel
                    </Link>
                    <CopyButton text={shortUrl} />
                    <form
                      action={setLinkActiveAction.bind(
                        null,
                        link.id,
                        !link.active,
                      )}
                    >
                      <button type="submit" className={buttonClass}>
                        {link.active ? "Desativar" : "Reativar"}
                      </button>
                    </form>
                    <DeleteLinkButton linkId={link.id} slug={link.slug} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
