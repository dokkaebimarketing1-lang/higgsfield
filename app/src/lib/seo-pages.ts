import { SITE, SITE_URL } from "./content";
import type { KeywordCluster, KeywordRole, SearchIntent } from "./keyword-taxonomy";

export type PublicKeywordCluster = KeywordCluster | "research";

export type PublicPageDefinition = {
  path: string;
  label: string;
  primaryKeyword: string;
  role: KeywordRole;
  intent: SearchIntent;
  cluster: PublicKeywordCluster;
  title: string;
  description: string;
  lastModified: string;
  image: string;
};

export type LessonSection = {
  heading: string;
  lead: string;
  paragraphs: readonly string[];
  points?: readonly string[];
};

export type LessonFaq = {
  q: string;
  a: string;
};

export type RelatedInformation = {
  href: string;
  label: string;
  description: string;
};

export type PageAuthorityRecord = {
  answer: string;
  scope: string;
  boundary: string;
};

export type LessonLandingDefinition = PublicPageDefinition & {
  role: "expansion";
  supportingKeywords: readonly string[];
  imageAlt: string;
  lede: string;
  authority: PageAuthorityRecord;
  sections: readonly LessonSection[];
  faq: readonly LessonFaq[];
  relatedServices: readonly RelatedInformation[];
  related: readonly RelatedInformation[];
  structuredData: string;
};

const SEO_UPDATED_AT = "2026-07-23";
const absoluteAsset = (path: string) => `${SITE_URL}${path}`;

function defineServicePage(
  page: Omit<LessonLandingDefinition, "structuredData">,
): LessonLandingDefinition {
  const canonical = `${SITE_URL}${page.path}`;
  const pricingCatalog =
    page.path === "/pricing"
      ? {
          "@type": "OfferCatalog",
          "@id": `${canonical}#offers`,
          name: "피아노 레슨비 과정",
          url: canonical,
          itemListElement: SITE.pricing.tiers.map((tier) => ({
            "@type": "Offer",
            name: tier.name,
            url: canonical,
            price: tier.price.replace(",", ""),
            priceCurrency: "KRW",
            itemOffered: {
              "@type": "Service",
              name: tier.name,
              description: tier.lines.join(", "),
            },
          })),
        }
      : null;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        inLanguage: "ko",
        dateModified: page.lastModified,
        author: { "@id": `${SITE_URL}/about#person` },
        publisher: { "@id": `${SITE_URL}/#business` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": `${canonical}#service` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: page.image,
          caption: page.imageAlt,
        },
        relatedLink: page.related.map((item) => `${SITE_URL}${item.href}`),
      },
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: page.primaryKeyword,
        url: canonical,
        description: page.lede,
        image: page.image,
        serviceType: page.primaryKeyword,
        keywords: [page.primaryKeyword, ...page.supportingKeywords],
        areaServed: ["서울특별시", "서울특별시 서대문구", "서울특별시 마포구"],
        mainEntityOfPage: { "@id": `${canonical}#webpage` },
        subjectOf: page.related.map((item) => ({
          "@id": `${SITE_URL}${item.href}#article`,
        })),
        provider: {
          "@type": ["LocalBusiness", "ProfessionalService"],
          "@id": `${SITE_URL}/#business`,
          name: SITE.brand,
          url: `${SITE_URL}/`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.label,
            item: canonical,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        isPartOf: { "@id": `${canonical}#webpage` },
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
      ...(pricingCatalog ? [pricingCatalog] : []),
    ],
  });

  return { ...page, structuredData };
}

export const SERVICE_PAGES = {
  private: defineServicePage({
    path: "/lessons/private",
    label: "피아노 개인 레슨",
    primaryKeyword: "피아노 개인 레슨",
    supportingKeywords: ["피아노 과외", "1:1 피아노 레슨"],
    role: "expansion",
    intent: "commercial",
    cluster: "lesson",
    title: "피아노 개인 레슨 | 이화 피아노 과외",
    description:
      "피아노 개인 레슨을 현재 수준과 목표에 맞춰 1:1로 진행합니다. 어린이, 성인 취미, 입시 준비에 맞는 수업 방식과 비용을 확인하세요.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/hero-detail.jpg"),
    imageAlt: "피아노 개인 레슨에서 건반을 연주하는 손",
    lede: "피아노 개인 레슨은 현재 수준과 목표, 생활 리듬에 맞춰 수업 순서와 연습 계획을 조정하는 1:1 피아노 레슨입니다.",
    authority: {
      answer:
        "현재 수준을 먼저 듣고 45분 또는 60분 수업, 주간 연습량과 교재 순서를 한 사람의 목표에 맞춰 정합니다.",
      scope: "1:1 수업의 진단, 진행 순서, 대상별 조정 방식과 첫 수업 준비를 설명합니다.",
      boundary:
        "과정별 정확한 금액은 피아노 레슨비 페이지가 담당하며, 특정 기간 안의 실력 향상이나 결과를 보장하지 않습니다.",
    },
    sections: [
      {
        heading: "피아노 개인 레슨은 무엇이 다른가요?",
        lead: "피아노 과외의 핵심은 정해진 진도를 따라가는 것이 아니라, 학생이 이해한 지점에서 다음 단계로 넘어가는 데 있습니다.",
        paragraphs: [
          "같은 교재를 사용하더라도 손 모양, 악보 읽기, 리듬, 표현 중 먼저 보완해야 할 부분은 사람마다 다릅니다. 수업에서는 연주를 직접 듣고 그날 가장 필요한 한두 가지를 선명하게 짚습니다. 한 번에 많은 과제를 주기보다 다음 레슨까지 반복할 수 있는 분량으로 나누어 안내합니다.",
          "어린이는 집중 시간과 학교 일정, 성인은 퇴근 후 확보할 수 있는 연습 시간, 입시 준비생은 시험 일정과 레퍼토리를 기준으로 계획이 달라집니다. 목표가 바뀌거나 연습이 막힐 때는 진도를 고정하지 않고 교재와 과제의 순서를 다시 조정합니다.",
        ],
        points: [
          "현재 연주와 악보 읽기 수준을 먼저 확인합니다.",
          "45분 또는 60분 수업 중 목표에 맞는 시간을 선택합니다.",
          "매주 레슨 뒤 다음 연습의 우선순위를 정리합니다.",
        ],
      },
      {
        heading: "첫 상담부터 정규 수업까지 어떻게 진행되나요?",
        lead: "첫 상담에서는 나이보다 경험, 원하는 곡, 가능한 연습 시간, 수업을 통해 얻고 싶은 변화를 구체적으로 확인합니다.",
        paragraphs: [
          "처음 피아노를 배우는 분은 자세와 손의 긴장을 살피고, 음표와 리듬을 읽는 출발점을 정합니다. 이미 배운 경험이 있다면 짧은 연주를 통해 익숙한 부분과 다시 정리할 부분을 나눕니다. 이 과정은 학생을 평가하기 위한 시험이 아니라 알맞은 시작점을 찾기 위한 진단입니다.",
          "정규 수업에서는 지난 과제 확인, 새 개념 설명, 구간 연습, 다음 과제 정리 순서로 진행합니다. 곡을 끝까지 반복해서 치는 것보다 어려운 두세 마디를 분리해 해결하는 방법을 익히도록 돕습니다. 질문은 수업 중 편하게 확인하고, 필요한 경우 연습 방향을 다시 설명합니다.",
        ],
      },
      {
        heading: "어떤 목표에 피아노 개인 레슨이 잘 맞나요?",
        lead: "개인 레슨은 진도를 남과 비교하기보다 자신의 목표에 맞춰 꾸준히 이어가고 싶은 분에게 적합합니다.",
        paragraphs: [
          "첫 건반을 배우는 어린이는 바른 자세와 악보 읽기를 작은 단계로 나눌 수 있습니다. 취미로 다시 시작하는 성인은 꼭 연주하고 싶은 곡을 중심에 두고 부족한 기초를 함께 채울 수 있습니다. 입시나 콩쿠르를 준비한다면 일정, 곡의 완성도, 무대 연습을 하나의 계획으로 묶어 관리합니다.",
          "반대로 여러 사람과 함께 배우는 환경이나 정해진 그룹 활동이 중요한 분에게는 학원이 더 잘 맞을 수 있습니다. 선택 전에는 이동 방식, 연습 가능한 악기, 원하는 피드백 방식까지 함께 비교하는 것이 좋습니다. 첫 상담에서 현재 여건을 알려 주시면 가능한 수업 방식을 솔직하게 안내합니다.",
        ],
      },
    ],
    faq: [
      {
        q: "피아노 개인 레슨은 완전 초보도 가능한가요?",
        a: "가능합니다. 악보 읽기, 자세, 손가락 번호부터 현재 이해 속도에 맞춰 시작하며, 처음부터 어려운 곡이나 빠른 진도를 요구하지 않습니다.",
      },
      {
        q: "피아노 개인 레슨 시간은 어떻게 정하나요?",
        a: "수업은 45분 또는 60분으로 진행합니다. 나이, 집중 시간, 목표, 준비 중인 곡의 분량을 확인한 뒤 알맞은 시간을 함께 정합니다.",
      },
      {
        q: "방문과 온라인 수업을 모두 선택할 수 있나요?",
        a: "서울 서대문구와 마포구는 방문 레슨을 협의할 수 있고, 그 외 지역은 온라인 화상 수업으로 진행합니다. 일정과 위치를 상담에서 확인합니다.",
      },
      {
        q: "첫 수업 전에 무엇을 준비해야 하나요?",
        a: "사용 중인 교재와 치고 싶은 곡이 있다면 알려 주세요. 기존 교재가 없어도 괜찮으며, 첫 상담과 진단 뒤 필요한 준비를 안내합니다.",
      },
    ],
    relatedServices: [
      {
        href: "/lessons/adult",
        label: "성인 피아노 레슨",
        description: "왕초보와 다시 시작하는 성인을 위한 수업 방식과 연습 계획을 확인합니다.",
      },
      {
        href: "/lessons/children",
        label: "어린이 피아노 레슨",
        description: "유아와 초등학생의 집중 시간에 맞춘 1:1 수업을 확인합니다.",
      },
    ],
    related: [
      {
        href: "/blog/lesson-guide/choosing-piano-tutor",
        label: "피아노 과외 선생님 고르는 법",
        description: "전공, 설명 방식, 피드백, 운영 규칙을 상담 전에 확인하는 기준입니다.",
      },
      {
        href: "/blog/lesson-guide/tutoring-time-guide",
        label: "피아노 과외 시간과 횟수 가이드",
        description: "45분과 60분, 주간 수업 횟수를 목표에 맞춰 비교합니다.",
      },
    ],
  }),
  adult: defineServicePage({
    path: "/lessons/adult",
    label: "성인 피아노 레슨",
    primaryKeyword: "성인 피아노 레슨",
    supportingKeywords: ["성인 피아노", "성인 취미 피아노", "직장인 피아노"],
    role: "expansion",
    intent: "commercial",
    cluster: "adult",
    title: "성인 피아노 레슨 | 이화 피아노 과외",
    description:
      "성인 피아노 레슨을 왕초보, 다시 시작하는 취미, 한 곡 완성 목표에 맞춰 진행합니다. 45분·60분 수업과 월별 비용을 확인하세요.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/program-adult.jpg"),
    imageAlt: "성인 피아노 레슨을 위해 그랜드 피아노 앞에 앉은 연주자",
    lede: "성인 피아노 레슨은 왕초보와 다시 시작하는 성인 취미 피아노 학습자가 원하는 곡과 가능한 연습 시간에 맞추는 1:1 수업입니다.",
    authority: {
      answer:
        "왕초보, 다시 시작하는 성인, 한 곡 완성 목표를 구분해 악보 읽기와 연습 순서를 설계합니다.",
      scope: "성인의 시작점 진단, 바쁜 일정에 맞춘 연습, 곡 선택과 수업 시간 결정을 설명합니다.",
      boundary:
        "어린이의 시작 시기와 입시 전형 준비는 각각 전용 페이지에서 다루며, 곡 완성 시점은 난이도와 연습 시간에 따라 달라집니다.",
    },
    sections: [
      {
        heading: "성인 피아노 레슨은 어디서 시작하나요?",
        lead: "첫 시작점은 나이가 아니라 현재 악보 읽기, 리듬 이해, 양손 사용 경험과 원하는 곡의 난이도로 정합니다.",
        paragraphs: [
          "피아노를 처음 배우면 음표의 위치와 길이, 손가락 번호, 건반에서의 자세를 함께 익힙니다. 예전에 배운 경험이 있다면 기억나는 곡을 짧게 연주하며 남아 있는 감각을 확인합니다. 잘하는 부분은 반복 설명하지 않고, 다시 연결해야 할 기초부터 정리해 수업 시간을 효율적으로 사용합니다.",
          "좋아하는 곡이 현재 수준보다 어렵더라도 바로 포기할 필요는 없습니다. 원곡을 장기 목표로 두고 더 단순한 편곡이나 필요한 패턴 연습부터 시작할 수 있습니다. 곡의 완성 시점은 난이도와 연습 시간에 따라 달라지므로, 첫 상담에서 현실적인 순서를 함께 정합니다.",
        ],
        points: [
          "악보를 처음 읽는 왕초보 기초 수업",
          "어릴 때 배운 경험을 다시 연결하는 수업",
          "원하는 한 곡을 완성하기 위한 맞춤 수업",
        ],
      },
      {
        heading: "바쁜 일정에도 연습을 이어가는 방법은 무엇인가요?",
        lead: "직장인 피아노 수업은 긴 연습 시간을 전제로 하지 않고, 실제로 확보할 수 있는 시간 안에서 우선순위를 정하는 것이 중요합니다.",
        paragraphs: [
          "매일 곡 전체를 처음부터 끝까지 치기보다, 손이 멈추는 구간을 짧게 나누어 반복합니다. 한 손 연습, 느린 속도, 리듬 분리처럼 목적이 다른 방법을 섞으면 짧은 시간에도 문제를 분명하게 확인할 수 있습니다. 레슨에서는 다음 주까지 할 일을 많은 양이 아니라 실행 가능한 순서로 정리합니다.",
          "업무나 일정 때문에 한 주 연습이 부족했다면 수업을 미루기보다 막힌 원인을 함께 찾는 편이 도움이 됩니다. 이전 과제를 그대로 반복할지, 곡의 일부를 줄일지, 기초 연습으로 전환할지 선택할 수 있습니다. 꾸준함은 완벽한 주간 계획보다 다시 시작하기 쉬운 구조에서 만들어집니다.",
        ],
      },
      {
        heading: "온라인과 방문 성인 레슨은 어떻게 선택하나요?",
        lead: "이동 시간, 집의 악기, 촬영 가능한 각도, 선호하는 피드백 방식을 기준으로 수업 형태를 고를 수 있습니다.",
        paragraphs: [
          "서울 서대문구와 마포구는 일정과 위치를 협의해 방문 수업을 진행합니다. 익숙한 악기로 자세와 소리를 바로 확인하고 싶은 분에게 적합합니다. 방문이 어려운 지역은 온라인 화상 수업으로 만날 수 있으며, 손과 건반이 보이도록 기기를 배치하면 연주 흐름과 악보를 함께 확인할 수 있습니다.",
          "어떤 방식이 더 좋다고 단정하기보다 본인의 생활 동선과 연습 환경을 먼저 살피는 것이 좋습니다. 첫 상담에서 악기 종류, 가능한 시간, 위치를 알려 주시면 수업 진행이 가능한지와 필요한 준비를 안내합니다.",
        ],
      },
    ],
    faq: [
      {
        q: "성인 피아노 레슨은 악보를 전혀 몰라도 가능한가요?",
        a: "가능합니다. 음표의 위치와 길이, 손가락 번호, 기본 자세부터 설명하며 현재 이해 속도에 맞춰 진도를 조정합니다.",
      },
      {
        q: "치고 싶은 곡으로 바로 시작할 수 있나요?",
        a: "곡의 난이도와 현재 수준을 확인한 뒤 가능한 순서를 정합니다. 원곡이 어렵다면 필요한 기초나 쉬운 편곡을 먼저 익힌 뒤 연결할 수 있습니다.",
      },
      {
        q: "직장인도 저녁이나 토요일 수업이 가능한가요?",
        a: "레슨 요일은 월요일부터 토요일까지이며 시간은 협의합니다. 원하는 요일과 시간을 상담 신청에 남겨 주시면 가능한 일정을 확인합니다.",
      },
      {
        q: "집에 어쿠스틱 피아노가 꼭 있어야 하나요?",
        a: "반드시 어쿠스틱 피아노일 필요는 없지만 수업 사이에 연습할 건반은 필요합니다. 현재 사용하는 악기를 알려 주시면 수업 가능 여부를 안내합니다.",
      },
    ],
    relatedServices: [
      {
        href: "/lessons/private",
        label: "피아노 개인 레슨",
        description: "1:1 수업의 진단, 피드백, 주간 연습 설계 방식을 확인합니다.",
      },
      {
        href: "/pricing",
        label: "피아노 레슨비",
        description: "45분·60분 과정의 월 비용과 포함 항목을 한곳에서 비교합니다.",
      },
    ],
    related: [
      {
        href: "/blog/lesson-guide/adult-piano-tutoring",
        label: "성인 피아노 학원과 개인 레슨 비교",
        description: "그룹 환경과 1:1 피드백 중 생활 방식에 맞는 선택 기준을 살펴봅니다.",
      },
      {
        href: "/blog/repertoire/easy-piano-songs",
        label: "성인 취미 피아노 곡 추천",
        description: "처음 완성할 곡을 난이도와 연습 목적에 맞춰 고르는 방법입니다.",
      },
    ],
  }),
  children: defineServicePage({
    path: "/lessons/children",
    label: "어린이 피아노 레슨",
    primaryKeyword: "어린이 피아노 레슨",
    supportingKeywords: ["어린이 피아노", "유아 피아노", "초등학생 피아노"],
    role: "expansion",
    intent: "commercial",
    cluster: "children",
    title: "어린이 피아노 레슨 | 이화 피아노 과외",
    description:
      "어린이 피아노 레슨은 유아·초등학생의 집중 시간에 맞춰 바른 자세, 악보 읽기, 연습 습관을 배웁니다. 수업 방식과 비용을 확인하세요.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/program-child.jpg"),
    imageAlt: "어린이 피아노 레슨에서 작은 손으로 건반을 연주하는 모습",
    lede: "어린이 피아노 레슨은 유아 피아노의 첫 건반부터 초등학생 피아노의 악보 읽기와 연습 습관까지 집중 시간에 맞춰 연결하는 1:1 수업입니다.",
    authority: {
      answer:
        "유아와 초등학생의 집중 시간, 읽기 수준과 가정 연습 환경을 확인해 짧고 반복 가능한 과제로 나눕니다.",
      scope: "첫 건반, 자세와 악보 읽기, 아이별 수업 속도, 부모의 연습 지원 방법을 설명합니다.",
      boundary:
        "모든 아이에게 적용되는 단일 시작 나이나 진도를 제시하지 않으며, 발달 또는 학습 성과를 보장하지 않습니다.",
    },
    sections: [
      {
        heading: "유아·초등학생 어린이 피아노는 무엇부터 배우나요?",
        lead: "처음에는 많은 곡을 빠르게 끝내기보다 몸의 긴장을 줄이고, 악보와 건반의 관계를 이해하는 데 집중합니다.",
        paragraphs: [
          "앉는 위치, 팔과 손목의 높이, 손가락 번호를 확인한 뒤 짧은 리듬과 음형을 연주합니다. 악보는 음 이름만 외우기보다 위아래 움직임과 박자를 함께 읽도록 돕습니다. 아이가 설명을 듣는 방식이 시각적 표현에 가까운지, 소리를 따라 하는 데 익숙한지도 살펴 수업 방법을 바꿉니다.",
          "새로운 내용을 이해했더라도 집에서 다시 해 볼 수 있어야 학습이 이어집니다. 수업 끝에는 오늘 배운 것과 다음 주까지 반복할 부분을 작게 나눕니다. 부모님에게는 정답을 대신 알려 주기보다 연습할 시간과 환경을 마련하는 방법을 안내합니다.",
        ],
        points: [
          "바른 자세와 힘을 빼는 손 사용",
          "음표, 박자, 손가락 번호를 함께 읽는 기초",
          "짧게 시작해 반복 가능한 주간 연습 계획",
        ],
      },
      {
        heading: "아이에게 맞는 수업 속도는 어떻게 정하나요?",
        lead: "아이의 나이만으로 진도를 정하지 않고 집중 시간, 기호 이해, 손의 움직임, 수업에 대한 반응을 함께 봅니다.",
        paragraphs: [
          "같은 학년이라도 처음 접하는 기호를 이해하는 속도와 손으로 옮기는 속도는 다릅니다. 잘되는 부분은 충분히 칭찬하고, 막히는 부분은 더 작은 단위로 나눕니다. 반복이 길어져 흥미가 떨어질 때는 리듬 활동이나 익숙한 곡을 섞어 배운 개념을 다른 방식으로 확인합니다.",
          "진도는 교재의 페이지 수보다 아이가 혼자 다시 해 볼 수 있는지를 기준으로 봅니다. 학교 행사나 시험으로 연습 시간이 줄어드는 주에는 과제를 줄이고, 여유가 생기면 새 곡과 기초 연습의 비중을 다시 조정합니다. 꾸준히 배우기 위한 속도는 매주 같을 필요가 없습니다.",
        ],
      },
      {
        heading: "부모는 어린이 피아노 연습을 어떻게 도울 수 있나요?",
        lead: "부모의 가장 중요한 역할은 직접 가르치는 것이 아니라, 아이가 짧게라도 건반 앞에 앉을 수 있는 환경을 만드는 것입니다.",
        paragraphs: [
          "연습 시작 시간을 아이와 미리 정하고, 한 번에 긴 시간을 요구하지 않는 것이 좋습니다. 틀린 음을 바로 지적하기보다 선생님이 표시한 구간을 확인하고, 끝까지 해낸 과정을 구체적으로 말해 주세요. 갈등이 반복되면 과제의 양이나 곡의 난이도가 현재 생활과 맞는지 수업에서 다시 조정합니다.",
          "첫 방문 수업 전에는 건반 주변을 정리하고 교재와 필기 도구를 가까이 두면 충분합니다. 수업 중 부모님의 참관 여부는 아이의 성향에 따라 다르게 정할 수 있습니다. 상담에서 평소 연습 반응과 이전 학습 경험을 알려 주시면 수업 계획을 세우는 데 도움이 됩니다.",
        ],
      },
    ],
    faq: [
      {
        q: "어린이 피아노는 몇 살부터 시작해야 하나요?",
        a: "정해진 한 나이보다 간단한 설명을 듣고 따라 하는지, 건반과 음악에 관심을 보이는지, 짧은 시간 앉아 있을 수 있는지를 함께 확인합니다.",
      },
      {
        q: "부모가 악보를 몰라도 연습을 도울 수 있나요?",
        a: "가능합니다. 부모님은 직접 음을 가르치기보다 정해진 시간과 조용한 환경을 마련하고, 수업에서 표시한 구간을 아이와 확인해 주시면 됩니다.",
      },
      {
        q: "어린이 피아노 수업은 몇 분 진행하나요?",
        a: "45분 또는 60분 수업을 운영합니다. 처음 상담에서 아이의 집중 시간, 경험, 목표를 확인한 뒤 적합한 수업 시간을 안내합니다.",
      },
      {
        q: "집으로 방문하는 어린이 피아노 레슨도 가능한가요?",
        a: "서울 서대문구와 마포구는 일정과 위치를 협의해 방문 레슨을 진행할 수 있습니다. 그 외 지역은 온라인 수업 가능 여부를 확인합니다.",
      },
    ],
    relatedServices: [
      {
        href: "/lessons/home-visit",
        label: "피아노 방문 레슨",
        description: "서대문구·마포구 가정에서 진행하는 수업과 준비 사항을 확인합니다.",
      },
      {
        href: "/pricing",
        label: "어린이 피아노 레슨비",
        description: "45분·60분 과정의 월 비용과 무료 첫 상담을 확인합니다.",
      },
    ],
    related: [
      {
        href: "/blog/parents/piano-start-age",
        label: "유아 피아노 시작 전 확인할 점",
        description: "나이 숫자보다 먼저 살펴볼 관심, 집중, 기호 이해의 신호를 정리합니다.",
      },
      {
        href: "/blog/lesson-guide/elementary-piano-tutoring",
        label: "초등학생 피아노 레슨 가이드",
        description: "초등 시기에 필요한 손 습관, 커리큘럼, 부모의 역할을 안내합니다.",
      },
    ],
  }),
  homeVisit: defineServicePage({
    path: "/lessons/home-visit",
    label: "피아노 방문 레슨",
    primaryKeyword: "피아노 방문 레슨",
    supportingKeywords: ["방문 피아노", "서대문구 피아노 레슨", "마포구 피아노 레슨"],
    role: "expansion",
    intent: "local",
    cluster: "home-visit",
    title: "서울 피아노 방문 레슨 | 서대문구·마포구 1:1 과외",
    description:
      "피아노 방문 레슨을 서울 서대문구·마포구에서 협의해 진행합니다. 익숙한 집의 악기로 받는 1:1 수업 방식과 준비 사항을 확인하세요.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/cat-local.jpg"),
    imageAlt: "서울 피아노 방문 레슨을 위한 집 안의 피아노와 악보",
    lede: "피아노 방문 레슨은 서울 서대문구와 마포구에서 학생이 평소 연습하는 집의 악기로 진행하는 1:1 수업입니다.",
    authority: {
      answer:
        "서울 서대문구와 마포구는 위치와 시간을 확인해 방문 일정을 협의하고, 그 외 지역은 온라인 수업 가능성을 안내합니다.",
      scope: "방문 가능 지역, 가정 악기와 공간 준비, 일정 협의와 온라인 대안을 설명합니다.",
      boundary:
        "서울 전 지역 방문을 약속하지 않으며, 실제 가능 여부는 동 단위 위치와 일정 확인 뒤 확정합니다.",
    },
    sections: [
      {
        heading: "피아노 방문 레슨의 장점은 무엇인가요?",
        lead: "방문 수업은 이동 부담을 줄이고, 학생이 매일 사용하는 악기와 의자, 악보 환경을 수업에서 그대로 점검할 수 있습니다.",
        paragraphs: [
          "어린이는 이동 뒤 다시 집중해야 하는 부담을 덜 수 있고, 부모님은 수업 전후의 준비와 과제를 같은 공간에서 확인할 수 있습니다. 성인은 퇴근 후 이동 시간을 줄이고 자신의 악기에서 바로 연습 방법을 적용할 수 있습니다. 특히 의자 높이와 건반 거리처럼 집에서 반복되는 자세를 함께 조정하기 좋습니다.",
          "다만 집에서 받는다는 이유만으로 모든 학생에게 방문 방식이 더 좋은 것은 아닙니다. 수업 시간 동안 방해받지 않을 공간이 있는지, 악기 주변에서 대화와 필기가 가능한지, 선생님의 이동 일정과 맞는지를 확인해야 합니다. 상담에서 위치와 가능한 시간을 먼저 알려 주세요.",
        ],
        points: [
          "서울 서대문구와 마포구 방문 일정 협의",
          "학생이 평소 사용하는 악기와 자세를 직접 확인",
          "방문이 어려운 지역은 온라인 화상 수업 검토",
        ],
      },
      {
        heading: "첫 방문 수업 전에 무엇을 준비하나요?",
        lead: "피아노나 디지털 건반, 의자, 사용 중인 교재와 필기 도구를 한곳에 준비하면 충분합니다.",
        paragraphs: [
          "건반 위와 주변의 물건을 치우고, 악보를 펼칠 수 있는 보면대가 있는지 확인해 주세요. 디지털 피아노를 사용한다면 전원과 페달 연결 상태, 음량을 확인하면 수업을 바로 시작할 수 있습니다. 수업 중 손과 자세를 볼 수 있도록 의자 주변에 최소한의 이동 공간을 마련하는 것도 도움이 됩니다.",
          "기존 교재가 있으면 현재까지 배운 페이지와 어려웠던 부분을 표시해 주세요. 처음 시작해 교재가 없다면 미리 구입하지 않아도 됩니다. 상담과 첫 진단 뒤 목표와 수준에 맞는 준비를 안내합니다. 온라인으로 전환할 가능성이 있다면 휴대전화나 태블릿을 둘 위치도 함께 살펴볼 수 있습니다.",
        ],
      },
      {
        heading: "서대문구·마포구 피아노 방문 레슨 지역은 어디인가요?",
        lead: "서대문구 피아노 레슨과 마포구 피아노 레슨 가능 여부는 정확한 위치, 이동 시간, 원하는 요일을 함께 확인해 결정합니다.",
        paragraphs: [
          "레슨은 월요일부터 토요일까지 운영하며 구체적인 시간은 협의합니다. 상담 신청에 동 단위의 지역, 가능한 요일과 시간대, 학생의 목표를 남겨 주세요. 개인정보 보호를 위해 상세 주소는 초기 문의에 적을 필요가 없으며, 수업 일정이 정해진 뒤 필요한 범위에서 확인합니다.",
          "방문 일정이 맞지 않거나 지역이 멀다면 온라인 화상 수업을 대안으로 안내할 수 있습니다. 온라인 수업은 이동 없이 같은 선생님과 진행할 수 있지만, 기기 배치와 연결 환경을 미리 확인해야 합니다. 두 방식의 장단점을 생활 동선과 학습 목표에 맞춰 비교해 주세요.",
        ],
      },
    ],
    faq: [
      {
        q: "피아노 방문 레슨은 어느 지역에서 가능한가요?",
        a: "서울 서대문구와 마포구에서 정확한 위치와 이동 일정을 확인한 뒤 협의합니다. 그 외 지역은 온라인 화상 수업 가능 여부를 안내합니다.",
      },
      {
        q: "방문 레슨을 위해 어쿠스틱 피아노가 꼭 필요한가요?",
        a: "어쿠스틱 피아노만 가능한 것은 아닙니다. 현재 사용하는 디지털 피아노나 건반의 종류를 상담에서 알려 주시면 수업 가능 여부를 확인합니다.",
      },
      {
        q: "방문 레슨 때 부모가 함께 있어야 하나요?",
        a: "아이의 나이와 성향에 따라 다릅니다. 첫 수업 전 보호자와 진행 방식을 협의하고, 수업을 방해하지 않는 범위에서 참관 여부를 정합니다.",
      },
      {
        q: "방문 수업이 어려운 주에는 온라인으로 바꿀 수 있나요?",
        a: "일정 변경과 수업 방식 전환은 미리 협의가 필요합니다. 가능한 시간과 기기 환경을 확인한 뒤 진행 여부를 안내합니다.",
      },
    ],
    relatedServices: [
      {
        href: "/lessons/private",
        label: "피아노 개인 레슨",
        description: "방문과 온라인을 포함한 1:1 수업의 진단과 피드백 방식을 확인합니다.",
      },
      {
        href: "/pricing",
        label: "피아노 방문 레슨비 확인",
        description: "45분·60분 과정의 월 비용과 포함 항목을 확인합니다.",
      },
    ],
    related: [
      {
        href: "/blog/parents/home-lesson-prep",
        label: "방문 피아노 레슨 준비 가이드",
        description: "첫 방문 전 악기, 의자, 교재와 수업 공간을 점검하는 방법입니다.",
      },
      {
        href: "/blog/local/seodaemun-piano",
        label: "서대문구 피아노 레슨 안내",
        description: "서대문구 방문 수업을 알아볼 때 확인할 위치와 일정 기준입니다.",
      },
    ],
  }),
  admission: defineServicePage({
    path: "/lessons/admission",
    label: "피아노 입시 레슨",
    primaryKeyword: "피아노 입시 레슨",
    supportingKeywords: ["피아노 입시", "음대 입시", "피아노 콩쿠르"],
    role: "expansion",
    intent: "commercial",
    cluster: "admission",
    title: "피아노 입시 레슨 | 이화 피아노 과외",
    description:
      "피아노 입시 레슨은 현재 실기 수준, 목표 학교, 일정에 맞춰 곡 해석과 무대 준비를 설계합니다. 상담 과정과 월별 비용을 확인하세요.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/program-exam.jpg"),
    imageAlt: "피아노 입시 레슨을 위해 악보를 보며 그랜드 피아노를 연주하는 모습",
    lede: "피아노 입시 레슨은 현재 실기 수준, 목표 학교, 남은 기간과 준비 곡에 맞춰 우선순위를 세우는 1:1 수업입니다.",
    authority: {
      answer:
        "현재 연주와 기본기, 목표 학교, 남은 기간을 함께 확인해 곡별 보완 순서와 실전 점검 계획을 세웁니다.",
      scope: "첫 진단, 입시곡 완성 순서, 주간 연습, 모의 연주와 콩쿠르 준비 기준을 설명합니다.",
      boundary:
        "합격이나 수상을 보장하지 않으며, 전형 요강과 지정곡은 지원 시점의 학교·주최 기관 공식 안내를 다시 확인해야 합니다.",
    },
    sections: [
      {
        heading: "피아노 입시 레슨은 첫 상담에서 무엇을 확인하나요?",
        lead: "목표 학교와 전형 일정만 묻지 않고, 현재 연주하는 곡의 완성도와 기본기, 확보할 수 있는 연습 시간을 먼저 확인합니다.",
        paragraphs: [
          "가능하면 준비 중인 곡을 처음부터 끝까지 듣고, 리듬과 음정의 정확성, 프레이즈, 터치, 암보 안정성을 나누어 봅니다. 아직 곡이 정해지지 않았다면 지금까지 공부한 레퍼토리와 학습 경험을 기준으로 출발점을 잡습니다. 진단은 합격 가능성을 단정하기 위한 것이 아니라 남은 기간에 무엇을 먼저 바꿔야 하는지 찾는 과정입니다.",
          "입시 일정과 현재 수준이 맞지 않는 경우에는 무리한 약속을 하지 않고 준비 범위와 선택지를 설명합니다. 목표가 확정되지 않았다면 학교별 요구를 확인하기 전에 기본 레퍼토리와 연주 습관을 정리할 수 있습니다. 구체적인 전형 정보는 지원 시점의 학교 공식 안내를 반드시 다시 확인해야 합니다.",
        ],
        points: [
          "현재 레퍼토리와 기본기 진단",
          "목표 학교와 전형 일정 확인",
          "주간 연습 시간에 맞춘 우선순위 설계",
        ],
      },
      {
        heading: "입시곡은 어떤 순서로 완성하나요?",
        lead: "곡 전체를 반복하는 것보다 악보 분석, 어려운 구간, 암보, 전체 흐름, 실전 연주를 단계별로 구분해 점검합니다.",
        paragraphs: [
          "처음에는 형식과 화성의 흐름, 손가락과 페달 계획을 정리합니다. 기술적으로 막히는 구간은 느린 속도와 리듬 변형, 손 분리로 해결하고, 연결이 안정되면 긴 호흡과 음색을 다듬습니다. 암보는 손의 기억에만 의존하지 않도록 시작 지점과 구조를 여러 위치에서 확인합니다.",
          "완성 단계에서는 중간에 멈추지 않고 연주하는 시간을 따로 둡니다. 녹음이나 모의 연주 뒤에는 모든 실수를 한꺼번에 고치지 않고 가장 크게 들린 문제부터 다시 연습합니다. 컨디션이 달라져도 연주를 이어갈 수 있도록 시작 전 준비와 실수 뒤 복귀 방법도 함께 점검합니다.",
        ],
      },
      {
        heading: "콩쿠르 준비와 음대 입시는 어떻게 다른가요?",
        lead: "두 목표 모두 완성도 높은 연주가 필요하지만, 일정과 평가 기준, 곡을 선택하는 방식은 서로 다를 수 있습니다.",
        paragraphs: [
          "콩쿠르는 연령과 부문, 지정곡 여부, 무대 경험이라는 목적을 먼저 살펴야 합니다. 입시는 지원 학교의 전형, 곡목 조건, 전체 준비 과정을 함께 관리해야 합니다. 같은 곡을 사용하더라도 어느 무대에서 무엇을 보여 줄지에 따라 연습의 우선순위가 달라질 수 있습니다.",
          "수업에서는 공식 모집 요강이나 콩쿠르 공지를 학생과 보호자가 직접 확인하도록 안내하고, 확인된 조건을 바탕으로 연주 준비를 돕습니다. 결과를 보장하거나 확인되지 않은 기준을 단정하지 않습니다. 현재 목표와 일정을 상담에서 알려 주시면 지도 가능한 범위와 진행 방식을 안내합니다.",
        ],
      },
    ],
    faq: [
      {
        q: "피아노 입시 레슨은 언제 시작해야 하나요?",
        a: "시작 시점은 현재 수준, 목표 학교, 준비 곡과 남은 기간에 따라 달라집니다. 먼저 연주를 확인한 뒤 가능한 준비 순서와 수업 범위를 안내합니다.",
      },
      {
        q: "입시곡이 정해지지 않아도 상담할 수 있나요?",
        a: "가능합니다. 지금까지 배운 곡과 기본기, 목표를 확인한 뒤 다음에 검토할 레퍼토리와 준비 과정을 함께 정리합니다.",
      },
      {
        q: "피아노 콩쿠르 준비도 함께 가능한가요?",
        a: "가능합니다. 참가 부문과 일정, 지정곡 여부를 확인하고 곡의 완성도와 실전 연주를 단계별로 점검합니다.",
      },
      {
        q: "입시 레슨이 합격이나 수상을 보장하나요?",
        a: "합격이나 수상을 보장하지 않습니다. 확인된 전형 조건과 현재 연주를 바탕으로 준비 방향을 세우고, 수업에서 개선할 부분을 구체적으로 지도합니다.",
      },
    ],
    relatedServices: [
      {
        href: "/pricing",
        label: "피아노 입시 레슨비",
        description: "입시·콩쿠르 과정의 월 비용, 수업 시간, 포함 항목을 확인합니다.",
      },
      {
        href: "/lessons/private",
        label: "피아노 개인 레슨",
        description: "현재 연주 수준을 진단하고 주간 연습을 설계하는 1:1 수업을 확인합니다.",
      },
    ],
    related: [
      {
        href: "/blog/exam/music-college-entrance",
        label: "음대 입시 준비 로드맵",
        description: "지원 일정과 현재 수준을 기준으로 준비 단계를 나누는 방법입니다.",
      },
      {
        href: "/blog/exam/competition-prep",
        label: "피아노 콩쿠르 첫 도전 가이드",
        description: "대회 선택, 연습 일정, 무대 전 점검 항목을 차례로 확인합니다.",
      },
    ],
  }),
  pricing: defineServicePage({
    path: "/pricing",
    label: "피아노 레슨비",
    primaryKeyword: "피아노 레슨비",
    supportingKeywords: [
      "피아노 레슨 비용",
      "피아노 개인 레슨 비용",
      "피아노 과외 비용",
      "성인 피아노 학원 가격",
    ],
    role: "expansion",
    intent: "commercial",
    cluster: "pricing",
    title: "피아노 레슨비 | 이화 피아노 과외",
    description:
      "피아노 레슨비는 월 4회 45분 160,000원, 60분 240,000원부터 안내합니다. 입시·콩쿠르 수업과 포함 항목, 첫 상담을 확인하세요.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/plate-score.jpg"),
    imageAlt: "피아노 레슨비 안내 옆에 놓인 피아노 악보와 건반",
    lede: "피아노 레슨비는 월 4회 기준 160,000원부터 320,000원까지이며, 수업 시간과 목표에 따라 세 과정으로 안내합니다.",
    authority: {
      answer:
        "월 4회 기준 45분 160,000원, 60분 240,000원, 입시·콩쿠르 60분 320,000원의 세 과정을 공개합니다.",
      scope: "과정별 수업 시간, 월 비용, 포함 항목, 첫 상담과 일정 변경 기준을 설명합니다.",
      boundary:
        "교재 구입비와 대관·콩쿠르 참가비 등 외부 비용은 별도일 수 있으며, 최종 과정은 목표와 수업 범위를 확인한 뒤 정합니다.",
    },
    sections: [
      {
        heading: "피아노 개인 레슨 비용에는 무엇이 포함되나요?",
        lead: "피아노 레슨 비용과 수업 시간, 안내 항목을 공개해 상담 전에 필요한 범위를 비교할 수 있습니다.",
        paragraphs: [
          "취미 스타터는 주 1회 45분 수업으로 기초 교재 안내와 온라인 질문 답변을 포함합니다. 정규 집중은 주 1회 60분 수업으로 맞춤 커리큘럼과 월 1회 연주 영상 피드백을 제공합니다. 입시·콩쿠르 과정은 주 1회 60분 수업으로 입시 전략 상담과 모의 연주 평가를 포함합니다.",
          "표시된 금액은 월 단위 과정 안내입니다. 현재 수준과 목표를 확인하지 않은 채 더 비싼 과정을 권하지 않습니다. 취미로 시작하는지, 한 곡 완성이 목표인지, 시험과 무대를 준비하는지에 따라 필요한 수업 시간과 피드백 범위를 상담에서 함께 정합니다.",
        ],
        points: [
          "취미 스타터 월 160,000원, 주 1회 45분",
          "정규 집중 월 240,000원, 주 1회 60분",
          "입시·콩쿠르 월 320,000원, 주 1회 60분",
        ],
      },
      {
        heading: "45분과 60분 수업은 어떻게 선택하나요?",
        lead: "수업 시간은 단순히 길수록 좋은 것이 아니라 집중 시간, 목표, 다룰 곡의 분량과 피드백 범위에 맞아야 합니다.",
        paragraphs: [
          "처음 배우는 어린이나 기초 취미 수업은 45분 안에서 자세, 악보 읽기, 한두 가지 과제를 집중해 다룰 수 있습니다. 여러 곡을 병행하거나 연주 영상 피드백, 입시 준비처럼 확인할 범위가 넓다면 60분 과정이 적합할 수 있습니다. 첫 상담에서 수업 대상과 목표를 확인해 선택을 돕습니다.",
          "정해진 과정을 한 번 선택했다고 계속 유지해야 하는 것은 아닙니다. 목표와 일정이 달라지면 다음 수업 계획을 협의할 수 있습니다. 비용만 비교하지 말고 수업 시간에 어떤 피드백을 받고, 집에서 어떤 연습을 이어갈 수 있는지도 함께 확인하는 것이 좋습니다.",
        ],
      },
      {
        heading: "첫 상담과 체험 레슨에서는 무엇을 확인하나요?",
        lead: "첫 상담과 30분 체험 레슨은 무료이며, 현재 경험과 목표, 수업 방식의 궁합을 확인하는 시간입니다.",
        paragraphs: [
          "상담 신청에 수강 대상, 목표, 희망 요일과 시간을 남기면 가능한 일정을 확인합니다. 체험에서는 간단한 연주나 기초 동작을 보고 설명 방식과 시작점을 안내합니다. 처음 배우는 분은 연주를 준비하지 않아도 되며, 사용 중인 교재나 원하는 곡이 있다면 함께 알려 주세요.",
          "체험 뒤에는 권하는 수업 시간과 과정, 방문 또는 온라인 진행 가능 여부를 설명합니다. 바로 등록해야 하는 조건을 두지 않으며, 안내받은 내용과 생활 일정을 비교해 결정할 수 있습니다. 상세한 일정은 선생님의 기존 수업과 이동 시간을 함께 확인해 확정합니다.",
        ],
      },
    ],
    faq: [
      {
        q: "피아노 레슨비는 월 얼마인가요?",
        a: "월 4회 기준 취미 스타터 160,000원, 정규 집중 240,000원, 입시·콩쿠르 320,000원입니다. 과정별 수업 시간과 포함 항목은 이 페이지의 요금표에서 확인할 수 있습니다.",
      },
      {
        q: "첫 상담과 체험 레슨에도 비용이 있나요?",
        a: "첫 상담과 30분 체험 레슨은 무료입니다. 현재 수준과 목표, 가능한 수업 방식과 일정을 확인한 뒤 정규 과정을 안내합니다.",
      },
      {
        q: "교재 비용이 피아노 레슨비에 포함되나요?",
        a: "취미 스타터에는 기초 교재 안내가 포함되지만 교재 구입비 포함 여부는 별도로 확인해야 합니다. 기존 교재가 있다면 상담에서 먼저 알려 주세요.",
      },
      {
        q: "방문 레슨과 온라인 레슨의 비용은 같은가요?",
        a: "이 페이지에는 과정별 기본 월 비용을 안내합니다. 정확한 위치와 수업 방식에 따른 적용 여부는 상담에서 확인해 안내합니다.",
      },
      {
        q: "성인 피아노 학원 가격과 1:1 레슨비는 어떻게 비교하나요?",
        a: "학원 가격은 그룹 여부, 시설, 수업 시간과 운영 방식에 따라 달라질 수 있습니다. 이 페이지의 1:1 월 비용과 수업 시간, 피드백 범위를 같은 기준으로 놓고 비교해 주세요.",
      },
    ],
    relatedServices: [
      {
        href: "/lessons/private",
        label: "피아노 개인 레슨",
        description: "1:1 수업의 진단, 피드백, 주간 연습 설계 방식을 확인합니다.",
      },
      {
        href: "/lessons/admission",
        label: "피아노 입시 레슨",
        description: "입시·콩쿠르 과정이 일반 취미 수업과 다른 준비 범위를 확인합니다.",
      },
    ],
    related: [
      {
        href: "/blog/lesson-guide/piano-tutoring-cost",
        label: "피아노 과외 비용 비교 가이드",
        description: "수업 시간, 횟수, 지도 범위를 기준으로 비용을 비교하는 방법입니다.",
      },
      {
        href: "/blog/lesson-guide/academy-vs-tutoring",
        label: "피아노 학원과 개인 레슨 비교",
        description: "수업 구조, 이동, 피드백 방식까지 함께 살펴보는 선택 기준입니다.",
      },
    ],
  }),
} as const;

const STATIC_PUBLIC_PAGES = [
  {
    path: "/",
    label: "피아노 레슨",
    primaryKeyword: "피아노 레슨",
    role: "main",
    intent: "commercial",
    cluster: "lesson",
    title: SITE.title,
    description: SITE.description,
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/hero-still.jpg"),
  },
  {
    path: "/about",
    label: "피아노 선생님",
    primaryKeyword: "피아노 선생님",
    role: "expansion",
    intent: "comparison",
    cluster: "lesson",
    title: "피아노 선생님 김서연 | 이화 피아노 과외",
    description:
      "피아노 선생님 김서연은 이화여자대학교 피아노과 재학생입니다. 콩쿠르 수상 경력과 어린이·성인·입시 1:1 레슨 철학, 수업 방식을 안내합니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/portrait.jpg"),
  },
  {
    path: "/blog",
    label: "피아노 레슨 정보",
    primaryKeyword: "피아노 레슨 정보",
    role: "informational",
    intent: "informational",
    cluster: "general",
    title: "피아노 레슨 정보 | 이화 피아노 과외",
    description:
      "피아노 레슨 정보와 연습법, 곡 추천, 어린이 교육, 입시·콩쿠르, 서울 지역 수업 안내를 검색 목적별로 정리한 칼럼입니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/plate-score.jpg"),
  },
  {
    path: "/research",
    label: "피아노 통계",
    primaryKeyword: "피아노 통계",
    role: "informational",
    intent: "informational",
    cluster: "research",
    title: "피아노 통계 자료실 | 공식 데이터·가공 CSV",
    description:
      "피아노 통계 자료실에서 교육부·국가데이터처와 서울특별시교육청 원자료, 직접 식별정보와 행 위치를 제거한 가공 CSV, 방법론과 한계를 함께 확인할 수 있습니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/plate-score.jpg"),
  },
  {
    path: "/research/2025-music-private-education-statistics",
    label: "2025 음악 사교육비 통계",
    primaryKeyword: "음악 사교육비 통계",
    role: "informational",
    intent: "informational",
    cluster: "research",
    title: "음악 사교육비 통계 2025 | 교육부·국가데이터처",
    description:
      "음악 사교육비 통계 2025 공식 조사에서 전국·초등·중등·고등 총액을 확인하고 원문 PDF와 가공 CSV, 조사 한계를 함께 내려받을 수 있습니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/plate-score.jpg"),
  },
  {
    path: "/research/2026-seoul-piano-academy-fees",
    label: "2026 서울 피아노 학원비",
    primaryKeyword: "서울 피아노 학원비",
    role: "informational",
    intent: "comparison",
    cluster: "research",
    title: "서울 피아노 학원비 2026 | 학원·교습소 등록 교습비",
    description:
      "서울 피아노 학원비를 2026년 서울특별시교육청 등록 교습비 원자료로 분석했습니다. 학원·교습소를 분리해 중앙값, 사분위수, 표본 수와 가공 CSV를 제공합니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/plate-score.jpg"),
  },
  {
    path: "/research/methodology",
    label: "피아노 데이터 방법론",
    primaryKeyword: "피아노 데이터 방법론",
    role: "informational",
    intent: "informational",
    cluster: "research",
    title: "피아노 데이터 방법론 | 필터·통계·수정 이력",
    description:
      "피아노 데이터 방법론에서 공식 원자료 수집, 피아노 행 필터, 직접 식별정보 제거, 중앙값·사분위수 계산, 한계와 수정 이력을 공개합니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/plate-score.jpg"),
  },
  {
    path: "/privacy",
    label: "개인정보 처리 안내",
    primaryKeyword: "개인정보 처리 안내",
    role: "utility",
    intent: "navigational",
    cluster: "general",
    title: "개인정보 처리 안내 | 이화 피아노 과외",
    description:
      "개인정보 처리 안내에서 이화 피아노 과외 상담 신청 시 처리하는 항목과 목적, 보유 기간, 이용자 권리를 확인할 수 있습니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/hero-still.jpg"),
  },
  {
    path: "/sitemap",
    label: "사이트맵",
    primaryKeyword: "사이트맵",
    role: "utility",
    intent: "navigational",
    cluster: "general",
    title: "사이트맵 | 이화 피아노 과외",
    description:
      "이화 피아노 과외의 레슨 안내, 요금, 선생님 소개, 피아노 정보 글을 한곳에서 찾을 수 있는 사이트맵입니다.",
    lastModified: SEO_UPDATED_AT,
    image: absoluteAsset("/assets/hero-still.jpg"),
  },
] as const satisfies readonly PublicPageDefinition[];

export const PUBLIC_PAGES = [
  ...STATIC_PUBLIC_PAGES,
  SERVICE_PAGES.private,
  SERVICE_PAGES.adult,
  SERVICE_PAGES.children,
  SERVICE_PAGES.homeVisit,
  SERVICE_PAGES.admission,
  SERVICE_PAGES.pricing,
] as const satisfies readonly PublicPageDefinition[];

export const PUBLIC_PAGE_BY_PATH = new Map(PUBLIC_PAGES.map((page) => [page.path, page]));

export const SERVICE_PAGE_BY_PATH = new Map(
  Object.values(SERVICE_PAGES).map((page) => [page.path, page]),
);

export const SERVICE_PAGE_BY_CLUSTER: Record<KeywordCluster, LessonLandingDefinition> = {
  general: SERVICE_PAGES.private,
  lesson: SERVICE_PAGES.private,
  pricing: SERVICE_PAGES.pricing,
  adult: SERVICE_PAGES.adult,
  children: SERVICE_PAGES.children,
  "home-visit": SERVICE_PAGES.homeVisit,
  admission: SERVICE_PAGES.admission,
  practice: SERVICE_PAGES.private,
  repertoire: SERVICE_PAGES.adult,
  local: SERVICE_PAGES.homeVisit,
};

const POST_SERVICE_OVERRIDES: Record<string, LessonLandingDefinition> = {
  "piano-tutoring-cost": SERVICE_PAGES.pricing,
  "adult-piano-tutoring": SERVICE_PAGES.adult,
  "elementary-piano-tutoring": SERVICE_PAGES.children,
  "piano-start-age": SERVICE_PAGES.children,
  "home-lesson-prep": SERVICE_PAGES.homeVisit,
  "seodaemun-piano": SERVICE_PAGES.homeVisit,
  "mapo-piano": SERVICE_PAGES.homeVisit,
  "ewha-area-lesson": SERVICE_PAGES.homeVisit,
  "seoul-piano-tutoring": SERVICE_PAGES.homeVisit,
  "online-piano-lesson": SERVICE_PAGES.private,
  "music-college-entrance": SERVICE_PAGES.admission,
  "competition-prep": SERVICE_PAGES.admission,
  "competition-pieces": SERVICE_PAGES.admission,
  "stage-fright": SERVICE_PAGES.admission,
};

const POST_SUPPORTING_SERVICE_OVERRIDES: Record<string, readonly LessonLandingDefinition[]> = {
  "choosing-piano-tutor": [SERVICE_PAGES.pricing],
  "academy-vs-tutoring": [SERVICE_PAGES.pricing],
  "tutoring-time-guide": [SERVICE_PAGES.pricing],
  "adult-piano-tutoring": [SERVICE_PAGES.pricing],
  "elementary-piano-tutoring": [SERVICE_PAGES.pricing],
};

export function getServicePageForPost(
  cluster: KeywordCluster,
  slug: string,
): LessonLandingDefinition {
  return POST_SERVICE_OVERRIDES[slug] ?? SERVICE_PAGE_BY_CLUSTER[cluster];
}

export function getServicePagesForPost(
  cluster: KeywordCluster,
  slug: string,
): readonly LessonLandingDefinition[] {
  const pages = [
    getServicePageForPost(cluster, slug),
    ...(POST_SUPPORTING_SERVICE_OVERRIDES[slug] ?? []),
  ];

  return [...new Map(pages.map((page) => [page.path, page])).values()];
}

export const CATEGORY_SERVICE_PATHS = {
  "lesson-guide": [
    SERVICE_PAGES.private.path,
    SERVICE_PAGES.pricing.path,
    SERVICE_PAGES.adult.path,
    SERVICE_PAGES.children.path,
  ],
  practice: [SERVICE_PAGES.private.path, SERVICE_PAGES.children.path],
  exam: [SERVICE_PAGES.admission.path],
  repertoire: [SERVICE_PAGES.adult.path, SERVICE_PAGES.admission.path],
  parents: [SERVICE_PAGES.children.path, SERVICE_PAGES.homeVisit.path],
  local: [SERVICE_PAGES.homeVisit.path, SERVICE_PAGES.private.path],
} as const;

export function buildPublicPageHead(page: PublicPageDefinition) {
  const canonical = `${SITE_URL}${page.path === "/" ? "/" : page.path}`;
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: page.image },
      { property: "og:image:alt", content: `${page.label} 대표 이미지` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: page.image },
      { name: "twitter:image:alt", content: `${page.label} 대표 이미지` },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
