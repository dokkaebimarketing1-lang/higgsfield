import { createFileRoute } from "@tanstack/react-router";

import { LessonLanding } from "../../components/site/lesson-landing";
import { buildPublicPageHead, SERVICE_PAGES } from "../../lib/seo-pages";

const page = SERVICE_PAGES.children;

export const Route = createFileRoute("/lessons/children")({
  head: () => buildPublicPageHead(page),
  component: ChildrenLessonPage,
});

function ChildrenLessonPage() {
  return <LessonLanding page={page} />;
}
