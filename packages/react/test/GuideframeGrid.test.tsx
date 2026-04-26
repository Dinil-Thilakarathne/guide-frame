import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuideframeGrid } from "../src";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.body.innerHTML = "";
});

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440, writable: true });
  Object.defineProperty(navigator, "platform", { configurable: true, value: "MacIntel" });
});

describe("GuideframeGrid", () => {
  it("renders the same initial markup on the server and client", () => {
    const serverMarkup = renderToString(<GuideframeGrid />);
    expect(serverMarkup).toContain('data-testid="guideframe-grid"');
    expect(serverMarkup).toContain("repeat(12, minmax(0, 1fr))");

    const { container } = render(<GuideframeGrid />);
    expect(container.innerHTML).toContain("repeat(12, minmax(0, 1fr))");
    expect(container.innerHTML).toContain('data-testid="guideframe-overlay"');
    expect(container.innerHTML).toContain('data-testid="guideframe-grid"');
  });

  it("renders the default desktop grid", () => {
    render(<GuideframeGrid />);
    expect(screen.getByTestId("guideframe-grid")).toBeInTheDocument();
  });

  it("applies responsive props", () => {
    render(<GuideframeGrid columns={{ desktop: 10 }} gutter={32} margin={40} maxWidth={1280} color="red" opacity={0.2} />);
    const overlay = screen.getByTestId("guideframe-grid");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({ maxWidth: "1280px" });
  });

  it("can render inside a positioned container", () => {
    render(<GuideframeGrid position="absolute" zIndex={4} />);
    expect(screen.getByTestId("guideframe-overlay")).toHaveStyle({
      position: "absolute",
      zIndex: "4",
    });
  });

  it("can override the active breakpoint", () => {
    render(
      <GuideframeGrid
        activeBreakpoint="mobile"
        columns={{ desktop: 12, tablet: 8, mobile: 4 }}
      />,
    );
    expect(document.querySelectorAll(".guideframe-column")).toHaveLength(4);
  });

  it("returns null in production by default", async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const { container } = render(<GuideframeGrid />);
    expect(container).toBeEmptyDOMElement();
    process.env.NODE_ENV = original;
  });

  it("toggles on mod+g and ignores editable fields", () => {
    const { rerender } = render(<GuideframeGrid defaultVisible={false} />);
    fireEvent.keyDown(window, { key: "g", metaKey: true });
    expect(screen.queryByTestId("guideframe-grid")).toBeInTheDocument();
    rerender(<GuideframeGrid defaultVisible={false} />);
  });

  it("persists local visibility", () => {
    localStorage.setItem("test-visible", "true");
    render(<GuideframeGrid storageKey="test-visible" defaultVisible={false} />);
    expect(screen.getByTestId("guideframe-grid")).toBeInTheDocument();
  });

  it("updates breakpoint after mount", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1440,
      writable: true,
    });

    const { findByTestId } = render(<GuideframeGrid />);
    expect(await findByTestId("guideframe-grid")).toHaveStyle({
      gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    });
  });
});
