export const RESEARCH_REFERENCE_IDS = ["hub", "national", "seoul", "methodology"] as const;

export type ResearchReferenceId = (typeof RESEARCH_REFERENCE_IDS)[number];
export type ResearchDatasetReferenceId = "national" | "seoul";

export type ResearchReference = {
  id: ResearchReferenceId;
  href: string;
  label: string;
  anchor: string;
  description: string;
  limitation: string;
};

export const RESEARCH_REFERENCES = {
  hub: {
    id: "hub",
    href: "/research",
    label: "데이터 허브",
    anchor: "피아노 교육 데이터와 원자료 전체 보기",
    description:
      "공식 조사와 교육행정 공개자료, 가공 CSV, 출처 목록을 한곳에서 확인할 수 있습니다.",
    limitation:
      "연구 허브의 자료는 교육 환경을 설명하기 위한 참고 자료이며 개인 레슨의 품질이나 학습 결과를 보증하지 않습니다.",
  },
  national: {
    id: "national",
    href: "/research/2025-music-private-education-statistics",
    label: "전국 공식 조사",
    anchor: "2025 전국 음악 사교육비 원자료와 가공 CSV",
    description:
      "교육부와 국가데이터처의 2025년 초중고 사교육비 조사에서 음악 항목의 학교급별 지출 규모를 재구성했습니다.",
    limitation:
      "음악 사교육 전체를 합산한 조사 결과이며 피아노 단독 지출, 개인 레슨비, 학습 효과를 뜻하지 않습니다.",
  },
  seoul: {
    id: "seoul",
    href: "/research/2026-seoul-piano-academy-fees",
    label: "서울 교육행정 자료",
    anchor: "2026 서울 피아노 교습비 행정자료와 가공 통계",
    description:
      "서울특별시교육청 공개자료에서 피아노 관련 학원과 교습소의 등록 교습비를 선별해 시설 유형과 자치구별로 요약했습니다.",
    limitation:
      "등록 교습비의 파생 통계로 실제 결제액이나 시장 평균이 아니며 이 사이트의 개인 레슨비를 산정하거나 정당화하는 근거가 아닙니다.",
  },
  methodology: {
    id: "methodology",
    href: "/research/methodology",
    label: "방법론과 수정 이력",
    anchor: "원자료 가공 방법, 한계와 수정 이력",
    description:
      "원자료 수집, 필드 정규화, 중복 제거, 소표본 억제, 공개 CSV 생성 과정을 재현할 수 있도록 정리했습니다.",
    limitation:
      "공개기관의 원자료 갱신과 분류 오차 가능성이 있으며 방법론 페이지에 버전별 변경 사항과 알려진 한계를 기록합니다.",
  },
} as const satisfies Record<ResearchReferenceId, ResearchReference>;

export const HOME_RESEARCH_REFERENCE_IDS = [
  "national",
  "seoul",
  "methodology",
] as const satisfies readonly ResearchReferenceId[];

export const ABOUT_RESEARCH_REFERENCE_IDS = [
  "hub",
  "methodology",
] as const satisfies readonly ResearchReferenceId[];

export const SERVICE_RESEARCH_REFERENCE_IDS = {
  "/pricing": ["seoul"],
  "/lessons/private": ["seoul"],
  "/lessons/adult": ["seoul"],
  "/lessons/children": ["national"],
} as const satisfies Readonly<Record<string, readonly ResearchReferenceId[]>>;

export const CATEGORY_RESEARCH_REFERENCE_IDS = {
  "lesson-guide": ["seoul"],
  local: ["seoul"],
  parents: ["national"],
} as const satisfies Readonly<Record<string, readonly ResearchReferenceId[]>>;

export const ARTICLE_RESEARCH_REFERENCE_IDS = {
  "piano-tutoring-cost": ["seoul"],
  "academy-vs-tutoring": ["seoul"],
  "adult-piano-academy-price": ["seoul"],
  "seodaemun-piano": ["seoul"],
  "mapo-piano": ["seoul"],
  "ewha-area-lesson": ["seoul"],
  "hongdae-piano-guide": ["seoul"],
} as const satisfies Readonly<Record<string, readonly ResearchReferenceId[]>>;

const NO_RESEARCH_REFERENCES: readonly ResearchReferenceId[] = [];

export function getServiceResearchReferenceIds(path: string): readonly ResearchReferenceId[] {
  return (
    (SERVICE_RESEARCH_REFERENCE_IDS as Readonly<Record<string, readonly ResearchReferenceId[]>>)[
      path
    ] ?? NO_RESEARCH_REFERENCES
  );
}

export function getCategoryResearchReferenceIds(
  categorySlug: string,
): readonly ResearchReferenceId[] {
  return (
    (CATEGORY_RESEARCH_REFERENCE_IDS as Readonly<Record<string, readonly ResearchReferenceId[]>>)[
      categorySlug
    ] ?? NO_RESEARCH_REFERENCES
  );
}

export function getArticleResearchReferenceIds(slug: string): readonly ResearchReferenceId[] {
  return (
    (ARTICLE_RESEARCH_REFERENCE_IDS as Readonly<Record<string, readonly ResearchReferenceId[]>>)[
      slug
    ] ?? NO_RESEARCH_REFERENCES
  );
}

export function resolveResearchReferences(
  ids: readonly ResearchReferenceId[],
): readonly ResearchReference[] {
  return ids.map((id) => RESEARCH_REFERENCES[id]);
}
