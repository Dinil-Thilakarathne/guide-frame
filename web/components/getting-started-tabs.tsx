"use client";

import { useState } from "react";
import { InternalCodeBlock } from "@/components/code-block/internal-code-block";
import FluidTabs from "@/components/ui/fluid-tabs/fluid-tabs";

const reactCommand = `import { GuideframeGrid } from "@guideframe/react";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GuideframeGrid rulers />
        {children}
      </body>
    </html>
  );
}`;

const coreCommand = `import { createGuideframe } from "@guideframe/core";

const guideframe = createGuideframe({
  columns: { desktop: 12, tablet: 8, mobile: 4 },
  rulers: true,
});

// on teardown
guideframe.destroy();`;

const tabs = [
  { value: "react", title: "React", ariaControls: "react-setup-panel" },
  { value: "core", title: "Any framework", ariaControls: "core-setup-panel" },
];

export default function GettingStartedTabs() {
  const [value, setValue] = useState("react");

  return (
    <div className="flex flex-col gap-4">
      <FluidTabs
        tabs={tabs}
        value={value}
        onValueChange={setValue}
        ariaLabel="GuideFrame package setup"
        size="sm"
      />

      <div
        id="react-setup-panel"
        role="tabpanel"
        aria-label="React setup"
        hidden={value !== "react"}
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Render the overlay once near the root of your app.
          </p>
          <InternalCodeBlock
            code={reactCommand}
            language="tsx"
            filename="root-layout.tsx"
            copyEventName="landing_usage_command_copied"
            copyEventProperties={{
              page_name: "guideframe landing page",
              command_name: "react",
              section: "get_started",
            }}
          />
        </div>
      </div>

      <div
        id="core-setup-panel"
        role="tabpanel"
        aria-label="Framework-agnostic setup"
        hidden={value !== "core"}
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Svelte, Vue, Astro, or plain JavaScript can drive the same engine
            directly.
          </p>
          <InternalCodeBlock
            code={coreCommand}
            language="ts"
            filename="guideframe.ts"
            copyEventName="landing_usage_command_copied"
            copyEventProperties={{
              page_name: "guideframe landing page",
              command_name: "core",
              section: "get_started",
            }}
          />
        </div>
      </div>
    </div>
  );
}
