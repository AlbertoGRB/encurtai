"use client";

import { useState } from "react";
import { deleteLinkAction } from "@/actions/links";

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

export function DeleteLinkButton({
  linkId,
  slug,
}: {
  linkId: string;
  slug: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonClass}
      >
        Excluir
      </button>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-md bg-red-50 p-3 text-sm dark:bg-red-950">
      <p className="w-full">
        Excluir <strong>/{slug}</strong>? O histórico some do painel e o apelido
        não poderá ser usado de novo.
      </p>
      <form action={deleteLinkAction.bind(null, linkId)}>
        <button
          type="submit"
          className="rounded-md bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800"
        >
          Excluir de vez
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className={buttonClass}
      >
        Cancelar
      </button>
    </div>
  );
}
