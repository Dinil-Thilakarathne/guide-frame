import React, { useMemo, useRef, useState } from "react";
import ReactDOM, { type Root } from "react-dom/client";
import { GuideframeGrid } from "@guideframe/react";
import type { GuideframeGridProps } from "@guideframe/react";
import "./styles.css";

type Viewport = "desktop" | "tablet" | "mobile";

type Preset = {
  label: string;
  columns: GuideframeGridProps["columns"];
  gutter: GuideframeGridProps["gutter"];
  margin: GuideframeGridProps["margin"];
  maxWidth: number;
};

const presets: Record<string, Preset> = {
  product: {
    label: "Product",
    columns: { desktop: 12, tablet: 8, mobile: 4 },
    gutter: { desktop: 24, tablet: 20, mobile: 16 },
    margin: { desktop: 32, tablet: 24, mobile: 16 },
    maxWidth: 1280,
  },
  editorial: {
    label: "Editorial",
    columns: { desktop: 6, tablet: 6, mobile: 4 },
    gutter: { desktop: 32, tablet: 24, mobile: 16 },
    margin: { desktop: 48, tablet: 28, mobile: 18 },
    maxWidth: 1120,
  },
  app: {
    label: "App",
    columns: { desktop: 16, tablet: 12, mobile: 4 },
    gutter: { desktop: 16, tablet: 16, mobile: 12 },
    margin: { desktop: 24, tablet: 20, mobile: 14 },
    maxWidth: 1440,
  },
};

const colorOptions = [
  "rgb(236 72 153)",
  "rgb(20 184 166)",
  "rgb(59 130 246)",
  "rgb(245 158 11)",
];

function getPresetValue<T>(
  value: GuideframeGridProps["columns"] | GuideframeGridProps["gutter"] | GuideframeGridProps["margin"],
  viewport: Viewport,
) {
  if (typeof value === "number") return value as T;
  return value?.[viewport] as T;
}

function App() {
  const [presetKey, setPresetKey] = useState("product");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.16);
  const [color, setColor] = useState(colorOptions[0]);
  const [rulers, setRulers] = useState(true);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameReady, setFrameReady] = useState(false);

  const preset = presets[presetKey];
  const viewportLabel = viewport[0].toUpperCase() + viewport.slice(1);

  const viewportClass = useMemo(() => `preview-frame is-${viewport}`, [viewport]);
  const columnCount = getPresetValue<number>(preset.columns, viewport);
  const gutterSize = getPresetValue<number>(preset.gutter, viewport);
  const marginSize = getPresetValue<number>(preset.margin, viewport);

  return (
    <main className="playground">
      <aside className="controls" aria-label="Grid controls">
        <div className="brand">
          <div className="mark" aria-hidden="true">
            GF
          </div>
          <div>
            <p className="eyebrow">GuideFrame</p>
            <h1>Layout grid playground</h1>
          </div>
        </div>

        <section className="control-group">
          <div className="group-header">
            <h2>Preset</h2>
            <span>{preset.label}</span>
          </div>
          <div className="segmented" role="tablist" aria-label="Grid preset">
            {Object.entries(presets).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={presetKey === key ? "is-active" : ""}
                onClick={() => setPresetKey(key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="control-group">
          <div className="group-header">
            <h2>Viewport</h2>
            <span>{viewportLabel}</span>
          </div>
          <div className="segmented" role="tablist" aria-label="Preview viewport">
            {(["desktop", "tablet", "mobile"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={viewport === item ? "is-active" : ""}
                onClick={() => setViewport(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="control-group">
          <div className="group-header">
            <h2>Overlay</h2>
            <label className="switch">
              <input
                type="checkbox"
                checked={visible}
                onChange={(event) => setVisible(event.currentTarget.checked)}
              />
              <span />
            </label>
          </div>

          <label className="range-row">
            <span>Opacity</span>
            <strong>{Math.round(opacity * 100)}%</strong>
            <input
              type="range"
              min="6"
              max="36"
              value={Math.round(opacity * 100)}
              onChange={(event) => setOpacity(Number(event.currentTarget.value) / 100)}
            />
          </label>

          <div className="group-header">
            <h2>Rulers &amp; guides</h2>
            <label className="switch">
              <input
                type="checkbox"
                checked={rulers}
                onChange={(event) => setRulers(event.currentTarget.checked)}
              />
              <span />
            </label>
          </div>
          <p className="hint">
            Drag off a ruler to place a guide. Alt disables snapping, drag back onto
            the ruler to delete, Shift+L locks.
          </p>

          <div className="swatches" aria-label="Grid color">
            {colorOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={color === option ? "is-active" : ""}
                style={{ backgroundColor: option }}
                aria-label={`Use ${option}`}
                onClick={() => setColor(option)}
              />
            ))}
          </div>
        </section>

        <dl className="metrics">
          <div>
            <dt>Columns</dt>
            <dd>{columnCount}</dd>
          </div>
          <div>
            <dt>Gutter</dt>
            <dd>{gutterSize}px</dd>
          </div>
          <div>
            <dt>Margin</dt>
            <dd>{marginSize}px</dd>
          </div>
          <div>
            <dt>Width</dt>
            <dd>{preset.maxWidth}px</dd>
          </div>
        </dl>
      </aside>

      <section className="stage" aria-label="Live preview">
        <div className="stage-toolbar">
          <div>
            <p className="eyebrow">Live preview</p>
            <h2>{preset.label} layout</h2>
          </div>
          <span className="viewport-pill">{viewportLabel}</span>
        </div>

        <div
          className={viewportClass}
          ref={(node) => {
            frameRef.current = node;
            if (node) setFrameReady(true);
          }}
        >
          {frameReady ? (
          <GuideframeGrid
            columns={preset.columns}
            gutter={preset.gutter}
            margin={preset.margin}
            maxWidth={preset.maxWidth}
            activeBreakpoint={viewport}
            color={color}
            opacity={opacity}
            visible={visible}
            container={frameRef.current}
            rulers={rulers}
            snap={{ elements: true, columns: true, guides: true, threshold: 6 }}
            shortcut={false}
            storageKey="guideframe:playground-visible"
            zIndex={4}
          />
          ) : null}

          <article className="mock-page">
            <header className="mock-hero">
              <p className="eyebrow">Design systems</p>
              <h3>Review spacing against the same grid your design file uses.</h3>
              <p>
                The overlay stays aligned while the layout shifts across viewport
                presets, gutters, and margins.
              </p>
            </header>

            <div className="mock-grid">
              <section className="feature wide">
                <span className="feature-kicker">01</span>
                <h4>Primary content</h4>
                <p>Use the columns as a visible reference while tuning layout rhythm.</p>
              </section>
              <section className="feature">
                <span className="feature-kicker">02</span>
                <h4>Sidebar</h4>
                <p>Check supporting panels against practical breakpoints.</p>
              </section>
              <section className="feature">
                <span className="feature-kicker">03</span>
                <h4>Density</h4>
                <p>Balance content width, whitespace, and scan speed.</p>
              </section>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const rootHost = rootElement as HTMLElement & { guideframeRoot?: Root };
rootHost.guideframeRoot ??= ReactDOM.createRoot(rootHost);

rootHost.guideframeRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
