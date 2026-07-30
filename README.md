# GuideFrame

GuideFrame brings Figma-style layout grids, rulers and draggable guides into the
browser, so you can check alignment against the real rendered DOM instead of
eyeballing it against a static mock.

## Packages

| Package | Description |
| --- | --- |
| [`@guideframe/core`](packages/core) | Framework-agnostic engine. Zero dependencies. Works with Svelte, Vue, Astro, or plain JS. |
| [`@guideframe/react`](packages/react) | React/Next.js wrapper around the core. |

## Quick start

React and Next.js:

```tsx
import { GuideframeGrid } from "@guideframe/react";

<GuideframeGrid rulers />;
```

Svelte, Vue, or plain JavaScript:

```ts
import { createGuideframe } from "@guideframe/core";

const guideframe = createGuideframe({ rulers: true });
```

## What it does

- **Column grids** — responsive column/gutter/margin overlay, per breakpoint.
- **Rulers** — top and left rulers with document-space ticks, plus accent ticks
  marking your column boundaries.
- **Guides** — drag off a ruler to place one, drag to move, drop back on the
  ruler to delete. Persisted per route.
- **Snapping** — guides snap to the box edges of the DOM element under the
  pointer, to column boundaries, and to other guides, with a readout naming what
  was hit (`section.feature left`). Hold <kbd>Alt</kbd> to place freely.
- **Scoped overlays** — scope the grid and guides to a single component with
  `container`.

Keyboard: <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>G</kbd> toggles the overlay,
<kbd>Shift</kbd>+<kbd>R</kbd> the rulers, <kbd>Shift</kbd>+<kbd>L</kbd> locks
guides, <kbd>Esc</kbd> cancels a drag.

The overlay lives in a shadow root on `<body>`, so host CSS can't affect it and
it can't affect host layout. It is inert in production unless you pass
`forceVisibleInProduction`.

## Examples

- [`examples/vite`](examples/vite) — React playground with a container-scoped overlay
- [`examples/svelte`](examples/svelte) — Svelte 5, using the core directly

## Scripts

- `npm run build` — build both packages and the React demo
- `npm run dev` — run the React playground
- `npm run test` — run the core and React test suites
- `npm run type-check` — typecheck every workspace
