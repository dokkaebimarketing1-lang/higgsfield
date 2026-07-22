import { createFileRoute } from "@tanstack/react-router";

import { LessonLanding } from "../../components/site/lesson-landing";
import { buildPublicPageHead, SERVICE_PAGES } from "../../lib/seo-pages";

const page = SERVICE_PAGES.homeVisit;

export const Route = createFileRoute("/lessons/home-visit")({
  head: () => buildPublicPageHead(page),
  component: HomeVisitLessonPage,
});

function HomeVisitLessonPage() {
  return <LessonLanding page={page} />;
}
