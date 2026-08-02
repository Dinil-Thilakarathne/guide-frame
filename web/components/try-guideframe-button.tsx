"use client";

import posthog from "posthog-js";
import Button from "@/components/ui/button";

export default function TryGuideframeButton() {
  function toggleGuideframe() {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "g",
        metaKey: isMac,
        ctrlKey: !isMac,
        bubbles: true,
        cancelable: true,
      }),
    );

    posthog.capture("landing_demo_toggled", {
      page_name: "guideframe_landing_page",
      trigger: "hero_button",
    });
  }

  return (
    <Button
      type="button"
      onClick={toggleGuideframe}
      aria-keyshortcuts="Meta+G Control+G"
      className="rounded-full"
    >
      Try GuideFrame
    </Button>
  );
}
