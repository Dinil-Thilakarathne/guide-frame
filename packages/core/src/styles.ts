/**
 * Rendered inside a shadow root, so these selectors cannot collide with host
 * application CSS and host resets cannot reach in and break the overlay.
 */
export const OVERLAY_STYLES = `
:host {
  all: initial;
}

* {
  box-sizing: border-box;
}

.gf-root {
  position: var(--gf-position, fixed);
  inset: 0;
  z-index: var(--gf-z-index, 2147483647);
  pointer-events: none;
  overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 10px;
  line-height: 1;
  color-scheme: light dark;
}

/* The overlay is a development aid; never let it reach paper or PDFs. */
@media print {
  .gf-root { display: none !important; }
}

.gf-grid-layer {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.gf-grid {
  width: 100%;
  height: 100%;
  display: grid;
  contain: layout paint;
  box-sizing: border-box;
}

.gf-column {
  background: var(--gf-color, rgb(255 0 84));
  clip-path: inset(0 0 0 0);
  animation: gf-reveal 620ms ease-in-out both;
  animation-delay: var(--gf-delay, 0ms);
}

@keyframes gf-reveal {
  from { clip-path: inset(0 0 100% 0); }
  to { clip-path: inset(0 0 0 0); }
}

@media (prefers-reduced-motion: reduce) {
  .gf-column { animation: none; }
}

/* ---------------------------------------------------------------- rulers -- */

.gf-ruler {
  position: absolute;
  background: rgba(24, 24, 27, 0.92);
  color: rgba(255, 255, 255, 0.75);
  pointer-events: auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
}

.gf-ruler-x {
  top: 0;
  left: 0;
  right: 0;
  height: var(--gf-ruler-size, 20px);
  cursor: ns-resize;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.gf-ruler-y {
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--gf-ruler-size, 20px);
  cursor: ew-resize;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
}

.gf-ruler-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--gf-ruler-size, 20px);
  height: var(--gf-ruler-size, 20px);
  background: rgba(24, 24, 27, 0.98);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  pointer-events: auto;
  cursor: pointer;
}

.gf-tick {
  position: absolute;
  background: rgba(255, 255, 255, 0.35);
}

.gf-ruler-x .gf-tick { bottom: 0; width: 1px; }
.gf-ruler-y .gf-tick { right: 0; height: 1px; }

.gf-tick-column {
  background: var(--gf-color, rgb(255 0 84));
  opacity: 0.9;
}

.gf-tick-label {
  position: absolute;
  font-size: 9px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  opacity: 0.75;
}

.gf-ruler-x .gf-tick-label { top: 3px; transform: translateX(3px); }
.gf-ruler-y .gf-tick-label {
  left: 3px;
  transform-origin: 0 0;
  transform: rotate(90deg) translateX(3px);
}

/* ---------------------------------------------------------------- guides -- */

.gf-guide {
  position: absolute;
  pointer-events: none;
}

.gf-guide-line {
  position: absolute;
  background: var(--gf-guide-color, rgb(0 138 255));
  pointer-events: none;
}

/*
 * A 1px line is impossible to grab, so each guide gets a wider transparent
 * hit strip. It is the only part of the guide that takes pointer events.
 */
.gf-guide-hit {
  position: absolute;
  pointer-events: auto;
  touch-action: none;
  background: transparent;
}

.gf-guide-x {
  top: 0;
  bottom: 0;
  width: 0;
}

.gf-guide-x .gf-guide-line {
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
}

.gf-guide-x .gf-guide-hit {
  top: 0;
  bottom: 0;
  left: -5px;
  width: 11px;
  cursor: ew-resize;
}

.gf-guide-y {
  left: 0;
  right: 0;
  height: 0;
}

.gf-guide-y .gf-guide-line {
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
}

.gf-guide-y .gf-guide-hit {
  left: 0;
  right: 0;
  top: -5px;
  height: 11px;
  cursor: ns-resize;
}

.gf-guide-locked .gf-guide-hit {
  pointer-events: none;
  cursor: default;
}

.gf-guide-locked .gf-guide-line {
  opacity: 0.55;
}

.gf-guide-dragging .gf-guide-line {
  box-shadow: 0 0 0 1px rgba(0, 138, 255, 0.35);
}

/* --------------------------------------------------------------- readout -- */

.gf-readout {
  position: absolute;
  padding: 4px 7px;
  border-radius: 4px;
  background: rgba(24, 24, 27, 0.95);
  color: #fff;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(8px, 8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.gf-readout-hint {
  opacity: 0.6;
  margin-left: 6px;
}

.gf-hidden { display: none !important; }
`;
