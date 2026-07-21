import { marked } from "marked";

// 마크다운 → 안전한 HTML. 원시 HTML은 먼저 이스케이프해 XSS를 차단한다
// (관리자 전용 CMS지만 방문자에게 출력되는 내용이므로 마크다운 문법만 허용).
marked.setOptions({ gfm: true, breaks: true });

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderMarkdown(markdown: string): string {
  // 물결표(45~60분 등)가 GFM 취소선(~x~)으로 파싱되는 것을 방지: 모두 리터럴로 이스케이프
  const escaped = escapeHtml(markdown).replace(/~/g, "\\~");
  const html = marked.parse(escaped, { async: false });
  return typeof html === "string" ? html : "";
}
