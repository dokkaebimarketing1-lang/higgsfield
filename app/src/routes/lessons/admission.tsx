import { createFileRoute } from "@tanstack/react-router";

import { LessonLanding } from "../../components/site/lesson-landing";
import { buildPublicPageHead, SERVICE_PAGES } from "../../lib/seo-pages";

const page = SERVICE_PAGES.admission;

export const Route = createFileRoute("/lessons/admission")({
  head: () => buildPublicPageHead(page),
  component: AdmissionLessonPage,
});

function AdmissionLessonPage() {
  return <LessonLanding page={page} />;
}
