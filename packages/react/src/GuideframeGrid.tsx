"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { GuideframeGridProps, ResponsiveValue } from "./types";

const DEFAULT_BREAKPOINTS = { tablet: 768, desktop: 1024 };
const DEFAULT_COLUMNS = { desktop: 12, tablet: 8, mobile: 4 };
const DEFAULT_GUTTER = { desktop: 24, tablet: 24, mobile: 16 };
const DEFAULT_MARGIN = { desktop: 24, tablet: 24, mobile: 16 };
const DEFAULT_COLOR = "rgb(255 0 84)";
const DEFAULT_OPACITY = 0.12;
const DEFAULT_STORAGE_KEY = "guideframe:visible";
const DEFAULT_Z_INDEX = 2147483647;

function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  fallback: { desktop: T; tablet: T; mobile: T },
  breakpoint: "desktop" | "tablet" | "mobile",
): T {
  if (value == null) return fallback[breakpoint];
  if (typeof value !== "object" || Array.isArray(value)) return value;
  const responsiveValue = value as Partial<
    Record<"desktop" | "tablet" | "mobile", T>
  >;
  return responsiveValue[breakpoint] ?? fallback[breakpoint];
}

function isProduction() {
  return (
    typeof process !== "undefined" && process.env.NODE_ENV === "production"
  );
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

function getBreakpoint(
  width: number,
  breakpoints: { tablet: number; desktop: number },
) {
  if (width >= breakpoints.desktop) return "desktop";
  if (width >= breakpoints.tablet) return "tablet";
  return "mobile";
}

function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth,
  );

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

function useLocalVisible(
  storageKey: string,
  defaultVisible: boolean,
  controlledVisible: boolean | undefined,
) {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  useEffect(() => {
    if (controlledVisible !== undefined) return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "true") setInternalVisible(true);
    if (stored === "false") setInternalVisible(false);
  }, [controlledVisible, storageKey]);

  const visible = controlledVisible ?? internalVisible;

  const setVisible = (next: boolean) => {
    if (controlledVisible === undefined) {
      setInternalVisible(next);
      window.localStorage.setItem(storageKey, String(next));
    }
  };

  return [visible, setVisible] as const;
}

function fillColumns(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

const styles = `
.guideframe-overlay {
  pointer-events: none;
}

.guideframe-grid {
  contain: layout paint;
}

.guideframe-column {
  clip-path: inset(100% 0 0 0);
  animation: guideframe-reveal 620ms ease-in-out both;
  animation-delay: var(--guideframe-delay, 0ms);
  background: var(--guideframe-color, rgb(255 0 84));
  opacity: 1;
}

@starting-style {
  .guideframe-column {
    clip-path: inset(100% 0 0 0);
  }
}

@keyframes guideframe-reveal {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

`;

export function GuideframeGrid({
  columns = DEFAULT_COLUMNS,
  gutter = DEFAULT_GUTTER,
  margin = DEFAULT_MARGIN,
  maxWidth = 1280,
  breakpoints,
  activeBreakpoint,
  color = DEFAULT_COLOR,
  opacity = DEFAULT_OPACITY,
  visible,
  defaultVisible = true,
  onVisibleChange,
  shortcut = true,
  storageKey = DEFAULT_STORAGE_KEY,
  zIndex = DEFAULT_Z_INDEX,
  position = "fixed",
  className,
  style,
  forceVisibleInProduction = false,
}: GuideframeGridProps) {
  if (isProduction() && !forceVisibleInProduction) return null;

  const mergedBreakpoints = { ...DEFAULT_BREAKPOINTS, ...breakpoints };
  const width = useWindowWidth();
  const breakpoint = activeBreakpoint ?? getBreakpoint(width, mergedBreakpoints);
  const [isVisible, setIsVisible] = useLocalVisible(
    storageKey,
    defaultVisible,
    visible,
  );

  useEffect(() => {
    if (visible !== undefined) return;
    onVisibleChange?.(isVisible);
  }, [isVisible, onVisibleChange, visible]);

  useEffect(() => {
    if (!shortcut) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const platform =
        typeof navigator !== "undefined" ? navigator.platform : "";
      const modKey = platform.includes("Mac") ? event.metaKey : event.ctrlKey;
      if (
        !modKey ||
        event.shiftKey ||
        event.altKey ||
        event.key.toLowerCase() !== "g"
      )
        return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();

      const nextVisible = !(visible ?? isVisible);
      if (visible === undefined) {
        setIsVisible(nextVisible);
      }
      onVisibleChange?.(nextVisible);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible, onVisibleChange, shortcut, setIsVisible, visible]);

  if (!(visible ?? isVisible)) return null;

  const columnCount = resolveResponsiveValue(
    columns,
    DEFAULT_COLUMNS,
    breakpoint,
  );
  const gutterSize = resolveResponsiveValue(gutter, DEFAULT_GUTTER, breakpoint);
  const marginSize = resolveResponsiveValue(margin, DEFAULT_MARGIN, breakpoint);
  const maxWidthValue =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;

  const containerStyle: CSSProperties = {
    position,
    inset: 0,
    zIndex,
    pointerEvents: "none",
    display: "flex",
    justifyContent: "center",
    ...style,
  };

  const gridStyle: CSSProperties = {
    width: "100%",
    maxWidth: maxWidthValue,
    height: "100%",
    display: "grid",
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    columnGap: `${gutterSize}px`,
    paddingLeft: `${marginSize}px`,
    paddingRight: `${marginSize}px`,
    opacity,
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{styles}</style>
      <div
        className={`guideframe-overlay ${className ?? ""}`.trim()}
        style={containerStyle}
        aria-hidden="true"
        data-testid="guideframe-overlay"
      >
        <div
          style={gridStyle}
          data-testid="guideframe-grid"
          className="guideframe-grid"
        >
          {fillColumns(columnCount).map((column) => (
            <div
              key={column}
              className="guideframe-column"
              style={
                {
                  ["--guideframe-color" as string]: color,
                  ["--guideframe-delay" as string]: `${column * 80}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}
