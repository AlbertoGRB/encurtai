import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Meus links | encurtai",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fdashboard");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Olá, {session.user.name ?? "divulgador"}
        </p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Sair
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Meus links</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Você ainda não tem links. A criação de links chega na próxima versão.
        </p>
      </section>
    </main>
  );
}
