"use client";

import { usePostHog } from "posthog-js/react";

export default function PosthogTestButton() {
  const posthog = usePostHog();

  function handleClick() {
    posthog.capture("landing_cta_clicked", {
      page_name: "guideframe_landing_page",
      section: "hero",
    });
  }

  return (
    <button type="submit" onClick={handleClick}>
      Test posthog connection
    </button>
  );
}
