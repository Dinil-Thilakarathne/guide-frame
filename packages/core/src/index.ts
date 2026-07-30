import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLOR,
  DEFAULT_COLUMNS,
  DEFAULT_GUIDES_STORAGE_KEY,
  DEFAULT_GUTTER,
  DEFAULT_MARGIN,
  DEFAULT_OPACITY,
  DEFAULT_RULER_SIZE,
  DEFAULT_SNAP_THRESHOLD,
  DEFAULT_STORAGE_KEY,
  DEFAULT_Z_INDEX,
  ROOT_ATTRIBUTE,
  canUseDOM,
  getBreakpoint,
  getViewportHeight,
  getViewportWidth,
  isEditableTarget,
  isProduction,
  resolveResponsiveValue,
  safeRead,
  safeWrite,
} from "./env";
import {
  columnEdges,
  computeGridGeometry,
  elementEdges,
  pickClosest,
  type GridGeometry,
  type SnapCandidate,
} from "./geometry";
import { createGuideId, readGuides, writeGuides } from "./guides-store";
import { OVERLAY_STYLES } from "./styles";
import type {
  Breakpoint,
  Guide,
  GuideAxis,
  GuideframeInstance,
  GuideframeOptions,
  RulerOptions,
  SnapOptions,
} from "./types";

export * from "./types";
export { createGuideId } from "./guides-store";

const NOOP_INSTANCE: GuideframeInstance = {
  update: () => {},
  destroy: () => {},
  setVisible: () => {},
  isVisible: () => false,
  getGuides: () => [],
  setGuides: () => {},
  clearGuides: () => {},
};

/** Live instances, so stale roots from HMR can be told apart from real ones. */
const liveRoots = new Set<HTMLElement>();

function normaliseRulers(rulers: GuideframeOptions["rulers"]): Required<RulerOptions> | null {
  if (!rulers) return null;
  const value = rulers === true ? {} : rulers;
  return {
    size: value.size ?? DEFAULT_RULER_SIZE,
    step: value.step ?? 100,
  };
}

function normaliseSnap(snap: GuideframeOptions["snap"]): Required<SnapOptions> | null {
  if (snap === false) return null;
  const value = snap === true || snap === undefined ? {} : snap;
  return {
    elements: value.elements ?? true,
    columns: value.columns ?? true,
    guides: value.guides ?? true,
    threshold: value.threshold ?? DEFAULT_SNAP_THRESHOLD,
  };
}

function scrollLeft() {
  return window.scrollX ?? window.pageXOffset ?? 0;
}

function scrollTop() {
  return window.scrollY ?? window.pageYOffset ?? 0;
}

export function createGuideframe(initialOptions: GuideframeOptions = {}): GuideframeInstance {
  if (!canUseDOM()) return NOOP_INSTANCE;

  let options: GuideframeOptions = { ...initialOptions };
  if (isProduction() && !options.forceVisibleInProduction) return NOOP_INSTANCE;

  // ------------------------------------------------------------- host DOM --
  // Any root left behind by a hot reload belongs to a module instance that is
  // already gone; removing it prevents overlays stacking up during dev.
  document.querySelectorAll<HTMLElement>(`[${ROOT_ATTRIBUTE}]`).forEach((stale) => {
    if (!liveRoots.has(stale)) stale.remove();
  });

  const host = document.createElement("div");
  host.setAttribute(ROOT_ATTRIBUTE, "");
  // Mounted on <body> by default so a transformed ancestor can't break
  // `position: fixed`, and so the host app's layout never reflows around it.
  // `display: contents` makes the host generate no box at all, so it adds no
  // layout of its own *and* leaves the overlay root's containing block as the
  // mount target — a positioned container when scoped, the viewport when fixed.
  host.style.cssText = "display:contents;";
  const mountTarget = options.container ?? document.body;
  const shadow = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = OVERLAY_STYLES;
  shadow.append(styleEl);

  const root = document.createElement("div");
  root.className = "gf-root";
  shadow.append(root);

  const gridLayer = document.createElement("div");
  gridLayer.className = "gf-grid-layer";
  const grid = document.createElement("div");
  grid.className = "gf-grid";
  gridLayer.append(grid);

  const guidesLayer = document.createElement("div");
  guidesLayer.className = "gf-guides-layer";

  const rulerX = document.createElement("div");
  rulerX.className = "gf-ruler gf-ruler-x";
  const rulerY = document.createElement("div");
  rulerY.className = "gf-ruler gf-ruler-y";
  const rulerCorner = document.createElement("div");
  rulerCorner.className = "gf-ruler-corner";
  rulerCorner.title = "Clear all guides on this route";

  const readout = document.createElement("div");
  readout.className = "gf-readout gf-hidden";

  root.append(gridLayer, guidesLayer, rulerX, rulerY, rulerCorner, readout);
  mountTarget.append(host);
  liveRoots.add(host);

  // ---------------------------------------------------------------- state --
  let destroyed = false;
  let visible = options.visible ?? options.defaultVisible ?? true;
  let rulersHidden = false;
  let guides: Guide[] = [];
  let geometry: GridGeometry | null = null;
  let breakpoint: Breakpoint = "desktop";
  let frame = 0;

  const guideElements = new Map<string, HTMLElement>();

  const storageKey = () => options.storageKey ?? DEFAULT_STORAGE_KEY;
  const guidesKey = () => options.guidesStorageKey ?? DEFAULT_GUIDES_STORAGE_KEY;
  const controlledVisible = () => options.visible;
  const controlledGuides = () => options.guides;

  // Restore persisted state (uncontrolled mode only).
  if (controlledVisible() === undefined) {
    const stored = safeRead(storageKey());
    if (stored === "true") visible = true;
    if (stored === "false") visible = false;
  }
  guides = controlledGuides() ?? options.defaultGuides ?? readGuides(guidesKey());

  // ------------------------------------------------------------ rendering --
  function effectivePosition(): "fixed" | "absolute" {
    // A scoped overlay can never be `fixed` — it would escape its container.
    return options.container ? "absolute" : options.position ?? "fixed";
  }

  /*
   * Two coordinate spaces are in play, and which one guides are *stored* in
   * depends on the mode:
   *
   *  - fixed (page overlay): document coordinates, so guides stay pinned to the
   *    page while it scrolls.
   *  - scoped/absolute: overlay-relative coordinates, so guides stay pinned to
   *    the component even when it moves elsewhere on the page.
   *
   * `renderOffset` converts stored → drawn, `clientOffset` converts a pointer
   * or a `getBoundingClientRect` value → stored.
   */
  function renderOffset() {
    if (effectivePosition() === "fixed") {
      return { x: scrollLeft(), y: scrollTop() };
    }
    return { x: 0, y: 0 };
  }

  function clientOffset() {
    if (effectivePosition() === "fixed") {
      return { x: scrollLeft(), y: scrollTop() };
    }
    const rect = root.getBoundingClientRect();
    return { x: -rect.left, y: -rect.top };
  }

  /** The box the grid is laid out in: the container when scoped, else the viewport. */
  function overlayWidth() {
    if (options.container) return root.clientWidth || getViewportWidth();
    return getViewportWidth();
  }

  function currentGeometry(): GridGeometry {
    const viewportWidth = overlayWidth();
    breakpoint =
      options.activeBreakpoint ??
      getBreakpoint(viewportWidth, { ...DEFAULT_BREAKPOINTS, ...options.breakpoints });

    return computeGridGeometry({
      viewportWidth,
      maxWidth: options.maxWidth ?? 1280,
      columnCount: resolveResponsiveValue(options.columns, DEFAULT_COLUMNS, breakpoint),
      gutter: resolveResponsiveValue(options.gutter, DEFAULT_GUTTER, breakpoint),
      margin: resolveResponsiveValue(options.margin, DEFAULT_MARGIN, breakpoint),
    });
  }

  function renderGrid() {
    if (!geometry) return;
    const color = options.color ?? DEFAULT_COLOR;

    root.style.setProperty("--gf-color", color);
    root.style.setProperty("--gf-z-index", String(options.zIndex ?? DEFAULT_Z_INDEX));
    root.style.setProperty("--gf-position", effectivePosition());

    grid.style.maxWidth = `${geometry.width}px`;
    grid.style.gridTemplateColumns = `repeat(${geometry.columnCount}, minmax(0, 1fr))`;
    grid.style.columnGap = `${geometry.gutter}px`;
    grid.style.paddingLeft = `${geometry.margin}px`;
    grid.style.paddingRight = `${geometry.margin}px`;
    grid.style.opacity = String(options.opacity ?? DEFAULT_OPACITY);

    // Only rebuild the columns when the count actually changed — otherwise
    // every resize frame would restart the reveal animation.
    if (grid.childElementCount !== geometry.columnCount) {
      grid.replaceChildren();
      for (let index = 0; index < geometry.columnCount; index += 1) {
        const column = document.createElement("div");
        column.className = "gf-column";
        column.style.setProperty("--gf-delay", `${index * 80}ms`);
        grid.append(column);
      }
    }
  }

  function rulerConfig() {
    return normaliseRulers(options.rulers);
  }

  function renderRulers() {
    const config = rulerConfig();
    const enabled = config !== null && !rulersHidden;

    rulerX.classList.toggle("gf-hidden", !enabled);
    rulerY.classList.toggle("gf-hidden", !enabled);
    rulerCorner.classList.toggle("gf-hidden", !enabled);
    if (!config || !enabled || !geometry) return;

    root.style.setProperty("--gf-ruler-size", `${config.size}px`);

    const origin = renderOffset();
    const width = options.container ? root.clientWidth : getViewportWidth();
    const height = options.container ? root.clientHeight : getViewportHeight();

    rulerX.replaceChildren(...buildTicks("x", origin.x, width, config.step, config.size));
    rulerY.replaceChildren(...buildTicks("y", origin.y, height, config.step, config.size));
  }

  function buildTicks(
    axis: GuideAxis,
    scrollOffset: number,
    extent: number,
    step: number,
    size: number,
  ) {
    const nodes: HTMLElement[] = [];
    const minor = Math.max(2, Math.round(step / 10));
    const start = Math.floor(scrollOffset / minor) * minor;

    for (let value = start; value <= scrollOffset + extent; value += minor) {
      // Rounding keeps hairlines crisp under browser zoom and fractional DPR.
      const offset = Math.round(value - scrollOffset);
      if (offset < 0 || offset > extent) continue;
      const isMajor = value % step === 0;

      const tick = document.createElement("div");
      tick.className = "gf-tick";
      const length = isMajor ? size : Math.round(size * 0.3);
      if (axis === "x") {
        tick.style.left = `${offset}px`;
        tick.style.height = `${length}px`;
      } else {
        tick.style.top = `${offset}px`;
        tick.style.width = `${length}px`;
      }
      nodes.push(tick);

      if (isMajor) {
        const label = document.createElement("span");
        label.className = "gf-tick-label";
        label.textContent = String(value);
        if (axis === "x") label.style.left = `${offset}px`;
        else label.style.top = `${offset}px`;
        nodes.push(label);
      }
    }

    // Column boundaries get their own accent ticks on the horizontal ruler.
    if (axis === "x" && geometry) {
      for (const edge of columnEdges(geometry)) {
        const tick = document.createElement("div");
        tick.className = "gf-tick gf-tick-column";
        tick.style.left = `${Math.round(edge.position)}px`;
        tick.style.height = `${size}px`;
        tick.style.width = "1px";
        nodes.push(tick);
      }
    }

    return nodes;
  }

  function renderGuides() {
    const seen = new Set<string>();

    for (const guide of guides) {
      seen.add(guide.id);
      let element = guideElements.get(guide.id);
      if (!element) {
        element = document.createElement("div");
        const line = document.createElement("div");
        line.className = "gf-guide-line";
        const hit = document.createElement("div");
        hit.className = "gf-guide-hit";
        element.append(line, hit);
        hit.addEventListener("pointerdown", (event) => onGuidePointerDown(event, guide.id));
        guidesLayer.append(element);
        guideElements.set(guide.id, element);
      }
      element.className = `gf-guide gf-guide-${guide.axis}${guide.locked ? " gf-guide-locked" : ""}`;
      element.dataset.guideId = guide.id;
    }

    for (const [id, element] of guideElements) {
      if (seen.has(id)) continue;
      element.remove();
      guideElements.delete(id);
    }

    positionGuides();
  }

  function positionGuides() {
    const origin = renderOffset();

    for (const guide of guides) {
      const element = guideElements.get(guide.id);
      if (!element) continue;
      if (guide.axis === "x") {
        element.style.left = `${guide.position - origin.x}px`;
      } else {
        element.style.top = `${guide.position - origin.y}px`;
      }
    }
  }

  function render() {
    if (destroyed) return;
    root.classList.toggle("gf-hidden", !isVisible());
    if (!isVisible()) return;
    geometry = currentGeometry();
    renderGrid();
    renderGuides();
    renderRulers();
  }

  function scheduleRender() {
    if (destroyed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  }

  /** Cheap path for scroll: reposition, don't rebuild the grid. */
  function scheduleSync() {
    if (destroyed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!isVisible()) return;
      positionGuides();
      renderRulers();
    });
  }

  // -------------------------------------------------------------- guides ---
  function commitGuides(next: Guide[], persist = true) {
    guides = next;
    if (controlledGuides() === undefined && persist) writeGuides(guidesKey(), guides);
    options.onGuidesChange?.(guides);
    renderGuides();
  }

  function snapCandidates(axis: GuideAxis, clientX: number, clientY: number, excludeId?: string) {
    const snap = normaliseSnap(options.snap);
    const candidates: SnapCandidate[] = [];
    if (!snap) return { snap, candidates };

    // Element rects are in viewport space; the grid is already in overlay space.
    const client = clientOffset();
    const clientDelta = axis === "x" ? client.x : client.y;
    const render = renderOffset();
    const gridOffset = axis === "x" ? render.x : render.y;

    if (snap.columns && geometry && axis === "x") {
      for (const edge of columnEdges(geometry)) {
        candidates.push({
          position: edge.position + gridOffset,
          kind: "column",
          label: edge.label,
          priority: 2,
        });
      }
    }

    if (snap.guides) {
      for (const guide of guides) {
        if (guide.id === excludeId || guide.axis !== axis) continue;
        candidates.push({
          position: guide.position,
          kind: "guide",
          label: "guide",
          priority: 3,
        });
      }
    }

    if (snap.elements && typeof document.elementsFromPoint === "function") {
      const stack = document.elementsFromPoint(clientX, clientY)
        .filter(
          (element) =>
            element !== host &&
            !host.contains(element) &&
            element !== document.body &&
            element !== document.documentElement,
        )
        .slice(0, 4);
      for (const element of stack) {
        candidates.push(...elementEdges(element, axis, clientDelta));
      }
    }

    return { snap, candidates };
  }

  type DragState = {
    id: string;
    axis: GuideAxis;
    /** Created by dragging off a ruler — dropping it back on the ruler cancels. */
    fromRuler: boolean;
    pointerId: number;
    captureTarget: Element;
  };

  let drag: DragState | null = null;
  let previousUserSelect = "";

  /**
   * Dragging a guide across the page would otherwise select the text underneath
   * it. `preventDefault` on pointerdown is not reliable for this, so selection
   * is suppressed on the document for the duration of the drag.
   */
  function suppressSelection() {
    previousUserSelect = document.documentElement.style.userSelect;
    document.documentElement.style.userSelect = "none";
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      /* selection APIs are unavailable in some embedded contexts */
    }
  }

  function restoreSelection() {
    document.documentElement.style.userSelect = previousUserSelect;
  }

  function pointerPosition(event: PointerEvent, axis: GuideAxis) {
    const offset = clientOffset();
    return axis === "x" ? event.clientX + offset.x : event.clientY + offset.y;
  }

  function updateDrag(event: PointerEvent) {
    if (!drag) return;
    const raw = pointerPosition(event, drag.axis);
    // Alt is the universal "ignore snapping" modifier, same as Figma.
    const bypass = event.altKey;
    const { snap, candidates } = bypass
      ? { snap: null, candidates: [] }
      : snapCandidates(drag.axis, event.clientX, event.clientY, drag.id);

    const result = snap
      ? pickClosest(raw, candidates, snap.threshold)
      : { position: raw, kind: "none" as const, label: "" };

    const position = Math.round(result.position * 100) / 100;
    const next = guides.map((guide) =>
      guide.id === drag?.id ? { ...guide, position } : guide,
    );
    guides = next;
    positionGuides();

    showReadout(event, `${drag.axis.toUpperCase()} ${Math.round(position)}`, result.label);
  }

  function showReadout(event: PointerEvent, text: string, hint: string) {
    readout.classList.remove("gf-hidden");
    readout.replaceChildren(document.createTextNode(text));
    if (hint) {
      const span = document.createElement("span");
      span.className = "gf-readout-hint";
      span.textContent = hint;
      readout.append(span);
    }
    readout.style.left = `${event.clientX}px`;
    readout.style.top = `${event.clientY}px`;
  }

  function hideReadout() {
    readout.classList.add("gf-hidden");
  }

  function isOverRuler(event: PointerEvent, axis: GuideAxis) {
    const config = rulerConfig();
    if (!config) return false;
    // A horizontal guide (axis "y") is deleted by dropping it on the top ruler.
    const rect = root.getBoundingClientRect();
    return axis === "y"
      ? event.clientY >= rect.top && event.clientY - rect.top <= config.size
      : event.clientX >= rect.left && event.clientX - rect.left <= config.size;
  }

  function endDrag(event: PointerEvent, cancelled: boolean) {
    if (!drag) return;
    const current = drag;
    drag = null;
    hideReadout();
    restoreSelection();

    try {
      current.captureTarget.releasePointerCapture(current.pointerId);
    } catch {
      /* capture may already be lost if the element was removed */
    }

    guideElements.get(current.id)?.classList.remove("gf-guide-dragging");

    const droppedOnRuler = !cancelled && isOverRuler(event, current.axis);
    if (cancelled || droppedOnRuler) {
      commitGuides(guides.filter((guide) => guide.id !== current.id));
      return;
    }

    commitGuides(guides.slice());
  }

  function beginDrag(event: PointerEvent, guide: Guide, fromRuler: boolean, target: Element) {
    if (guide.locked) return;
    event.preventDefault();
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is best-effort; the window listeners still fire */
    }
    suppressSelection();
    drag = {
      id: guide.id,
      axis: guide.axis,
      fromRuler,
      pointerId: event.pointerId,
      captureTarget: target,
    };
    guideElements.get(guide.id)?.classList.add("gf-guide-dragging");
    updateDrag(event);
  }

  function onGuidePointerDown(event: PointerEvent, id: string) {
    if (event.button !== 0) return;
    const guide = guides.find((item) => item.id === id);
    if (!guide || guide.locked) return;
    const target = event.currentTarget as Element;
    beginDrag(event, guide, false, target);
  }

  function onRulerPointerDown(event: PointerEvent, axis: GuideAxis) {
    if (event.button !== 0) return;
    const guide: Guide = {
      id: createGuideId(),
      axis,
      position: pointerPosition(event, axis),
    };
    guides = [...guides, guide];
    renderGuides();
    beginDrag(event, guide, true, event.currentTarget as Element);
  }

  // -------------------------------------------------------------- events ---
  const onPointerMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    updateDrag(event);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    endDrag(event, false);
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    endDrag(event, true);
  };

  const onScroll = () => scheduleSync();

  const onKeyDown = (event: KeyboardEvent) => {
    // Escape aborts an in-flight drag before any other handling.
    if (event.key === "Escape" && drag) {
      const synthetic = new PointerEvent("pointerup", { pointerId: drag.pointerId });
      endDrag(synthetic, true);
      return;
    }

    if (options.shortcut === false) return;
    // Ignore keystrokes an IME is still composing, and anything typed into a field.
    if (event.isComposing || event.keyCode === 229) return;
    if (isEditableTarget(event.target)) return;

    const platform = typeof navigator !== "undefined" ? navigator.platform || "" : "";
    const isMac = /Mac|iPhone|iPad/.test(platform);
    const modKey = isMac ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();

    if (modKey && !event.shiftKey && !event.altKey && key === "g") {
      event.preventDefault();
      setVisible(!isVisible());
      return;
    }

    if (event.shiftKey && !modKey && !event.altKey && key === "r") {
      event.preventDefault();
      rulersHidden = !rulersHidden;
      scheduleRender();
      return;
    }

    if (event.shiftKey && !modKey && !event.altKey && key === "l") {
      event.preventDefault();
      const anyUnlocked = guides.some((guide) => !guide.locked);
      commitGuides(guides.map((guide) => ({ ...guide, locked: anyUnlocked })));
    }
  };

  rulerX.addEventListener("pointerdown", (event) => onRulerPointerDown(event, "y"));
  rulerY.addEventListener("pointerdown", (event) => onRulerPointerDown(event, "x"));
  rulerCorner.addEventListener("click", () => clearGuides());

  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  window.addEventListener("keydown", onKeyDown);

  // A ResizeObserver on the root element catches viewport changes *and*
  // scrollbar appear/disappear, which a bare `resize` listener misses.
  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => scheduleRender())
      : null;
  resizeObserver?.observe(document.documentElement);
  if (!resizeObserver) window.addEventListener("resize", scheduleRender);

  // ----------------------------------------------------------------- API ---
  function isVisible() {
    return controlledVisible() ?? visible;
  }

  function setVisible(next: boolean) {
    if (controlledVisible() === undefined) {
      visible = next;
      safeWrite(storageKey(), String(next));
    }
    options.onVisibleChange?.(next);
    scheduleRender();
  }

  function clearGuides() {
    commitGuides([]);
  }

  render();

  return {
    update(next: GuideframeOptions) {
      if (destroyed) return;
      options = { ...next };
      if (next.guides !== undefined) guides = next.guides;
      scheduleRender();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", scheduleRender);
      resizeObserver?.disconnect();
      guideElements.clear();
      liveRoots.delete(host);
      host.remove();
    },
    setVisible,
    isVisible,
    getGuides: () => guides.slice(),
    setGuides: (next: Guide[]) => commitGuides(next),
    clearGuides,
  };
}
