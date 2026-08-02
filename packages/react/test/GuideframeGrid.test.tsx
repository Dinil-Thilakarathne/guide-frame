import { StrictMode } from "react";
import { act, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuideframeGrid } from "../src";

const ROOT = "[data-guideframe-root]";

function root() {
  return document.querySelector(ROOT) as HTMLElement | null;
}

function shadow() {
  return root()?.shadowRoot ?? null;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number,
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: 1440,
  });
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: "MacIntel",
  });
});

afterEach(() => {
  document.querySelectorAll(ROOT).forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = "";
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("GuideframeGrid", () => {
  it("renders nothing on the server, so it can never cause a hydration mismatch", () => {
    expect(renderToString(<GuideframeGrid />)).toBe("");
  });

  it("renders nothing into the React tree", () => {
    const { container } = render(<GuideframeGrid />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts the overlay onto the body after hydration", () => {
    render(<GuideframeGrid />);
    expect(root()).not.toBeNull();
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(12);
  });

  it("unmounts cleanly", () => {
    const { unmount } = render(<GuideframeGrid />);
    unmount();
    expect(root()).toBeNull();
  });

  it("leaves exactly one overlay under StrictMode double-mounting", () => {
    render(
      <StrictMode>
        <GuideframeGrid />
      </StrictMode>,
    );
    expect(document.querySelectorAll(ROOT)).toHaveLength(1);
  });

  it("applies the active breakpoint override", () => {
    render(<GuideframeGrid activeBreakpoint="mobile" />);
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(4);
  });

  it("applies responsive props", () => {
    render(<GuideframeGrid columns={{ desktop: 10 }} gutter={32} margin={40} maxWidth={1280} />);
    const grid = shadow()?.querySelector(".gf-grid") as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe("repeat(10, minmax(0, 1fr))");
    expect(grid.style.columnGap).toBe("32px");
  });

  it("pushes prop updates through to the overlay", async () => {
    const { rerender } = render(<GuideframeGrid activeBreakpoint="desktop" />);
    rerender(<GuideframeGrid activeBreakpoint="mobile" />);
    await act(tick);
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(4);
  });

  it("renders rulers and guides when asked", () => {
    render(<GuideframeGrid rulers defaultGuides={[{ id: "a", axis: "x", position: 240 }]} />);
    expect(shadow()?.querySelector(".gf-ruler-x")?.classList.contains("gf-hidden")).toBe(false);
    expect(shadow()?.querySelectorAll(".gf-guide")).toHaveLength(1);
  });

  it("renders nothing in production by default", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    render(<GuideframeGrid />);
    expect(root()).toBeNull();
    process.env.NODE_ENV = original;
  });

  it("persists visibility across mounts", () => {
    localStorage.setItem("guideframe:visible", "false");
    render(<GuideframeGrid />);
    expect(shadow()?.querySelector(".gf-root")?.classList.contains("gf-hidden")).toBe(true);
  });

  it("toggles with mod+g", async () => {
    render(<GuideframeGrid />);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "g", metaKey: true }));
      await tick();
    });
    expect(shadow()?.querySelector(".gf-root")?.classList.contains("gf-hidden")).toBe(true);
  });
});
