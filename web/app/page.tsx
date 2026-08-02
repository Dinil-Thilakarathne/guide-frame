import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockHeader,
  CodeBlockPre,
} from "@/components/code-block/code-block";
import { InternalCodeBlock } from "@/components/code-block/internal-code-block";
import TrackableOutboundLink from "@/components/trackable-outbound-link";
import TryGuideframeButton from "@/components/try-guideframe-button";

const installCommand = "npm install @guideframe/react";
const usageCommand = `import { GuideframeGrid } from "@guideframe/react";

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

const coreUsageCommand = `import { createGuideframe } from "@guideframe/core";

const guideframe = createGuideframe({
  columns: { desktop: 12, tablet: 8, mobile: 4 },
  rulers: true,
});

// on teardown
guideframe.destroy();`;

const outcomes = [
  {
    title: "Align",
    description:
      "Place snapping guides against the real edges and column boundaries in your rendered app.",
  },
  {
    title: "Measure",
    description:
      "Read dimensions, padding, gaps, and alignment without leaving the browser.",
  },
  {
    title: "Compare",
    description:
      "Pin one component and compare it with another using exact DOM geometry.",
  },
];

const usageSteps = [
  {
    title: "Install",
    description: "Add the package to your app.",
    command: installCommand,
    commandName: "install",
    language: "bash",
  },
  {
    title: "Use",
    description: "Render the overlay once near the root of your app.",
    command: usageCommand,
    commandName: "use",
    language: "tsx",
  },
  {
    title: "Any framework",
    description:
      "Svelte, Vue, Astro, or plain JavaScript can drive the same engine directly through @guideframe/core.",
    command: coreUsageCommand,
    commandName: "core",
    language: "ts",
  },
];

const coverageItems = [
  "Layout grid overlay",
  "Rulers with document-space ticks",
  "Draggable guides",
  "Snapping to element edges",
  "Geometry inspection and comparison",
  "Floating control panel",
  "Per-route guide persistence",
  "Container-scoped overlays",
  "React and Next.js",
  "Svelte, Vue, and vanilla JS",
];

const packagePoints = [
  "Designed for design engineering workflows that need a visual grid while building interfaces.",
  "Keeps the interface lightweight and unobtrusive so the grid stays useful instead of distracting.",
  "Renders inside a shadow root, so your CSS cannot affect the overlay and the overlay cannot affect your layout.",
  "Client-only by design, with production rendering disabled by default in supported build environments.",
];

const shortcutItems = [
  {
    action: "Toggle the overlay",
    shortcut: "Cmd / Ctrl + G",
  },
  {
    action: "Open the control panel",
    shortcut: "Cmd / Ctrl + Shift + G",
  },
  {
    action: "Toggle the rulers",
    shortcut: "Shift + R",
  },
  {
    action: "Toggle geometry inspection",
    shortcut: "Shift + M",
  },
  {
    action: "Lock every guide",
    shortcut: "Shift + L",
  },
  {
    action: "Undo the last guide change",
    shortcut: "Shift + Z",
  },
  {
    action: "Nudge selected guides",
    shortcut: "Arrow / Shift + Arrow",
  },
];

const guideActions = [
  "Drag off a ruler to place a guide, and drag a guide to move it.",
  "Alt or Option-drag an existing guide to duplicate it.",
  "Command or Ctrl-drag to temporarily bypass snapping.",
  "Shift-click guides or Shift-drag across the page to select multiple guides.",
  "Use Arrow keys to nudge selected guides by 1px, or Shift + Arrow for 10px.",
  "Delete a selection together, or use the Clear… menu for selected, horizontal, vertical, or all guides.",
];

const inspectorActions = [
  "Open the floating control panel and enable Geometry inspector, or press Shift + M.",
  "Page interactions pause, so inspected buttons and links cannot activate.",
  "Hover a component to read its rendered width, height, and padding.",
  "Click the component to pin its geometry.",
  "Hover another component to compare horizontal and vertical gaps plus alignment deltas.",
  "Press Esc to clear the pinned component, then again to exit inspection.",
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-foreground-main text-xl leading-normal font-semibold">
      {children}
    </h2>
  );
}

function InlineLink({
  href,
  children,
  analyticsLabel,
}: {
  href: string;
  children: React.ReactNode;
  analyticsLabel: string;
}) {
  return (
    <TrackableOutboundLink
      href={href}
      analyticsLabel={analyticsLabel}
      className="text-foreground-main/80 hover:text-foreground-main inline-flex w-fit font-medium transition-colors duration-300"
    >
      <span className="border-foreground-main/20 hover:border-foreground-main/60 border-b transition-colors duration-300">
        {children}
      </span>
    </TrackableOutboundLink>
  );
}

export default function Page() {
  return (
    <div className="flex flex-col gap-20 pb-16">
      <section className="flex min-h-[70svh] flex-col justify-center gap-8 py-8 sm:py-12">
        <div className="flex flex-col gap-1">
          <p className="text-foreground-main/70 text-xs font-medium tracking-[0.18em] uppercase">
            Interactive browser overlay
          </p>
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground-main font-helvetica-neue text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
              GuideFrame
            </h1>
            <p className="text-foreground-main max-w-xl text-xl leading-relaxed sm:text-2xl">
              Figma-style layout grids, rulers, and guides for your running app.
            </p>
          </div>
        </div>

        <p className="max-w-xl text-pretty leading-7">
          Check spacing and alignment against the real rendered DOM instead of
          moving back and forth between your browser and static mocks.
        </p>

        <div className="border-border bg-background flex flex-col gap-5 rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-foreground-main font-medium">
              This page is the demo.
            </p>
            <p className="max-w-lg text-sm leading-6">
              Turn on GuideFrame, drag a guide from either ruler, then try
              duplicating and selecting guides together.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TryGuideframeButton />
            <p className="text-sm">
              or press{" "}
              <kbd className="text-foreground-main font-mono">⌘ / Ctrl + G</kbd>
            </p>
          </div>
          <ol className="grid gap-2 text-sm sm:grid-cols-3">
            <li>
              <span className="text-foreground-main font-medium">1.</span> Place
              a guide
            </li>
            <li>
              <span className="text-foreground-main font-medium">2.</span>{" "}
              Option-drag to duplicate
            </li>
            <li>
              <span className="text-foreground-main font-medium">3.</span>{" "}
              Shift-drag to select
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <InlineLink
            href="https://github.com/Dinil-Thilakarathne/guide-frame"
            analyticsLabel="github"
          >
            GitHub
          </InlineLink>
          <InlineLink
            href="https://www.npmjs.com/package/@guideframe/react"
            analyticsLabel="npm"
          >
            npm
          </InlineLink>
          <InlineLink
            href="https://www.npmjs.com/package/@guideframe/core"
            analyticsLabel="npm_core"
          >
            @guideframe/core
          </InlineLink>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Built for the browser</SectionHeading>
        <div className="grid gap-3 sm:grid-cols-3">
          {outcomes.map((outcome) => (
            <article
              key={outcome.title}
              className="border-border rounded-2xl border p-4"
            >
              <h3 className="text-foreground-main font-medium">
                {outcome.title}
              </h3>
              <p className="mt-2 text-sm leading-6">{outcome.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Get started</SectionHeading>
        <div className="grid grid-cols-1 gap-6">
          {usageSteps.map((step) => (
            <article key={step.title} className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-foreground-main font-medium">
                  {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
              <InternalCodeBlock
                code={step.command}
                language={step.language}
                filename={step.title.toLowerCase()}
                copyEventName="landing_usage_command_copied"
                copyEventProperties={{
                  page_name: "guideframe landing page",
                  command_name: step.commandName,
                  section: "usage",
                }}
                className="my-0"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>What it covers</SectionHeading>
        <div>
          <div className="flex flex-wrap gap-2">
            {coverageItems.map((target) => (
              <span
                key={target}
                className="border-border text-foreground-main rounded-full border px-3 py-1 text-sm"
              >
                {target}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Interaction reference</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {shortcutItems.map((item) => (
            <div
              key={item.action}
              className="border-border bg-background rounded-2xl border p-4"
            >
              <p className="text-foreground-main font-medium">{item.action}</p>
              <p className="text-foreground-main mt-1 font-mono text-lg tracking-[-0.03em]">
                {item.shortcut}
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-2 grid grid-cols-1 gap-2">
          {guideActions.map((action) => (
            <li key={action}>
              <p className="leading-7">{action}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-xl text-balance leading-7">
          Guides snap to the box edges of whatever element is under your
          pointer, to your column boundaries, and to other guides — and the
          readout names what it locked onto. They persist per route, so the
          guides you draw on one page stay there.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Inspect component geometry</SectionHeading>
        <ul className="grid grid-cols-1 gap-2">
          {inspectorActions.map((action) => (
            <li key={action}>
              <p className="leading-7">{action}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-xl text-balance leading-7">
          Pin one rendered element and compare it with another to turn a spacing
          or alignment concern into exact browser measurements.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Technical guarantees</SectionHeading>
        <div>
          <div className="flex flex-col gap-2">
            {packagePoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-border flex flex-col gap-5 rounded-2xl border p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <SectionHeading>Add GuideFrame to your app</SectionHeading>
          <p>Start with React, or use the framework-agnostic core package.</p>
        </div>
        <CodeBlock code={installCommand} language="bash" className="my-0">
          <CodeBlockHeader
            filename="install"
            copyEventName="landing_install_command_copied"
            copyEventProperties={{
              page_name: "guideframe landing page",
              command_name: "install",
              section: "final_cta",
            }}
          />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
        <InlineLink
          href="https://github.com/Dinil-Thilakarathne/guide-frame"
          analyticsLabel="github_final_cta"
        >
          View the source on GitHub
        </InlineLink>
      </section>

      <footer className="mt-4 flex flex-col gap-2 pb-6">
        <div className="bg-foreground-main/20 h-px w-full" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 © Dinil Thilakarathne</p>
          <p className="text-sm">
            Built for interface work that needs a reliable grid reference.
          </p>
        </div>
      </footer>
    </div>
  );
}
