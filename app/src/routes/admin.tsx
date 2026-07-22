import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { Monogram } from "../components/site/monogram";
import { adminSessionStatus, loginAdmin, logoutAdmin } from "../lib/api/auth.functions";
import { listInquiries, markInquiryDone } from "../lib/api/inquiries.functions";
import {
  adminGetPost,
  adminListPosts,
  createPost,
  deletePost,
  listCategories,
  updatePost,
  uploadImage,
  type CategoryRow,
  type PostRow,
} from "../lib/api/posts.functions";
import {
  KEYWORD_CLUSTERS,
  KEYWORD_CLUSTER_LABELS,
  KEYWORD_ROLES,
  KEYWORD_ROLE_LABELS,
  SEARCH_INTENTS,
  SEARCH_INTENT_LABELS,
  type KeywordCluster,
  type KeywordRole,
  type SearchIntent,
} from "../lib/keyword-taxonomy";
import { getPrimaryKeyword } from "../lib/seo";

type Inquiry = {
  id: number;
  name: string;
  phone: string;
  student_type: string;
  goal: string;
  preferred_days: string;
  message: string;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "관리자 | 이화 피아노 과외" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Tab = "inquiries" | "posts" | "editor";

function Admin() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("inquiries");
  const [editId, setEditId] = useState<number | null>(null);
  const loseAuth = useCallback(() => setAuthed(false), []);

  useEffect(() => {
    let active = true;
    void adminSessionStatus()
      .then(({ authenticated }) => {
        if (active) setAuthed(authenticated);
      })
      .catch(() => {
        if (active) setAuthed(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await loginAdmin({ data: { passcode } });
      setAuthed(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setPasscode("");
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      setAuthed(false);
      setTab("inquiries");
      setEditId(null);
    }
  };

  if (authed === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-ebony px-6 text-ivory">
        <p className="text-sm text-mute">관리자 세션을 확인하는 중...</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-ebony px-6 text-ivory">
        <form onSubmit={login} className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <Monogram className="h-8 w-8 text-brass" />
            <h1 className="font-serif-kr text-2xl font-bold">관리자</h1>
          </div>
          <label className="mt-8 block">
            <span className="mb-2 block text-sm text-mute">비밀번호</span>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
              className="w-full border border-line bg-ebony-2 px-4 py-3 text-ivory outline-none placeholder:text-faint focus:border-brass"
            />
          </label>
          {error && <p className="mt-3 text-sm text-[#d98a8a]">{error}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="mt-5 w-full bg-brass py-3 font-serif-kr text-lg font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99]"
          >
            {loggingIn ? "확인 중..." : "로그인"}
          </button>
          <p className="mt-8 text-center text-sm text-faint">
            <a href="/" className="underline underline-offset-4 hover:text-mute">
              사이트로 돌아가기
            </a>
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-ebony text-ivory">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Monogram className="h-7 w-7 text-brass" />
            <h1 className="font-serif-kr text-2xl font-bold">관리자</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-faint underline underline-offset-4 hover:text-mute">
              사이트로 돌아가기
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-faint underline underline-offset-4 hover:text-mute"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-2 border-b border-line">
          {(
            [
              ["inquiries", "상담 신청"],
              ["posts", "글 관리"],
              ["editor", editId ? "글 수정" : "새 글 작성"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm transition-colors ${
                tab === key
                  ? "border-brass text-ivory"
                  : "border-transparent text-faint hover:text-mute"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "inquiries" && <InquiriesTab onAuthLost={loseAuth} />}
          {tab === "posts" && (
            <PostsTab
              onAuthLost={loseAuth}
              onNew={() => {
                setEditId(null);
                setTab("editor");
              }}
              onEdit={(id) => {
                setEditId(id);
                setTab("editor");
              }}
            />
          )}
          {tab === "editor" && (
            <EditorTab
              onAuthLost={loseAuth}
              postId={editId}
              onDone={() => {
                setEditId(null);
                setTab("posts");
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/* ── 상담 신청 탭 ─────────────────────────────────────── */
function isAuthError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("관리자 로그인이 필요합니다");
}

function InquiriesTab({ onAuthLost }: { onAuthLost: () => void }) {
  const [list, setList] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await listInquiries();
      setList(res.inquiries as Inquiry[]);
    } catch (err) {
      if (isAuthError(err)) onAuthLost();
      setError(err instanceof Error ? err.message : "불러오기에 실패했습니다.");
    }
  }, [onAuthLost]);

  useEffect(() => {
    void load();
  }, [load]);

  const markDone = async (id: number) => {
    try {
      await markInquiryDone({ data: { id } });
      setList((prev) =>
        prev ? prev.map((q) => (q.id === id ? { ...q, status: "done" } : q)) : prev,
      );
    } catch (err) {
      if (isAuthError(err)) onAuthLost();
      setError("상태 변경에 실패했습니다.");
    }
  };

  if (error) return <p className="text-sm text-[#d98a8a]">{error}</p>;
  if (list === null) return <p className="text-mute">불러오는 중...</p>;
  if (list.length === 0)
    return (
      <div className="border border-line p-10 text-center text-mute">
        아직 접수된 상담 신청이 없습니다.
      </div>
    );

  return (
    <div className="space-y-4">
      {list.map((q) => (
        <article
          key={q.id}
          className={`border p-5 ${q.status === "done" ? "border-line opacity-55" : "border-brass/50"}`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-serif-kr text-lg font-semibold">
              {q.name}
              <span className="ml-3 text-sm font-normal text-mute">{q.phone}</span>
            </p>
            <span className="text-xs text-faint">{q.created_at}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-mute">
            <span>대상: {q.student_type || "-"}</span>
            <span>목표: {q.goal || "-"}</span>
            <span>희망: {q.preferred_days || "-"}</span>
          </div>
          {q.message && (
            <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-mute">
              {q.message}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className={`text-xs ${q.status === "done" ? "text-faint" : "text-brass"}`}>
              {q.status === "done" ? "처리 완료" : "신규"}
            </span>
            {q.status !== "done" && (
              <button
                onClick={() => void markDone(q.id)}
                className="border border-line px-4 py-2 text-sm text-ivory transition-colors hover:border-brass hover:text-brass"
              >
                처리 완료로 표시
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── 글 목록 탭 ───────────────────────────────────────── */
function PostsTab({
  onAuthLost,
  onNew,
  onEdit,
}: {
  onAuthLost: () => void;
  onNew: () => void;
  onEdit: (id: number) => void;
}) {
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminListPosts();
      setPosts(res.posts);
    } catch (err) {
      if (isAuthError(err)) onAuthLost();
      setError(err instanceof Error ? err.message : "불러오기에 실패했습니다.");
    }
  }, [onAuthLost]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: number, title: string) => {
    if (!window.confirm(`"${title}" 글을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try {
      await deletePost({ data: { id } });
      setPosts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    } catch (err) {
      if (isAuthError(err)) onAuthLost();
      setError("삭제에 실패했습니다.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-mute">총 {posts?.length ?? 0}편</p>
        <button
          onClick={onNew}
          className="bg-brass px-5 py-2.5 font-serif-kr font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99]"
        >
          새 글 작성
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-[#d98a8a]">{error}</p>}
      {posts === null ? (
        <p className="mt-6 text-mute">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <div className="mt-6 border border-line p-10 text-center text-mute">
          아직 작성된 글이 없습니다. 첫 글을 작성해 보세요.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {posts.map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-center gap-4 border border-line p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif-kr text-lg font-semibold">{p.title}</p>
                <p className="mt-1 text-xs text-faint">
                  {p.category_name ?? "미분류"} · /blog/{p.category_slug}/{p.slug} ·{" "}
                  {p.updated_at.slice(0, 10)}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs ${
                  p.status === "published" ? "bg-brass/15 text-brass" : "bg-ebony-2 text-faint"
                }`}
              >
                {p.status === "published" ? "발행됨" : "초안"}
              </span>
              {p.status === "published" && (
                <a
                  href={`/blog/${p.category_slug}/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-mute underline underline-offset-4 hover:text-ivory"
                >
                  보기
                </a>
              )}
              <button
                onClick={() => onEdit(p.id)}
                className="border border-line px-4 py-2 text-sm transition-colors hover:border-brass hover:text-brass"
              >
                수정
              </button>
              <button
                onClick={() => void remove(p.id, p.title)}
                className="border border-line px-4 py-2 text-sm text-faint transition-colors hover:border-[#d98a8a] hover:text-[#d98a8a]"
              >
                삭제
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 글 편집 탭 ───────────────────────────────────────── */
type EditorForm = {
  title: string;
  slug: string;
  categoryId: number | null;
  excerpt: string;
  tags: string;
  keywordRole: KeywordRole;
  searchIntent: SearchIntent;
  keywordCluster: KeywordCluster;
  coverImage: string;
  coverAlt: string;
  metaTitle: string;
  metaDescription: string;
  status: "draft" | "published";
  body: string;
};

const EMPTY_FORM: EditorForm = {
  title: "",
  slug: "",
  categoryId: null,
  excerpt: "",
  tags: "",
  keywordRole: "informational",
  searchIntent: "informational",
  keywordCluster: "general",
  coverImage: "",
  coverAlt: "",
  metaTitle: "",
  metaDescription: "",
  status: "draft",
  body: "",
};

function EditorTab({
  onAuthLost,
  postId,
  onDone,
}: {
  onAuthLost: () => void;
  postId: number | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<EditorForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(postId !== null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void listCategories({ data: undefined }).then((r) => setCategories(r.categories));
    if (postId !== null) {
      void adminGetPost({ data: { id: postId } })
        .then((r) => {
          if (r.post) {
            const p = r.post;
            setForm({
              title: p.title,
              slug: p.slug,
              categoryId: p.category_id,
              excerpt: p.excerpt,
              tags: p.tags,
              keywordRole: p.keyword_role,
              searchIntent: p.search_intent,
              keywordCluster: p.keyword_cluster,
              coverImage: p.cover_image,
              coverAlt: p.cover_alt,
              metaTitle: p.meta_title,
              metaDescription: p.meta_description,
              status: p.status === "published" ? "published" : "draft",
              body: p.body,
            });
          }
        })
        .catch((err: unknown) => {
          if (isAuthError(err)) onAuthLost();
          setError(err instanceof Error ? err.message : "글을 불러오지 못했습니다.");
        })
        .finally(() => setLoading(false));
    }
  }, [onAuthLost, postId]);

  const set = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const togglePreview = async () => {
    if (!preview) {
      const { renderMarkdown } = await import("../lib/markdown");
      setPreviewHtml(renderMarkdown(form.body));
    }
    setPreview((v) => !v);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("이미지는 10MB 이하여야 합니다.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      const res = await uploadImage({
        data: { contentType: file.type, dataBase64: base64 },
      });
      set("coverImage", res.url);
    } catch (err) {
      if (isAuthError(err)) onAuthLost();
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (status: "draft" | "published") => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        body: form.body,
        categoryId: form.categoryId,
        tags: form.tags,
        keywordRole: form.keywordRole,
        searchIntent: form.searchIntent,
        keywordCluster: form.keywordCluster,
        coverImage: form.coverImage,
        coverAlt: form.coverAlt,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        status,
      };
      if (postId === null) {
        await createPost({ data: payload });
      } else {
        await updatePost({ data: { ...payload, id: postId } });
      }
      onDone();
    } catch (err) {
      if (isAuthError(err)) onAuthLost();
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  };

  if (loading) return <p className="text-mute">불러오는 중...</p>;

  const inputCls =
    "w-full border border-line bg-ebony px-4 py-3 text-ivory outline-none transition-colors placeholder:text-faint focus:border-brass";
  const labelCls = "mb-2 block text-sm text-mute";
  const primaryKeyword = getPrimaryKeyword(form.tags);

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className={labelCls}>제목 *</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="예: 피아노 과외 비용, 얼마가 적당할까?"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>슬러그 (영문 소문자·숫자·하이픈)</span>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="piano-tutoring-cost"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>카테고리</span>
          <select
            value={form.categoryId ?? ""}
            onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}
            className={inputCls}
          >
            <option value="">미분류</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>키워드 역할</span>
          <select
            value={form.keywordRole}
            onChange={(e) => set("keywordRole", e.target.value as KeywordRole)}
            className={inputCls}
          >
            {KEYWORD_ROLES.map((role) => (
              <option key={role} value={role}>
                {KEYWORD_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>검색 의도</span>
          <select
            value={form.searchIntent}
            onChange={(e) => set("searchIntent", e.target.value as SearchIntent)}
            className={inputCls}
          >
            {SEARCH_INTENTS.map((intent) => (
              <option key={intent} value={intent}>
                {SEARCH_INTENT_LABELS[intent]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>토픽 클러스터</span>
          <select
            value={form.keywordCluster}
            onChange={(e) => set("keywordCluster", e.target.value as KeywordCluster)}
            className={inputCls}
          >
            {KEYWORD_CLUSTERS.map((cluster) => (
              <option key={cluster} value={cluster}>
                {KEYWORD_CLUSTER_LABELS[cluster]}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-relaxed text-faint">
            발행 글은 미분류가 아닌 클러스터를 선택해야 합니다.
          </span>
        </label>
        <label className="block md:col-span-2">
          <span className={labelCls}>요약 (목록·검색결과에 표시, 1~2문장)</span>
          <textarea
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            placeholder="글의 핵심 내용을 한두 문장으로"
            className={`${inputCls} resize-none`}
          />
        </label>
        <label className="block">
          <span className={labelCls}>목표 키워드 · 연관 키워드 (쉼표로 구분)</span>
          <input
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="피아노 과외, 비용, 초등"
            className={inputCls}
          />
          <span className="mt-2 block text-xs leading-relaxed text-faint">
            첫 항목이 대표 목표 키워드입니다
            {primaryKeyword
              ? `: ${primaryKeyword}`
              : ". 발행 전 제목, 요약, SEO 설명에 자연스럽게 포함해야 합니다."}
          </span>
        </label>
        <div className="block">
          <span className={labelCls}>커버 이미지</span>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer border border-line px-4 py-3 text-sm text-mute transition-colors hover:border-brass hover:text-brass">
              {uploading ? "업로드 중..." : "이미지 선택"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onFile}
                className="hidden"
              />
            </label>
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt={form.coverAlt || "커버 이미지 미리보기"}
                className="h-16 w-24 object-cover"
              />
            )}
          </div>
          <label className="mt-3 block">
            <span className={labelCls}>커버 이미지 대체 텍스트 (발행 필수)</span>
            <input
              value={form.coverAlt}
              onChange={(e) => set("coverAlt", e.target.value)}
              placeholder="예: 피아노 건반 위에서 하농을 연습하는 손"
              className={inputCls}
            />
            <span className="mt-2 block text-xs leading-relaxed text-faint">
              파일명이 아니라 이미지에서 실제로 보이는 내용을 간결하게 작성하세요.
            </span>
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>SEO 제목 (비우면 글 제목 사용)</span>
          <input
            value={form.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>SEO 설명 (비우면 요약 사용)</span>
          <input
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className={labelCls}>본문 (마크다운) *</span>
        <button
          onClick={() => void togglePreview()}
          className="text-sm text-brass underline underline-offset-4 hover:text-ivory"
        >
          {preview ? "편집으로" : "미리보기"}
        </button>
      </div>
      {preview ? (
        <div
          className="prose-ewha min-h-64 border border-line bg-ebony-2 p-6"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          rows={18}
          placeholder={"## 소제목\n\n본문을 마크다운으로 작성하세요."}
          className={`${inputCls} mt-1 font-mono text-sm leading-relaxed`}
        />
      )}

      {error && <p className="mt-4 text-sm text-[#d98a8a]">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => void save("published")}
          disabled={saving}
          className="bg-brass px-6 py-3 font-serif-kr font-semibold text-ebony transition-all hover:bg-[#cdb07a] active:scale-[0.99] disabled:opacity-60"
        >
          {saving ? "저장 중..." : "발행하기"}
        </button>
        <button
          onClick={() => void save("draft")}
          disabled={saving}
          className="border border-line px-6 py-3 font-serif-kr transition-colors hover:border-brass hover:text-brass disabled:opacity-60"
        >
          초안 저장
        </button>
        <button
          onClick={onDone}
          className="px-4 py-3 text-sm text-faint underline underline-offset-4 hover:text-mute"
        >
          취소
        </button>
      </div>
    </div>
  );
}
