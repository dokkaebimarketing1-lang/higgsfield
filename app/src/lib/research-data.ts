import nationalMetadataJson from "../data/research/national-music-private-education.json";
import seoulMetadataJson from "../data/research/seoul-piano-fees.json";
import sourceManifestJson from "../data/research/source-manifest.json";
import { SITE, SITE_URL } from "./content";

export type FacilityType = "academy" | "teaching_center";

export type ResearchSummaryRow = {
  group_level: "seoul" | "district";
  area: string;
  facility_type: FacilityType;
  candidate_records: number;
  facility_count: number;
  valid_tuition_records: number;
  tuition_coverage_pct: number;
  registered_tuition_median_krw: number | null;
  registered_tuition_q1_krw: number | null;
  registered_tuition_q3_krw: number | null;
  registered_tuition_note: string;
  valid_hourly_records: number;
  hourly_tuition_median_krw: number | null;
  hourly_tuition_q1_krw: number | null;
  hourly_tuition_q3_krw: number | null;
  hourly_tuition_note: string;
  explicit_one_month_records: number;
  explicit_one_month_median_krw: number | null;
  explicit_one_month_q1_krw: number | null;
  explicit_one_month_q3_krw: number | null;
  explicit_one_month_note: string;
};

export type ResearchSource = {
  sourceId: string;
  originalName: string;
  format: string;
  bytes: number;
  sha256: string;
  retrievedAt: string;
  referenceDate: string;
  sourcePage: string;
  downloadUrl: string;
  kind: "official-statistics-pdf" | "official-administrative-xls";
};

type SeoulMetadata = Omit<typeof seoulMetadataJson, "seoulSummary" | "districtSummary"> & {
  seoulSummary: ResearchSummaryRow[];
  districtSummary: ResearchSummaryRow[];
  datasetVersion?: string;
  datasetPublishedAt?: string;
  modifiedAt?: string;
};

type SourceManifest = Omit<typeof sourceManifestJson, "sources"> & {
  sources: ResearchSource[];
};

type NationalMetadata = typeof nationalMetadataJson & {
  datasetVersion?: string;
  sourcePublishedAt?: string;
  datasetPublishedAt?: string;
  modifiedAt?: string;
};

export const SEOUL_PIANO_FEES = seoulMetadataJson as SeoulMetadata;
export const NATIONAL_MUSIC_EDUCATION = nationalMetadataJson as NationalMetadata;
export const RESEARCH_SOURCE_MANIFEST = sourceManifestJson as SourceManifest;
export const SEOUL_ADMINISTRATIVE_SOURCES = RESEARCH_SOURCE_MANIFEST.sources.filter(
  (source) => source.kind === "official-administrative-xls",
);
export const NATIONAL_PDF_SOURCE = RESEARCH_SOURCE_MANIFEST.sources.find(
  (source) => source.sourceId === "moe-2025-private-education-survey",
)!;

export const RESEARCH_DOWNLOADS = {
  nationalCsv: "/data/research/national-music-private-education-2025.csv",
  seoulRecordsCsv: "/data/research/seoul-piano-fee-records-2026-01-01.csv",
  seoulSummaryCsv: "/data/research/seoul-piano-fee-summary-2026-01-01.csv",
  sourceManifest: SEOUL_PIANO_FEES.sourceManifestPath,
  seoulMetadata: "/data/research/seoul-piano-fees-metadata.json",
  nationalMetadata: "/data/research/national-music-private-education-metadata.json",
  nationalSchema:
    NATIONAL_MUSIC_EDUCATION.dataDictionaryPath ??
    "/data/research/national-music-private-education-schema.json",
  seoulSchema: SEOUL_PIANO_FEES.dataDictionaryPath ?? "/data/research/seoul-piano-fees-schema.json",
} as const;

const numberFormatter = new Intl.NumberFormat("ko-KR");

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "자료 없음" : numberFormatter.format(value);
}

export function formatKrw(value: number | null | undefined): string {
  return value === null || value === undefined ? "자료 없음" : `${formatNumber(value)}원`;
}

export function formatEokKrw(value: number): string {
  const trillion = Math.floor(value / 10_000);
  const eok = value % 10_000;
  return trillion > 0 ? `${trillion}조 ${formatNumber(eok)}억 원` : `${formatNumber(eok)}억 원`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function facilityTypeLabel(type: FacilityType): string {
  return type === "academy" ? "학원" : "교습소";
}

const publisher = {
  "@id": `${SITE_URL}/#business`,
};

export const RESEARCH_CATALOG_ID = `${SITE_URL}/research#catalog`;
export const NATIONAL_DATASET_URL = `${SITE_URL}/research/2025-music-private-education-statistics`;
export const SEOUL_DATASET_URL = `${SITE_URL}/research/2026-seoul-piano-academy-fees`;
export const RESEARCH_METHOD_URL = `${SITE_URL}/research/methodology`;
export const NATIONAL_DATASET_VERSION = NATIONAL_MUSIC_EDUCATION.datasetVersion ?? "1.0.0";
export const SEOUL_DATASET_VERSION =
  SEOUL_PIANO_FEES.datasetVersion ?? SEOUL_PIANO_FEES.pipelineVersion;
export const NATIONAL_DATASET_PUBLISHED_AT =
  NATIONAL_MUSIC_EDUCATION.datasetPublishedAt ?? NATIONAL_MUSIC_EDUCATION.retrievedAt;
export const NATIONAL_DATASET_MODIFIED_AT =
  NATIONAL_MUSIC_EDUCATION.modifiedAt ?? NATIONAL_MUSIC_EDUCATION.retrievedAt;
export const SEOUL_DATASET_PUBLISHED_AT =
  SEOUL_PIANO_FEES.datasetPublishedAt ?? SEOUL_PIANO_FEES.retrievedAt;
export const SEOUL_DATASET_MODIFIED_AT =
  SEOUL_PIANO_FEES.modifiedAt ?? SEOUL_PIANO_FEES.retrievedAt;

export const NATIONAL_DATASET_CITATION =
  `${SITE.brand} (${NATIONAL_DATASET_PUBLISHED_AT.slice(0, 4)}). ` +
  `${NATIONAL_MUSIC_EDUCATION.name} (버전 ${NATIONAL_DATASET_VERSION}). ` +
  `교육부·국가데이터처 2025년 초중고 사교육비 조사 기반. ${NATIONAL_DATASET_URL}`;

export const SEOUL_DATASET_CITATION =
  `${SITE.brand} (${SEOUL_DATASET_PUBLISHED_AT.slice(0, 4)}). ` +
  `${SEOUL_PIANO_FEES.name} (버전 ${SEOUL_DATASET_VERSION}). ` +
  `서울특별시교육청 공개자료 기반. ${SEOUL_DATASET_URL}`;

function buildDataDownload(distribution: {
  title: string;
  contentUrl: string;
  encodingFormat: string;
  bytes: number;
  sha256: string;
  rowCount: number;
  fieldCount: number;
}) {
  return {
    "@type": "DataDownload",
    name: distribution.title,
    description: `${formatNumber(distribution.rowCount)}개 데이터 행, ${formatNumber(distribution.fieldCount)}개 필드`,
    contentUrl: `${SITE_URL}${distribution.contentUrl}`,
    encodingFormat: distribution.encodingFormat,
    contentSize: `${formatNumber(distribution.bytes)} B`,
    sha256: distribution.sha256,
  };
}

const nationalOfficialReport = {
  "@type": "Report",
  "@id": `${NATIONAL_PDF_SOURCE.sourcePage}#report`,
  name: NATIONAL_PDF_SOURCE.originalName,
  url: NATIONAL_PDF_SOURCE.sourcePage,
  datePublished: NATIONAL_MUSIC_EDUCATION.sourcePublishedAt ?? NATIONAL_MUSIC_EDUCATION.publishedAt,
  publisher: [
    { "@type": "Organization", name: "교육부", url: "https://www.moe.go.kr/" },
    { "@type": "Organization", name: "국가데이터처", url: "https://www.kostat.go.kr/" },
  ],
  license: NATIONAL_PDF_SOURCE.sourcePage,
};

const seoulOfficialDataset = {
  "@type": "Dataset",
  "@id": "https://www.data.go.kr/data/3044370/fileData.do#dataset",
  name: "서울특별시교육청 학원·교습소 교습비 공개자료",
  url: "https://www.data.go.kr/data/3044370/fileData.do",
  creator: {
    "@type": "GovernmentOrganization",
    name: "서울특별시교육청",
    url: "https://www.sen.go.kr/",
  },
  license: "https://www.data.go.kr/data/3044370/fileData.do",
};

export function buildResearchDataCatalogSchema() {
  return {
    "@type": "DataCatalog",
    "@id": RESEARCH_CATALOG_ID,
    name: "이화 피아노 통계 자료실",
    description:
      "공식 국가통계와 행정자료 기반 피아노 파생 데이터, 가공 CSV, 방법론과 한계를 제공하는 데이터 카탈로그",
    url: `${SITE_URL}/research`,
    publisher,
    datePublished: NATIONAL_DATASET_PUBLISHED_AT,
    dateModified:
      NATIONAL_DATASET_MODIFIED_AT > SEOUL_DATASET_MODIFIED_AT
        ? NATIONAL_DATASET_MODIFIED_AT
        : SEOUL_DATASET_MODIFIED_AT,
    inLanguage: "ko",
    dataset: [
      { "@id": `${NATIONAL_DATASET_URL}#dataset` },
      { "@id": `${SEOUL_DATASET_URL}#dataset` },
    ],
  };
}

export function buildNationalMusicDatasetSchema() {
  const pageUrl = NATIONAL_DATASET_URL;
  return {
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: NATIONAL_MUSIC_EDUCATION.name,
    description: NATIONAL_MUSIC_EDUCATION.description,
    url: pageUrl,
    identifier: NATIONAL_MUSIC_EDUCATION.datasetId,
    version: NATIONAL_DATASET_VERSION,
    keywords: ["음악 사교육비", "2025 초중고 사교육비 조사", "교육부 사교육비 통계"],
    isAccessibleForFree: true,
    creator: publisher,
    publisher,
    datePublished: NATIONAL_DATASET_PUBLISHED_AT,
    dateModified: NATIONAL_DATASET_MODIFIED_AT,
    temporalCoverage: "2025",
    spatialCoverage: { "@type": "Place", name: "대한민국" },
    inLanguage: "ko",
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    isBasedOn: nationalOfficialReport,
    citation: [
      nationalOfficialReport,
      {
        "@type": "Dataset",
        name: "KOSIS 학교급 및 특성별 사교육비 총액 통계표",
        url: "https://kosis.kr/statHtml/statHtml.do?conn_path=I2&orgId=101&tblId=DT_1PE003",
      },
    ],
    creditText: NATIONAL_DATASET_CITATION,
    publishingPrinciples: RESEARCH_METHOD_URL,
    usageInfo: `${RESEARCH_METHOD_URL}#reuse-policy`,
    measurementTechnique:
      "교육부·국가데이터처 초중고 사교육비 표본조사의 음악 과목 총액 표를 단위와 학교급을 유지해 전사",
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "음악 사교육비 총액",
        unitText: "억원",
      },
      { "@type": "PropertyValue", name: "학교급", value: "전체·초등학교·중학교·고등학교" },
    ],
    distribution: NATIONAL_MUSIC_EDUCATION.distributions.map(buildDataDownload),
    subjectOf: [
      { "@type": "WebPage", "@id": `${RESEARCH_METHOD_URL}#webpage`, url: RESEARCH_METHOD_URL },
      {
        "@type": "DataDownload",
        name: "음악 사교육비 데이터셋 메타데이터",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.nationalMetadata}`,
        encodingFormat: "application/json",
      },
      {
        "@type": "DataDownload",
        name: "음악 사교육비 CSV 데이터 사전",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.nationalSchema}`,
        encodingFormat: "application/json",
      },
    ],
    includedInDataCatalog: { "@id": RESEARCH_CATALOG_ID },
  };
}

export function buildSeoulPianoFeesDatasetSchema() {
  const pageUrl = SEOUL_DATASET_URL;
  return {
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: SEOUL_PIANO_FEES.name,
    description: SEOUL_PIANO_FEES.description,
    url: pageUrl,
    identifier: SEOUL_PIANO_FEES.datasetId,
    version: SEOUL_DATASET_VERSION,
    keywords: ["서울 피아노 학원비", "피아노 교습비", "학원 교습소", "등록 교습비"],
    isAccessibleForFree: true,
    creator: publisher,
    publisher,
    datePublished: SEOUL_DATASET_PUBLISHED_AT,
    dateModified: SEOUL_DATASET_MODIFIED_AT,
    temporalCoverage: SEOUL_PIANO_FEES.referenceDate,
    spatialCoverage: { "@type": "Place", name: "서울특별시" },
    inLanguage: "ko",
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    isBasedOn: seoulOfficialDataset,
    citation: [seoulOfficialDataset],
    creditText: SEOUL_DATASET_CITATION,
    publishingPrinciples: RESEARCH_METHOD_URL,
    measurementTechnique:
      "서울특별시교육청 원자료 전체 시트에서 피아노 명시 교습상품을 필터링하고 중복 제거·직접 식별정보와 원자료 행 위치를 제외한 뒤 중앙값과 사분위수를 계산",
    variableMeasured: [
      { "@type": "PropertyValue", name: "시설 유형", value: "학원·교습소" },
      { "@type": "PropertyValue", name: "자치구" },
      { "@type": "PropertyValue", name: "등록 교습비", unitText: "KRW" },
      { "@type": "PropertyValue", name: "총 교습시간", unitText: "분" },
      { "@type": "PropertyValue", name: "시간당 환산 교습비", unitText: "KRW/hour" },
    ],
    usageInfo: `${RESEARCH_METHOD_URL}#reuse-policy`,
    distribution: SEOUL_PIANO_FEES.distributions.map(buildDataDownload),
    subjectOf: [
      { "@type": "WebPage", "@id": `${RESEARCH_METHOD_URL}#webpage`, url: RESEARCH_METHOD_URL },
      {
        "@type": "DataDownload",
        name: "서울 피아노 교습비 데이터셋 메타데이터",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.seoulMetadata}`,
        encodingFormat: "application/json",
      },
      {
        "@type": "DataDownload",
        name: "서울 피아노 교습비 CSV 데이터 사전",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.seoulSchema}`,
        encodingFormat: "application/json",
      },
      {
        "@type": "CreativeWork",
        name: "원자료 출처·해시 매니페스트",
        url: `${SITE_URL}${RESEARCH_DOWNLOADS.sourceManifest}`,
        encodingFormat: "application/json",
      },
    ],
    includedInDataCatalog: { "@id": RESEARCH_CATALOG_ID },
  };
}

export function buildNationalDatasetPageSchema() {
  return {
    "@type": "WebPage",
    "@id": `${NATIONAL_DATASET_URL}#webpage`,
    name: NATIONAL_MUSIC_EDUCATION.name,
    description: NATIONAL_MUSIC_EDUCATION.description,
    url: NATIONAL_DATASET_URL,
    datePublished: NATIONAL_DATASET_PUBLISHED_AT,
    dateModified: NATIONAL_DATASET_MODIFIED_AT,
    author: publisher,
    publisher,
    inLanguage: "ko",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${NATIONAL_DATASET_URL}#dataset` },
  };
}

export function buildSeoulDatasetPageSchema() {
  return {
    "@type": "WebPage",
    "@id": `${SEOUL_DATASET_URL}#webpage`,
    name: SEOUL_PIANO_FEES.name,
    description: SEOUL_PIANO_FEES.description,
    url: SEOUL_DATASET_URL,
    datePublished: SEOUL_DATASET_PUBLISHED_AT,
    dateModified: SEOUL_DATASET_MODIFIED_AT,
    author: publisher,
    publisher,
    inLanguage: "ko",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${SEOUL_DATASET_URL}#dataset` },
  };
}
