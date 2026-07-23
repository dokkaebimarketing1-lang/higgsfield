export const RESOURCE_UPDATED_AT = "2026-07-23";

export type PianoLevel = {
  id: string;
  stage: string;
  label: string;
  summary: string;
  criteria: readonly string[];
  skills: readonly string[];
  theory: readonly string[];
  repertoireExamples: readonly string[];
  readiness: readonly string[];
};

export const PIANO_LEVELS = [
  {
    id: "orientation",
    stage: "Level 1",
    label: "첫 건반·방향 익히기",
    summary:
      "건반의 반복 구조와 바른 자세를 익히고, 짧은 선율을 안정된 박으로 연주하는 단계입니다.",
    criteria: [
      "검은건반 두 개·세 개 묶음을 기준으로 도의 위치를 찾을 수 있습니다.",
      "높은음자리표의 가운데 도 주변 음을 손가락 번호와 함께 읽기 시작합니다.",
      "2분음표·4분음표와 같은 기본 길이를 세며 짧은 곡을 멈추지 않고 연주합니다.",
    ],
    skills: [
      "손목과 어깨의 과도한 힘을 줄인 기본 자세",
      "양손을 따로 사용한 5음 음형",
      "일정한 박으로 짧은 프레이즈 연결",
    ],
    theory: ["건반의 음이름과 옥타브의 반복", "보표·마디·박자표의 역할", "기본 음표와 쉼표의 길이"],
    repertoireExamples: [
      "바이엘 또는 동급 입문 교재의 짧은 양손 분담곡",
      "다섯 음 안에서 움직이는 민요 편곡",
      "한 손씩 연주하는 8마디 창작곡",
    ],
    readiness: [
      "교사의 도움 없이 시작 자세와 손가락 번호를 확인합니다.",
      "8마디 안팎의 곡에서 기본 박을 유지합니다.",
      "틀린 음을 들었을 때 멈춰 위치를 다시 찾을 수 있습니다.",
    ],
  },
  {
    id: "foundation",
    stage: "Level 2",
    label: "기초 읽기·양손 협응",
    summary:
      "두 보표를 함께 읽고, 양손이 다른 음형을 연주할 때 박과 손 모양을 유지하는 단계입니다.",
    criteria: [
      "높은음자리표와 낮은음자리표의 기준음을 사용해 가까운 음을 읽습니다.",
      "양손이 서로 다른 리듬 또는 진행을 맡는 16마디 안팎의 곡을 연주합니다.",
      "다이내믹과 레가토·스타카토 표시를 구분해 소리에 반영합니다.",
    ],
    skills: [
      "양손 5음 음형과 손가락 교체",
      "레가토·스타카토의 기본 터치",
      "느린 템포에서 양손 리듬 분리",
    ],
    theory: [
      "온음·반음과 장음계의 기본 구조",
      "셈여림표와 기본 아티큘레이션",
      "2/4·3/4·4/4박자의 강약",
    ],
    repertoireExamples: [
      "바이엘 후반 또는 동급 난도의 성격 소품",
      "안나 막달레나 바흐 음악수첩의 쉬운 미뉴에트",
      "쉬운 동요·OST의 양손 편곡",
    ],
    readiness: [
      "새 악보의 조표·박자·시작음을 먼저 확인합니다.",
      "양손 연주 중 한쪽이 흔들려도 느린 박을 다시 찾습니다.",
      "두 가지 이상의 셈여림을 구분해 연주합니다.",
    ],
  },
  {
    id: "developing",
    stage: "Level 3",
    label: "초급 확장·패턴 이해",
    summary:
      "음계·화음 패턴을 익히고, 짧은 곡의 형식과 프레이즈를 이해하며 스스로 구간 연습을 시작하는 단계입니다.",
    criteria: [
      "조표가 적은 장음계의 손가락 번호를 이해하고 일정한 박으로 연주합니다.",
      "분산화음·알베르티 베이스 등 반복 반주형을 인식하고 따로 연습합니다.",
      "ABA 같은 단순 형식에서 반복과 대비 구간을 구분해 설명합니다.",
    ],
    skills: [
      "한 옥타브 장음계와 기본 3화음",
      "왼손 반주 위에서 오른손 선율 표현",
      "페달을 짧게 바꾸는 기초 동작",
    ],
    theory: [
      "으뜸화음·버금딸림화음·딸림화음의 기초",
      "8분음표와 점음표가 포함된 리듬",
      "동기·프레이즈·반복·대비",
    ],
    repertoireExamples: [
      "체르니 100번 또는 동급의 짧은 연습곡",
      "부르크뮐러 25개의 연습곡 중 초기 작품",
      "쉬운 고전 소나티네의 한 악장",
    ],
    readiness: [
      "막히는 두세 마디를 스스로 표시하고 손을 나눠 연습합니다.",
      "메트로놈의 느린 기준 박에 맞춰 같은 구간을 반복합니다.",
      "곡의 반복·대비 구간과 기본 화음을 말로 설명합니다.",
    ],
  },
  {
    id: "intermediate",
    stage: "Level 4",
    label: "중급 독립·음악적 해석",
    summary:
      "여러 성부와 긴 형식을 다루며, 기술 문제를 진단하고 음색·프레이징 계획을 세우는 단계입니다.",
    criteria: [
      "두 옥타브 음계·아르페지오를 여러 조에서 고른 소리와 손가락 번호로 연주합니다.",
      "성부가 둘 이상인 악보에서 주선율과 내성을 구분해 균형을 조절합니다.",
      "완곡 전 구간을 나눠 연습하고 녹음을 바탕으로 수정할 지점을 찾습니다.",
    ],
    skills: [
      "빠른 음형의 리듬 변형·그룹 연습",
      "성부별 음량과 아티큘레이션 조절",
      "화성 변화에 맞춘 페달 교체",
    ],
    theory: [
      "장·단조 관계와 주요 3화음 연결",
      "소나티네·론도·2부 형식의 기본",
      "비화성음과 종지의 기초 인식",
    ],
    repertoireExamples: [
      "바흐 2성 인벤션 중 현재 성부 독립 수준에 맞는 곡",
      "고전 소나타의 비교적 짧은 악장",
      "슈만·차이콥스키 등의 중급 성격 소품",
    ],
    readiness: [
      "기술 문제를 음·리듬·손가락·긴장 중 하나로 구분해 설명합니다.",
      "녹음에서 박, 음 균형, 프레이즈의 수정 지점을 각각 찾습니다.",
      "처음부터 반복하지 않고 목적에 맞는 구간과 연습법을 선택합니다.",
    ],
  },
  {
    id: "advanced-planning",
    stage: "Level 5",
    label: "상급 준비·레퍼토리 설계",
    summary:
      "작품의 양식과 구조를 근거로 해석을 세우고, 무대 또는 장기 레퍼토리 목표에 맞춰 연습을 설계하는 단계입니다.",
    criteria: [
      "작곡 시대와 형식에 맞는 터치·페달·아티큘레이션 선택을 근거와 함께 설명합니다.",
      "큰 형식의 작품을 구간·주간 목표로 나누고 기술과 음악 과제를 별도로 관리합니다.",
      "연주 영상을 검토해 재현성, 긴장 관리, 암보의 취약 지점을 수정합니다.",
    ],
    skills: [
      "복합 리듬·도약·옥타브 등 작품별 기술의 분해 연습",
      "다성부 보이싱과 넓은 다이내믹 범위",
      "무대 순서에 맞춘 런스루와 회복 연습",
    ],
    theory: [
      "전조·확장 화음과 형식 분석",
      "시대별 연주 관습의 비교",
      "악구 구조와 긴장·해결의 설계",
    ],
    repertoireExamples: [
      "바흐 신포니아 또는 평균율 중 현재 대위법 수준에 맞는 작품",
      "고전 소나타의 빠른 악장",
      "낭만·인상주의 작품 중 교사와 기술 범위를 검토한 레퍼토리",
    ],
    readiness: [
      "작품의 기술·해석·암보 위험을 구분한 주간 계획을 작성합니다.",
      "완주 후 흔들린 지점에서 다시 시작하는 회복 연습을 수행합니다.",
      "다음 작품을 선택할 때 목표 기술과 현재 부담을 함께 비교합니다.",
    ],
  },
] as const satisfies readonly PianoLevel[];

export const LEVEL_ROADMAP_FAQ = [
  {
    question: "피아노 수준은 교재 번호만으로 판단할 수 있나요?",
    answer:
      "교재 번호는 참고 자료일 뿐입니다. 같은 교재를 사용해도 악보 읽기, 리듬, 양손 협응, 음색과 스스로 연습하는 능력은 다를 수 있으므로 여러 기준을 함께 확인해야 합니다.",
  },
  {
    question: "각 단계를 끝내는 데 얼마나 걸리나요?",
    answer:
      "고정 기간을 제시하거나 보장할 수 없습니다. 이전 경험, 연습 빈도, 곡의 난도, 신체 조건과 피드백 환경에 따라 달라지며 체크리스트는 달력 대신 현재 수행 능력을 확인하는 도구입니다.",
  },
  {
    question: "예시곡을 모두 쳐야 다음 단계로 갈 수 있나요?",
    answer:
      "아닙니다. 예시곡은 난도와 학습 요소를 이해하기 위한 참고이며 시험 목록이 아닙니다. 같은 기술과 음악 요소를 다루는 다른 곡으로 바꿀 수 있습니다.",
  },
  {
    question: "체크리스트 결과가 레슨 진단을 대신하나요?",
    answer:
      "대신하지 않습니다. 손의 긴장, 소리의 균형, 현재 악보와 목표처럼 화면만으로 판단하기 어려운 요소는 교사와 직접 확인하는 것이 좋습니다.",
  },
] as const;

export const PRACTICE_DAYS = [
  { id: "monday", label: "월요일" },
  { id: "tuesday", label: "화요일" },
  { id: "wednesday", label: "수요일" },
  { id: "thursday", label: "목요일" },
  { id: "friday", label: "금요일" },
  { id: "saturday", label: "토요일" },
  { id: "sunday", label: "일요일" },
] as const;

export const PRACTICE_MINUTE_FIELDS = [
  { key: "warmupMinutes", label: "몸풀기" },
  { key: "techniqueMinutes", label: "테크닉" },
  { key: "repertoireMinutes", label: "곡 연습" },
  { key: "readingMinutes", label: "초견·이론" },
] as const;

export type PracticeMinuteField = (typeof PRACTICE_MINUTE_FIELDS)[number]["key"];

export type PracticeDayEntry = {
  day: string;
  goal: string;
  warmupMinutes: number;
  techniqueMinutes: number;
  repertoireMinutes: number;
  readingMinutes: number;
  reflection: string;
};

export function createEmptyPracticeWeek(): PracticeDayEntry[] {
  return PRACTICE_DAYS.map((day) => ({
    day: day.label,
    goal: "",
    warmupMinutes: 0,
    techniqueMinutes: 0,
    repertoireMinutes: 0,
    readingMinutes: 0,
    reflection: "",
  }));
}

export function normalizePracticeMinutes(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(300, Math.max(0, Math.round(parsed)));
}

export function getPracticeDayTotal(entry: PracticeDayEntry): number {
  return PRACTICE_MINUTE_FIELDS.reduce(
    (total, field) => total + normalizePracticeMinutes(entry[field.key]),
    0,
  );
}

export function getPracticeWeekTotals(entries: readonly PracticeDayEntry[]) {
  const byCategory = Object.fromEntries(
    PRACTICE_MINUTE_FIELDS.map((field) => [
      field.key,
      entries.reduce((total, entry) => total + normalizePracticeMinutes(entry[field.key]), 0),
    ]),
  ) as Record<PracticeMinuteField, number>;

  return {
    byCategory,
    grandTotal: Object.values(byCategory).reduce((total, value) => total + value, 0),
  };
}

function spreadsheetSafeText(value: string): string {
  const normalized = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  return /^[=+\-@]/.test(normalized.trimStart()) ? `'${normalized}` : normalized;
}

function escapeCsvCell(value: string | number): string {
  const text = typeof value === "number" ? String(value) : spreadsheetSafeText(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildPracticePlannerCsv(entries: readonly PracticeDayEntry[]): string {
  const header = [
    "요일",
    "오늘의 목표",
    "몸풀기(분)",
    "테크닉(분)",
    "곡 연습(분)",
    "초견·이론(분)",
    "합계(분)",
    "연습 메모",
  ];
  const rows = entries.map((entry) => [
    entry.day,
    entry.goal,
    normalizePracticeMinutes(entry.warmupMinutes),
    normalizePracticeMinutes(entry.techniqueMinutes),
    normalizePracticeMinutes(entry.repertoireMinutes),
    normalizePracticeMinutes(entry.readingMinutes),
    getPracticeDayTotal(entry),
    entry.reflection,
  ]);

  return `\uFEFF${[header, ...rows]
    .map((row) => row.map((value) => escapeCsvCell(value)).join(","))
    .join("\r\n")}\r\n`;
}

export const PRACTICE_PLANNER_FAQ = [
  {
    question: "입력한 연습 계획이 서버에 저장되나요?",
    answer:
      "아닙니다. 입력 내용은 현재 브라우저 탭의 메모리에만 있으며 서버로 전송하거나 브라우저 저장소에 보관하지 않습니다. 새로고침하거나 탭을 닫으면 사라질 수 있으므로 필요한 경우 CSV로 내려받으세요.",
  },
  {
    question: "하루 연습 시간은 몇 분으로 정해야 하나요?",
    answer:
      "고정된 정답은 없습니다. 현재 집중할 수 있는 시간 안에서 몸풀기, 기술, 곡, 초견·이론의 우선순위를 정하고 통증이나 과도한 긴장이 생기면 중단하세요.",
  },
  {
    question: "작성한 내용을 PDF로 저장할 수 있나요?",
    answer:
      "인쇄 버튼을 누른 뒤 브라우저의 인쇄 대화상자에서 PDF 저장을 선택할 수 있습니다. 지원 방식과 파일 이름은 사용하는 브라우저와 운영체제에 따라 다릅니다.",
  },
] as const;
