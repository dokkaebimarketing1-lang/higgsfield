export type PostUrlLocation = {
  categorySlug: string | null;
  postSlug: string;
};

export function getPostRedirectPath(target: PostUrlLocation | null): string | null {
  if (!target?.categorySlug || !target.postSlug) return null;
  return `/blog/${target.categorySlug}/${target.postSlug}`;
}

export function getPostRedirectSource(
  current: PostUrlLocation & { publishedAt: string | null },
  next: PostUrlLocation,
): PostUrlLocation | null {
  if (!current.publishedAt || !current.categorySlug) return null;
  if (current.categorySlug === next.categorySlug && current.postSlug === next.postSlug) return null;
  return { categorySlug: current.categorySlug, postSlug: current.postSlug };
}
