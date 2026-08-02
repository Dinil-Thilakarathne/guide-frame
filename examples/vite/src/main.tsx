import React from "react";
import ReactDOM, { type Root } from "react-dom/client";
import { GuideframeGrid } from "@guideframe/react";
import "./styles.css";

function App() {
  return (
    <main className="demo-page">
      <GuideframeGrid
        rulers
        columns={{ desktop: 12, tablet: 8, mobile: 4 }}
        gutter={{ desktop: 24, tablet: 20, mobile: 16 }}
        margin={{ desktop: 32, tablet: 24, mobile: 16 }}
        maxWidth={1280}
        color="rgb(236 72 153)"
        opacity={0.14}
        snap={{ elements: true, columns: true, guides: true, threshold: 6 }}
        storageKey="guideframe:demo-visible"
      />

      <header className="hero">
        <p className="eyebrow">GuideFrame local test</p>
        <h1>A full-screen surface for testing rulers and guides.</h1>
        <p className="intro">
          Drag from either ruler, Option-drag a guide to duplicate it, Shift-drag across the page to
          select several, use the arrow keys to nudge them, and press Shift+Z to undo.
        </p>
      </header>

      <section className="cards" aria-label="Snap targets">
        <article className="card card-wide">
          <span>01</span>
          <h2>Primary content</h2>
          <p>Snap guides to this card’s rendered edges.</p>
        </article>
        <article className="card">
          <span>02</span>
          <h2>Supporting panel</h2>
          <p>Duplicate and align guides across the page.</p>
        </article>
        <article className="card">
          <span>03</span>
          <h2>Batch selection</h2>
          <p>Select several guides and remove them together.</p>
        </article>
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
