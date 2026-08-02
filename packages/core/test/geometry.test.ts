import { describe, expect, it } from "vitest";
import { columnEdges, computeGridGeometry, pickClosest, resolveMaxWidth } from "../src/geometry";

describe("resolveMaxWidth", () => {
  it("clamps a numeric max width to the viewport", () => {
    expect(resolveMaxWidth(1280, 1440)).toBe(1280);
    expect(resolveMaxWidth(1280, 900)).toBe(900);
  });

  it("supports percentage strings", () => {
    expect(resolveMaxWidth("50%", 1000)).toBe(500);
  });

  it("treats non-numeric strings as full width", () => {
    expect(resolveMaxWidth("none", 1000)).toBe(1000);
    expect(resolveMaxWidth("auto", 1000)).toBe(1000);
  });
});

describe("computeGridGeometry", () => {
  it("centres the container and divides the columns", () => {
    const geometry = computeGridGeometry({
      viewportWidth: 1440,
      maxWidth: 1200,
      columnCount: 12,
      gutter: 20,
      margin: 0,
    });

    expect(geometry.left).toBe(120);
    expect(geometry.width).toBe(1200);
    // (1200 - 11*20) / 12
    expect(geometry.columnWidth).toBeCloseTo(81.666, 2);
  });

  it("never produces negative widths on tiny viewports", () => {
    const geometry = computeGridGeometry({
      viewportWidth: 100,
      maxWidth: 1200,
      columnCount: 12,
      gutter: 24,
      margin: 40,
    });

    expect(geometry.columnWidth).toBe(0);
    expect(geometry.left).toBe(0);
  });

  it("handles a zero column count without dividing by zero", () => {
    const geometry = computeGridGeometry({
      viewportWidth: 1000,
      maxWidth: 1000,
      columnCount: 0,
      gutter: 20,
      margin: 0,
    });

    expect(geometry.columnWidth).toBe(0);
    expect(Number.isFinite(geometry.columnWidth)).toBe(true);
  });
});

describe("columnEdges", () => {
  it("emits a start and end for every column plus the container bounds", () => {
    const geometry = computeGridGeometry({
      viewportWidth: 1000,
      maxWidth: 1000,
      columnCount: 4,
      gutter: 0,
      margin: 0,
    });

    const edges = columnEdges(geometry);
    expect(edges).toHaveLength(4 * 2 + 2);
    expect(edges.map((edge) => edge.position)).toContain(250);
  });

  it("returns nothing when there is no room to draw columns", () => {
    const geometry = computeGridGeometry({
      viewportWidth: 10,
      maxWidth: 1000,
      columnCount: 12,
      gutter: 24,
      margin: 24,
    });

    expect(columnEdges(geometry)).toHaveLength(0);
  });
});

describe("pickClosest", () => {
  const candidates = [
    { position: 100, kind: "column" as const, label: "col 1 start", priority: 2 },
    { position: 103, kind: "element" as const, label: "div left", priority: 0 },
    { position: 400, kind: "guide" as const, label: "guide", priority: 3 },
  ];

  it("snaps to the nearest candidate within the threshold", () => {
    expect(pickClosest(102, candidates, 6).position).toBe(103);
  });

  it("leaves the position untouched when nothing is close enough", () => {
    const result = pickClosest(250, candidates, 6);
    expect(result.position).toBe(250);
    expect(result.kind).toBe("none");
  });

  it("prefers element edges over columns at equal distance", () => {
    const tied = [
      { position: 100, kind: "column" as const, label: "col", priority: 2 },
      { position: 104, kind: "element" as const, label: "div left", priority: 0 },
    ];
    expect(pickClosest(102, tied, 6).kind).toBe("element");
  });

  it("ignores non-finite candidates", () => {
    const result = pickClosest(
      10,
      [{ position: Number.NaN, kind: "element" as const, label: "x", priority: 0 }],
      6,
    );
    expect(result.kind).toBe("none");
  });
});
