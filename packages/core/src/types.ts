export type Breakpoint = "desktop" | "tablet" | "mobile";

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

export type GuideframeBreakpoints = {
  tablet: number;
  desktop: number;
};

export type GuideAxis = "x" | "y";

export type Guide = {
  /** Stable id. Generated when the guide is created by dragging from a ruler. */
  id: string;
  axis: GuideAxis;
  /**
   * Position in *document* coordinates (CSS pixels), so guides stay pinned to
   * the page as it scrolls rather than drifting with the viewport.
   */
  position: number;
  /** Locked guides render but cannot be dragged or deleted. */
  locked?: boolean;
};

export type SnapOptions = {
  /** Snap to the box edges of the DOM element under the pointer. */
  elements?: boolean;
  /** Snap to column/gutter boundaries of the rendered grid. */
  columns?: boolean;
  /** Snap to other guides. */
  guides?: boolean;
  /** Snap radius in CSS pixels. */
  threshold?: number;
};

export type RulerOptions = {
  /** Thickness of each ruler strip in CSS pixels. */
  size?: number;
  /** Spacing between labelled ticks in CSS pixels. */
  step?: number;
};

export type SnapSourceKind = "element" | "column" | "guide" | "none";

export type SnapResult = {
  position: number;
  kind: SnapSourceKind;
  label: string;
};

export type GuideframeOptions = {
  columns?: ResponsiveValue<number>;
  gutter?: ResponsiveValue<number>;
  margin?: ResponsiveValue<number>;
  maxWidth?: number | string;
  breakpoints?: Partial<GuideframeBreakpoints>;
  activeBreakpoint?: Breakpoint;
  color?: string;
  opacity?: number;

  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;

  /** Enable the top/left rulers. Pass an object to tune size and tick step. */
  rulers?: boolean | RulerOptions;
  /** Controlled guides. When provided, the overlay never mutates them itself. */
  guides?: Guide[];
  defaultGuides?: Guide[];
  onGuidesChange?: (guides: Guide[]) => void;
  /** Set false to disable snapping entirely, or pass an object to tune it. */
  snap?: boolean | SnapOptions;

  /** Enable the compact floating control panel. Open it with Mod+Shift+G. */
  panel?: boolean;

  shortcut?: boolean;
  storageKey?: string;
  /**
   * Storage key for guides. Guides are additionally namespaced by
   * `location.pathname` so a route's guides don't leak onto other routes.
   */
  guidesStorageKey?: string;
  zIndex?: number;
  position?: "fixed" | "absolute";
  /**
   * Scope the overlay to an element instead of the whole page. The container
   * must be positioned (`relative`/`absolute`/`sticky`) for this to line up.
   * Implies `position: "absolute"`.
   */
  container?: Element | null;
  className?: string;
  forceVisibleInProduction?: boolean;
};

export type GuideframeInstance = {
  update: (next: GuideframeOptions) => void;
  destroy: () => void;
  setVisible: (visible: boolean) => void;
  isVisible: () => boolean;
  getGuides: () => Guide[];
  setGuides: (guides: Guide[]) => void;
  clearGuides: () => void;
};
