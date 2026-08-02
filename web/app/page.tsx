import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockHeader,
  CodeBlockPre,
} from "@/components/code-block/code-block";
import { InternalCodeBlock } from "@/components/code-block/internal-code-block";
import TrackableOutboundLink from "@/components/trackable-outbound-link";

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

const quickFacts = [
  "Adds a Figma-style layout grid, rulers, and draggable guides directly in the browser.",
  "Guides snap to the edges of your real rendered elements, not to design-file objects.",
  "Measures rendered dimensions, padding, gaps, and alignment between components.",
  "Helps designers and engineers check alignment without leaving the app.",
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
  "Inert in production by default, and never rendered on the server.",
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
    action: "Delete the selected guide",
    shortcut: "Backspace",
  },
  {
    action: "Cancel a drag, or deselect",
    shortcut: "Esc",
  },
];

const guideActions = [
  "Drag off a ruler to place a guide, and drag a guide to move it.",
  "Click a guide to select it, then press Backspace or Delete to remove it.",
  "Or drag a guide back onto the ruler to delete it.",
  "Hold Alt while dragging to ignore snapping.",
  "Click the ruler corner to clear every guide on the route.",
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
    <div className="flex flex-col gap-16 pb-16">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm tracking-[0.18em] uppercase">
            Layout grid overlay
          </p>
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground-main font-helvetica-neue text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
              GuideFrame
            </h1>
            <p className="text-foreground-main text-lg leading-relaxed">
              Figma-style layout grids, rulers, and guides in the browser.
            </p>
          </div>
        </div>

        <p className="max-w-xl text-balance leading-7">
          GuideFrame brings the grid, rulers, and draggable guides you already
          know from Figma into your running app, so you can check spacing and
          alignment against the real rendered DOM instead of guessing from
          static mocks alone.
        </p>

        <div className="flex flex-wrap gap-3">
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

        <CodeBlock code={installCommand} language="bash" className="my-4">
          <CodeBlockHeader
            filename="install"
            copyEventName="landing_install_command_copied"
            copyEventProperties={{
              page_name: "guideframe landing page",
              command_name: "install",
              section: "hero",
            }}
          />
          <CodeBlockPre>
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Why it exists</SectionHeading>
        <ul className="grid grid-cols-1 gap-2">
          {quickFacts.map((fact) => (
            <li key={fact} className="">
              <p className="leading-7">{fact}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Usage</SectionHeading>
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
        <SectionHeading>Try it</SectionHeading>
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
        <p>
          Hit the shortcut in your app to bring GuideFrame up when you want a
          quick visual grid reference.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Working with guides</SectionHeading>
        <ul className="grid grid-cols-1 gap-2">
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
        <SectionHeading>To the point</SectionHeading>
        <div>
          <div className="flex flex-col gap-2">
            {packagePoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
        </div>
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
