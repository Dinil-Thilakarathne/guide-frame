"use client";

import { useEffect, useRef, useState } from "react";
import { createGuideframe } from "@guideframe/core";
import type { Guide, GuideframeInstance, GuideframeOptions } from "@guideframe/core";

/**
 * Imperative escape hatch for apps that want to drive the overlay from their
 * own UI (a settings panel, a toolbar button) instead of rendering
 * `<GuideframeGrid />`. Returns live visibility and guide state.
 */
export function useGuideframe(options: GuideframeOptions = {}) {
  const instanceRef = useRef<GuideframeInstance | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [visible, setVisibleState] = useState(options.visible ?? options.defaultVisible ?? true);
  const [guides, setGuidesState] = useState<Guide[]>(options.defaultGuides ?? []);

  useEffect(() => {
    const instance = createGuideframe({
      ...optionsRef.current,
      onVisibleChange: (next) => {
        setVisibleState(next);
        optionsRef.current.onVisibleChange?.(next);
      },
      onGuidesChange: (next) => {
        setGuidesState(next);
        optionsRef.current.onGuidesChange?.(next);
      },
    });
    instanceRef.current = instance;
    setVisibleState(instance.isVisible());
    setGuidesState(instance.getGuides());

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);

  return {
    visible,
    guides,
    setVisible: (next: boolean) => instanceRef.current?.setVisible(next),
    setGuides: (next: Guide[]) => instanceRef.current?.setGuides(next),
    clearGuides: () => instanceRef.current?.clearGuides(),
  };
}
