import type { Breakpoint, GuideframeBreakpoints, ResponsiveValue } from "./types";

export const DEFAULT_BREAKPOINTS: GuideframeBreakpoints = {
  tablet: 768,
  desktop: 1024,
};
export const DEFAULT_COLUMNS = { desktop: 12, tablet: 8, mobile: 4 };
export const DEFAULT_GUTTER = { desktop: 24, tablet: 24, mobile: 16 };
export const DEFAULT_MARGIN = { desktop: 24, tablet: 24, mobile: 16 };
export const DEFAULT_COLOR = "rgb(255 0 84)";
export const DEFAULT_OPACITY = 0.12;
export const DEFAULT_STORAGE_KEY = "guideframe:visible";
export const DEFAULT_GUIDES_STORAGE_KEY = "guideframe:guides";
export const DEFAULT_Z_INDEX = 2147483647;
export const DEFAULT_RULER_SIZE = 20;
export const DEFAULT_SNAP_THRESHOLD = 6;

export const ROOT_ATTRIBUTE = "data-guideframe-root";

export function canUseDOM() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isProduction() {
  // Guarded because `process` is not defined in some browser/edge bundles.
  try {
    return typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  } catch {
    return false;
  }
}

export function prefersReducedMotion() {
  if (!canUseDOM() || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * `window.innerWidth` includes the classic scrollbar, which makes the overlay
 * disagree with CSS media queries by ~15px near a breakpoint edge. The
 * documentElement's client width is what media queries actually use.
 */
export function getViewportWidth() {
  if (!canUseDOM()) return 0;
  return document.documentElement?.clientWidth || window.innerWidth || 0;
}

export function getViewportHeight() {
  if (!canUseDOM()) return 0;
  return document.documentElement?.clientHeight || window.innerHeight || 0;
}

export function getBreakpoint(width: number, breakpoints: GuideframeBreakpoints): Breakpoint {
  if (width >= breakpoints.desktop) return "desktop";
  if (width >= breakpoints.tablet) return "tablet";
  return "mobile";
}

export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  fallback: Record<Breakpoint, T>,
  breakpoint: Breakpoint,
): T {
  if (value == null) return fallback[breakpoint];
  if (typeof value !== "object" || Array.isArray(value)) return value as T;
  const responsive = value as Partial<Record<Breakpoint, T>>;
  return responsive[breakpoint] ?? fallback[breakpoint];
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

/**
 * Safari private mode, sandboxed iframes and some enterprise policies make
 * `localStorage` access *throw* rather than return null, which would otherwise
 * take the host application down with it.
 */
export function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeWrite(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable or over quota — the overlay still works in-memory */
  }
}
