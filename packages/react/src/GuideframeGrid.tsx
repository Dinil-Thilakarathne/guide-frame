"use client";

import { useEffect, useRef } from "react";
import { createGuideframe } from "@guideframe/core";
import type { GuideframeInstance } from "@guideframe/core";
import type { GuideframeGridProps } from "./types";

/**
 * Renders nothing on the server and nothing into the React tree. The overlay is
 * mounted imperatively onto <body> by `@guideframe/core`, which means:
 *
 *  - no hydration mismatch when persisted visibility disagrees with the
 *    server-rendered default (a real bug in 0.1.x),
 *  - `position: fixed` can't be broken by a transformed ancestor,
 *  - the host app's layout never reflows around the overlay.
 */
export function GuideframeGrid(props: GuideframeGridProps) {
  const instanceRef = useRef<GuideframeInstance | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const instance = createGuideframe(propsRef.current);
    instanceRef.current = instance;
    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);

  // Options are plain data plus callbacks; pushing them on every render keeps
  // the overlay in sync without asking callers to memoise object literals.
  useEffect(() => {
    instanceRef.current?.update(propsRef.current);
  });

  return null;
}
