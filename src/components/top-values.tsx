type Item = { label: string; clicks: number };

export function TopValues({ title, items }: { title: string; items: Item[] }) {
  const max = Math.max(1, ...items.map((item) => item.clicks));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Sem cliques no período.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.label} className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate">{item.label}</span>
                <span className="tabular-nums">{item.clicks}</span>
              </div>
              <div className="h-2 rounded bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-2 rounded bg-zinc-900 dark:bg-zinc-100"
                  style={{ width: `${(item.clicks / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
