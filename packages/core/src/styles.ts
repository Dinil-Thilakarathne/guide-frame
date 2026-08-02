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

/* A selected guide can be deleted with Backspace/Delete, so it needs to be
 * obvious which one has focus. */
.gf-guide-selected .gf-guide-line {
  background: var(--gf-guide-selected-color, rgb(255 0 84));
  box-shadow: 0 0 0 2px rgba(255, 0, 84, 0.25);
}

.gf-guide-x .gf-guide-handle,
.gf-guide-y .gf-guide-handle {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gf-guide-selected-color, rgb(255 0 84));
  pointer-events: none;
  opacity: 0;
}

.gf-guide-x .gf-guide-handle {
  top: calc(var(--gf-ruler-size, 20px) + 4px);
  left: -3px;
}

.gf-guide-y .gf-guide-handle {
  left: calc(var(--gf-ruler-size, 20px) + 4px);
  top: -3px;
}

.gf-guide-selected .gf-guide-handle {
  opacity: 1;
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

/* ------------------------------------------------------ geometry inspector -- */

.gf-inspector-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.gf-inspector-box {
  position: absolute;
  border: 1px solid rgb(94 173 255);
  background: rgba(49, 143, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.gf-inspector-pinned {
  border-color: var(--gf-color, rgb(255 0 84));
  background: rgba(255, 0, 84, 0.06);
}

.gf-inspector-label,
.gf-inspector-distance {
  position: absolute;
  display: flex;
  z-index: 2;
  padding: 5px 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 5px;
  background: rgba(24, 24, 27, 0.96);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.24);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transform: translateY(-100%);
}

.gf-inspector-label { gap: 7px; }
.gf-inspector-label span + span { color: rgba(255, 255, 255, 0.62); }
.gf-inspector-distance {
  color: rgba(255, 255, 255, 0.82);
  transform: translate(-50%, -50%);
}

.gf-inspector-status {
  position: fixed;
  top: 12px;
  left: 50%;
  z-index: 3;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(24, 24, 27, 0.96);
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.24);
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
  transform: translateX(-50%);
}

/* --------------------------------------------------------- control panel -- */

.gf-panel {
  position: absolute;
  top: 32px;
  right: 24px;
  width: min(268px, calc(100% - 16px));
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(24, 24, 27, 0.96);
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  pointer-events: auto;
  font-size: 12px;
  line-height: 1.25;
}

.gf-panel-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 10px 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.gf-panel-header:active { cursor: grabbing; }
.gf-panel-header strong { font-size: 12px; font-weight: 650; letter-spacing: -0.01em; }

.gf-panel-meta {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.46);
  font-size: 9px;
  text-align: right;
  text-transform: capitalize;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.gf-panel-close,
.gf-panel-row,
.gf-panel-clear {
  appearance: none;
  border: 0;
  color: inherit;
  font: inherit;
}

.gf-panel-close {
  display: grid;
  width: 24px;
  height: 24px;
  padding: 0;
  place-items: center;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.56);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.gf-panel-close:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.gf-panel-body { padding: 6px; }

.gf-panel-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 0 7px 0 8px;
  border-radius: 7px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.gf-panel-row:hover { background: rgba(255, 255, 255, 0.06); }
.gf-panel-row:disabled { cursor: default; opacity: 0.38; }
.gf-panel-row kbd { color: rgba(255, 255, 255, 0.38); font: inherit; font-size: 9px; }

.gf-panel-toggle {
  position: relative;
  width: 26px;
  height: 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  transition: background 140ms ease;
}

.gf-panel-toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.84);
  transition: transform 140ms ease;
}

.gf-panel-row-on .gf-panel-toggle { background: var(--gf-color, rgb(255 0 84)); }
.gf-panel-row-on .gf-panel-toggle::after { transform: translateX(10px); background: #fff; }

.gf-panel-separator {
  height: 1px;
  margin: 5px 8px;
  background: rgba(255, 255, 255, 0.08);
}

.gf-panel-clear {
  width: 100%;
  min-height: 32px;
  margin-top: 5px;
  padding: 0 8px;
  border-radius: 7px;
  background: transparent;
  color: rgba(255, 120, 137, 0.9);
  text-align: left;
  cursor: pointer;
}

.gf-panel-clear:hover:not(:disabled) { background: rgba(255, 80, 104, 0.09); }
.gf-panel-clear:disabled { cursor: default; opacity: 0.35; }

.gf-panel button:focus-visible {
  outline: 2px solid var(--gf-color, rgb(255 0 84));
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .gf-panel-toggle,
  .gf-panel-toggle::after { transition: none; }
}

.gf-hidden { display: none !important; }
`;
