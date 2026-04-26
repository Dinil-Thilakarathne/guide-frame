import type { CSSProperties } from "react";

export type ResponsiveValue<T> = T | { desktop?: T; tablet?: T; mobile?: T };

export type GuideframeBreakpoints = {
  tablet: number;
  desktop: number;
};

export type GuideframeGridProps = {
  columns?: ResponsiveValue<number>;
  gutter?: ResponsiveValue<number>;
  margin?: ResponsiveValue<number>;
  maxWidth?: number | string;
  breakpoints?: Partial<GuideframeBreakpoints>;
  activeBreakpoint?: "desktop" | "tablet" | "mobile";
  color?: string;
  opacity?: number;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  shortcut?: boolean;
  storageKey?: string;
  zIndex?: number;
  position?: "fixed" | "absolute";
  className?: string;
  style?: CSSProperties;
  forceVisibleInProduction?: boolean;
};
