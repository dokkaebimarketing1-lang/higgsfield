import { BLOG_CATEGORY_SLUGS, CATEGORY_SEO, SITE, SITE_URL } from "../src/lib/content";
import { KEYWORD_CLUSTERS, type KeywordCluster } from "../src/lib/keyword-taxonomy";
import { RESEARCH_DOWNLOADS } from "../src/lib/research-data";
import {
  CATEGORY_SERVICE_PATHS,
  PUBLIC_PAGES,
  SERVICE_PAGES,
  getServicePagesForPost,
} from "../src/lib/seo-pages";

type QueryResult<T> = {
  row_count: number;
  rows: T[];
};

type HealthRow = {
  published_count: number;
  draft_count: number;
  category_count: number;
  public_category_count: number;
  invalid_public_count: number;
  evidence_count: number;
};

type DraftRow = {
  path: string;
};

type PublicPostRow = {
  path: string;
  title: string;
  slug: string;
  keyword_cluster: string;
};

type SchemaRelationExpectation = {
  nodeId: string;
  schemaType: string;
  property: string;
  expectedTargets: readonly string[];
};

type HtmlPageExpectation = {
  path: string;
  h1: string;
  schemaTypes: readonly string[];
  markers?: readonly (
    "data-page-authority" | "data-research-authorship" | "data-research-citation"
  )[];
  methodologyLink?: boolean;
  officialSourceHosts?: readonly string[];
  requiredText?: readonly string[];
  requiredInternalPaths?: readonly string[];
  schemaRelations?: readonly SchemaRelationExpectation[];
};

const websiteId = process.env.HIGGSFIELD_WEBSITE_ID?.trim();
const siteUrl = (process.env.SITE_URL?.trim() || SITE_URL).replace(/\/$/, "");
const verificationId = process.env.GITHUB_SHA?.slice(0, 12) || Date.now().toString();

if (!websiteId) throw new Error("HIGGSFIELD_WEBSITE_ID가 설정되지 않았습니다.");
if (!siteUrl.startsWith("https://")) throw new Error("SITE_URL은 HTTPS 주소여야 합니다.");

const requiredResearchPaths = [
  "/research",
  "/research/2025-music-private-education-statistics",
  "/research/2026-seoul-piano-academy-fees",
  "/research/piano-search-demand-report-2026",
  "/research/methodology",
  "/research/changelog",
] as const;

const resourceDownloads = {
  levelRoadmapCsv: "/data/resources/piano-level-roadmap.csv",
  practicePlannerTemplateCsv: "/data/resources/piano-practice-planner-template.csv",
} as const;

const searchDemandExpectedHeader = [
  "keyword",
  "total_search_volume",
  "naver_total",
  "naver_mobile",
  "naver_pc",
  "google_monthly_average",
  "naver_competition",
  "google_competition",
  "google_competition_index",
  "google_bid_low_krw",
  "google_bid_high_krw",
  "google_search_volume_2025_07",
  "google_search_volume_2025_08",
  "google_search_volume_2025_09",
  "google_search_volume_2025_10",
  "google_search_volume_2025_11",
  "google_search_volume_2025_12",
  "google_search_volume_2026_01",
  "google_search_volume_2026_02",
  "google_search_volume_2026_03",
  "google_search_volume_2026_04",
  "google_search_volume_2026_05",
  "google_search_volume_2026_06",
  "source_coverage",
  "in_lesson_segment",
  "in_local_segment",
  "in_audience_segment",
  "in_jobs_segment",
  "in_parent_segment",
  "in_naver_discovered_segment",
] as const;

const searchDemandSummaryExpectedHeader = [
  "sheet_name",
  "segment_id",
  "data_rows",
  "column_count",
  "total_search_volume_sum",
  "naver_search_volume_sum",
  "google_monthly_average_sum",
  "overlap_policy",
  "notes",
] as const;

const levelRoadmapExpectedHeader = [
  "단계",
  "단계명",
  "현재 수준 확인 기준",
  "연주 기술",
  "이론·읽기",
  "예시 레퍼토리",
  "다음 단계 준비 체크",
  "해석 한계",
] as const;

const practicePlannerExpectedHeader = [
  "요일",
  "오늘의 목표",
  "몸풀기(분)",
  "테크닉(분)",
  "곡 연습(분)",
  "초견·이론(분)",
  "합계(분)",
  "연습 메모",
] as const;

const serviceHtmlPages: readonly HtmlPageExpectation[] = Object.values(SERVICE_PAGES).map(
  (page) => ({
    path: page.path,
    h1: page.primaryKeyword,
    schemaTypes: ["WebPage", "Service", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: [page.authority.answer, page.authority.scope, page.authority.boundary],
    requiredInternalPaths: [
      "/about",
      ...page.relatedServices.map((item) => item.href),
      ...page.related.map((item) => item.href),
    ],
    schemaRelations: [
      {
        nodeId: `${siteUrl}${page.path}#webpage`,
        schemaType: "WebPage",
        property: "relatedLink",
        expectedTargets: page.related.map((item) => `${siteUrl}${item.href}`),
      },
      {
        nodeId: `${siteUrl}${page.path}#service`,
        schemaType: "Service",
        property: "subjectOf",
        expectedTargets: page.related.map((item) => `${siteUrl}${item.href}#article`),
      },
    ],
  }),
);

const categoryServicePaths = CATEGORY_SERVICE_PATHS as Record<string, readonly string[]>;
const categoryHtmlPages: readonly HtmlPageExpectation[] = BLOG_CATEGORY_SLUGS.map((slug) => {
  const seo = CATEGORY_SEO[slug];
  return {
    path: `/blog/${slug}`,
    h1: seo.primaryKeyword,
    schemaTypes: ["CollectionPage", "ItemList", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: [seo.audience, seo.editorialRule, seo.exclusionRule],
    requiredInternalPaths: ["/about", ...(categoryServicePaths[slug] ?? [])],
    schemaRelations: [
      {
        nodeId: `${siteUrl}/blog/${slug}#collection`,
        schemaType: "CollectionPage",
        property: "about",
        expectedTargets: (categoryServicePaths[slug] ?? []).map(
          (path) => `${siteUrl}${path}#service`,
        ),
      },
    ],
  };
});

const coreHtmlPages: readonly HtmlPageExpectation[] = [
  {
    path: "/",
    h1: SITE.hero.headline,
    schemaTypes: ["LocalBusiness", "WebSite", "FAQPage"],
  },
  {
    path: "/about",
    h1: "피아노 선생님 김서연",
    schemaTypes: ["Person", "FAQPage", "BreadcrumbList"],
  },
  {
    path: "/blog",
    h1: "피아노 레슨 정보와 연습 칼럼",
    schemaTypes: ["CollectionPage", "ItemList", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredInternalPaths: ["/about"],
    requiredText: ["피아노 정보 허브 편집 기준"],
  },
  {
    path: "/tools",
    h1: "피아노 학습 도구",
    schemaTypes: ["WebPage", "ItemList", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: ["피아노 도구 작성·운영 기준", "외부·전문가 독립 검토 전"],
    requiredInternalPaths: [
      "/editorial-policy",
      "/tools/piano-chord-chart",
      "/tools/piano-lesson-cost-calculator",
    ],
  },
  {
    path: "/tools/piano-chord-chart",
    h1: "피아노 코드표",
    schemaTypes: ["WebPage", "WebApplication", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: ["피아노 코드표 작성·운영 기준", "132개 구성음·전위", "외부·전문가 독립 검토 전"],
    requiredInternalPaths: ["/editorial-policy", "/tools"],
  },
  {
    path: "/tools/piano-lesson-cost-calculator",
    h1: "피아노 레슨비 계산기",
    schemaTypes: ["WebPage", "WebApplication", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: [
      "레슨비 계산기 작성·운영 기준",
      "월 총액, 회당, 분당, 60분 환산값",
      "외부·전문가 독립 검토 전",
    ],
    requiredInternalPaths: ["/editorial-policy", "/research/2026-seoul-piano-academy-fees"],
  },
  {
    path: "/resources",
    h1: "피아노 학습 자료실",
    schemaTypes: ["CollectionPage", "ItemList", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: ["피아노 학습 자료 작성·운영 기준", "외부·전문가 독립 검토 전"],
    requiredInternalPaths: [
      "/editorial-policy",
      "/resources/piano-level-roadmap",
      "/resources/piano-practice-planner",
    ],
  },
  {
    path: "/resources/piano-level-roadmap",
    h1: "피아노 수준별 학습 로드맵",
    schemaTypes: ["WebPage", "Article", "ItemList", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: [
      "수준별 로드맵 작성·운영 기준",
      "다섯 단계의 관찰 가능한 기준",
      "외부·전문가 독립 검토 전",
    ],
    requiredInternalPaths: ["/editorial-policy", "/resources"],
  },
  {
    path: "/resources/piano-practice-planner",
    h1: "주간 피아노 연습 플래너",
    schemaTypes: ["WebPage", "WebApplication", "FAQPage", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: [
      "주간 연습 플래너 작성·운영 기준",
      "입력 내용을 서버에 보내지 않은 채",
      "외부·전문가 독립 검토 전",
    ],
    requiredInternalPaths: ["/editorial-policy", "/resources"],
  },
  {
    path: "/editorial-policy",
    h1: "편집·출처·AI 활용 정책",
    schemaTypes: ["WebPage", "Article", "BreadcrumbList"],
    markers: ["data-page-authority"],
    requiredText: ["이 편집 정책의 운영 책임", "외부·전문가 독립 검토 전"],
    requiredInternalPaths: ["/about", "/research/changelog"],
  },
  ...serviceHtmlPages,
  ...categoryHtmlPages,
  {
    path: "/research",
    h1: "피아노 통계 자료실",
    schemaTypes: ["CollectionPage", "DataCatalog", "BreadcrumbList"],
    markers: ["data-research-authorship"],
    methodologyLink: true,
    officialSourceHosts: ["www.moe.go.kr", "www.data.go.kr"],
    requiredText: [
      "교육부·국가데이터처 2025년 초중고 사교육비 조사",
      "원자료 공표일: 2026-03-12",
      "서울특별시교육청 2026년 1월 1일 기준 학원·교습소 현황",
      "원자료 기준일: 2026-01-01",
    ],
  },
  {
    path: "/research/2025-music-private-education-statistics",
    h1: "2025 음악 사교육비 통계",
    schemaTypes: ["Dataset", "FAQPage", "BreadcrumbList"],
    markers: ["data-research-authorship", "data-research-citation"],
    methodologyLink: true,
    officialSourceHosts: ["www.moe.go.kr", "kosis.kr"],
  },
  {
    path: "/research/2026-seoul-piano-academy-fees",
    h1: "2026 서울 피아노 학원비·교습소 등록 교습비",
    schemaTypes: ["Dataset", "FAQPage", "BreadcrumbList"],
    markers: ["data-research-authorship", "data-research-citation"],
    methodologyLink: true,
    officialSourceHosts: ["www.data.go.kr", "buseo.sen.go.kr"],
  },
  {
    path: "/research/piano-search-demand-report-2026",
    h1: "2026 피아노 키워드 검색수요 조사",
    schemaTypes: ["WebPage", "Dataset", "Article", "FAQPage", "BreadcrumbList"],
    markers: ["data-research-authorship", "data-research-citation"],
    methodologyLink: true,
    officialSourceHosts: ["business.google.com", "ads.naver.com"],
    requiredText: [
      "자체 조사 · 광고 도구 추정치 · 공식 통계 아님",
      "4,545개 피아노 관련 키워드",
      "CSV 행·필드 수, 파일 크기·SHA-256",
    ],
    requiredInternalPaths: ["/tools/piano-chord-chart"],
  },
  {
    path: "/research/methodology",
    h1: "피아노 데이터 방법론",
    schemaTypes: ["WebPage", "BreadcrumbList"],
    markers: ["data-research-authorship"],
  },
  {
    path: "/research/changelog",
    h1: "연구 데이터 수정 이력",
    schemaTypes: ["WebPage", "Article", "BreadcrumbList"],
    markers: ["data-research-authorship"],
    officialSourceHosts: ["www.moe.go.kr", "www.data.go.kr"],
    requiredText: ["수정 이력 작성·검증 정보"],
    requiredInternalPaths: ["/research/methodology", "/research"],
  },
] as const;

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&#x([\da-f]+);/gi, (_, hexadecimal: string) =>
      String.fromCodePoint(Number.parseInt(hexadecimal, 16)),
    )
    .replace(/&([a-z]+);/gi, (entity, name: string) => namedEntities[name.toLowerCase()] ?? entity);
}

function readHtmlAttribute(tag: string, attribute: string): string | undefined {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(
    new RegExp(
      `\\s${escapedAttribute}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+)))?(?=\\s|\\/?>)`,
      "i",
    ),
  );
  if (!match) return undefined;
  return decodeHtmlEntities(match[1] ?? match[2] ?? match[3] ?? "");
}

function openingTags(html: string, tagName: string): string[] {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...html.matchAll(new RegExp(`<${escapedTagName}\\b[^>]*>`, "gi"))].map(
    (match) => match[0],
  );
}

function normalizedVisibleText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+([:：,.;!?])/g, "$1")
    .trim();
}

function parseCsvRows(csv: string, label: string): string[][] {
  const source = csv.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') {
      if (cell) throw new Error(`${label} CSV의 따옴표 위치가 유효하지 않습니다.`);
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\r" || character === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (character === "\r" && source[index + 1] === "\n") index += 1;
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error(`${label} CSV에 닫히지 않은 따옴표가 있습니다.`);
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function verifyCsvShape(
  label: string,
  csv: string,
  expectedHeader: readonly string[],
  expectedDataRows: number,
): string[][] {
  const rows = parseCsvRows(csv, label);
  const header = rows[0] ?? [];
  if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
    throw new Error(
      `${label} CSV 헤더가 예상과 다릅니다. 기대값: ${expectedHeader.join(",")}, 실제: ${header.join(",")}`,
    );
  }
  const dataRows = rows.slice(1);
  if (dataRows.length !== expectedDataRows) {
    throw new Error(
      `${label} CSV 데이터 행이 ${dataRows.length}개입니다. 기대값: ${expectedDataRows}`,
    );
  }
  const invalidWidthRow = dataRows.findIndex((row) => row.length !== expectedHeader.length);
  if (invalidWidthRow >= 0) {
    throw new Error(
      `${label} CSV ${invalidWidthRow + 2}행의 필드 수가 ${dataRows[invalidWidthRow].length}개입니다. 기대값: ${expectedHeader.length}`,
    );
  }
  return dataRows;
}

function parseRequiredInteger(value: string, label: string): number {
  if (!/^-?\d+$/.test(value)) throw new Error(`${label} 값이 정수가 아닙니다: ${value}`);
  return Number(value);
}

function parseNullableInteger(value: string, label: string): number | null {
  return value === "" ? null : parseRequiredInteger(value, label);
}

async function readResponseBytes(response: Response): Promise<{
  bytes: Uint8Array<ArrayBuffer>;
  text: string;
}> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { bytes, text: new TextDecoder().decode(bytes) };
}

async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function canonicalLinks(html: string): string[] {
  return openingTags(html, "link")
    .filter((tag) =>
      (readHtmlAttribute(tag, "rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"),
    )
    .map((tag) => readHtmlAttribute(tag, "href"))
    .filter((href): href is string => href !== undefined);
}

function hasNoindexDirective(html: string, response: Response): boolean {
  if (/\bnoindex\b/i.test(response.headers.get("x-robots-tag") ?? "")) return true;
  return openingTags(html, "meta").some((tag) => {
    const name = (readHtmlAttribute(tag, "name") ?? "").toLowerCase();
    if (!["robots", "googlebot", "bingbot"].includes(name)) return false;
    return /\bnoindex\b/i.test(readHtmlAttribute(tag, "content") ?? "");
  });
}

function collectJsonLdTypes(value: unknown, types: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdTypes(item, types);
    return;
  }
  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  const schemaType = record["@type"];
  if (typeof schemaType === "string") types.add(schemaType);
  if (Array.isArray(schemaType)) {
    for (const type of schemaType) {
      if (typeof type === "string") types.add(type);
    }
  }
  for (const child of Object.values(record)) collectJsonLdTypes(child, types);
}

function jsonLdTypes(html: string, path: string): Set<string> {
  const types = new Set<string>();
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(
    (match) => (readHtmlAttribute(`<script${match[1]}>`, "type") ?? "") === "application/ld+json",
  );

  for (const script of scripts) {
    const source = script[2].trim();
    if (!source) continue;
    try {
      collectJsonLdTypes(JSON.parse(source), types);
    } catch (error) {
      throw new Error(
        `${path} JSON-LD를 파싱하지 못했습니다: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return types;
}

function collectJsonLdNodes(value: unknown, nodes: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdNodes(item, nodes);
    return;
  }
  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  if (record["@type"]) nodes.push(record);
  for (const child of Object.values(record)) collectJsonLdNodes(child, nodes);
}

function jsonLdNodes(html: string, path: string): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(
    (match) => (readHtmlAttribute(`<script${match[1]}>`, "type") ?? "") === "application/ld+json",
  );

  for (const script of scripts) {
    const source = script[2].trim();
    if (!source) continue;
    try {
      collectJsonLdNodes(JSON.parse(source), nodes);
    } catch (error) {
      throw new Error(
        `${path} JSON-LD 관계를 파싱하지 못했습니다: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return nodes;
}

function schemaTypesForNode(node: Record<string, unknown>): string[] {
  const value = node["@type"];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return [];
}

function schemaRelationTargets(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(schemaRelationTargets);
  if (value && typeof value === "object") {
    const id = (value as Record<string, unknown>)["@id"];
    return typeof id === "string" ? [id] : [];
  }
  return [];
}

function anchorHrefs(html: string): string[] {
  return openingTags(html, "a")
    .map((tag) => readHtmlAttribute(tag, "href"))
    .filter((href): href is string => href !== undefined);
}

function isHrefForPath(href: string, path: string): boolean {
  try {
    const url = new URL(href, `${siteUrl}/`);
    return url.origin === new URL(siteUrl).origin && url.pathname === path;
  } catch {
    return false;
  }
}

function hasHtmlAttribute(html: string, attribute: string): boolean {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\s${escapedAttribute}(?:\\s*=|\\s|\\/?>)`, "i").test(html);
}

function verifyHtmlPage(expectation: HtmlPageExpectation, response: Response, html: string): void {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error(`${expectation.path} Content-Type이 HTML이 아닙니다: ${contentType || "없음"}`);
  }

  const canonical = `${siteUrl}${expectation.path}`;
  const canonicals = canonicalLinks(html);
  if (canonicals.length !== 1 || canonicals[0] !== canonical) {
    throw new Error(
      `${expectation.path} canonical이 정확하지 않습니다. 기대값: ${canonical}, 실제: ${canonicals.join(", ") || "없음"}`,
    );
  }
  if (hasNoindexDirective(html, response)) {
    throw new Error(`${expectation.path}에 noindex 지시가 있습니다.`);
  }

  const h1Contents = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi)].map((match) =>
    normalizedVisibleText(match[1]),
  );
  if (h1Contents.length !== 1 || h1Contents[0] !== expectation.h1) {
    throw new Error(
      `${expectation.path} H1이 정확하지 않습니다. 기대값: "${expectation.h1}", 실제: ${JSON.stringify(h1Contents)}`,
    );
  }

  const types = jsonLdTypes(html, expectation.path);
  for (const requiredType of expectation.schemaTypes) {
    if (!types.has(requiredType)) {
      throw new Error(`${expectation.path} JSON-LD에 ${requiredType} 타입이 없습니다.`);
    }
  }
  const nodes = jsonLdNodes(html, expectation.path);
  for (const relation of expectation.schemaRelations ?? []) {
    const node = nodes.find(
      (candidate) =>
        candidate["@id"] === relation.nodeId &&
        schemaTypesForNode(candidate).includes(relation.schemaType),
    );
    if (!node) {
      throw new Error(
        `${expectation.path} JSON-LD에 ${relation.schemaType} ${relation.nodeId} 노드가 없습니다.`,
      );
    }
    const actualTargets = schemaRelationTargets(node[relation.property]).sort();
    const expectedTargets = [...relation.expectedTargets].sort();
    if (JSON.stringify(actualTargets) !== JSON.stringify(expectedTargets)) {
      throw new Error(
        `${expectation.path} JSON-LD ${relation.schemaType}.${relation.property} 관계가 화면 링크 맵과 다릅니다. 기대값: ${expectedTargets.join(", ") || "없음"}, 실제: ${actualTargets.join(", ") || "없음"}`,
      );
    }
  }

  for (const marker of expectation.markers ?? []) {
    if (!hasHtmlAttribute(html, marker)) {
      throw new Error(`${expectation.path}에 ${marker} 신뢰 마커가 없습니다.`);
    }
  }

  const visibleText = normalizedVisibleText(html);
  for (const requiredText of expectation.requiredText ?? []) {
    if (!visibleText.includes(requiredText)) {
      throw new Error(`${expectation.path}에 필수 출처 문구가 없습니다: "${requiredText}"`);
    }
  }

  const hrefs = anchorHrefs(html);
  if (
    expectation.methodologyLink &&
    !hrefs.some((href) => isHrefForPath(href, "/research/methodology"))
  ) {
    throw new Error(`${expectation.path}에 데이터 방법론 내부 링크가 없습니다.`);
  }
  for (const officialHost of expectation.officialSourceHosts ?? []) {
    const hasOfficialLink = hrefs.some((href) => {
      try {
        return new URL(href, `${siteUrl}/`).hostname.toLowerCase() === officialHost;
      } catch {
        return false;
      }
    });
    if (!hasOfficialLink) {
      throw new Error(`${expectation.path}에 ${officialHost} 공식 출처 링크가 없습니다.`);
    }
  }
  for (const requiredPath of expectation.requiredInternalPaths ?? []) {
    if (!hrefs.some((href) => isHrefForPath(href, requiredPath))) {
      throw new Error(`${expectation.path}에 ${requiredPath} 내부 링크가 없습니다.`);
    }
  }
}

function parseCliJson<T>(stdout: string): T {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Higgsfield CLI JSON 응답을 찾지 못했습니다.");
  return JSON.parse(stdout.slice(start, end + 1)) as T;
}

async function queryDatabase<T>(sql: string): Promise<QueryResult<T>> {
  const normalizedSql = sql.replace(/\s+/g, " ").trim();
  const processResult = Bun.spawn(
    [
      "higgsfield",
      "website",
      "db",
      "query",
      websiteId,
      "--sql",
      normalizedSql,
      "--json",
      "--no-color",
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    processResult.exited,
    new Response(processResult.stdout).text(),
    new Response(processResult.stderr).text(),
  ]);
  if (exitCode !== 0) {
    throw new Error(`운영 DB 조회 실패: ${stderr.trim() || `exit ${exitCode}`}`);
  }
  return parseCliJson<QueryResult<T>>(stdout);
}

async function fetchStatus(pathOrUrl: string, expected: number): Promise<Response> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${siteUrl}${pathOrUrl}`;
  let lastStatus = 0;
  const edgePropagationAttempts = 12;
  for (let attempt = 1; attempt <= edgePropagationAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "ewha-piano-release-verifier/1.0" },
      });
      lastStatus = response.status;
      if (response.status === expected) return response;
    } catch {
      lastStatus = 0;
    }
    await Bun.sleep(attempt * 1_000);
  }
  throw new Error(
    `${url} 응답이 ${expected}가 아닙니다. 마지막 상태: ${lastStatus || "연결 실패"}`,
  );
}

async function fetchAndVerifyHtmlPage(expectation: HtmlPageExpectation): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const response = await fetchStatus(
      `${expectation.path}?verify=${encodeURIComponent(`${verificationId}-${attempt}`)}`,
      200,
    );
    const html = await response.text();
    try {
      verifyHtmlPage(expectation, response, html);
      return;
    } catch (error) {
      lastError = error;
    }
    await Bun.sleep(attempt * 1_000);
  }

  throw new Error(
    `${expectation.path} 운영 HTML이 배포 전파 재확인 후에도 일치하지 않습니다: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

const healthResult = await queryDatabase<HealthRow>(`
  SELECT
    (SELECT COUNT(*) FROM posts WHERE status = 'published') AS published_count,
    (SELECT COUNT(*) FROM posts WHERE status = 'draft') AS draft_count,
    (SELECT COUNT(*) FROM categories) AS category_count,
    (SELECT COUNT(DISTINCT category_id) FROM posts WHERE status = 'published') AS public_category_count,
    (SELECT COUNT(*) FROM posts WHERE status = 'published' AND published_at IS NULL) AS invalid_public_count,
    (SELECT COUNT(*) FROM post_keyword_evidence) AS evidence_count
`);
const health = healthResult.rows[0];
if (!health || healthResult.row_count !== 1)
  throw new Error("운영 DB 상태 행을 확인하지 못했습니다.");
if (health.published_count < 1) throw new Error("운영 DB에 공개 글이 없습니다.");
if (health.invalid_public_count !== 0) {
  throw new Error(`published_at이 없는 공개 글이 ${health.invalid_public_count}건 있습니다.`);
}
if (health.category_count !== BLOG_CATEGORY_SLUGS.length) {
  throw new Error(
    `CMS 카테고리 수가 ${health.category_count}개입니다. 기대값: ${BLOG_CATEGORY_SLUGS.length}`,
  );
}

const draftResult = await queryDatabase<DraftRow>(`
  SELECT '/blog/' || c.slug || '/' || p.slug AS path
  FROM posts p INNER JOIN categories c ON c.id = p.category_id
  WHERE p.status = 'draft'
  ORDER BY p.id
`);
const draftPaths = draftResult.rows.map((row) => row.path);

const publicPostResult = await queryDatabase<PublicPostRow>(`
  SELECT
    '/blog/' || c.slug || '/' || p.slug AS path,
    p.title,
    p.slug,
    p.keyword_cluster
  FROM posts p INNER JOIN categories c ON c.id = p.category_id
  WHERE p.status = 'published' AND p.published_at IS NOT NULL
  ORDER BY p.id
`);
if (
  publicPostResult.row_count !== health.published_count ||
  publicPostResult.rows.length !== health.published_count
) {
  throw new Error(
    `공개 글 HTML 검증 대상이 ${publicPostResult.rows.length}건입니다. 운영 DB 기대값: ${health.published_count}`,
  );
}
const publicPostHtmlPages: readonly HtmlPageExpectation[] = publicPostResult.rows.map((post) => {
  if (!KEYWORD_CLUSTERS.includes(post.keyword_cluster as KeywordCluster)) {
    throw new Error(`${post.path}의 키워드 클러스터가 유효하지 않습니다: ${post.keyword_cluster}`);
  }
  const servicePaths = getServicePagesForPost(
    post.keyword_cluster as KeywordCluster,
    post.slug,
  ).map((page) => page.path);
  return {
    path: post.path,
    h1: post.title,
    schemaTypes: ["BlogPosting", "BreadcrumbList"],
    requiredInternalPaths: ["/about", ...servicePaths],
    schemaRelations: [
      {
        nodeId: `${siteUrl}${post.path}#article`,
        schemaType: "BlogPosting",
        property: "about",
        expectedTargets: servicePaths.map((path) => `${siteUrl}${path}#service`),
      },
    ],
  };
});
const verifiedHtmlPages = [...coreHtmlPages, ...publicPostHtmlPages];

const cacheBuster = `verify=${encodeURIComponent(verificationId)}`;
const [, sitemapResponse, robotsResponse, rssResponse, llmsResponse] = await Promise.all([
  Promise.all(verifiedHtmlPages.map((page) => fetchAndVerifyHtmlPage(page))),
  fetchStatus(`/sitemap.xml?${cacheBuster}`, 200),
  fetchStatus(`/robots.txt?${cacheBuster}`, 200),
  fetchStatus(`/rss.xml?${cacheBuster}`, 200),
  fetchStatus(`/llms.txt?${cacheBuster}`, 200),
]);

const [sitemap, robots, rss, llms] = await Promise.all([
  sitemapResponse.text(),
  robotsResponse.text(),
  rssResponse.text(),
  llmsResponse.text(),
]);
const [
  nationalCsvResponse,
  seoulRecordsResponse,
  seoulSummaryResponse,
  sourceManifestResponse,
  nationalMetadataResponse,
  seoulMetadataResponse,
  nationalSchemaResponse,
  seoulSchemaResponse,
  searchDemandCsvResponse,
  searchDemandSummaryResponse,
  searchDemandMetadataResponse,
  searchDemandSchemaResponse,
  searchDemandManifestResponse,
  levelRoadmapResponse,
  practicePlannerTemplateResponse,
] = await Promise.all([
  fetchStatus(RESEARCH_DOWNLOADS.nationalCsv, 200),
  fetchStatus(RESEARCH_DOWNLOADS.seoulRecordsCsv, 200),
  fetchStatus(RESEARCH_DOWNLOADS.seoulSummaryCsv, 200),
  fetchStatus(RESEARCH_DOWNLOADS.sourceManifest, 200),
  fetchStatus(RESEARCH_DOWNLOADS.nationalMetadata, 200),
  fetchStatus(RESEARCH_DOWNLOADS.seoulMetadata, 200),
  fetchStatus(RESEARCH_DOWNLOADS.nationalSchema, 200),
  fetchStatus(RESEARCH_DOWNLOADS.seoulSchema, 200),
  fetchStatus(`${RESEARCH_DOWNLOADS.searchDemandCsv}?${cacheBuster}`, 200),
  fetchStatus(`${RESEARCH_DOWNLOADS.searchDemandSummaryCsv}?${cacheBuster}`, 200),
  fetchStatus(`${RESEARCH_DOWNLOADS.searchDemandMetadata}?${cacheBuster}`, 200),
  fetchStatus(`${RESEARCH_DOWNLOADS.searchDemandSchema}?${cacheBuster}`, 200),
  fetchStatus(`${RESEARCH_DOWNLOADS.searchDemandManifest}?${cacheBuster}`, 200),
  fetchStatus(`${resourceDownloads.levelRoadmapCsv}?${cacheBuster}`, 200),
  fetchStatus(`${resourceDownloads.practicePlannerTemplateCsv}?${cacheBuster}`, 200),
]);
const [
  nationalCsv,
  seoulRecordsCsv,
  seoulSummaryCsv,
  sourceManifestText,
  nationalMetadataText,
  seoulMetadataText,
  nationalSchemaText,
  seoulSchemaText,
  searchDemandCsvAsset,
  searchDemandSummaryAsset,
  searchDemandMetadataText,
  searchDemandSchemaText,
  searchDemandManifestText,
  levelRoadmapAsset,
  practicePlannerTemplateAsset,
] = await Promise.all([
  nationalCsvResponse.text(),
  seoulRecordsResponse.text(),
  seoulSummaryResponse.text(),
  sourceManifestResponse.text(),
  nationalMetadataResponse.text(),
  seoulMetadataResponse.text(),
  nationalSchemaResponse.text(),
  seoulSchemaResponse.text(),
  readResponseBytes(searchDemandCsvResponse),
  readResponseBytes(searchDemandSummaryResponse),
  searchDemandMetadataResponse.text(),
  searchDemandSchemaResponse.text(),
  searchDemandManifestResponse.text(),
  readResponseBytes(levelRoadmapResponse),
  readResponseBytes(practicePlannerTemplateResponse),
]);
if (!nationalCsv.replace(/^\uFEFF/, "").startsWith("reference_year,school_level,category")) {
  throw new Error("음악 사교육비 CSV 헤더가 예상과 다릅니다.");
}
if (!seoulRecordsCsv.replace(/^\uFEFF/, "").startsWith("facility_type,district,realm")) {
  throw new Error("서울 피아노 교습상품 CSV 헤더가 예상과 다릅니다.");
}
if (
  /전화|주소|성명|학원명|교습소명|source_file_id|source_sheet|source_row|facility_id/.test(
    seoulRecordsCsv.split(/\r?\n/, 1)[0],
  )
) {
  throw new Error(
    "서울 피아노 교습상품 CSV 헤더에 직접 식별 또는 원자료 위치 필드가 포함되었습니다.",
  );
}
if (!seoulSummaryCsv.replace(/^\uFEFF/, "").startsWith("group_level,area,facility_type")) {
  throw new Error("서울 피아노 요약 CSV 헤더가 예상과 다릅니다.");
}
const sourceManifest = JSON.parse(sourceManifestText) as {
  sources?: { sourceId?: string; sha256?: string }[];
};
const nationalMetadata = JSON.parse(nationalMetadataText) as {
  datasetId?: string;
  source?: { sha256?: string };
};
const seoulMetadata = JSON.parse(seoulMetadataText) as {
  datasetId?: string;
  publishedRecords?: number;
  sourceManifestPath?: string;
};
const nationalSchema = JSON.parse(nationalSchemaText) as {
  datasetId?: string;
  tables?: { fieldCount?: number; fields?: unknown[] }[];
};
const seoulSchema = JSON.parse(seoulSchemaText) as {
  datasetId?: string;
  tables?: { fieldCount?: number; fields?: unknown[] }[];
};
const searchDemandMetadata = JSON.parse(searchDemandMetadataText) as {
  datasetId?: string;
  datasetVersion?: string;
  uniqueKeywords?: number;
  naverMeasuredKeywords?: number;
  totalSearchVolumeSum?: number;
  naverSearchVolumeSum?: number;
  googleMonthlyAverageSum?: number;
  segments?: {
    segmentId?: string;
    dataRows?: number;
    totalSearchVolumeSum?: number | null;
    naverSearchVolumeSum?: number | null;
    googleMonthlyAverageSum?: number | null;
  }[];
  sourceWorkbook?: {
    bytes?: number;
    sha256?: string;
    manifestPath?: string;
  };
  dataDictionaryPath?: string;
  distributions?: {
    title?: string;
    contentUrl?: string;
    encodingFormat?: string;
    bytes?: number;
    sha256?: string;
    rowCount?: number;
    fieldCount?: number;
  }[];
};
const searchDemandSchema = JSON.parse(searchDemandSchemaText) as {
  datasetId?: string;
  datasetVersion?: string;
  tables?: {
    name?: string;
    csvPath?: string;
    fieldCount?: number;
    fields?: { name?: string }[];
  }[];
};
const searchDemandManifest = JSON.parse(searchDemandManifestText) as {
  manifestVersion?: string;
  datasetId?: string;
  source?: {
    originalName?: string;
    bytes?: number;
    sha256?: string;
    publiclyRedistributed?: boolean;
  };
};
if (sourceManifest.sources?.length !== 12) {
  throw new Error("원자료 매니페스트의 파일 수가 12개가 아닙니다.");
}
if (!sourceManifest.sources.every((source) => /^[a-f0-9]{64}$/.test(source.sha256 ?? ""))) {
  throw new Error("원자료 매니페스트에 유효하지 않은 SHA-256이 있습니다.");
}
if (
  nationalMetadata.datasetId !== "korea-music-private-education-spending-2025" ||
  !/^[a-f0-9]{64}$/.test(nationalMetadata.source?.sha256 ?? "")
) {
  throw new Error("음악 사교육비 메타데이터가 예상과 다릅니다.");
}
if (
  seoulMetadata.datasetId !== "seoul-piano-registered-fees-2026-01-01" ||
  !seoulMetadata.publishedRecords ||
  seoulMetadata.sourceManifestPath !== RESEARCH_DOWNLOADS.sourceManifest
) {
  throw new Error("서울 피아노 교습비 메타데이터가 예상과 다릅니다.");
}
if (
  nationalSchema.datasetId !== "korea-music-private-education-spending-2025" ||
  nationalSchema.tables?.length !== 1 ||
  nationalSchema.tables[0].fieldCount !== 7 ||
  nationalSchema.tables[0].fields?.length !== 7
) {
  throw new Error("음악 사교육비 CSV 데이터 사전이 예상과 다릅니다.");
}
if (
  seoulSchema.datasetId !== "seoul-piano-registered-fees-2026-01-01" ||
  seoulSchema.tables?.length !== 2 ||
  seoulSchema.tables[0].fieldCount !== 14 ||
  seoulSchema.tables[0].fields?.length !== 14 ||
  seoulSchema.tables[1].fieldCount !== 21 ||
  seoulSchema.tables[1].fields?.length !== 21
) {
  throw new Error("서울 피아노 교습비 CSV 데이터 사전이 예상과 다릅니다.");
}

if (
  searchDemandMetadata.datasetId !== "ewha-piano-search-demand-2026" ||
  searchDemandMetadata.datasetVersion !== "1.0.0" ||
  searchDemandMetadata.uniqueKeywords !== 4_545 ||
  searchDemandMetadata.naverMeasuredKeywords !== 4_522 ||
  searchDemandMetadata.totalSearchVolumeSum !== 1_001_925 ||
  searchDemandMetadata.naverSearchVolumeSum !== 593_235 ||
  searchDemandMetadata.googleMonthlyAverageSum !== 408_690 ||
  searchDemandMetadata.segments?.length !== 7 ||
  searchDemandMetadata.dataDictionaryPath !== RESEARCH_DOWNLOADS.searchDemandSchema ||
  searchDemandMetadata.sourceWorkbook?.manifestPath !== RESEARCH_DOWNLOADS.searchDemandManifest ||
  !/^[a-f0-9]{64}$/.test(searchDemandMetadata.sourceWorkbook.sha256 ?? "")
) {
  throw new Error("피아노 검색수요 메타데이터의 버전·행 수·합계 또는 연결 경로가 예상과 다릅니다.");
}

if (
  searchDemandSchema.datasetId !== searchDemandMetadata.datasetId ||
  searchDemandSchema.datasetVersion !== searchDemandMetadata.datasetVersion ||
  searchDemandSchema.tables?.length !== 2
) {
  throw new Error("피아노 검색수요 CSV 데이터 사전의 데이터셋 식별자가 예상과 다릅니다.");
}
const searchDemandTable = searchDemandSchema.tables[0];
const searchDemandSummaryTable = searchDemandSchema.tables[1];
if (
  searchDemandTable.name !== "keyword_search_demand" ||
  searchDemandTable.csvPath !== RESEARCH_DOWNLOADS.searchDemandCsv ||
  searchDemandTable.fieldCount !== searchDemandExpectedHeader.length ||
  JSON.stringify(searchDemandTable.fields?.map((field) => field.name)) !==
    JSON.stringify(searchDemandExpectedHeader) ||
  searchDemandSummaryTable.name !== "segment_summary" ||
  searchDemandSummaryTable.csvPath !== RESEARCH_DOWNLOADS.searchDemandSummaryCsv ||
  searchDemandSummaryTable.fieldCount !== searchDemandSummaryExpectedHeader.length ||
  JSON.stringify(searchDemandSummaryTable.fields?.map((field) => field.name)) !==
    JSON.stringify(searchDemandSummaryExpectedHeader)
) {
  throw new Error("피아노 검색수요 CSV 데이터 사전의 표·필드 정의가 예상과 다릅니다.");
}

if (
  searchDemandManifest.manifestVersion !== "1.0.0" ||
  searchDemandManifest.datasetId !== searchDemandMetadata.datasetId ||
  searchDemandManifest.source?.originalName !== "피아노_키워드_최종완전판.xlsx" ||
  searchDemandManifest.source.bytes !== searchDemandMetadata.sourceWorkbook.bytes ||
  searchDemandManifest.source.sha256 !== searchDemandMetadata.sourceWorkbook.sha256 ||
  searchDemandManifest.source.publiclyRedistributed !== false
) {
  throw new Error("피아노 검색수요 원본 매니페스트의 파일·해시·재배포 상태가 예상과 다릅니다.");
}

const searchDemandRows = verifyCsvShape(
  "피아노 검색수요",
  searchDemandCsvAsset.text,
  searchDemandExpectedHeader,
  searchDemandMetadata.uniqueKeywords,
);
const keywordColumn = searchDemandExpectedHeader.indexOf("keyword");
const totalVolumeColumn = searchDemandExpectedHeader.indexOf("total_search_volume");
const naverTotalColumn = searchDemandExpectedHeader.indexOf("naver_total");
const googleAverageColumn = searchDemandExpectedHeader.indexOf("google_monthly_average");
const searchDemandComputed = searchDemandRows.reduce(
  (result, row, index) => {
    const naverValue = parseNullableInteger(
      row[naverTotalColumn],
      `피아노 검색수요 ${index + 2}행 네이버 검색량`,
    );
    const googleValue = parseNullableInteger(
      row[googleAverageColumn],
      `피아노 검색수요 ${index + 2}행 구글 월평균`,
    );
    result.keywords.add(row[keywordColumn]);
    result.total += parseRequiredInteger(
      row[totalVolumeColumn],
      `피아노 검색수요 ${index + 2}행 참고 합계`,
    );
    if (naverValue !== null) {
      result.naverMeasured += 1;
      result.naver += naverValue;
    }
    if (googleValue !== null) result.google += googleValue;
    return result;
  },
  {
    keywords: new Set<string>(),
    total: 0,
    naverMeasured: 0,
    naver: 0,
    google: 0,
  },
);
if (
  searchDemandComputed.keywords.size !== searchDemandMetadata.uniqueKeywords ||
  searchDemandComputed.total !== searchDemandMetadata.totalSearchVolumeSum ||
  searchDemandComputed.naverMeasured !== searchDemandMetadata.naverMeasuredKeywords ||
  searchDemandComputed.naver !== searchDemandMetadata.naverSearchVolumeSum ||
  searchDemandComputed.google !== searchDemandMetadata.googleMonthlyAverageSum
) {
  throw new Error("피아노 검색수요 CSV의 고유 키워드·플랫폼별 합계가 메타데이터와 다릅니다.");
}

const searchDemandSummaryRows = verifyCsvShape(
  "피아노 검색수요 세그먼트 요약",
  searchDemandSummaryAsset.text,
  searchDemandSummaryExpectedHeader,
  searchDemandMetadata.segments.length,
);
for (const [index, row] of searchDemandSummaryRows.entries()) {
  const segment = searchDemandMetadata.segments.find((item) => item.segmentId === row[1]);
  if (
    !segment ||
    segment.dataRows !== parseRequiredInteger(row[2], `세그먼트 요약 ${index + 2}행 행 수`) ||
    segment.totalSearchVolumeSum !==
      parseNullableInteger(row[4], `세그먼트 요약 ${index + 2}행 참고 합계`) ||
    segment.naverSearchVolumeSum !==
      parseNullableInteger(row[5], `세그먼트 요약 ${index + 2}행 네이버 합계`) ||
    segment.googleMonthlyAverageSum !==
      parseNullableInteger(row[6], `세그먼트 요약 ${index + 2}행 구글 합계`)
  ) {
    throw new Error(`피아노 검색수요 세그먼트 요약 ${index + 2}행이 메타데이터와 다릅니다.`);
  }
}

const searchDemandDistribution = searchDemandMetadata.distributions?.find(
  (distribution) => distribution.contentUrl === RESEARCH_DOWNLOADS.searchDemandCsv,
);
const searchDemandSummaryDistribution = searchDemandMetadata.distributions?.find(
  (distribution) => distribution.contentUrl === RESEARCH_DOWNLOADS.searchDemandSummaryCsv,
);
if (
  searchDemandMetadata.distributions?.length !== 2 ||
  searchDemandDistribution?.encodingFormat !== "text/csv" ||
  searchDemandDistribution.rowCount !== searchDemandMetadata.uniqueKeywords ||
  searchDemandDistribution.fieldCount !== searchDemandExpectedHeader.length ||
  searchDemandDistribution.bytes !== searchDemandCsvAsset.bytes.byteLength ||
  !/^[a-f0-9]{64}$/.test(searchDemandDistribution.sha256 ?? "") ||
  searchDemandDistribution.sha256 !== (await sha256Hex(searchDemandCsvAsset.bytes)) ||
  searchDemandSummaryDistribution?.encodingFormat !== "text/csv" ||
  searchDemandSummaryDistribution.rowCount !== searchDemandMetadata.segments.length ||
  searchDemandSummaryDistribution.fieldCount !== searchDemandSummaryExpectedHeader.length ||
  searchDemandSummaryDistribution.bytes !== searchDemandSummaryAsset.bytes.byteLength ||
  !/^[a-f0-9]{64}$/.test(searchDemandSummaryDistribution.sha256 ?? "") ||
  searchDemandSummaryDistribution.sha256 !== (await sha256Hex(searchDemandSummaryAsset.bytes))
) {
  throw new Error("피아노 검색수요 CSV의 파일 크기·행·필드·SHA-256이 메타데이터와 다릅니다.");
}

const levelRoadmapRows = verifyCsvShape(
  "피아노 수준별 로드맵",
  levelRoadmapAsset.text,
  levelRoadmapExpectedHeader,
  5,
);
const practicePlannerRows = verifyCsvShape(
  "피아노 연습 플래너 템플릿",
  practicePlannerTemplateAsset.text,
  practicePlannerExpectedHeader,
  7,
);
if (
  levelRoadmapRows.map((row) => row[0]).join(",") !== "Level 1,Level 2,Level 3,Level 4,Level 5" ||
  practicePlannerRows.map((row) => row[0]).join(",") !==
    "월요일,화요일,수요일,목요일,금요일,토요일,일요일" ||
  (await sha256Hex(levelRoadmapAsset.bytes)) !==
    "e4318c63cc304f7be7c9af6f57d7e08b626f34769482c84250f41fbfc5954f7f" ||
  (await sha256Hex(practicePlannerTemplateAsset.bytes)) !==
    "bedff3a679f733705502c908977c683e482e341df7abf03e782e30fed9bab94e"
) {
  throw new Error("피아노 학습 자료 CSV의 단계·요일 또는 SHA-256이 예상과 다릅니다.");
}

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapUrls = new Set(sitemapUrls);
const expectedSitemapUrls =
  PUBLIC_PAGES.length + health.public_category_count + health.published_count;

if (sitemapUrls.length !== expectedSitemapUrls) {
  throw new Error(
    `사이트맵 URL이 ${sitemapUrls.length}개입니다. DB·정적 페이지 기준 기대값: ${expectedSitemapUrls}`,
  );
}
if (uniqueSitemapUrls.size !== sitemapUrls.length)
  throw new Error("사이트맵에 중복 URL이 있습니다.");
if (![...uniqueSitemapUrls].every((url) => url.startsWith(`${siteUrl}/`) || url === siteUrl)) {
  throw new Error("사이트맵에 다른 호스트 또는 HTTP URL이 포함되어 있습니다.");
}
for (const page of PUBLIC_PAGES) {
  const canonical = `${siteUrl}${page.path}`;
  if (!uniqueSitemapUrls.has(canonical)) {
    throw new Error(`사이트맵에 정적 공개 페이지 canonical이 없습니다: ${canonical}`);
  }
}
if (!robots.includes(`${siteUrl}/sitemap.xml`)) {
  throw new Error("robots.txt에 정식 사이트맵 주소가 없습니다.");
}

const llmsDestinations = new Set(
  [...llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]),
);
for (const path of requiredResearchPaths) {
  const canonical = `${siteUrl}${path}`;
  if (!llmsDestinations.has(canonical)) {
    throw new Error(`llms.txt에 연구 페이지 주소가 없습니다: ${canonical}`);
  }
}

for (const path of draftPaths) {
  if (sitemap.includes(path) || rss.includes(path) || llms.includes(path)) {
    throw new Error(`비공개 초안이 검색 피드에 노출되었습니다: ${path}`);
  }
}

const verifiedHtmlUrls = new Set(verifiedHtmlPages.map((page) => `${siteUrl}${page.path}`));
await Promise.all([
  ...sitemapUrls.filter((url) => !verifiedHtmlUrls.has(url)).map((url) => fetchStatus(url, 200)),
  ...draftPaths.map((path) => fetchStatus(`${path}?${cacheBuster}`, 404)),
]);

console.log(
  JSON.stringify({
    site: siteUrl,
    publishedPosts: health.published_count,
    draftPosts: health.draft_count,
    keywordEvidence: health.evidence_count,
    categories: health.category_count,
    sitemapUrls: sitemapUrls.length,
    checkedPublicUrls: sitemapUrls.length,
    blockedDraftUrls: draftPaths.length,
    endpoints: ["blog", "sitemap", "robots", "rss", "llms"],
    verifiedCoreHtmlPages: verifiedHtmlPages.length,
    verifiedPublishedArticlePages: publicPostHtmlPages.length,
    verifiedStaticCanonicalUrls: PUBLIC_PAGES.length,
    verifiedResearchLlmsUrls: requiredResearchPaths.length,
    verifiedPageAuthorityPages: verifiedHtmlPages.filter((page) =>
      page.markers?.includes("data-page-authority"),
    ).length,
    verifiedResearchAuthorityPages: verifiedHtmlPages.filter(
      (page) =>
        page.markers?.includes("data-research-authorship") ||
        page.markers?.includes("data-research-citation"),
    ).length,
    researchDownloads: 13,
    resourceDownloads: 2,
  }),
);
