# @guideframe/react

React overlay for visualizing layout grids, rulers and guides in development.
Wraps [`@guideframe/core`](../core).

## Install

```bash
npm install @guideframe/react
```

## Usage

```tsx
import { GuideframeGrid } from "@guideframe/react";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GuideframeGrid rulers />
        {children}
      </body>
    </html>
  );
}
```

The component renders nothing into the React tree — the overlay is mounted
imperatively into a shadow root on `<body>`. That means it renders nothing on the
server and can never cause a hydration mismatch, and its `position: fixed` can't
be broken by a transformed ancestor.

Works in Next.js (App Router and Pages Router), Vite, Remix, and any other React
setup. The package carries the `"use client"` directive, so it can be imported
directly from a Server Component file.

## Rulers and guides

Drag off a ruler to place a guide and drag a guide to move it. To remove one,
either click it and press <kbd>Backspace</kbd>/<kbd>Delete</kbd>, or drag it back
onto the ruler. Guides snap to the edges of the DOM element under the pointer, to
your column boundaries, and to other guides — hold <kbd>Alt</kbd> to place one
freely.

| Shortcut | Action |
| --- | --- |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>G</kbd> | Toggle the overlay |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd> | Toggle the floating control panel |
| <kbd>Shift</kbd> + <kbd>R</kbd> | Toggle the rulers |
| <kbd>Shift</kbd> + <kbd>L</kbd> | Lock/unlock every guide |
| <kbd>Shift</kbd> + <kbd>M</kbd> | Toggle the geometry inspector |
| <kbd>Backspace</kbd> / <kbd>Delete</kbd> | Delete the selected guide |
| <kbd>Esc</kbd> | Cancel a drag, or deselect |

Guides persist per route in `localStorage`. See the
[core README](../core/README.md) for the full option and behaviour reference.

## Geometry inspector

Open the floating control panel with
<kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd>, then enable **Geometry
inspector**. Hover an element to read its rendered dimensions and padding. Click
to pin it, then hover another element to compare gaps and alignment. Press
<kbd>Esc</kbd> to clear the pinned element, then again to exit. Page clicks are
paused while inspection is active, so buttons and links cannot be triggered by
measurement clicks.

## Scoping to a container

```tsx
function Preview() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setFrame} style={{ position: "relative" }}>
      {frame ? <GuideframeGrid container={frame} rulers /> : null}
      {/* ... */}
    </div>
  );
}
```

Use state rather than a ref object so the overlay mounts once the container
element exists. A scoped overlay stores guides relative to the container.

## Imperative API

`useGuideframe` drives the overlay from your own UI instead of rendering the
component:

```tsx
const { visible, guides, setVisible, clearGuides } = useGuideframe({ rulers: true });
```

## Beta testing

```bash
npm install @guideframe/react@beta
```

## Upgrading from 0.1.x

The props you were already passing all still work. Behaviour that changed:

- **Nothing is rendered into the React tree.** If you were asserting on
  `data-testid="guideframe-grid"` or styling `.guideframe-column` from your app,
  target the shadow root under `[data-guideframe-root]` instead. Overlay class
  names are now prefixed `gf-`.
- **No server-rendered markup.** 0.1.x rendered the grid during SSR based on
  `defaultVisible`, which mismatched persisted `localStorage` visibility on
  hydration. It now renders on the client only.
- **`position="absolute"` no longer mounts in place.** Pass `container` to scope
  the overlay to an element.
- **Breakpoints are matched against `documentElement.clientWidth`** rather than
  `window.innerWidth`, so they agree with CSS media queries instead of being off
  by the scrollbar width.
