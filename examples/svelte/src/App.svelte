<script lang="ts">
import { onMount } from "svelte";
import { createGuideframe } from "@guideframe/core";
import type { Guide, GuideframeInstance } from "@guideframe/core";

let instance: GuideframeInstance | undefined;
// biome-ignore lint/correctness/noUnusedVariables: referenced by the Svelte template below
let guides = $state<Guide[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: referenced by the Svelte template below
let visible = $state(true);

// `@guideframe/core` needs no framework adapter — Svelte's `onMount` returning
// a teardown function is exactly the lifecycle contract `destroy()` expects.
onMount(() => {
  instance = createGuideframe({
    columns: { desktop: 12, tablet: 8, mobile: 4 },
    rulers: true,
    snap: { elements: true, columns: true, guides: true, threshold: 6 },
    onGuidesChange: (next) => {
      guides = next;
    },
    onVisibleChange: (next) => {
      visible = next;
    },
  });

  guides = instance.getGuides();
  visible = instance.isVisible();

  return () => instance?.destroy();
});
</script>

<main>
  <h1>GuideFrame in Svelte</h1>
  <p>
    The overlay is driven straight from <code>@guideframe/core</code>, with no
    Svelte-specific package involved.
  </p>

  <ul class="shortcuts">
    <li><kbd>⌘/Ctrl</kbd> + <kbd>G</kbd> — toggle the overlay</li>
    <li><kbd>Shift</kbd> + <kbd>R</kbd> — toggle rulers</li>
    <li><kbd>Shift</kbd> + <kbd>L</kbd> — lock every guide</li>
    <li><kbd>Shift</kbd> + <kbd>Z</kbd> — undo the latest guide change</li>
    <li>Drag off a ruler to add a guide, drop it back to delete it</li>
    <li>Click a guide, then <kbd>Backspace</kbd> — removes it without dragging</li>
    <li><kbd>Alt</kbd>/<kbd>Option</kbd>-drag a guide to duplicate it</li>
    <li>Hold <kbd>Command</kbd>/<kbd>Ctrl</kbd> while dragging to ignore snapping</li>
    <li><kbd>Shift</kbd>-drag across the page to select and delete several guides</li>
  </ul>

  <section class="status">
    <p>Overlay visible: <strong>{visible ? "yes" : "no"}</strong></p>
    <p>Guides: <strong>{guides.length}</strong></p>
    <button type="button" onclick={() => instance?.clearGuides()}>Clear guides</button>
  </section>

  <div class="card">
    <h2>Alignment target</h2>
    <p>Drag a vertical guide near this card — it snaps to the card's edges.</p>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #f4f6f8;
    color-scheme: light;
  }

  main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 64px 24px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    color: #16202a;
  }

  .shortcuts {
    line-height: 1.9;
    padding-left: 18px;
  }

  kbd {
    padding: 1px 5px;
    border: 1px solid #cbd3da;
    border-radius: 4px;
    background: #f4f6f8;
    font-size: 12px;
  }

  .status {
    display: flex;
    gap: 20px;
    align-items: center;
    margin: 24px 0;
  }

  .card {
    padding: 28px;
    border: 1px solid #d8dee4;
    border-radius: 10px;
    background: #fff;
  }
</style>
