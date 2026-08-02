import type { GuideAxis, SnapResult } from "./types";

export type GridGeometry = {
  /** Left edge of the centred grid container, in viewport coordinates. */
  left: number;
  width: number;
  columnCount: number;
  columnWidth: number;
  gutter: number;
  margin: number;
};

export type SnapCandidate = {
  position: number;
  kind: SnapResult["kind"];
  label: string;
  /** Lower wins ties. */
  priority: number;
};

export function resolveMaxWidth(maxWidth: number | string, viewportWidth: number) {
  if (typeof maxWidth === "number") return Math.min(maxWidth, viewportWidth);
  const trimmed = String(maxWidth).trim();
  if (trimmed.endsWith("%")) {
    const ratio = Number.parseFloat(trimmed) / 100;
    return Number.isFinite(ratio) ? viewportWidth * ratio : viewportWidth;
  }
  const parsed = Number.parseFloat(trimmed);
  // `none`, `100vw`, `auto` and friends all mean "fill the viewport".
  if (!Number.isFinite(parsed)) return viewportWidth;
  return Math.min(parsed, viewportWidth);
}

export function computeGridGeometry(options: {
  viewportWidth: number;
  maxWidth: number | string;
  columnCount: number;
  gutter: number;
  margin: number;
}): GridGeometry {
  const { viewportWidth, columnCount, gutter, margin } = options;
  const width = resolveMaxWidth(options.maxWidth, viewportWidth);
  const left = Math.max(0, (viewportWidth - width) / 2);
  const contentWidth = Math.max(0, width - margin * 2);
  const totalGutter = gutter * Math.max(0, columnCount - 1);
  const columnWidth = columnCount > 0 ? Math.max(0, (contentWidth - totalGutter) / columnCount) : 0;

  return { left, width, columnCount, columnWidth, gutter, margin };
}

/**
 * Column and gutter boundaries in viewport coordinates, left to right.
 * Used both for snapping and for the ruler's column ticks.
 */
export function columnEdges(geometry: GridGeometry): { position: number; label: string }[] {
  const edges: { position: number; label: string }[] = [];
  const contentLeft = geometry.left + geometry.margin;
  if (geometry.columnCount <= 0 || geometry.columnWidth <= 0) return edges;

  edges.push({ position: geometry.left, label: "container left" });
  edges.push({ position: geometry.left + geometry.width, label: "container right" });

  for (let index = 0; index < geometry.columnCount; index += 1) {
    const start = contentLeft + index * (geometry.columnWidth + geometry.gutter);
    edges.push({ position: start, label: `col ${index + 1} start` });
    edges.push({ position: start + geometry.columnWidth, label: `col ${index + 1} end` });
  }

  return edges;
}

export function pickClosest(
  target: number,
  candidates: SnapCandidate[],
  threshold: number,
): SnapResult {
  let best: SnapCandidate | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (!Number.isFinite(candidate.position)) continue;
    const distance = Math.abs(candidate.position - target);
    if (distance > threshold) continue;
    if (
      distance < bestDistance - 0.001 ||
      (Math.abs(distance - bestDistance) <= 0.001 &&
        best !== null &&
        candidate.priority < best.priority)
    ) {
      best = candidate;
      bestDistance = distance;
    }
  }

  if (!best) return { position: target, kind: "none", label: "" };
  return { position: best.position, kind: best.kind, label: best.label };
}

/**
 * Box edges of an element, in the axis of interest, as snap candidates.
 * Includes the padding box so guides can be checked against inner content too.
 */
export function elementEdges(
  element: Element,
  axis: GuideAxis,
  scrollOffset: number,
): SnapCandidate[] {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return [];

  const name = describeElement(element);
  if (axis === "x") {
    return [
      { position: rect.left + scrollOffset, kind: "element", label: `${name} left`, priority: 0 },
      { position: rect.right + scrollOffset, kind: "element", label: `${name} right`, priority: 0 },
      {
        position: rect.left + rect.width / 2 + scrollOffset,
        kind: "element",
        label: `${name} center`,
        priority: 1,
      },
    ];
  }

  return [
    { position: rect.top + scrollOffset, kind: "element", label: `${name} top`, priority: 0 },
    { position: rect.bottom + scrollOffset, kind: "element", label: `${name} bottom`, priority: 0 },
    {
      position: rect.top + rect.height / 2 + scrollOffset,
      kind: "element",
      label: `${name} center`,
      priority: 1,
    },
  ];
}

export function describeElement(element: Element) {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  if (id) return `${tag}${id}`;
  const className =
    typeof element.className === "string" ? element.className.trim().split(/\s+/)[0] : "";
  return className ? `${tag}.${className}` : tag;
}
