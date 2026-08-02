import { afterEach, describe, expect, it, vi } from "vitest";
import { createGuideId, isGuide, readGuides, writeGuides } from "../src/guides-store";

const KEY = "test:guides";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("guide persistence", () => {
  it("round-trips guides", () => {
    const guides = [{ id: "a", axis: "x" as const, position: 120 }];
    writeGuides(KEY, guides);
    expect(readGuides(KEY)).toEqual([{ id: "a", axis: "x", position: 120, locked: false }]);
  });

  it("namespaces guides per route", () => {
    writeGuides(KEY, [{ id: "a", axis: "x", position: 10 }]);
    const stored = Object.keys(localStorage);
    expect(stored[0]).toContain(window.location.pathname);
  });

  it("drops malformed entries instead of throwing", () => {
    localStorage.setItem(
      `${KEY}::${window.location.pathname}`,
      JSON.stringify([
        { id: "ok", axis: "x", position: 10 },
        { id: "bad-axis", axis: "z", position: 10 },
        { id: "no-position", axis: "y" },
        { axis: "y", position: Number.NaN },
        "nonsense",
        null,
      ]),
    );

    const guides = readGuides(KEY);
    expect(guides).toHaveLength(1);
    expect(guides[0].id).toBe("ok");
  });

  it("returns an empty list for invalid JSON", () => {
    localStorage.setItem(`${KEY}::${window.location.pathname}`, "{not json");
    expect(readGuides(KEY)).toEqual([]);
  });

  it("returns an empty list when the stored value is not an array", () => {
    localStorage.setItem(`${KEY}::${window.location.pathname}`, '{"axis":"x"}');
    expect(readGuides(KEY)).toEqual([]);
  });

  it("survives localStorage throwing (Safari private mode, sandboxed iframes)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeGuides(KEY, [{ id: "a", axis: "x", position: 1 }])).not.toThrow();
    expect(readGuides(KEY)).toEqual([]);
  });

  it("backfills a missing id", () => {
    localStorage.setItem(
      `${KEY}::${window.location.pathname}`,
      JSON.stringify([{ axis: "x", position: 42 }]),
    );
    expect(readGuides(KEY)[0].id).toBeTruthy();
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 200 }, () => createGuideId()));
    expect(ids.size).toBe(200);
  });

  it("validates guide shape", () => {
    expect(isGuide({ axis: "x", position: 0 })).toBe(true);
    expect(isGuide({ axis: "x", position: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isGuide(undefined)).toBe(false);
  });
});
