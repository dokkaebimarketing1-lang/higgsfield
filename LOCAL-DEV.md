# 로컬 개발 가이드 (LOCAL-DEV)

이 문서는 세 가지를 설명합니다.

1. 왜 이 미러를 그대로 클론하면 빌드가 안 되는지
2. 그래도 콘텐츠·컴포넌트·스타일을 어떻게 수정하는지
3. 임시로 로컬 빌드/실행하는 우회 방법

---

## 1. 왜 그대로는 외부 빌드가 안 되나

이 저장소는 플랫폼 소유 스캐폴을 뺀 **소스 미러**입니다. 빠진 파일들:

| 제외된 것 | 역할 | 빠진 이유 |
|---|---|---|
| `app/packages/` (`@higgsfield/fnf`, `fnf-react`, `quanta`) | 플랫폼 전용 UI/SDK 벤더 패키지 | 플랫폼 남부 자산 |
| `skills/` | 플랫폼 에이전트 스킬 파일 | 플랫폼 남부 자산 |
| `AGENTS.md` | 플랫폼 에이전트 지침 | 플랫폼 남부 자산 |
| `.github/` | 플랫폼 CI 워크플로 | 플랫폼 남부 자산 |

이 때문에 두 곳이 깨집니다.

- **`app/package.json`** — `"@higgsfield/*": "workspace:*"` 의존성이 `app/packages/`를 가리키는데, 그 폴터가 없어서 `bun install`이 실패합니다.
- **`app/src/styles.css`** — `@import "@higgsfield/quanta/tailwind.css"` 와 `@source "../packages/quanta/src"` 가 없는 파일을 가리킵니다.

라이브 배포(ewha-piano.higgsfield.app)에는 영향이 없습니다. 배포 시 플랫폼이 이 파일들을 자동으로 다시 주입하거든요.

---

## 2. 콘텐츠 · 컴포넌트 · 스타일 수정 방법

실제 사이트를 이루는 파일은 전부 미러에 있습니다. 어디를 고치면 되는지 표로 정리했습니다.

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 문구, 가격, 연락처, FAQ, 카피 전반 | `app/src/lib/content.ts` |
| 블로그 글 추가/수정 | 운영 중인 `/admin` CMS (권장) 또는 `seed/*.md` 편집 후 SQL 변환 |
| DB 스키마 · 시드 데이터 | `app/migrations/000N_*.sql` (신규 번호로 추가) |
| 홈 섹션 구성 | `app/src/routes/index.tsx` |
| 블로그 허브/카테고리/글 페이지 | `app/src/routes/blog/**` |
| 선생님 소개 페이지 | `app/src/routes/about.tsx` |
| 낸드/푸터 | `app/src/components/site/chrome.tsx` |
| 히어로 스크럽 동작 | `app/src/components/site/hero-scrub.tsx` |
| 색상/폰트/브랜드 토큰 | `app/src/styles.css` 상단 `@theme` 블록 |
| 이미지 교체 | `app/public/assets/` (같은 파일명으로 교체하면 코드 수정 불필요) |
| 히어로 프레임 교체 | `app/public/frames/hero/` + `HERO_FRAME_COUNT` 값 (`index.tsx`) |

**칼럼 글을 코드로 추가하고 싶다면** (CMS 대신): `seed/`의 `###POST###` 형식에 맞춰 원고를 쓰고, 기존 배치를 만든 방식대로 SQL INSERT를 `app/migrations/` 새 번호 파일로 추가합니다. 다만 운영 중이라면 `/admin`에서 바로 쓰는 편이 간단합니다 (글 즉시 발행, 사이트맵/RSS 자동 반영).

---

## 3. 임시 로컬 빌드 우회 방법 (단계별)

변환은 한 번만 하면 됩니다. 원본 파일은 `.bak`으로 백업됩니다.

### 3.1 준비물

- [bun](https://bun.sh) 설치 (`npm install -g bun` 또는 공식 인스톨러)
- Git

### 3.2 클론 + 변환

```bash
git clone https://github.com/dokkaebimarketing1-lang/higgsfield.git
cd higgsfield
bash scripts/make-local.sh
```

`make-local.sh`가 하는 일 (원본은 건드리지 않고 백업만 남김):

1. `app/package.json` → `app/package.platform.json.bak` 백업 후, `workspaces` 필드와 `@higgsfield/*` 의존성 3개 제거
2. `app/src/styles.css` → `app/src/styles.platform.css.bak` 백업 후, 플랫폼 전용 `@source`/`@import` 2줄 제거

### 3.3 설치 + 실행

```bash
cd app
bun install
bun run dev
```

브라우저에서 안내 주소(보통 http://localhost:3000)를 열어 확인합니다.

### 3.4 로컬에서 되는 것 / 안 되는 것

| 되는 것 | 안 되는 것 (플랫폼 의존) |
|---|---|
| 홈/블로그/소개 등 모든 화면 렌더링 | 글 목록·글 내용 (D1 DB 없음 → 빈 목록/오류 메시지) |
| 디자인·스타일·레이아웃 확인 | 상담 신청 폼 전송 (D1 없음 → 오류 안내) |
| 히어로 스크럽, 모션 | CMS 이미지 업로드 (R2 없음) |
| 코드 수정 후 핫 리로드 | 실제 배포 (플랫폼만 가능) |

### 3.5 원래 상태로 되돌리기

```bash
cd app
cp package.platform.json.bak package.json
cp src/styles.platform.css.bak src/styles.css
```

---

## 4. 수정 → 라이브 반영 플로우

로컬/GitHub에서의 수정은 자동 배포되지 않습니다.

1. 원하는 파일 수정 (위 표 참고)
2. GitHub에 푸시 (백업 유지)
3. Higgsfield Supercomputer에 "배포해줘" 요청 → 플랫폼 저장소로 옮겨 라이브 반영

DB/R2는 프로덕션에만 있으므로, 콘텐츠 데이터(글, 상담 신청 내역)는 항상 라이브가 기준입니다.
