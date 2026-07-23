import { describe, expect, test } from "bun:test";

import { buildRssXml, rssUnavailableResponse } from "../src/lib/feed";
import { buildCollectionPageSchema, safeJsonLd } from "../src/lib/structured-data";

describe("public feed and collection inventory", () => {
  test("builds a canonical RSS feed with namespaces, dates, categories, and media", () => {
    const xml = buildRssXml(
      [
        {
          title: '초보 & 연습 <가이드> "완성"',
          slug: "beginner-practice",
          excerpt: "하루 20분 & 구간 연습",
          published_at: "2026-07-22 09:30:00",
          updated_at: "2026-07-22 12:00:00",
          category_slug: "practice",
          category_name: "연습 & 습관",
          cover_image: "/assets/practice.jpg?size=large&format=jpg",
          cover_alt: "건반 위에서 구간 연습 중인 손",
        },
      ],
      new Date("2026-07-23T00:00:00.000Z"),
    );

    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
    expect(xml).toContain('xmlns:media="http://search.yahoo.com/mrss/"');
    expect(xml).toContain(
      '<atom:link href="https://ewha-piano.higgsfield.app/rss.xml" rel="self" type="application/rss+xml" />',
    );
    expect(xml).toContain("<lastBuildDate>Wed, 22 Jul 2026 12:00:00 GMT</lastBuildDate>");
    expect(xml).toContain("<title>초보 &amp; 연습 &lt;가이드&gt; &quot;완성&quot;</title>");
    expect(xml).toContain("<category>연습 &amp; 습관</category>");
    expect(xml).toContain("<dc:creator>김서연</dc:creator>");
    expect(xml).toContain(
      'media:content url="https://ewha-piano.higgsfield.app/assets/practice.jpg?size=large&amp;format=jpg"',
    );
    expect(xml).toContain("<media:description>건반 위에서 구간 연습 중인 손</media:description>");
  });

  test("returns a crawler-safe temporary failure response", () => {
    const response = rssUnavailableResponse();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("60");
    expect(response.headers.get("content-type")).toContain("text/plain");
  });

  test("adds an ordered post ItemList to collection schema", () => {
    const schema = buildCollectionPageSchema({
      name: "피아노 연습",
      description: "피아노 연습 글 모음",
      url: "https://ewha-piano.higgsfield.app/blog/practice",
      image: "https://ewha-piano.higgsfield.app/assets/cat-practice.jpg",
      items: [
        {
          name: "초보 피아노 연습법",
          path: "/blog/practice/beginner-practice",
          image: "/assets/practice.jpg",
        },
        { name: "메트로놈 활용법", path: "/blog/practice/metronome" },
      ],
      dateModified: "2026-07-23",
      authorId: "https://ewha-piano.higgsfield.app/about#person",
      publisherId: "https://ewha-piano.higgsfield.app/#business",
      aboutIds: ["https://ewha-piano.higgsfield.app/lessons/private#service"],
    });

    expect(schema).toMatchObject({
      dateModified: "2026-07-23",
      author: { "@id": "https://ewha-piano.higgsfield.app/about#person" },
      publisher: { "@id": "https://ewha-piano.higgsfield.app/#business" },
      about: [{ "@id": "https://ewha-piano.higgsfield.app/lessons/private#service" }],
    });
    expect(schema.mainEntity.numberOfItems).toBe(2);
    expect(schema.mainEntity.itemListElement[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      name: "초보 피아노 연습법",
      url: "https://ewha-piano.higgsfield.app/blog/practice/beginner-practice",
      image: "https://ewha-piano.higgsfield.app/assets/practice.jpg",
    });
    expect(schema.mainEntity.itemListElement[1].position).toBe(2);
  });

  test("serializes JSON-LD without executable script terminators", () => {
    const value = { text: "</script><script>&\u2028\u2029" };
    const json = safeJsonLd(value);

    expect(json).not.toContain("<");
    expect(json).not.toContain(">");
    expect(json).not.toContain("&");
    expect(json).not.toContain("\u2028");
    expect(json).not.toContain("\u2029");
    expect(json).toContain("\\u003c/script\\u003e");
    expect(JSON.parse(json)).toEqual(value);
  });
});
