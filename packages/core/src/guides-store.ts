import { safeRead, safeWrite } from "./env";
import type { Guide } from "./types";

let idCounter = 0;

export function createGuideId() {
  idCounter += 1;
  return `gf-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/** Guides are per-route: guides drawn on /pricing shouldn't appear on /blog. */
export function routeStorageKey(baseKey: string) {
  let pathname = "/";
  try {
    pathname = window.location?.pathname || "/";
  } catch {
    /* non-browser location (rare embeds) — fall back to the shared bucket */
  }
  return `${baseKey}::${pathname}`;
}

export function isGuide(value: unknown): value is Guide {
  if (typeof value !== "object" || value === null) return false;
  const guide = value as Partial<Guide>;
  return (
    (guide.axis === "x" || guide.axis === "y") &&
    typeof guide.position === "number" &&
    Number.isFinite(guide.position)
  );
}

/**
 * Hand-written or stale localStorage entries must never throw at startup, so
 * every value is validated and anything unrecognised is dropped.
 */
export function readGuides(baseKey: string): Guide[] {
  const raw = safeRead(routeStorageKey(baseKey));
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGuide).map((guide) => ({
      id: typeof guide.id === "string" && guide.id ? guide.id : createGuideId(),
      axis: guide.axis,
      position: guide.position,
      locked: guide.locked === true,
    }));
  } catch {
    return [];
  }
}

export function writeGuides(baseKey: string, guides: Guide[]) {
  safeWrite(routeStorageKey(baseKey), JSON.stringify(guides));
}
