import { toCanonicalUrl } from "./seo";

export type CollectionListItem = {
  name: string;
  path: string;
  image?: string | null;
};

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function buildCollectionPageSchema(input: {
  name: string;
  description: string;
  url: string;
  image: string;
  items: readonly CollectionListItem[];
  itemListOrder?: "ascending" | "descending" | "unordered";
}) {
  const pageUrl = toCanonicalUrl(input.url);
  const imageUrl = toCanonicalUrl(input.image);

  return {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    name: input.name,
    description: input.description,
    url: pageUrl,
    image: imageUrl,
    primaryImageOfPage: imageUrl,
    isPartOf: { "@id": `${toCanonicalUrl("/")}#website` },
    inLanguage: "ko",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListOrder: `https://schema.org/ItemListOrder${
        input.itemListOrder === "ascending"
          ? "Ascending"
          : input.itemListOrder === "unordered"
            ? "Unordered"
            : "Descending"
      }`,
      itemListElement: input.items.map((item, index) => {
        const url = toCanonicalUrl(item.path);
        return {
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url,
          ...(item.image ? { image: toCanonicalUrl(item.image) } : {}),
        };
      }),
    },
  };
}
