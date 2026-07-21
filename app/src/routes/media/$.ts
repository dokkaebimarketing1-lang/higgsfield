import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";

// R2에 업로드된 이미지를 서빙하는 미디어 라우트 (/media/covers/xxx.jpg)
// workers-types와 DOM 타입 충돌을 피하기 위해 필요한 멤버만 갖는 로컬 타입 사용
type R2ObjectLike = {
  body: unknown;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
};

export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { STORAGE } = bindings();
        if (!STORAGE) return new Response("Not found", { status: 404 });
        const key = params._splat ?? "";
        if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
        const object = (await STORAGE.get(key)) as unknown as R2ObjectLike | null;
        if (!object) return new Response("Not found", { status: 404 });
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new Response(object.body as BodyInit, { headers });
      },
    },
  },
});
