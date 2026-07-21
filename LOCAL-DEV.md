# 로컬 개발 가이드

이 미러는 플랫폼 빌드 부품(`app/packages/`, `@higgsfield/*` 워크스페이스 패키지)이 빠진 상태입니다.
그대로는 `bun install`이 실패하니, 로컬에서 실행하려면 한 번만 변환 스크립트를 돌려 주세요.

## 빠른 시작

```bash
# 1. 변환 (package.json에서 워크스페이스 의존성 제거, 플랫폼 CSS import 제거)
bash scripts/make-local.sh

# 2. 설치 + 개발 서버
cd app
bun install
bun run dev
```

- 변환은 원본을 바꾸지 않고 `app/package.platform.json.bak`, `app/src/styles.platform.css.bak` 백업을 남깁니다.
- 되돌리려면 백업 파일을 원래 이름으로 복사하면 됩니다.

## 배포(라이브 반영)는?

로컬 실행은 개발·확인용입니다. 실제 https://ewha-piano.higgsfield.app 에 반영하는 배포는
플랫폼 저장소를 통해서만 가능합니다 (DB/R2 프로비저닝이 플랫폼에 묶여 있음).
수정한 내용을 라이브에 반영하려면 Higgsfield Supercomputer에 "배포해줘"라고 요청하세요.

## DB / CMS 로컬 참고

- 로컬 개발에서는 D1/R2 바인딩이 없으므로, 글 목록·상담 신청 폼은 빈 상태/오류 메시지로 동작합니다 (프론트 UI는 전부 확인 가능).
- 실제 데이터는 프로덕션 D1에만 있습니다.
