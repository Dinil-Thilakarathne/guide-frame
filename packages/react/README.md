# @guideframe/react

React overlay for visualizing layout grids in development.

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
        <GuideframeGrid />
        {children}
      </body>
    </html>
  );
}
```

## Beta testing

For beta releases, install the prerelease tag directly:

```bash
npm install @guideframe/react@beta
```
