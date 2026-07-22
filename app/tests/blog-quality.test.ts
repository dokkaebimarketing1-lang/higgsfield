import { describe, expect, test } from "bun:test";

import {
  getBlogPublicationIssues,
  getEffectiveSeoCopy,
  getMarkdownPlainText,
  getUniqueBlogTags,
  hasMarkdownH2,
  type BlogPublicationInput,
} from "../src/lib/blog-quality";
import { preserveFirstPublishedAt } from "../src/lib/blog-publication-policy";

const longBody = `## 연습 순서\n\n${"피아노 연습에서 손의 긴장을 확인하고 짧은 구간을 천천히 반복합니다. ".repeat(14)}`;

const validPost: BlogPublicationInput = {
  title: "피아노 독학을 시작하는 현실적인 순서",
  excerpt: "피아노 독학을 시작할 때 악보 읽기와 손 모양을 어떤 순서로 점검할지 안내합니다.",
  body: longBody,
  categoryId: 2,
  tags: "피아노 독학, 피아노 연습",
  coverImage: "/assets/cat-practice.jpg",
  coverAlt: "집 피아노에서 악보를 보며 연습하는 학습자",
  metaTitle: "",
  metaDescription: "",
  status: "published",
};

describe("blog publication quality", () => {
  test("accepts a complete published post and uses title/excerpt as SEO fallbacks", () => {
    expect(getBlogPublicationIssues(validPost)).toEqual([]);
    expect(getEffectiveSeoCopy(validPost)).toEqual({
      title: validPost.title,
      description: validPost.excerpt,
    });
  });

  test("keeps drafts unrestricted", () => {
    const draft = Object.fromEntries(
      Object.keys(validPost).map((key) => [key, ""]),
    ) as unknown as BlogPublicationInput;
    draft.categoryId = null;
    draft.status = "draft";
    expect(getBlogPublicationIssues(draft)).toEqual([]);
  });

  test("reports every required published-content problem", () => {
    const issues = getBlogPublicationIssues({
      ...validPost,
      excerpt: "짧은 요약",
      body: "### H3만 있는 짧은 본문",
      categoryId: null,
      tags: "피아노, 피아노",
      coverImage: "",
      coverAlt: "",
    });
    expect(new Set(issues.map((issue) => issue.field))).toEqual(
      new Set(["categoryId", "excerpt", "body", "tags", "coverImage", "coverAlt"]),
    );
    expect(issues.filter((issue) => issue.field === "body")).toHaveLength(2);
  });

  test("counts readable markdown copy and recognizes only level-two headings", () => {
    expect(getMarkdownPlainText("## 제목\n\n[설명](https://example.com) **강조**")).toBe(
      "제목 설명 강조",
    );
    expect(hasMarkdownH2("### 세부 제목")).toBeFalse();
    expect(hasMarkdownH2("```md\n## 코드 예시\n```")).toBeFalse();
    expect(hasMarkdownH2("## 핵심 제목")).toBeTrue();
    expect(getUniqueBlogTags("피아노 독학, 피아노 독학, 연습\n기초")).toEqual([
      "피아노 독학",
      "연습",
      "기초",
    ]);
  });

  test("keeps the original publication date across draft and republish transitions", () => {
    const firstPublishedAt = "2026-01-02T03:04:05.000Z";
    const republishedAt = "2026-07-23T00:00:00.000Z";

    expect(preserveFirstPublishedAt(firstPublishedAt, "draft", republishedAt)).toBe(
      firstPublishedAt,
    );
    expect(preserveFirstPublishedAt(firstPublishedAt, "published", republishedAt)).toBe(
      firstPublishedAt,
    );
    expect(preserveFirstPublishedAt(null, "published", republishedAt)).toBe(republishedAt);
    expect(preserveFirstPublishedAt(null, "draft", republishedAt)).toBeNull();
  });
});
