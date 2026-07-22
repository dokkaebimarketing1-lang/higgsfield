import { createFileRoute } from "@tanstack/react-router";

import { LessonLanding } from "../../components/site/lesson-landing";
import { buildPublicPageHead, SERVICE_PAGES } from "../../lib/seo-pages";

const page = SERVICE_PAGES.private;

export const Route = createFileRoute("/lessons/private")({
  head: () => buildPublicPageHead(page),
  component: PrivateLessonPage,
});

function PrivateLessonPage() {
  return <LessonLanding page={page} />;
}
