# @guideframe/core

Framework-agnostic layout grid, rulers and guides overlay for the browser. Zero
dependencies, no framework required — works with Svelte, Vue, Astro, plain
JavaScript, or anything else that can run a function on mount.

React users should install [`@guideframe/react`](../react) instead, which wraps
this package.

## Install

```bash
npm install @guideframe/core
```

## Usage

```ts
import { createGuideframe } from "@guideframe/core";

const guideframe = createGuideframe({
  columns: { desktop: 12, tablet: 8, mobile: 4 },
  rulers: true,
  snap: { elements: true, columns: true, guides: true, threshold: 6 },
});

// later
guideframe.destroy();
```

`createGuideframe` mounts its own DOM inside a shadow root on `<body>`, so it
cannot be affected by (or affect) your application's CSS. It returns a no-op
instance when there is no DOM (SSR) or when `NODE_ENV === "production"`, unless
`forceVisibleInProduction` is set.

### Svelte

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { createGuideframe } from "@guideframe/core";

  onMount(() => {
    const guideframe = createGuideframe({ rulers: true });
    return () => guideframe.destroy();
  });
</script>
```

### Vue

```ts
import { onMounted, onUnmounted } from "vue";
import { createGuideframe, type GuideframeInstance } from "@guideframe/core";

let guideframe: GuideframeInstance | undefined;
onMounted(() => {
  guideframe = createGuideframe({ rulers: true });
});
onUnmounted(() => guideframe?.destroy());
```

## Rulers and guides

With `rulers: true`, a ruler is drawn along the top and left edges. The
interaction model matches Figma:

| Action | Result |
| --- | --- |
| Drag off a ruler | Creates a guide and starts dragging it |
| Click a guide | Selects it |
| Drag a guide | Moves it |
| <kbd>Backspace</kbd> / <kbd>Delete</kbd> | Deletes the selected guide |
| Drop a guide on a ruler | Deletes it |
| Hold <kbd>Alt</kbd> while dragging | Ignores snapping |
| <kbd>Esc</kbd> while dragging | Cancels the drag, restoring the guide's position |
| <kbd>Esc</kbd> with a guide selected | Deselects it |
| Click the ruler corner | Clears every guide on the route |

A selected guide is highlighted and shows a small handle. Selection is cleared by
pressing <kbd>Esc</kbd> or clicking anywhere off the guide. Locked guides can be
selected but not moved or deleted.

<kbd>Backspace</kbd>/<kbd>Delete</kbd> and <kbd>Esc</kbd> keep working even with
`shortcut: false`, because they only act on a guide you have directly selected.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>G</kbd> | Toggle the overlay |
| <kbd>Shift</kbd> + <kbd>R</kbd> | Toggle the rulers |
| <kbd>Shift</kbd> + <kbd>L</kbd> | Lock/unlock every guide |

All shortcuts are disabled with `shortcut: false`, and are ignored while typing
in an input, textarea, contenteditable, or while an IME is composing.

The grid and the rulers are independent layers. <kbd>Shift</kbd>+<kbd>R</kbd>
brings the rulers up even when the grid is hidden, and toggling the overlay off
takes both with it.

### Snapping

While dragging, guides snap to the nearest of:

1. box edges and centre of the DOM element under the pointer,
2. column and gutter boundaries of the rendered grid,
3. other guides.

Element edges win ties, and the readout names what was snapped to (for example
`section.feature left`). This is the part Figma cannot do — the guides snap to
your real rendered DOM, not to design-file objects.

### Persistence

Guides are stored in `localStorage`, namespaced by `location.pathname`, so the
guides you draw on `/pricing` don't appear on `/blog`. Pass `guides` +
`onGuidesChange` to control them yourself instead, in which case nothing is
persisted.

## Scoping to a container

```ts
createGuideframe({ container: document.querySelector("#preview"), rulers: true });
```

A scoped overlay implies `position: "absolute"` and stores guide positions
relative to the container, so guides stay pinned to the component even when it
moves elsewhere on the page. A page-level (`fixed`) overlay stores guides in
document coordinates instead, so they stay pinned to the page while scrolling.

The container must be positioned (`relative`, `absolute` or `sticky`).

## Options

| Option | Default | Notes |
| --- | --- | --- |
| `columns` | `{ desktop: 12, tablet: 8, mobile: 4 }` | Number or per-breakpoint |
| `gutter` | `{ desktop: 24, tablet: 24, mobile: 16 }` | Number or per-breakpoint |
| `margin` | `{ desktop: 24, tablet: 24, mobile: 16 }` | Number or per-breakpoint |
| `maxWidth` | `1280` | Number of px, a percentage, or `"none"` |
| `breakpoints` | `{ tablet: 768, desktop: 1024 }` | Matched against `documentElement.clientWidth` |
| `activeBreakpoint` | — | Force a breakpoint, ignoring width |
| `color` | `rgb(255 0 84)` | Column colour |
| `opacity` | `0.12` | Column opacity |
| `rulers` | `false` | `true` or `{ size, step }` |
| `guides` / `defaultGuides` | `[]` | Controlled / initial guides |
| `snap` | enabled | `false` or `{ elements, columns, guides, threshold }` |
| `visible` / `defaultVisible` | `true` | Controlled / initial visibility |
| `container` | — | Scope the overlay to an element |
| `position` | `"fixed"` | `"fixed"` or `"absolute"` |
| `zIndex` | `2147483647` | |
| `storageKey` | `guideframe:visible` | |
| `guidesStorageKey` | `guideframe:guides` | Namespaced by pathname |
| `shortcut` | `true` | |
| `forceVisibleInProduction` | `false` | |

## Instance API

```ts
type GuideframeInstance = {
  update(options: GuideframeOptions): void;
  destroy(): void;
  setVisible(visible: boolean): void;
  isVisible(): boolean;
  getGuides(): Guide[];
  setGuides(guides: Guide[]): void;
  clearGuides(): void;
};
```
