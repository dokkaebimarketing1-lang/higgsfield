type DatedContent = {
  updated_at?: string | null;
  published_at?: string | null;
};

export function getLatestContentDate(items: readonly DatedContent[], fallback: string): string {
  const dates = items
    .flatMap((item) => [item.updated_at, item.published_at])
    .filter((value): value is string => Boolean(value))
    .map((value) => value.slice(0, 10))
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort();

  return dates.at(-1) ?? fallback;
}
