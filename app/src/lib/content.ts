import type { KeywordCluster, KeywordRole, SearchIntent } from "./keyword-taxonomy";

// 이화 피아노 과외 — 모든 노출 카피를 한곳에서 관리합니다.
export const SITE_URL = "https://ewha-piano.higgsfield.app";

// 카테고리 허브는 개별 글과 검색 의도를 겹치지 않게 넓은 주제 키워드를 담당합니다.
export const BLOG_CATEGORY_SLUGS = [
  "lesson-guide",
  "practice",
  "exam",
  "repertoire",
  "parents",
  "local",
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUGS)[number];

export const BLOG_POST_KEYWORD_ROLES = [
  "informational",
  "long-tail",
] as const satisfies readonly KeywordRole[];

export type CategorySeo = {
  name: string;
  description: string;
  primaryKeyword: string;
  pageTitle: string;
  metaDescription: string;
  intro: string;
  audience: string;
  editorialRule: string;
  exclusionRule: string;
  defaultKeywordRole: (typeof BLOG_POST_KEYWORD_ROLES)[number];
  allowedKeywordRoles: readonly (typeof BLOG_POST_KEYWORD_ROLES)[number][];
  defaultSearchIntent: SearchIntent;
  allowedSearchIntents: readonly SearchIntent[];
  defaultKeywordCluster: Exclude<KeywordCluster, "general">;
  allowedKeywordClusters: readonly Exclude<KeywordCluster, "general">[];
};

export const CATEGORY_SEO: Record<string, CategorySeo> = {
  "lesson-guide": {
    name: "레슨 선택·비용",
    description: "비용, 수업 방식, 선생님과 대상별 레슨 선택 기준",
    primaryKeyword: "피아노 과외 가이드",
    pageTitle: "피아노 과외 가이드 | 비용·선생님·수업 비교",
    metaDescription:
      "피아노 과외 가이드. 비용, 선생님 고르는 법, 학원과 과외 비교, 수업 시간과 횟수까지 시작 전에 필요한 정보를 레슨 현장의 시선으로 정리합니다.",
    intro:
      "피아노 과외 가이드는 처음 알아보는 분들이 가장 많이 묻는 질문부터 답합니다. 비용, 선생님 선택, 학원과의 비교, 시간과 횟수까지 레슨을 하는 사람이 솔직하게 정리했습니다.",
    audience: "레슨 신청 전에 비용, 방식, 선생님을 비교하는 학습자와 보호자",
    editorialRule:
      "비용·수업 방식·선생님 선택·대상별 레슨 비교처럼 상담 직전의 판단 기준을 다룹니다.",
    exclusionRule:
      "연습 기술만 다루는 글과 특정 지역을 찾는 글은 각각 연습·독학, 서울 지역 레슨으로 분류합니다.",
    defaultKeywordRole: "informational",
    allowedKeywordRoles: BLOG_POST_KEYWORD_ROLES,
    defaultSearchIntent: "comparison",
    allowedSearchIntents: ["commercial", "comparison", "informational"],
    defaultKeywordCluster: "lesson",
    allowedKeywordClusters: ["lesson", "pricing", "adult", "children"],
  },
  practice: {
    name: "연습·독학",
    description: "연습 순서, 악보 읽기, 리듬, 테크닉과 독학 습관",
    primaryKeyword: "피아노 연습",
    pageTitle: "피아노 연습 | 연습법·악보·메트로놈 가이드",
    metaDescription:
      "피아노 연습 방법을 찾는 분을 위한 가이드입니다. 효율적인 연습 구조, 하농 활용법, 악보 읽는 법, 메트로놈 사용과 습관 만들기를 단계별로 안내합니다.",
    intro:
      "피아노 연습은 오래 앉아 있는 것보다 무엇을 어떤 순서로 반복하는지가 중요합니다. 워밍업, 구간 연습, 악보 읽기, 메트로놈 활용과 매일 이어지는 습관까지 실제 레슨에서 쓰는 방법을 공개합니다.",
    audience: "혼자 연습하는 초보자와 아이의 연습 습관을 돕는 보호자",
    editorialRule:
      "악보 읽기, 리듬, 테크닉, 연습 루틴과 독학처럼 바로 실행할 수 있는 방법을 다룹니다.",
    exclusionRule:
      "레슨 상품 비교나 곡 추천 목록은 각각 레슨 선택·비용, 연주곡·레퍼토리로 분류합니다.",
    defaultKeywordRole: "informational",
    allowedKeywordRoles: BLOG_POST_KEYWORD_ROLES,
    defaultSearchIntent: "informational",
    allowedSearchIntents: ["informational"],
    defaultKeywordCluster: "practice",
    allowedKeywordClusters: ["practice", "children"],
  },
  exam: {
    name: "입시·콩쿠르",
    description: "음대 입시, 콩쿠르, 실기와 무대 준비 전략",
    primaryKeyword: "피아노 입시",
    pageTitle: "피아노 입시·콩쿠르 가이드 | 준비 시기·곡 선택",
    metaDescription:
      "피아노 입시 준비 시기, 콩쿠르 첫 도전, 입시곡 선택과 무대 떨림 극복을 정리했습니다. 이화여대 피아노과 입시를 경험한 재학생이 현실적인 기준을 전합니다.",
    intro:
      "피아노 입시는 준비 시기와 곡 선택, 실전 무대 경험을 함께 설계해야 합니다. 이화여대 피아노과 입시를 경험한 재학생이 콩쿠르와 실기 준비 기준을 단계별로 정리합니다.",
    audience: "음대 입시와 콩쿠르를 준비하는 학생 및 보호자",
    editorialRule:
      "모집요강 확인, 준비 시기, 실기 계획, 무대 대응처럼 입시·콩쿠르 실행 전략을 다룹니다.",
    exclusionRule:
      "감상용·취미용 곡 추천과 일반 연습법은 각각 연주곡·레퍼토리, 연습·독학으로 분류합니다.",
    defaultKeywordRole: "informational",
    allowedKeywordRoles: BLOG_POST_KEYWORD_ROLES,
    defaultSearchIntent: "informational",
    allowedSearchIntents: ["informational"],
    defaultKeywordCluster: "admission",
    allowedKeywordClusters: ["admission"],
  },
  repertoire: {
    name: "연주곡·레퍼토리",
    description: "수준, 목적과 장르별 피아노 연주곡 선택 가이드",
    primaryKeyword: "피아노 연주곡",
    pageTitle: "피아노 연주곡 추천 | 초보·성인·중급·콩쿠르",
    metaDescription:
      "피아노 연주곡을 찾는 분을 위해 초보 입문곡, 성인 취미 쉬운 곡, 체르니 이후 중급 곡, 뉴에이지와 콩쿠르 레퍼토리를 수준별로 골랐습니다.",
    intro:
      "피아노 연주곡은 현재 읽기와 손가락 수준보다 조금 어려운 곡을 고를 때 가장 꾸준히 완성할 수 있습니다. 입문 로드맵, 성인 취미곡, 중급곡, 뉴에이지와 콩쿠르 곡까지 수준별로 골랐습니다.",
    audience: "현재 수준과 목적에 맞는 다음 연주곡을 찾는 학습자",
    editorialRule: "초보·성인·중급·콩쿠르 등 수준과 목적에 맞춘 곡 추천 및 선택 기준을 다룹니다.",
    exclusionRule:
      "곡을 연습하는 기술과 입시 일정 운영은 각각 연습·독학, 입시·콩쿠르로 분류합니다.",
    defaultKeywordRole: "informational",
    allowedKeywordRoles: BLOG_POST_KEYWORD_ROLES,
    defaultSearchIntent: "informational",
    allowedSearchIntents: ["informational"],
    defaultKeywordCluster: "repertoire",
    allowedKeywordClusters: ["repertoire", "admission"],
  },
  parents: {
    name: "아이·학부모",
    description: "아이의 시작 시기, 악기, 연습 환경과 부모 역할",
    primaryKeyword: "아이 피아노",
    pageTitle: "아이 피아노 학부모 가이드 | 시작·연습·악기 선택",
    metaDescription:
      "아이 피아노 시작 나이, 연습을 싫어할 때의 대응, 첫 피아노 구입, 방문 레슨 준비와 부모의 역할을 학부모가 확인하기 쉽게 안내합니다.",
    intro:
      "아이 피아노 교육에서 부모의 역할은 연습 감독보다 환경을 만드는 일에 가깝습니다. 시작 시기, 연습 갈등을 줄이는 법, 악기 구입과 방문 레슨 준비까지 자주 묻는 질문에 답합니다.",
    audience: "유아·초등 피아노 교육을 시작하거나 이어 가는 보호자",
    editorialRule: "시작 나이, 첫 악기, 연습 갈등, 부모 역할과 가정 수업 환경을 다룹니다.",
    exclusionRule:
      "모든 연령에 공통인 연습 기술과 레슨 상품 비교는 각각 연습·독학, 레슨 선택·비용으로 분류합니다.",
    defaultKeywordRole: "informational",
    allowedKeywordRoles: BLOG_POST_KEYWORD_ROLES,
    defaultSearchIntent: "informational",
    allowedSearchIntents: ["informational", "comparison"],
    defaultKeywordCluster: "children",
    allowedKeywordClusters: ["children", "home-visit"],
  },
  local: {
    name: "서울 지역 레슨",
    description: "서대문구, 마포구와 이대 인근 방문 레슨 지역 안내",
    primaryKeyword: "서울 피아노 레슨",
    pageTitle: "서울 피아노 레슨 | 서대문·마포 방문 수업",
    metaDescription:
      "서울 피아노 레슨을 찾는 분에게 서대문구·마포구 방문 수업과 이대 인근 이화여대 피아노과 재학생의 1:1 수업 지역을 안내합니다.",
    intro:
      "서울 피아노 레슨은 서대문구·마포구와 이대 인근 방문 방식으로 진행합니다. 지역별 이동 범위와 신청 전에 확인할 내용을 한곳에서 안내합니다.",
    audience: "서울 서대문구·마포구와 이대 인근에서 방문 레슨을 찾는 학습자",
    editorialRule: "구·동·생활권처럼 명확한 서울 지역명이 검색어의 중심인 방문 레슨 글만 다룹니다.",
    exclusionRule: "지역 제한이 없는 온라인·화상 레슨 비교는 레슨 선택·비용으로 분류합니다.",
    defaultKeywordRole: "long-tail",
    allowedKeywordRoles: ["long-tail"],
    defaultSearchIntent: "local",
    allowedSearchIntents: ["local"],
    defaultKeywordCluster: "local",
    allowedKeywordClusters: ["local"],
  },
};

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return (BLOG_CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function getBlogCategoryTaxonomyIssues(input: {
  categorySlug: string;
  keywordRole: KeywordRole;
  searchIntent: SearchIntent;
  keywordCluster: KeywordCluster;
}): string[] {
  if (!isBlogCategorySlug(input.categorySlug)) {
    return ["CMS에서 확정한 6개 카테고리 중 하나를 선택해 주세요."];
  }

  const category = CATEGORY_SEO[input.categorySlug];
  const issues: string[] = [];
  if (!(category.allowedKeywordRoles as readonly KeywordRole[]).includes(input.keywordRole)) {
    issues.push(
      `${category.name} 카테고리는 ${category.allowedKeywordRoles.join(" 또는 ")} 키워드 역할만 사용할 수 있습니다.`,
    );
  }
  if (!(category.allowedSearchIntents as readonly SearchIntent[]).includes(input.searchIntent)) {
    issues.push(
      `${category.name} 카테고리의 검색 의도는 ${category.allowedSearchIntents.join(", ")} 중에서 선택해 주세요.`,
    );
  }
  if (
    !(category.allowedKeywordClusters as readonly KeywordCluster[]).includes(input.keywordCluster)
  ) {
    issues.push(
      `${category.name} 카테고리의 토픽 클러스터는 ${category.allowedKeywordClusters.join(", ")} 중에서 선택해 주세요.`,
    );
  }
  return issues;
}

export const SITE = {
  brand: "이화 피아노 과외",
  title: "피아노 레슨 | 이화여대 피아노과 1:1 과외",
  description:
    "피아노 레슨을 이화여자대학교 피아노과 재학생에게 1:1로 배워 보세요. 어린이·성인 취미부터 입시·콩쿠르까지, 서울 서대문구·마포구 방문과 온라인 수업을 안내합니다.",
  nav: [
    { label: "선생님 소개", href: "/about" },
    { label: "레슨 프로그램", href: "/#programs" },
    { label: "요금 안내", href: "/pricing" },
    { label: "피아노 이야기", href: "/blog" },
  ],
  hero: {
    eyebrow: "이화여자대학교 피아노과",
    headline: "피아노 레슨, 당신만을 위한 리사이틀",
    sub: "피아노 레슨을 이화여대 피아노과 재학생의 1:1 피아노 개인 레슨으로 시작하세요. 어린이 취미부터 성인·입시까지 당신의 템포에 맞춥니다.",
    primary: "피아노 레슨 상담 신청하기",
    secondary: "레슨 프로그램",
  },
  about: {
    tempo: "Adagio",
    headline: "선생님 소개",
    name: "김서연",
    intro:
      "어린이의 첫 건반부터 성인의 오랜 꿈까지, 한 사람의 속도에 맞춘 레슨을 합니다. 정확한 기초와 음악을 사랑하는 마음, 두 가지를 함께 전합니다.",
    credentials: [
      { label: "학력", value: "이화여자대학교 피아노과 재학" },
      { label: "수상", value: "국내 피아노 콩쿠르 수상 다수" },
      { label: "레슨", value: "학생별 1:1 맞춤 수업 운영" },
    ],
    facts: [
      { label: "레슨 요일", value: "월~토, 시간 협의" },
      { label: "레슨 시간", value: "45분 또는 60분" },
      { label: "레슨 형태", value: "방문 레슨 · 온라인 화상" },
      { label: "레슨 지역", value: "서울 서대문구 · 마포구 방문" },
    ],
  },
  programs: {
    tempo: "Allegro",
    headline: "레슨 프로그램",
    featured: {
      title: "유아·초등 취미반",
      body: "피아노와 처음 만나는 시간. 바른 자세와 악보 읽기부터, 스스로 연습하는 즐거운 습관까지 차근차근 함께합니다.",
    },
    rows: [
      {
        num: "01",
        title: "입시·콩쿠르 준비반",
        body: "목표 학교와 콩쿠르 일정에 맞춘 체계적 커리큘럼. 곡 해석과 무대 경험을 함께 쌓아 실전에 강한 연주를 만듭니다.",
      },
      {
        num: "02",
        title: "성인 취미반",
        body: "퇴근 후의 한 시간. 어릴 적 치고 싶었던 곡 하나를 완성하는 기쁨을 드립니다.",
      },
    ],
  },
  process: {
    headline: "수업은 이렇게 진행됩니다",
    steps: [
      {
        num: "01",
        title: "상담 및 목표 설정",
        body: "현재 실력과 목표, 생활 패턴을 편하게 이야기합니다.",
      },
      {
        num: "02",
        title: "레벨과 습관 진단",
        body: "간단한 연주와 확인을 통해 정확한 출발점을 정합니다.",
      },
      {
        num: "03",
        title: "맞춤 커리큘럼 설계",
        body: "교재와 곡, 연습량을 학생 한 사람에게 맞춰 설계합니다.",
      },
      {
        num: "04",
        title: "주 1회 레슨과 피드백",
        body: "매주 레슨 후 연습 과제와 세밀한 피드백을 전합니다.",
      },
    ],
  },
  pricing: {
    headline: "레슨 요금 안내",
    note: "첫 상담과 30분 체험 레슨은 무료입니다.",
    tiers: [
      {
        name: "취미 스타터",
        price: "160,000",
        unit: "원",
        per: "월",
        lines: ["주 1회 45분 레슨", "기초 교재 안내 포함", "온라인 질문 답변"],
        featured: false,
      },
      {
        name: "정규 집중",
        price: "240,000",
        unit: "원",
        per: "월",
        lines: ["주 1회 60분 레슨", "맞춤 커리큘럼 설계", "월 1회 연주 영상 피드백"],
        featured: true,
        badge: "가장 많이 선택",
      },
      {
        name: "입시·콩쿠르",
        price: "320,000",
        unit: "원",
        per: "월",
        lines: ["주 1회 60분 레슨", "입시 전략 상담", "모의 연주 평가"],
        featured: false,
      },
    ],
  },
  faq: {
    headline: "자주 묻는 질문",
    items: [
      {
        q: "피아노 과외 비용은 얼마인가요?",
        a: "월 4회 45분 기준 160,000원부터 시작합니다. 60분·입시 과정의 최신 금액과 포함 항목은 피아노 레슨비 페이지에서 비교할 수 있으며, 첫 상담과 30분 체험 레슨은 무료입니다.",
      },
      {
        q: "레슨은 어디에서 진행하나요?",
        a: "서울 서대문구와 마포구는 가정 방문 레슨이 가능하고, 그 외 지역이나 먼 곳은 온라인 화상 레슨으로 진행합니다.",
      },
      {
        q: "아이는 몇 살쯤 시작하면 좋을까요?",
        a: "보통 5세에서 7세 사이, 아이가 악보의 기호에 흥미를 보일 때 시작하면 가장 좋습니다. 첫 상담에서 아이의 준비 상태를 함께 확인해 드립니다.",
      },
      {
        q: "성인 완전 초보도 가능한가요?",
        a: "가능합니다. 악보를 한 번도 읽어 보지 않으신 분도 기초부터 차근차근 진행합니다. 첫 곡의 완성 시점은 곡의 난이도와 주간 연습 시간에 따라 달라집니다.",
      },
      {
        q: "음대 입시나 콩쿠르 준비도 가능한가요?",
        a: "가능합니다. 목표 학교의 실기 유형 분석부터 곡 선정, 무대 연습까지 단계별로 지도합니다. 입시·콩쿠르 반으로 신청해 주세요.",
      },
    ],
  },
  contact: {
    tempo: "Finale",
    headline: "첫 상담을 신청하세요",
    body: "레슨에 대한 궁금한 점, 아이의 성향, 원하는 방향을 편하게 남겨 주세요. 24시간 이내에 답변드립니다.",
    rows: [{ icon: "pin", label: "레슨 지역", value: "서울 서대문구 · 마포구 방문 · 전역 온라인" }],
    hours: "운영 시간 | 평일 15:00~21:00 · 토요일 10:00~18:00",
    form: {
      submit: "상담 신청하기",
      success: "신청해 주셔서 감사합니다. 24시간 이내에 연락드리겠습니다.",
      goals: ["취미 (아이)", "취미 (성인)", "입시·콩쿠르", "기타"],
    },
  },
  footer: {
    line: "이화여자대학교 피아노과 재학생의 1:1 피아노 레슨",
    copyright: "© 2026 이화 피아노 과외",
    admin: "관리자",
  },
} as const;
