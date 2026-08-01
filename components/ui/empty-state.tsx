export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-zinc-200 text-2xl">
        ◌
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
