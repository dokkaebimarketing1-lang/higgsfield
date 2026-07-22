import { SITE_URL } from "./content";

export function getPrimaryKeyword(tags: string): string {
  return (
    tags
      .split(",")
      .map((tag) => tag.trim())
      .find(Boolean) ?? ""
  );
}

export type KeywordAlignmentField = "tags" | "title" | "excerpt" | "metaTitle" | "metaDescription";

export type KeywordAlignmentIssue = {
  field: KeywordAlignmentField;
  message: string;
};

export function getKeywordAlignmentIssues(input: {
  tags: string;
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
}): KeywordAlignmentIssue[] {
  const keyword = getPrimaryKeyword(input.tags);
  if (!keyword) {
    return [{ field: "tags", message: "발행 글에는 목표 키워드를 첫 태그로 입력해 주세요." }];
  }

  const checks: { field: KeywordAlignmentField; value: string; label: string }[] = [
    { field: "title", value: input.title, label: "제목(H1)" },
    { field: "excerpt", value: input.excerpt, label: "요약" },
    ...(input.metaTitle
      ? [{ field: "metaTitle" as const, value: input.metaTitle, label: "SEO 제목" }]
      : []),
    ...(input.metaDescription
      ? [
          {
            field: "metaDescription" as const,
            value: input.metaDescription,
            label: "SEO 설명",
          },
        ]
      : []),
  ];

  return checks
    .filter((check) => !check.value.includes(keyword))
    .map((check) => ({
      field: check.field,
      message: `${check.label}에 목표 키워드 “${keyword}”를 자연스럽게 포함해 주세요.`,
    }));
}

export function toCanonicalUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export type SitemapUrlEntry = {
  path: string;
  lastmod?: string;
};

export function buildSitemapXml(entries: SitemapUrlEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) =>
      [
        "  <url>",
        `    <loc>${escapeXml(toCanonicalUrl(entry.path))}</loc>`,
        entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "</urlset>",
  ].join("\n");
}
