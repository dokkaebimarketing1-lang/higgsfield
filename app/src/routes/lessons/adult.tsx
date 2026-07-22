import { createFileRoute } from "@tanstack/react-router";

import { LessonLanding } from "../../components/site/lesson-landing";
import { buildPublicPageHead, SERVICE_PAGES } from "../../lib/seo-pages";

const page = SERVICE_PAGES.adult;

export const Route = createFileRoute("/lessons/adult")({
  head: () => buildPublicPageHead(page),
  component: AdultLessonPage,
});

function AdultLessonPage() {
  return <LessonLanding page={page} />;
}
