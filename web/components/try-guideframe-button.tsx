"use client";

import posthog from "posthog-js";

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
    <button
      type="button"
      onClick={toggleGuideframe}
      aria-keyshortcuts="Meta+G Control+G"
      className="focus-ring bg-foreground-main text-background hover:bg-foreground-main/85 inline-flex min-h-10 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200"
    >
      Try GuideFrame
    </button>
  );
}
