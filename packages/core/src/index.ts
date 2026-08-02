import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLOR,
  DEFAULT_COLUMNS,
  DEFAULT_GUIDES_STORAGE_KEY,
  DEFAULT_GUTTER,
  DEFAULT_MARGIN,
  DEFAULT_OPACITY,
  DEFAULT_PANEL_POSITION_STORAGE_KEY,
  DEFAULT_PANEL_STORAGE_KEY,
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
  describeElement,
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

function createPanelButton(label: string, shortcut = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "gf-panel-row";

  const text = document.createElement("span");
  text.textContent = label;
  const key = document.createElement("kbd");
  key.textContent = shortcut;
  const toggle = document.createElement("span");
  toggle.className = "gf-panel-toggle";
  toggle.setAttribute("aria-hidden", "true");
  button.append(text, key, toggle);
  return button;
}

function modifierLabel() {
  const platform = typeof navigator !== "undefined" ? navigator.platform || "" : "";
  return /Mac|iPhone|iPad/.test(platform) ? "⌘" : "Ctrl+";
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

  const inspectorLayer = document.createElement("div");
  inspectorLayer.className = "gf-inspector-layer gf-hidden";
  const inspectorHover = document.createElement("div");
  inspectorHover.className = "gf-inspector-box gf-inspector-hover";
  const inspectorPinned = document.createElement("div");
  inspectorPinned.className = "gf-inspector-box gf-inspector-pinned gf-hidden";
  const inspectorLabel = document.createElement("div");
  inspectorLabel.className = "gf-inspector-label";
  const inspectorDistance = document.createElement("div");
  inspectorDistance.className = "gf-inspector-distance gf-hidden";
  const inspectorStatus = document.createElement("div");
  inspectorStatus.className = "gf-inspector-status";
  inspectorStatus.setAttribute("role", "status");
  inspectorStatus.textContent = "Geometry Inspector · Page interactions paused · Esc to exit";
  inspectorLayer.append(
    inspectorHover,
    inspectorPinned,
    inspectorLabel,
    inspectorDistance,
    inspectorStatus,
  );

  const rulerX = document.createElement("div");
  rulerX.className = "gf-ruler gf-ruler-x";
  const rulerY = document.createElement("div");
  rulerY.className = "gf-ruler gf-ruler-y";
  const rulerCorner = document.createElement("div");
  rulerCorner.className = "gf-ruler-corner";
  rulerCorner.title = "Clear all guides on this route";

  const readout = document.createElement("div");
  readout.className = "gf-readout gf-hidden";

  const panel = document.createElement("section");
  panel.className = "gf-panel gf-hidden";
  panel.setAttribute("aria-label", "GuideFrame controls");
  const panelHeader = document.createElement("header");
  panelHeader.className = "gf-panel-header";
  const panelTitle = document.createElement("strong");
  panelTitle.textContent = "GuideFrame";
  const panelMeta = document.createElement("span");
  panelMeta.className = "gf-panel-meta";
  const panelClose = document.createElement("button");
  panelClose.type = "button";
  panelClose.className = "gf-panel-close";
  panelClose.setAttribute("aria-label", "Close GuideFrame controls");
  panelClose.textContent = "×";
  panelHeader.append(panelTitle, panelMeta, panelClose);

  const panelBody = document.createElement("div");
  panelBody.className = "gf-panel-body";
  const gridControl = createPanelButton("Grid", `${modifierLabel()}G`);
  const rulersControl = createPanelButton("Rulers", "⇧R");
  const guidesControl = createPanelButton("Guides");
  const inspectorControl = createPanelButton("Geometry inspector", "⇧M");
  const lockControl = createPanelButton("Lock guides", "⇧L");
  const snapElementsControl = createPanelButton("Snap to elements");
  const snapColumnsControl = createPanelButton("Snap to columns");
  const snapGuidesControl = createPanelButton("Snap to guides");
  const separator = document.createElement("div");
  separator.className = "gf-panel-separator";
  const clearControl = document.createElement("button");
  clearControl.type = "button";
  clearControl.className = "gf-panel-clear";
  clearControl.textContent = "Clear all guides";
  panelBody.append(
    gridControl,
    rulersControl,
    guidesControl,
    inspectorControl,
    lockControl,
    separator,
    snapElementsControl,
    snapColumnsControl,
    snapGuidesControl,
    clearControl,
  );
  panel.append(panelHeader, panelBody);

  root.append(
    gridLayer,
    guidesLayer,
    inspectorLayer,
    rulerX,
    rulerY,
    rulerCorner,
    readout,
    panel,
  );
  mountTarget.append(host);
  liveRoots.add(host);

  // ---------------------------------------------------------------- state --
  let destroyed = false;
  let visible = options.visible ?? options.defaultVisible ?? true;
  let rulersOn = false;
  let guidesOn = true;
  let inspectorOn = false;
  let hoveredElement: Element | null = null;
  let pinnedElement: Element | null = null;
  let previousCursor = "";
  let panelOpen = options.panel !== false && safeRead(DEFAULT_PANEL_STORAGE_KEY) === "true";
  let snapOverrides: Partial<Pick<Required<SnapOptions>, "elements" | "columns" | "guides">> = {};
  /** The guide that Backspace/Delete acts on. */
  let selectedId: string | null = null;
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
  // Rulers start in step with the grid, so enabling `rulers` doesn't change how
  // an existing setup looks on load. Shift+R moves them independently after that.
  rulersOn = normaliseRulers(options.rulers) !== null && visible;

  const storedPanelPosition = safeRead(DEFAULT_PANEL_POSITION_STORAGE_KEY);
  if (storedPanelPosition) {
    try {
      const position = JSON.parse(storedPanelPosition) as { x?: number; y?: number };
      if (Number.isFinite(position.x) && Number.isFinite(position.y)) {
        panel.style.left = `${position.x}px`;
        panel.style.top = `${position.y}px`;
        panel.style.right = "auto";
      }
    } catch {
      // Ignore old or malformed position data.
    }
  }

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
    return normaliseRulers(options.rulers) ?? (rulersOn ? normaliseRulers(true) : null);
  }

  function renderRulers() {
    const config = rulerConfig();
    const enabled = rulersVisible();

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
        const handle = document.createElement("div");
        handle.className = "gf-guide-handle";
        element.append(line, hit, handle);
        hit.addEventListener("pointerdown", (event) => onGuidePointerDown(event, guide.id));
        guidesLayer.append(element);
        guideElements.set(guide.id, element);
      }
      const classes = ["gf-guide", `gf-guide-${guide.axis}`];
      if (guide.locked) classes.push("gf-guide-locked");
      if (guide.id === selectedId) classes.push("gf-guide-selected");
      element.className = classes.join(" ");
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

  /** True when the rulers (and therefore the guides) should be drawn. */
  function rulersVisible() {
    return rulersOn;
  }

  function currentSnap() {
    const configured = normaliseSnap(options.snap) ?? {
      elements: false,
      columns: false,
      guides: false,
      threshold: DEFAULT_SNAP_THRESHOLD,
    };
    return { ...configured, ...snapOverrides };
  }

  function setPressed(control: HTMLButtonElement, pressed: boolean) {
    control.setAttribute("role", "switch");
    control.setAttribute("aria-checked", String(pressed));
    control.classList.toggle("gf-panel-row-on", pressed);
  }

  function renderPanel() {
    const enabled = options.panel !== false;
    if (!enabled) panelOpen = false;
    panel.classList.toggle("gf-hidden", !enabled || !panelOpen);
    if (!enabled || !panelOpen) return;

    const snap = currentSnap();
    const anyUnlocked = guides.some((guide) => !guide.locked);
    setPressed(gridControl, isVisible());
    setPressed(rulersControl, rulersOn);
    setPressed(guidesControl, guidesOn);
    setPressed(inspectorControl, inspectorOn);
    setPressed(lockControl, guides.length > 0 && !anyUnlocked);
    setPressed(snapElementsControl, snap.elements);
    setPressed(snapColumnsControl, snap.columns);
    setPressed(snapGuidesControl, snap.guides);
    lockControl.disabled = guides.length === 0;
    clearControl.disabled = guides.length === 0;
    panelMeta.textContent = geometry
      ? `${breakpoint} · ${geometry.columnCount} cols · ${geometry.gutter}px gap`
      : breakpoint;
  }

  function inspectedElementAt(clientX: number, clientY: number) {
    if (typeof document.elementsFromPoint !== "function") return null;
    return (
      document
        .elementsFromPoint(clientX, clientY)
        .find(
          (element) =>
            element !== host &&
            !host.contains(element) &&
            element !== document.body &&
            element !== document.documentElement,
        ) ?? null
    );
  }

  function inspectorRect(element: Element) {
    const rect = element.getBoundingClientRect();
    const rootRect = options.container ? root.getBoundingClientRect() : null;
    return {
      left: rect.left - (rootRect?.left ?? 0),
      top: rect.top - (rootRect?.top ?? 0),
      right: rect.right - (rootRect?.left ?? 0),
      bottom: rect.bottom - (rootRect?.top ?? 0),
      width: rect.width,
      height: rect.height,
    };
  }

  function placeInspectorBox(box: HTMLElement, rect: ReturnType<typeof inspectorRect>) {
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }

  function rounded(value: number) {
    return Math.round(value * 10) / 10;
  }

  function computedSpacing(element: Element) {
    if (typeof getComputedStyle !== "function") return "";
    const style = getComputedStyle(element);
    const values = [
      style.paddingTop,
      style.paddingRight,
      style.paddingBottom,
      style.paddingLeft,
    ].map((value) => Number.parseFloat(value) || 0);
    return values.some(Boolean) ? `padding ${values.map(rounded).join(" ")}` : "";
  }

  function renderInspector() {
    inspectorLayer.classList.toggle("gf-hidden", !inspectorOn);
    if (!inspectorOn) return;
    if (hoveredElement && !hoveredElement.isConnected) hoveredElement = null;
    if (pinnedElement && !pinnedElement.isConnected) pinnedElement = null;

    if (!hoveredElement) {
      inspectorHover.classList.add("gf-hidden");
      inspectorLabel.classList.add("gf-hidden");
      inspectorDistance.classList.add("gf-hidden");
      inspectorPinned.classList.toggle("gf-hidden", !pinnedElement);
      if (pinnedElement) placeInspectorBox(inspectorPinned, inspectorRect(pinnedElement));
      return;
    }

    const hoverRect = inspectorRect(hoveredElement);
    placeInspectorBox(inspectorHover, hoverRect);
    inspectorHover.classList.remove("gf-hidden");

    const details = [
      describeElement(hoveredElement),
      `${rounded(hoverRect.width)} × ${rounded(hoverRect.height)}`,
      computedSpacing(hoveredElement),
    ].filter(Boolean);
    inspectorLabel.replaceChildren();
    for (const detail of details) {
      const line = document.createElement("span");
      line.textContent = detail;
      inspectorLabel.append(line);
    }
    inspectorLabel.style.left = `${Math.max(8, hoverRect.left)}px`;
    inspectorLabel.style.top = `${Math.max(8, hoverRect.top - 8)}px`;
    inspectorLabel.classList.remove("gf-hidden");

    const comparing = pinnedElement && pinnedElement !== hoveredElement;
    inspectorPinned.classList.toggle("gf-hidden", !pinnedElement);
    inspectorDistance.classList.toggle("gf-hidden", !comparing);
    if (!pinnedElement) return;

    const pinnedRect = inspectorRect(pinnedElement);
    placeInspectorBox(inspectorPinned, pinnedRect);
    if (!comparing) return;

    const horizontalGap =
      hoverRect.left >= pinnedRect.right
        ? hoverRect.left - pinnedRect.right
        : pinnedRect.left >= hoverRect.right
          ? pinnedRect.left - hoverRect.right
          : 0;
    const verticalGap =
      hoverRect.top >= pinnedRect.bottom
        ? hoverRect.top - pinnedRect.bottom
        : pinnedRect.top >= hoverRect.bottom
          ? pinnedRect.top - hoverRect.bottom
          : 0;
    const leftDelta = Math.abs(hoverRect.left - pinnedRect.left);
    const topDelta = Math.abs(hoverRect.top - pinnedRect.top);
    inspectorDistance.textContent = `gap x ${rounded(horizontalGap)} · y ${rounded(verticalGap)}  |  align x ${rounded(leftDelta)} · y ${rounded(topDelta)}`;
    inspectorDistance.style.left = `${Math.max(8, (hoverRect.left + pinnedRect.left) / 2)}px`;
    inspectorDistance.style.top = `${Math.max(8, (hoverRect.top + pinnedRect.top) / 2)}px`;
  }

  function setInspector(next: boolean) {
    if (inspectorOn === next) return;
    inspectorOn = next;
    if (next) {
      previousCursor = document.documentElement.style.cursor;
      document.documentElement.style.cursor = "crosshair";
    } else {
      document.documentElement.style.cursor = previousCursor;
      hoveredElement = null;
      pinnedElement = null;
      inspectorLayer.classList.add("gf-hidden");
    }
    scheduleRender();
  }

  /*
   * The grid and the rulers are independent layers. The root only hides when
   * *both* are off, so `Shift+R` can bring the rulers up from cold instead of
   * being a silent no-op whenever the grid happens to be hidden.
   */
  function render() {
    if (destroyed) return;
    const showRoot =
      isVisible() || rulersVisible() || inspectorOn || (options.panel !== false && panelOpen);
    root.classList.toggle("gf-hidden", !showRoot);
    if (!showRoot) return;
    geometry = currentGeometry();
    gridLayer.classList.toggle("gf-hidden", !isVisible());
    guidesLayer.classList.toggle("gf-hidden", !guidesOn || (!isVisible() && !rulersVisible()));
    renderGrid();
    renderGuides();
    renderRulers();
    renderInspector();
    renderPanel();
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
      if (!isVisible() && !rulersVisible() && !inspectorOn) return;
      positionGuides();
      renderRulers();
      renderInspector();
    });
  }

  // -------------------------------------------------------------- guides ---
  function commitGuides(next: Guide[], persist = true) {
    guides = next;
    if (controlledGuides() === undefined && persist) writeGuides(guidesKey(), guides);
    options.onGuidesChange?.(guides);
    renderGuides();
    if (panelOpen) renderPanel();
  }

  function snapCandidates(axis: GuideAxis, clientX: number, clientY: number, excludeId?: string) {
    const snap = currentSnap();
    const candidates: SnapCandidate[] = [];

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
    /** Where the guide sat before the drag, so Escape can put it back. */
    originPosition: number;
    pointerId: number;
    captureTarget: Element;
  };

  let drag: DragState | null = null;
  let panelDrag: { pointerId: number; offsetX: number; offsetY: number } | null = null;
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

    // A cancelled drag only removes the guide if the drag is what created it.
    // Cancelling a move of an existing guide puts it back where it started.
    if (droppedOnRuler || (cancelled && current.fromRuler)) {
      if (selectedId === current.id) selectedId = null;
      commitGuides(guides.filter((guide) => guide.id !== current.id));
      return;
    }

    if (cancelled) {
      commitGuides(
        guides.map((guide) =>
          guide.id === current.id ? { ...guide, position: current.originPosition } : guide,
        ),
      );
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
      originPosition: guide.position,
      pointerId: event.pointerId,
      captureTarget: target,
    };
    guideElements.get(guide.id)?.classList.add("gf-guide-dragging");
    updateDrag(event);
  }

  function select(id: string | null) {
    if (selectedId === id) return;
    selectedId = id;
    renderGuides();
  }

  function deleteSelected() {
    const guide = guides.find((item) => item.id === selectedId);
    if (!guide || guide.locked) return false;
    selectedId = null;
    commitGuides(guides.filter((item) => item.id !== guide.id));
    return true;
  }

  function onGuidePointerDown(event: PointerEvent, id: string) {
    if (event.button !== 0) return;
    const guide = guides.find((item) => item.id === id);
    if (!guide) return;
    // Selecting a locked guide is fine — it just can't be moved or deleted.
    select(id);
    if (guide.locked) return;
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
    selectedId = guide.id;
    renderGuides();
    beginDrag(event, guide, true, event.currentTarget as Element);
  }

  // -------------------------------------------------------------- events ---
  const onPointerMove = (event: PointerEvent) => {
    if (panelDrag && event.pointerId === panelDrag.pointerId) {
      const rect = panel.getBoundingClientRect();
      const maxX = Math.max(8, getViewportWidth() - rect.width - 8);
      const maxY = Math.max(8, getViewportHeight() - rect.height - 8);
      const x = Math.min(maxX, Math.max(8, event.clientX - panelDrag.offsetX));
      const y = Math.min(maxY, Math.max(8, event.clientY - panelDrag.offsetY));
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.right = "auto";
      return;
    }
    if (drag && event.pointerId === drag.pointerId) {
      event.preventDefault();
      updateDrag(event);
      return;
    }
    if (inspectorOn) {
      hoveredElement = inspectedElementAt(event.clientX, event.clientY);
      renderInspector();
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (panelDrag && event.pointerId === panelDrag.pointerId) {
      panelDrag = null;
      safeWrite(
        DEFAULT_PANEL_POSITION_STORAGE_KEY,
        JSON.stringify({ x: panel.offsetLeft, y: panel.offsetTop }),
      );
      return;
    }
    if (!drag || event.pointerId !== drag.pointerId) return;
    endDrag(event, false);
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (panelDrag && event.pointerId === panelDrag.pointerId) {
      panelDrag = null;
      return;
    }
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

    // Ignore keystrokes an IME is still composing, and anything typed into a field.
    if (event.isComposing || event.keyCode === 229) return;
    if (isEditableTarget(event.target)) return;

    /*
     * Deleting and deselecting act on a guide the user has directly selected, so
     * they stay available even when the global `shortcut` handling is disabled —
     * they can't fire unless a guide is selected in the first place.
     */
    if (selectedId !== null) {
      if (event.key === "Backspace" || event.key === "Delete") {
        // Backspace would otherwise navigate back in some browsers.
        event.preventDefault();
        deleteSelected();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        select(null);
        return;
      }
    }

    if (event.key === "Escape" && inspectorOn) {
      event.preventDefault();
      if (pinnedElement) {
        pinnedElement = null;
        renderInspector();
      } else {
        setInspector(false);
      }
      return;
    }

    if (options.shortcut === false) return;

    const platform = typeof navigator !== "undefined" ? navigator.platform || "" : "";
    const isMac = /Mac|iPhone|iPad/.test(platform);
    const modKey = isMac ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();

    if (modKey && event.shiftKey && !event.altKey && key === "g") {
      event.preventDefault();
      panelOpen = !panelOpen;
      safeWrite(DEFAULT_PANEL_STORAGE_KEY, String(panelOpen));
      scheduleRender();
      return;
    }

    if (modKey && !event.shiftKey && !event.altKey && key === "g") {
      event.preventDefault();
      setVisible(!isVisible());
      return;
    }

    if (event.shiftKey && !modKey && !event.altKey && key === "r") {
      event.preventDefault();
      rulersOn = !rulersOn;
      scheduleRender();
      return;
    }

    if (event.shiftKey && !modKey && !event.altKey && key === "l") {
      event.preventDefault();
      const anyUnlocked = guides.some((guide) => !guide.locked);
      commitGuides(guides.map((guide) => ({ ...guide, locked: anyUnlocked })));
      return;
    }

    if (event.shiftKey && !modKey && !event.altKey && key === "m") {
      event.preventDefault();
      setInspector(!inspectorOn);
    }
  };

  rulerX.addEventListener("pointerdown", (event) => onRulerPointerDown(event, "y"));
  rulerY.addEventListener("pointerdown", (event) => onRulerPointerDown(event, "x"));
  rulerCorner.addEventListener("click", () => clearGuides());
  panelClose.addEventListener("click", () => {
    panelOpen = false;
    safeWrite(DEFAULT_PANEL_STORAGE_KEY, "false");
    scheduleRender();
  });
  panelHeader.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target === panelClose) return;
    const rect = panel.getBoundingClientRect();
    panelDrag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    event.preventDefault();
  });
  gridControl.addEventListener("click", () => setVisible(!isVisible()));
  rulersControl.addEventListener("click", () => {
    rulersOn = !rulersOn;
    scheduleRender();
  });
  guidesControl.addEventListener("click", () => {
    guidesOn = !guidesOn;
    scheduleRender();
  });
  inspectorControl.addEventListener("click", () => setInspector(!inspectorOn));
  lockControl.addEventListener("click", () => {
    const anyUnlocked = guides.some((guide) => !guide.locked);
    commitGuides(guides.map((guide) => ({ ...guide, locked: anyUnlocked })));
    renderPanel();
  });
  snapElementsControl.addEventListener("click", () => {
    snapOverrides.elements = !currentSnap().elements;
    renderPanel();
  });
  snapColumnsControl.addEventListener("click", () => {
    snapOverrides.columns = !currentSnap().columns;
    renderPanel();
  });
  snapGuidesControl.addEventListener("click", () => {
    snapOverrides.guides = !currentSnap().guides;
    renderPanel();
  });
  clearControl.addEventListener("click", () => {
    clearGuides();
    renderPanel();
  });

  const onWindowPointerDown = (event: PointerEvent) => {
    if (inspectorOn && event.target !== host) {
      const inspected = inspectedElementAt(event.clientX, event.clientY);
      if (inspected) {
        pinnedElement = pinnedElement === inspected ? null : inspected;
        hoveredElement = inspected;
        renderInspector();
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (selectedId === null) return;
    // Shadow-DOM events retarget to the host, so a different target means the
    // click landed on the page rather than on a guide.
    if (event.target === host) return;
    select(null);
  };

  const blockPageInteraction = (event: Event) => {
    if (!inspectorOn || event.target === host) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  window.addEventListener("pointerdown", onWindowPointerDown, true);
  window.addEventListener("pointerup", blockPageInteraction, true);
  window.addEventListener("click", blockPageInteraction, true);
  window.addEventListener("dblclick", blockPageInteraction, true);
  window.addEventListener("contextmenu", blockPageInteraction, true);
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
    // Showing or hiding the overlay brings the rulers with it, so the master
    // toggle reveals everything that was configured. Shift+R moves them alone.
    rulersOn = next && normaliseRulers(options.rulers) !== null;
    options.onVisibleChange?.(next);
    scheduleRender();
  }

  function clearGuides() {
    selectedId = null;
    commitGuides([]);
  }

  render();

  return {
    update(next: GuideframeOptions) {
      if (destroyed) return;
      options = { ...next };
      if (next.panel === false) panelOpen = false;
      if (next.guides !== undefined) guides = next.guides;
      scheduleRender();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (inspectorOn) document.documentElement.style.cursor = previousCursor;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", onWindowPointerDown, true);
      window.removeEventListener("pointerup", blockPageInteraction, true);
      window.removeEventListener("click", blockPageInteraction, true);
      window.removeEventListener("dblclick", blockPageInteraction, true);
      window.removeEventListener("contextmenu", blockPageInteraction, true);
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
    setGuides: (next: Guide[]) => {
      if (!next.some((guide) => guide.id === selectedId)) selectedId = null;
      commitGuides(next);
    },
    clearGuides,
  };
}
