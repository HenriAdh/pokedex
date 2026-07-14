export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="mb-1 h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
