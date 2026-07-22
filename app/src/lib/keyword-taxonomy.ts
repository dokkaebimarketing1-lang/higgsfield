export const KEYWORD_ROLES = [
  "main",
  "expansion",
  "informational",
  "long-tail",
  "utility",
] as const;

export type KeywordRole = (typeof KEYWORD_ROLES)[number];

export const SEARCH_INTENTS = [
  "commercial",
  "comparison",
  "informational",
  "local",
  "navigational",
] as const;

export type SearchIntent = (typeof SEARCH_INTENTS)[number];

export const KEYWORD_CLUSTERS = [
  "general",
  "lesson",
  "pricing",
  "adult",
  "children",
  "home-visit",
  "admission",
  "practice",
  "repertoire",
  "local",
] as const;

export type KeywordCluster = (typeof KEYWORD_CLUSTERS)[number];

export const KEYWORD_ROLE_LABELS: Record<KeywordRole, string> = {
  main: "메인 키워드",
  expansion: "전환형 확장 키워드",
  informational: "정보 키워드",
  "long-tail": "대상·지역 롱테일",
  utility: "탐색·정책 페이지",
};

export const SEARCH_INTENT_LABELS: Record<SearchIntent, string> = {
  commercial: "상담·신청",
  comparison: "비교·검토",
  informational: "정보 탐색",
  local: "지역 탐색",
  navigational: "사이트 탐색",
};

export const KEYWORD_CLUSTER_LABELS: Record<KeywordCluster, string> = {
  general: "미분류",
  lesson: "개인 레슨",
  pricing: "레슨 비용",
  adult: "성인 레슨",
  children: "어린이 레슨",
  "home-visit": "방문 레슨",
  admission: "입시·콩쿠르",
  practice: "연습·독학",
  repertoire: "연주곡",
  local: "지역 레슨",
};

export function normalizeKeyword(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}
