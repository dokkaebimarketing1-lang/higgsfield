// 본문 마크다운의 "## 자주 묻는 질문" 섹션에서 Q&A를 추출한다.
// 형식: **질문?** 답변. (스키마와 보이는 내용이 항상 일치하도록 같은 소스 사용)
export type FaqItem = { q: string; a: string };

export function extractFaq(markdown: string): FaqItem[] {
  const sectionMatch = markdown.match(/^## 자주 묻는 질문\s*$/m);
  if (!sectionMatch || sectionMatch.index === undefined) return [];
  const rest = markdown.slice(sectionMatch.index + sectionMatch[0].length);
  // 다음 h2가 나오기 전까지가 FAQ 섹션
  const nextH2 = rest.search(/^## /m);
  const section = nextH2 === -1 ? rest : rest.slice(0, nextH2);
  const items: FaqItem[] = [];
  const re = /\*\*([^*]+?)\*\*\s+([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    const q = m[1].trim();
    const a = m[2].trim();
    if (q && a) items.push({ q, a });
  }
  return items.slice(0, 6);
}
