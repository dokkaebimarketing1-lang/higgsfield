export type BlogPublicationField =
  | "title"
  | "excerpt"
  | "body"
  | "categoryId"
  | "tags"
  | "coverImage"
  | "coverAlt"
  | "metaTitle"
  | "metaDescription";

export type BlogPublicationInput = {
  title: string;
  excerpt: string;
  body: string;
  categoryId: number | null;
  tags: string;
  coverImage: string;
  coverAlt: string;
  metaTitle: string;
  metaDescription: string;
  status: "draft" | "published";
};

export type BlogPublicationIssue = {
  field: BlogPublicationField;
  message: string;
};

export const MIN_BLOG_EXCERPT_CHARACTERS = 40;
export const MIN_BLOG_BODY_CHARACTERS = 400;

export function getMarkdownPlainText(markdown: string): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}(?:[-+*]|\d+[.)])\s+/gm, "")
    .replace(/[`*_~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasMarkdownH2(markdown: string): boolean {
  const readableMarkdown = markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ");
  return /^\s{0,3}##(?!#)\s+\S/m.test(readableMarkdown);
}

export function getUniqueBlogTags(tags: string): string[] {
  const uniqueTags = new Map<string, string>();
  for (const tag of tags.split(/[,，\n]/)) {
    const cleaned = tag.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    const key = cleaned.toLocaleLowerCase("ko-KR");
    if (!uniqueTags.has(key)) uniqueTags.set(key, cleaned);
  }
  return [...uniqueTags.values()];
}

export function getEffectiveSeoCopy(input: {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
}): { title: string; description: string } {
  return {
    title: input.metaTitle.trim() || input.title.trim(),
    description: input.metaDescription.trim() || input.excerpt.trim(),
  };
}

export function getBlogPublicationIssues(input: BlogPublicationInput): BlogPublicationIssue[] {
  if (input.status !== "published") return [];

  const issues: BlogPublicationIssue[] = [];
  if (input.categoryId === null) {
    issues.push({ field: "categoryId", message: "발행 글은 카테고리를 선택해 주세요." });
  }
  if ([...input.excerpt.trim()].length < MIN_BLOG_EXCERPT_CHARACTERS) {
    issues.push({
      field: "excerpt",
      message: `발행 글의 요약은 앞뒤 공백을 제외하고 ${MIN_BLOG_EXCERPT_CHARACTERS}자 이상 작성해 주세요.`,
    });
  }
  if ([...getMarkdownPlainText(input.body)].length < MIN_BLOG_BODY_CHARACTERS) {
    issues.push({
      field: "body",
      message: `발행 글의 읽을 수 있는 본문은 마크다운 문법을 제외하고 ${MIN_BLOG_BODY_CHARACTERS}자 이상이어야 합니다.`,
    });
  }
  if (!hasMarkdownH2(input.body)) {
    issues.push({
      field: "body",
      message:
        "발행 글 본문에는 독자가 내용을 훑어볼 수 있도록 H2 소제목(##)을 하나 이상 넣어 주세요.",
    });
  }
  if (getUniqueBlogTags(input.tags).length < 2) {
    issues.push({
      field: "tags",
      message: "발행 글에는 대표 목표 키워드를 포함해 서로 다른 키워드를 2개 이상 입력해 주세요.",
    });
  }
  if (!input.coverImage.trim()) {
    issues.push({ field: "coverImage", message: "발행 글에는 커버 이미지를 등록해 주세요." });
  }
  if (!input.coverAlt.trim()) {
    issues.push({
      field: "coverAlt",
      message: "발행 글의 커버 이미지가 전달하는 내용을 대체 텍스트로 작성해 주세요.",
    });
  }

  const effectiveSeo = getEffectiveSeoCopy(input);
  if (!effectiveSeo.title) {
    issues.push({
      field: "metaTitle",
      message: "SEO 제목을 입력하거나 글 제목을 작성해 주세요.",
    });
  }
  if (!effectiveSeo.description) {
    issues.push({
      field: "metaDescription",
      message: "SEO 설명을 입력하거나 글 요약을 작성해 주세요.",
    });
  }
  return issues;
}
