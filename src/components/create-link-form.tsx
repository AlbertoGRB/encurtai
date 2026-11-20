"use client";

import { useActionState } from "react";
import { createLinkAction, type CreateLinkState } from "@/actions/links";
import { CopyButton } from "@/components/copy-button";

const initialState: CreateLinkState = { status: "idle" };

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export function CreateLinkForm({ appHost }: { appHost: string }) {
  const [state, formAction, pending] = useActionState(
    createLinkAction,
    initialState,
  );
  const hasError = state.status === "error";

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url" className="text-sm font-medium">
            URL de destino
          </label>
          <input
            id="url"
            name="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://"
            defaultValue={hasError ? state.values.url : ""}
            aria-invalid={hasError}
            aria-describedby={hasError ? "create-link-error" : undefined}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium">
            Apelido{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-zinc-500">{appHost}/</span>
            <input
              id="slug"
              name="slug"
              autoComplete="off"
              placeholder="promo-natal"
              defaultValue={hasError ? state.values.slug : ""}
              className={inputClass}
            />
          </div>
        </div>

        {hasError && (
          <p
            id="create-link-error"
            role="alert"
            className="text-sm text-red-700 dark:text-red-400"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? "Encurtando..." : "Encurtar"}
        </button>
      </form>

      {state.status === "created" && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950"
        >
          <span className="text-sm">Link criado:</span>
          <a href={state.shortUrl} className="font-medium underline">
            {state.shortUrl}
          </a>
          <CopyButton text={state.shortUrl} />
        </div>
      )}
    </div>
  );
}
