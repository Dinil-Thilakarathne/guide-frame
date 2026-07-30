import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGuideframe } from "../src";
import { ROOT_ATTRIBUTE } from "../src/env";

function root() {
  return document.querySelector(`[${ROOT_ATTRIBUTE}]`) as HTMLElement | null;
}

function shadow() {
  return root()?.shadowRoot ?? null;
}

function flush() {
  // The overlay batches work into an animation frame.
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    setTimeout(() => cb(0), 0) as unknown as number,
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: 1440,
  });
});

afterEach(() => {
  document.querySelectorAll(`[${ROOT_ATTRIBUTE}]`).forEach((node) => node.remove());
  document.body.innerHTML = "";
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createGuideframe", () => {
  it("mounts an isolated shadow root on the body", () => {
    const instance = createGuideframe();
    expect(root()).not.toBeNull();
    expect(shadow()).not.toBeNull();
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(12);
    instance.destroy();
  });

  it("removes everything on destroy", () => {
    const instance = createGuideframe();
    instance.destroy();
    expect(root()).toBeNull();
  });

  it("is safe to destroy twice", () => {
    const instance = createGuideframe();
    instance.destroy();
    expect(() => instance.destroy()).not.toThrow();
  });

  it("cleans up a root left behind by a hot reload", () => {
    const stale = document.createElement("div");
    stale.setAttribute(ROOT_ATTRIBUTE, "");
    document.body.append(stale);

    const instance = createGuideframe();
    expect(document.querySelectorAll(`[${ROOT_ATTRIBUTE}]`)).toHaveLength(1);
    instance.destroy();
  });

  it("does not remove a root belonging to a live instance", () => {
    const first = createGuideframe();
    const second = createGuideframe();
    expect(document.querySelectorAll(`[${ROOT_ATTRIBUTE}]`)).toHaveLength(2);
    first.destroy();
    second.destroy();
  });

  it("renders the responsive column count for the active breakpoint", () => {
    const instance = createGuideframe({ activeBreakpoint: "mobile" });
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(4);
    instance.destroy();
  });

  it("uses documentElement.clientWidth so it agrees with CSS media queries", () => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 800,
    });
    const instance = createGuideframe();
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(8);
    instance.destroy();
  });

  it("restores persisted visibility", () => {
    localStorage.setItem("guideframe:visible", "false");
    const instance = createGuideframe();
    expect(instance.isVisible()).toBe(false);
    instance.destroy();
  });

  it("ignores persisted visibility when controlled", () => {
    localStorage.setItem("guideframe:visible", "false");
    const instance = createGuideframe({ visible: true });
    expect(instance.isVisible()).toBe(true);
    instance.destroy();
  });

  it("does not write storage in controlled mode", () => {
    const instance = createGuideframe({ visible: true });
    instance.setVisible(false);
    expect(localStorage.getItem("guideframe:visible")).toBeNull();
    expect(instance.isVisible()).toBe(true);
    instance.destroy();
  });

  it("still reports visibility changes to the host in controlled mode", () => {
    const onVisibleChange = vi.fn();
    const instance = createGuideframe({ visible: true, onVisibleChange });
    instance.setVisible(false);
    expect(onVisibleChange).toHaveBeenCalledWith(false);
    instance.destroy();
  });

  it("toggles with mod+g and ignores editable targets", async () => {
    Object.defineProperty(navigator, "platform", {
      configurable: true,
      value: "MacIntel",
    });
    const instance = createGuideframe();
    expect(instance.isVisible()).toBe(true);

    const input = document.createElement("input");
    document.body.append(input);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", metaKey: true, bubbles: true }),
    );
    expect(instance.isVisible()).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g", metaKey: true }));
    expect(instance.isVisible()).toBe(false);
    await flush();
    instance.destroy();
  });

  it("ignores keystrokes while an IME is composing", () => {
    const instance = createGuideframe();
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", metaKey: true, isComposing: true }),
    );
    expect(instance.isVisible()).toBe(true);
    instance.destroy();
  });

  it("honours shortcut: false", () => {
    const instance = createGuideframe({ shortcut: false });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g", ctrlKey: true }));
    expect(instance.isVisible()).toBe(true);
    instance.destroy();
  });

  it("stops responding to shortcuts after destroy", () => {
    const onVisibleChange = vi.fn();
    const instance = createGuideframe({ onVisibleChange });
    instance.destroy();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g", ctrlKey: true }));
    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it("renders rulers only when enabled", async () => {
    const off = createGuideframe();
    expect(shadow()?.querySelector(".gf-ruler-x")?.classList.contains("gf-hidden")).toBe(true);
    off.destroy();

    const on = createGuideframe({ rulers: true });
    await flush();
    expect(shadow()?.querySelector(".gf-ruler-x")?.classList.contains("gf-hidden")).toBe(false);
    expect(shadow()?.querySelectorAll(".gf-tick").length).toBeGreaterThan(0);
    on.destroy();
  });

  it("renders guides passed in as defaults", () => {
    const instance = createGuideframe({
      defaultGuides: [
        { id: "a", axis: "x", position: 200 },
        { id: "b", axis: "y", position: 80 },
      ],
    });
    expect(shadow()?.querySelectorAll(".gf-guide")).toHaveLength(2);
    expect((shadow()?.querySelector(".gf-guide-x") as HTMLElement).style.left).toBe("200px");
    instance.destroy();
  });

  it("marks locked guides so they cannot be grabbed", () => {
    const instance = createGuideframe({
      defaultGuides: [{ id: "a", axis: "x", position: 200, locked: true }],
    });
    expect(shadow()?.querySelector(".gf-guide")?.classList.contains("gf-guide-locked")).toBe(
      true,
    );
    instance.destroy();
  });

  it("persists guides per route and reloads them", () => {
    const first = createGuideframe();
    first.setGuides([{ id: "a", axis: "x", position: 333 }]);
    first.destroy();

    const second = createGuideframe();
    expect(second.getGuides()).toHaveLength(1);
    expect(second.getGuides()[0].position).toBe(333);
    second.destroy();
  });

  it("clears guides", () => {
    const instance = createGuideframe({
      defaultGuides: [{ id: "a", axis: "x", position: 10 }],
    });
    instance.clearGuides();
    expect(instance.getGuides()).toEqual([]);
    expect(shadow()?.querySelectorAll(".gf-guide")).toHaveLength(0);
    instance.destroy();
  });

  it("reports guide changes to the host", () => {
    const onGuidesChange = vi.fn();
    const instance = createGuideframe({ onGuidesChange });
    instance.setGuides([{ id: "a", axis: "x", position: 12 }]);
    expect(onGuidesChange).toHaveBeenCalledWith([{ id: "a", axis: "x", position: 12 }]);
    instance.destroy();
  });

  it("does not persist guides in controlled mode", () => {
    const instance = createGuideframe({ guides: [] });
    instance.setGuides([{ id: "a", axis: "x", position: 5 }]);
    expect(
      localStorage.getItem(`guideframe:guides::${window.location.pathname}`),
    ).toBeNull();
    instance.destroy();
  });

  it("offsets guides by the scroll position in fixed mode", async () => {
    const instance = createGuideframe({
      defaultGuides: [{ id: "a", axis: "y", position: 500 }],
    });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
    window.dispatchEvent(new Event("scroll"));
    await flush();
    expect((shadow()?.querySelector(".gf-guide-y") as HTMLElement).style.top).toBe("300px");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    instance.destroy();
  });

  it("keeps absolute-mode guides overlay-relative so scrolling does not move them", async () => {
    const instance = createGuideframe({
      position: "absolute",
      defaultGuides: [{ id: "a", axis: "y", position: 500 }],
    });

    Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
    window.dispatchEvent(new Event("scroll"));
    await flush();
    expect((shadow()?.querySelector(".gf-guide-y") as HTMLElement).style.top).toBe("500px");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    instance.destroy();
  });

  it("toggles rulers with shift+r", async () => {
    const instance = createGuideframe({ rulers: true });
    await flush();
    expect(shadow()?.querySelector(".gf-ruler-x")?.classList.contains("gf-hidden")).toBe(false);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "R", shiftKey: true }));
    await flush();
    expect(shadow()?.querySelector(".gf-ruler-x")?.classList.contains("gf-hidden")).toBe(true);
    instance.destroy();
  });

  it("locks and unlocks every guide with shift+l", () => {
    const instance = createGuideframe({
      defaultGuides: [
        { id: "a", axis: "x", position: 10 },
        { id: "b", axis: "y", position: 20 },
      ],
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "L", shiftKey: true }));
    expect(instance.getGuides().every((guide) => guide.locked)).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "L", shiftKey: true }));
    expect(instance.getGuides().every((guide) => !guide.locked)).toBe(true);
    instance.destroy();
  });

  it("scopes the overlay to a container element", () => {
    const container = document.createElement("div");
    container.style.position = "relative";
    document.body.append(container);

    const instance = createGuideframe({ container, rulers: true });
    expect(container.querySelector(`[${ROOT_ATTRIBUTE}]`)).not.toBeNull();
    expect(
      (shadow()?.querySelector(".gf-root") as HTMLElement).style.getPropertyValue(
        "--gf-position",
      ),
    ).toBe("absolute");
    instance.destroy();
    expect(container.querySelector(`[${ROOT_ATTRIBUTE}]`)).toBeNull();
  });

  it("returns an inert instance in production", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const instance = createGuideframe();
    expect(root()).toBeNull();
    expect(instance.isVisible()).toBe(false);
    expect(() => instance.destroy()).not.toThrow();
    process.env.NODE_ENV = original;
  });

  it("can be forced on in production", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const instance = createGuideframe({ forceVisibleInProduction: true });
    expect(root()).not.toBeNull();
    instance.destroy();
    process.env.NODE_ENV = original;
  });

  it("survives update() with new options", async () => {
    const instance = createGuideframe({ activeBreakpoint: "desktop" });
    instance.update({ activeBreakpoint: "mobile" });
    await flush();
    expect(shadow()?.querySelectorAll(".gf-column")).toHaveLength(4);
    instance.destroy();
  });

  it("ignores update() after destroy", () => {
    const instance = createGuideframe();
    instance.destroy();
    expect(() => instance.update({ activeBreakpoint: "mobile" })).not.toThrow();
  });

  it("does not rebuild columns when only the colour changes", async () => {
    const instance = createGuideframe();
    const firstColumn = shadow()?.querySelector(".gf-column");
    instance.update({ color: "blue" });
    await flush();
    expect(shadow()?.querySelector(".gf-column")).toBe(firstColumn);
    instance.destroy();
  });
});
