import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        Link não encontrado
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Este endereço não existe ou o link foi desativado pelo dono.
      </p>
      <Link href="/" className="w-fit underline">
        Ir para a página inicial
      </Link>
    </main>
  );
}
