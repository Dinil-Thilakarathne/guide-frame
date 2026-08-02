"use client";

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemHeader,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion/accordion";

const shortcuts = [
  ["Toggle the overlay", "Cmd / Ctrl + G"],
  ["Open the control panel", "Cmd / Ctrl + Shift + G"],
  ["Toggle the rulers", "Shift + R"],
  ["Toggle geometry inspection", "Shift + M"],
  ["Lock every guide", "Shift + L"],
  ["Undo the last guide change", "Shift + Z"],
  ["Nudge selected guides", "Arrow / Shift + Arrow"],
];

const guideActions = [
  "Drag off a ruler to place a guide, and drag a guide to move it.",
  "Alt or Option-drag an existing guide to duplicate it.",
  "Command or Ctrl-drag to temporarily bypass snapping.",
  "Shift-click guides or Shift-drag across the page to select multiple guides.",
  "Use Arrow keys to nudge selected guides by 1px, or Shift + Arrow for 10px.",
  "Delete a selection together, or use Clear… for selected, horizontal, vertical, or all guides.",
];

const inspectorActions = [
  "Enable Geometry inspector from the panel, or press Shift + M.",
  "Hover a component to read its rendered width, height, and padding.",
  "Click a component to pin it, then hover another to compare gaps and alignment.",
  "Press Esc to clear the pinned component, then again to exit inspection.",
];

function ReferenceItem({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionItemTrigger>
        <AccordionItemHeader className="px-0 py-4 text-base">
          {title}
        </AccordionItemHeader>
      </AccordionItemTrigger>
      <AccordionItemContent className="px-0 pb-5">
        {children}
      </AccordionItemContent>
    </AccordionItem>
  );
}

export default function InteractionReference() {
  return (
    <AccordionRoot defaultValue={["shortcuts"]} variant="default">
      <ReferenceItem value="shortcuts" title="Keyboard shortcuts">
        <dl className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map(([action, shortcut]) => (
            <div key={action} className="border-border rounded-xl border p-3">
              <dt>{action}</dt>
              <dd className="text-foreground-main mt-1 font-mono">
                {shortcut}
              </dd>
            </div>
          ))}
        </dl>
      </ReferenceItem>

      <ReferenceItem value="guides" title="Working with guides">
        <ul className="flex flex-col gap-2">
          {guideActions.map((action) => (
            <li key={action} className="leading-6">
              {action}
            </li>
          ))}
        </ul>
      </ReferenceItem>

      <ReferenceItem value="inspector" title="Geometry inspection">
        <ul className="flex flex-col gap-2">
          {inspectorActions.map((action) => (
            <li key={action} className="leading-6">
              {action}
            </li>
          ))}
        </ul>
      </ReferenceItem>
    </AccordionRoot>
  );
}
