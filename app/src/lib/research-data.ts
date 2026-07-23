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
};

type SourceManifest = Omit<typeof sourceManifestJson, "sources"> & {
  sources: ResearchSource[];
};

export const SEOUL_PIANO_FEES = seoulMetadataJson as SeoulMetadata;
export const NATIONAL_MUSIC_EDUCATION = nationalMetadataJson;
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
  "@type": "Organization",
  name: SITE.brand,
  url: SITE_URL,
};

export function buildNationalMusicDatasetSchema() {
  const pageUrl = `${SITE_URL}/research/2025-music-private-education-statistics`;
  return {
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: NATIONAL_MUSIC_EDUCATION.name,
    description: NATIONAL_MUSIC_EDUCATION.description,
    url: pageUrl,
    identifier: NATIONAL_MUSIC_EDUCATION.datasetId,
    version: String(NATIONAL_MUSIC_EDUCATION.referenceYear),
    keywords: ["음악 사교육비", "2025 초중고 사교육비 조사", "교육부 사교육비 통계"],
    isAccessibleForFree: true,
    creator: [
      { "@type": "Organization", name: "교육부", url: "https://www.moe.go.kr/" },
      { "@type": "Organization", name: "국가데이터처", url: "https://www.kostat.go.kr/" },
    ],
    publisher,
    datePublished: NATIONAL_MUSIC_EDUCATION.publishedAt,
    dateModified: NATIONAL_MUSIC_EDUCATION.retrievedAt,
    temporalCoverage: "2025",
    spatialCoverage: { "@type": "Place", name: "대한민국" },
    inLanguage: "ko",
    isBasedOn: NATIONAL_PDF_SOURCE.sourcePage,
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
    license: "https://www.kogl.or.kr/info/licenseType1.do",
    distribution: [
      {
        "@type": "DataDownload",
        name: "음악 사교육비 학교급별 가공 CSV",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.nationalCsv}`,
        encodingFormat: "text/csv",
      },
      {
        "@type": "DataDownload",
        name: "교육부 2025년 초중고 사교육비 조사 원문 PDF",
        contentUrl: NATIONAL_PDF_SOURCE.downloadUrl,
        encodingFormat: "application/pdf",
      },
    ],
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "이화 피아노 통계 자료실",
      url: `${SITE_URL}/research`,
    },
  };
}

export function buildSeoulPianoFeesDatasetSchema() {
  const pageUrl = `${SITE_URL}/research/2026-seoul-piano-academy-fees`;
  return {
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: SEOUL_PIANO_FEES.name,
    description: SEOUL_PIANO_FEES.description,
    url: pageUrl,
    identifier: SEOUL_PIANO_FEES.datasetId,
    version: SEOUL_PIANO_FEES.pipelineVersion,
    keywords: ["서울 피아노 학원비", "피아노 교습비", "학원 교습소", "등록 교습비"],
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: SITE.brand,
      url: SITE_URL,
    },
    publisher,
    datePublished: SEOUL_PIANO_FEES.retrievedAt,
    dateModified: SEOUL_PIANO_FEES.retrievedAt,
    temporalCoverage: SEOUL_PIANO_FEES.referenceDate,
    spatialCoverage: { "@type": "Place", name: "서울특별시" },
    inLanguage: "ko",
    isBasedOn: "https://www.data.go.kr/data/3044370/fileData.do",
    measurementTechnique:
      "서울특별시교육청 원자료 전체 시트에서 피아노 명시 교습상품을 필터링하고 중복 제거·직접 식별정보와 원자료 행 위치를 제외한 뒤 중앙값과 사분위수를 계산",
    variableMeasured: [
      { "@type": "PropertyValue", name: "시설 유형", value: "학원·교습소" },
      { "@type": "PropertyValue", name: "자치구" },
      { "@type": "PropertyValue", name: "등록 교습비", unitText: "KRW" },
      { "@type": "PropertyValue", name: "총 교습시간", unitText: "분" },
      { "@type": "PropertyValue", name: "시간당 환산 교습비", unitText: "KRW/hour" },
    ],
    usageInfo: "https://www.data.go.kr/data/3044370/fileData.do",
    license: {
      "@type": "CreativeWork",
      name: "공공데이터포털 이용허락범위 제한 없음",
      url: "https://www.data.go.kr/data/3044370/fileData.do",
    },
    distribution: [
      {
        "@type": "DataDownload",
        name: "피아노 교습상품 직접 식별정보 제거 가공 CSV",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.seoulRecordsCsv}`,
        encodingFormat: "text/csv",
      },
      {
        "@type": "DataDownload",
        name: "서울·자치구별 요약 CSV",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.seoulSummaryCsv}`,
        encodingFormat: "text/csv",
      },
      {
        "@type": "DataDownload",
        name: "원자료 출처·해시 매니페스트",
        contentUrl: `${SITE_URL}${RESEARCH_DOWNLOADS.sourceManifest}`,
        encodingFormat: "application/json",
      },
    ],
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "이화 피아노 통계 자료실",
      url: `${SITE_URL}/research`,
    },
  };
}
