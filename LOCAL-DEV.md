# 로컬 개발 가이드

이 저장소는 변환 없이 바로 설치하고 빌드할 수 있습니다. 피아노 사이트는 Higgsfield
SDK 기능을 사용하지 않으므로 private `@higgsfield/*` 패키지와 Quanta CSS가 필요하지
않습니다.

## 준비물

- Git
- Bun 1.3 이상

## 처음 실행

```bash
git clone https://github.com/dokkaebimarketing1-lang/higgsfield.git
cd higgsfield/app
bun install --frozen-lockfile
bun run dev
```

Vite가 출력한 로컬 주소를 브라우저에서 엽니다. 의존성을 변경한 경우에만
`bun install`을 실행해 `bun.lock`을 갱신합니다.

## 검증

```bash
# ESLint + Prettier 규칙
bun run lint

# TypeScript
bun run typecheck

# 타입 검사 후 프로덕션 Worker/client 번들 생성
bun run build

# Higgsfield 미리보기용 Design Inspector 포함 빌드
bun run build:design
```

`bun run build` 결과는 `app/dist/server/server.js`와 `app/dist/client/`에
생성됩니다. 서버 바인딩은 요청 단위 환경에서 읽기 때문에 같은 번들을 Cloudflare
Worker와 Vite의 Node 기반 개발/미리보기 서버에서 모두 실행할 수 있습니다.

빌드 결과를 로컬에서 확인하려면 다음 명령을 실행합니다.

```bash
bun run preview
```

미리보기는 운영 D1/R2 없이 안전한 빈 바인딩으로 실행됩니다.

## 로컬 데이터와 비밀값

`app/app.manifest.json`은 배포 시 D1(`DB`)과 R2(`STORAGE`) 사용을 선언합니다.
저장소의 `wrangler.jsonc`에는 실제 운영 리소스 ID가 없으며, 운영 데이터와 비밀값도
포함되지 않습니다.

- `bun run dev`는 안전한 빈 Worker 바인딩을 사용하므로 정적 페이지와 클라이언트
  상호작용을 운영 데이터 없이 확인할 수 있습니다.
- 블로그/CMS, 상담 저장, 이미지 업로드처럼 D1/R2가 필요한 기능은 로컬 바인딩을
  별도로 구성해야 실제 저장까지 검증할 수 있습니다.
- 관리자 기능에는 Worker 비밀값 `ADMIN_PASSCODE`가 필요합니다. 값을 문서나 Git에
  기록하지 마세요.
- D1/R2까지 테스트하려면 `bun run build` 후 `wrangler.jsonc`의 주석 안내에 따라
  개발 전용 바인딩을 구성하고 `bunx wrangler dev`로 Worker 빌드를 실행하세요.
  운영 리소스 ID를 재사용하지 마세요.

## Higgsfield 배포 호환성

독립 로컬 빌드를 위해 제거한 것은 사용되지 않던 SDK/Quanta 템플릿 코드뿐입니다.
다음 배포 계약은 그대로 유지됩니다.

- TanStack Start SSR Worker 엔트리: `src/server.ts`
- 인프라 선언: `app.manifest.json`
- Cloudflare 빌드 설정: `wrangler.jsonc`
- Higgsfield Design mode: `src/module/design-inspector/`
- 미리보기 빌드: `bun run build:design`
- 프로덕션 정리 빌드: `bun run build`

실제 배포와 D1/R2 프로비저닝은 기존 Higgsfield 웹사이트 배포 흐름에서 수행합니다.
