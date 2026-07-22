import { SITE_URL } from "./content";
import { normalizeKeyword } from "./keyword-taxonomy";

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
  const normalizedKeyword = normalizeKeyword(keyword);

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
    .filter((check) => !normalizeKeyword(check.value).includes(normalizedKeyword))
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
  images?: readonly string[];
};

export function buildSitemapXml(entries: SitemapUrlEntry[]): string {
  const hasImages = entries.some((entry) => entry.images && entry.images.length > 0);
  const urlset = hasImages
    ? '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
    : '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    urlset,
    ...entries.map((entry) =>
      [
        "  <url>",
        `    <loc>${escapeXml(toCanonicalUrl(entry.path))}</loc>`,
        entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : null,
        ...(entry.images ?? []).map(
          (image) =>
            `    <image:image><image:loc>${escapeXml(toCanonicalUrl(image))}</image:loc></image:image>`,
        ),
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "</urlset>",
  ].join("\n");
}

export function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function extractExternalLinks(markdown: string): string[] {
  const links: string[] = [];
  const seen = new Set<string>();
  const linkPattern = /\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(markdown)) !== null) {
    try {
      const url = new URL(match[1]).href;
      if (!seen.has(url)) {
        seen.add(url);
        links.push(url);
      }
    } catch {
      // Ignore malformed external links instead of publishing invalid citation URLs.
    }
  }
  return links;
}
