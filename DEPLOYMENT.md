# 배포 아키텍처

## 단일 원본

`dokkaebimarketing1-lang/higgsfield`의 `main` 브랜치가 유일한 편집 원본이다.
Higgsfield 내부 Git 저장소는 플랫폼 빌드를 위한 자동 생성 미러이며 직접 수정하지 않는다.

```text
GitHub main
  -> lint, test, typecheck, fresh-DB migration check, production build
  -> Higgsfield internal main에 GitHub 트리를 비강제 동기화
  -> live deploy
  -> production D1, sitemap, robots, RSS, llms.txt, public URLs, draft isolation 검증
```

내부 저장소와 GitHub의 커밋 계보는 다르다. 동기화 스크립트는 내부 저장소의 최신
커밋 위에 GitHub 커밋의 전체 트리를 적용하며, 커밋 본문에 `GitHub-Source`를 기록한다.
강제 푸시는 사용하지 않는다.

## 자동 실행

- `pull_request -> main`: 검증만 수행하고 배포 자격 증명은 제공하지 않는다.
- `push -> main`: 검증 성공 후 내부 미러 동기화, 라이브 배포, 운영 검증을 수행한다.
- `workflow_dispatch`: 같은 GitHub 커밋을 수동으로 재검증·재배포한다.
- 동시 배포는 직렬화하며 실행 중인 배포를 취소하지 않는다.

워크플로: `.github/workflows/deploy-production.yml`

## GitHub production 환경

다음 값은 GitHub `production` 환경에서만 관리한다.

| 종류     | 이름                         | 용도                                       |
| -------- | ---------------------------- | ------------------------------------------ |
| Secret   | `HIGGSFIELD_CREDENTIALS_B64` | Higgsfield CLI OAuth 자격 증명 파일 Base64 |
| Secret   | `HIGGSFIELD_CONFIG_B64`      | Higgsfield CLI 설정 파일 Base64            |
| Variable | `HIGGSFIELD_WEBSITE_ID`      | 배포할 피아노 사이트 식별자                |
| Variable | `SITE_URL`                   | 운영 URL                                   |

토큰 값을 워크플로, 커밋, 로그에 직접 입력하지 않는다. JSON은 운영체제별 문자 인코딩
차이를 피하도록 원문 바이트를 Base64로 저장한다. 인증이 폐기되면 로컬에서
`higgsfield auth login`을 다시 실행한 뒤 두 파일의 Base64를 GitHub 환경 Secret에
갱신한다.

## 마이그레이션 원칙

D1은 라이브 데이터베이스 하나를 사용한다. 모든 마이그레이션은 추가 방식으로 작성한다.
`verify:migrations`는 새 메모리 DB에 전체 마이그레이션을 순서대로 적용하고 다음을 차단한다.

- `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM`
- SQL 적용 실패
- SQLite 무결성 및 외래 키 오류
- 필수 CMS·상담·인증 테이블 누락
- `published_at` 또는 카테고리가 없는 공개 글

## 실패 시 운영 원칙

검증이나 배포가 실패하면 Higgsfield 내부 저장소를 직접 수정하지 않는다. GitHub `main`의
원인을 수정하고 새 커밋을 푸시하거나 실패한 커밋에서 워크플로를 재실행한다. 운영 DB를
되돌리는 파괴적 마이그레이션은 자동화하지 않는다.
