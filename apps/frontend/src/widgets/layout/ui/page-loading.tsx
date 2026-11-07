export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center" role="status" aria-label="Загрузка страницы">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--ui-border)] border-t-[var(--ui-primary)]" aria-hidden="true" />
    </div>
  );
}
