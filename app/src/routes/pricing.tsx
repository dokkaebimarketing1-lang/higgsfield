import { createFileRoute } from "@tanstack/react-router";

import { LessonLanding } from "../components/site/lesson-landing";
import { buildPublicPageHead, SERVICE_PAGES } from "../lib/seo-pages";

const page = SERVICE_PAGES.pricing;

export const Route = createFileRoute("/pricing")({
  head: () => buildPublicPageHead(page),
  component: PricingPage,
});

function PricingPage() {
  return <LessonLanding page={page} />;
}
