import { createFileRoute } from "@tanstack/react-router";

import { SubPageShell } from "../components/site/chrome";
import { buildPublicPageHead, PUBLIC_PAGE_BY_PATH } from "../lib/seo-pages";

const privacyPage = PUBLIC_PAGE_BY_PATH.get("/privacy")!;

export const Route = createFileRoute("/privacy")({
  head: () => buildPublicPageHead(privacyPage),
  component: PrivacyPage,
});

const rows = [
  {
    title: "처리 목적",
    body: "레슨 상담 답변, 수강 가능 일정 확인, 체험 레슨 조율을 위해서만 사용합니다.",
  },
  {
    title: "처리 항목",
    body: "필수: 이름, 연락처. 선택: 수강 대상, 학습 목표, 희망 요일·시간, 문의 내용. 스팸 방지를 위해 접속 IP의 일방향 해시와 요청 시각을 짧게 처리하며 원본 IP는 저장하지 않습니다.",
  },
  {
    title: "처리 근거",
    body: "정보주체가 요청한 상담 및 계약 체결 전 조치를 이행하기 위해 필요한 범위에서 처리합니다(개인정보 보호법 제15조 제1항 제4호).",
  },
  {
    title: "보유 기간",
    body: "상담 완료로 표시된 정보는 완료 후 90일, 미처리 문의는 접수 후 최대 1년간 보관합니다. 보관 기준이 지난 정보는 다음 상담 접수 또는 관리자 조회 시 자동 삭제하며, 이용자가 삭제를 요청하면 확인 후 더 일찍 삭제합니다.",
  },
  {
    title: "처리 위탁·국외 처리",
    body: "사이트 운영을 위해 Higgsfield 호스팅 플랫폼과 Cloudflare의 서버·데이터베이스 인프라를 사용합니다. 상담 정보를 광고 판매나 제3자 마케팅에 제공하지 않습니다.",
  },
  {
    title: "이용자 권리",
    body: "본인 정보의 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 상담에 필요한 이름과 연락처를 제공하지 않으면 답변이나 일정 조율이 어렵습니다.",
  },
] as const;

function PrivacyPage() {
  return (
    <SubPageShell>
      <article className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
        <nav className="text-sm text-faint" aria-label="breadcrumb">
          <a href="/" className="hover:text-mute">
            홈
          </a>
          <span className="mx-2">/</span>
          <span className="text-mute">개인정보 처리 안내</span>
        </nav>

        <h1 className="mt-10 font-serif-kr text-4xl font-bold tracking-tight md:text-5xl">
          개인정보 처리 안내
        </h1>
        <p className="mt-5 max-w-[62ch] leading-relaxed text-mute">
          상담 신청에 필요한 최소한의 정보만 처리하며, 아래 목적을 벗어나 사용하지 않습니다. 이
          안내의 시행일은 2026년 7월 23일입니다.
        </p>

        <div className="mt-12 border-t border-line">
          {rows.map((row) => (
            <section key={row.title} className="border-b border-line py-7">
              <h2 className="font-serif-kr text-xl font-semibold text-ivory">{row.title}</h2>
              <p className="mt-3 leading-relaxed text-mute">{row.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12 border border-brass/40 bg-ebony-2 p-7 md:p-9">
          <h2 className="font-serif-kr text-xl font-semibold">개인정보 관련 문의</h2>
          <p className="mt-3 text-mute">
            열람, 정정, 삭제 또는 처리정지 요청임을 적어 상담 폼으로 보내 주세요.
          </p>
          <a
            href="/#contact"
            className="mt-2 inline-block text-brass underline underline-offset-4 hover:text-ivory"
          >
            상담 폼으로 요청하기
          </a>
        </section>
      </article>
    </SubPageShell>
  );
}
