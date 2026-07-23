# 배포 아키텍처

## 단일 원본

`dokkaebimarketing1-lang/higgsfield`의 `main` 브랜치가 유일한 편집 원본이다.
Higgsfield 내부 Git 저장소는 플랫폼 빌드를 위한 자동 생성 미러이며 직접 수정하지 않는다.

```text
GitHub main
  -> lint, test, typecheck, fresh-DB migration check, production build
  -> Higgsfield internal main에 GitHub 트리를 비강제 동기화
  -> live deploy
  -> production D1, sitemap, robots, RSS, llms.txt, 공개 페이지·다운로드, draft isolation 검증
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

## 배포 전 로컬 게이트

```powershell
$repoRoot = git rev-parse --show-toplevel
Set-Location (Join-Path $repoRoot 'app')
bun install --frozen-lockfile
bun run verify:ci
```

검색수요 통합문서가 바뀌었다면 먼저
[RESEARCH-DATA.md](RESEARCH-DATA.md)의 `build-search-demand-data.py` 절차로 CSV,
메타데이터, 데이터 사전과 매니페스트를 함께 갱신합니다. 생성 파일 일부만 수동으로
바꾸지 않습니다.

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

## 배포 후 권위 자산 검증

워크플로의 운영 검증 단계는 `SITE_URL`을 기준으로 다음을 확인해야 합니다.

1. `/research`, 세 연구 보고서, 방법론과 수정 이력 페이지가 200으로 응답하고 canonical, H1, 작성·검토 정보와 요구 구조화 데이터를 포함합니다.
2. `/tools`, 코드표, 레슨비 계산기, `/resources`, 수준별 로드맵, 연습 플래너와 `/editorial-policy`가 200으로 응답하고 사이트맵에 포함됩니다.
3. 검색수요 전체·세그먼트 CSV, 메타데이터, 데이터 사전과 원본 매니페스트가 공개 URL에서 응답하며 데이터셋 ID, 행·필드 수와 SHA-256이 저장소 산출물과 일치합니다.
4. 학습 로드맵과 연습 플래너 CSV가 공개 URL에서 내려받아지고 헤더가 예상값과 일치합니다.
5. `sitemap.xml`, `robots.txt`, `rss.xml`, `llms.txt`가 정식 호스트를 사용하며 비공개 초안 URL을 노출하지 않습니다.
6. 공개 CMS 글과 카테고리, D1 무결성, 필수 내부 링크와 JSON-LD 관계가 유지됩니다.

새 배포 직후 Cloudflare 엣지에 이전 404 응답이 남을 수 있으므로 HTTP 검증은 새
cache-buster를 사용해 최대 12회, 누적 대기 78초까지 재시도합니다.

자동 검증 명령:

```powershell
$repoRoot = git rev-parse --show-toplevel
Set-Location (Join-Path $repoRoot 'app')
$env:SITE_URL = 'https://ewha-piano.higgsfield.app'
$env:HIGGSFIELD_WEBSITE_ID = '<production website id>'
bun run verify:live
```

로컬 실행에는 해당 웹사이트를 조회할 수 있도록 인증된 Higgsfield CLI가 필요합니다.
GitHub Actions에서는 두 환경 변수를 `production` 환경 Variable에서 주입합니다.
브라우저에서는 코드 선택·전위 표시·PNG/CSV 저장, 레슨비 환산, 연습 플래너 입력·합계,
CSV 저장과 인쇄/PDF 동작을 데스크톱과 모바일에서 표본 확인합니다. 자동 검증 성공은
도메인 권위, 외부 링크 또는 검색순위 상승을 보장하지 않으므로 Search Console의
색인·노출·클릭과 실제 인용은 별도 운영 지표로 추적합니다.

## 실패 시 운영 원칙

검증이나 배포가 실패하면 Higgsfield 내부 저장소를 직접 수정하지 않는다. GitHub `main`의
원인을 수정하고 새 커밋을 푸시하거나 실패한 커밋에서 워크플로를 재실행한다. 운영 DB를
되돌리는 파괴적 마이그레이션은 자동화하지 않는다.
