# GuideFrame

GuideFrame is a React development overlay that brings Figma-style layout grids into the browser.

## Packages

- `@guideframe/react`

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

## Scripts

- `npm run build`
- `npm run dev`
- `npm run test`
