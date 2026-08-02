# Contributing to GuideFrame

Thank you for helping improve GuideFrame. Contributions should keep the library focused,
framework-agnostic at its core, accessible, and safe to run over arbitrary web pages.

By submitting a contribution, you agree that it will be licensed under the repository's MIT
License.

## Before you start

- Search existing issues and pull requests before opening a duplicate.
- Open an issue before starting a large feature, public API change, or interaction redesign.
- Keep pull requests focused. Do not combine unrelated cleanup with a behavior change.
- Never include credentials, private data, proprietary source code, or assets without documented
  redistribution rights.

## Repository structure

- `packages/core/` — framework-agnostic overlay engine and its tests.
- `packages/react/` — React and Next.js bindings around the core package.
- `examples/vite/` — full-screen local interaction test surface.
- `examples/svelte/` — direct core-package integration example.
- `web/` — the public Next.js website, managed separately with Bun.

Framework-independent behavior belongs in `@guideframe/core`. React-specific lifecycle and hook
behavior belongs in `@guideframe/react`.

## Local setup

Use Node.js 22 and npm 11 for the root workspace.

```bash
npm ci
npm run dev
```

The local Vite demo is the preferred surface for manually testing rulers, guides, snapping,
selection, shortcuts, and pointer interactions.

The website uses Bun:

```bash
cd web
bun install --frozen-lockfile
bun run dev
```

## Required checks

Run these commands before opening a pull request:

```bash
npm run format:check
npm run lint
npm test
npm run type-check
npm run build
```

For website changes, also run:

```bash
cd web
bun run lint
bun run build
```

Static checks are not visual proof. Describe any browser testing you performed and explicitly say
when rendered behavior was not verified.

## Interaction requirements

- Do not block the host page unless the user has entered an explicit GuideFrame interaction.
- Preserve scrolling and hover behavior whenever the active tool allows it.
- Keep pointer capture, cancellation, Escape behavior, and locked-guide behavior predictable.
- Respect reduced-motion preferences and keyboard accessibility.
- Preserve controlled and uncontrolled state contracts and `onGuidesChange` behavior.
- Avoid changing existing shortcuts or public options without an approved migration plan.

Add tests for every interaction-state change, especially cancellation, locking, controlled data,
pointer events, persistence, and keyboard behavior.

## Pull requests

Pull requests should include:

- The problem and intended outcome.
- The chosen approach and important trade-offs.
- Public API or behavior changes.
- Tests and documentation added or updated.
- Exact validation commands that passed.
- Browser, operating system, and rendered verification status when UI behavior changed.
- A breaking-change declaration when relevant.

Maintainers may ask for a smaller scope, an issue discussion, or an interaction prototype before
accepting a substantial change.

## AI-assisted contributions

AI-assisted contributions are welcome, but the human contributor remains responsible for them.

- Understand and review every submitted change.
- Verify technical, security, dependency, and licensing claims against primary sources.
- Apply the same test, documentation, accessibility, and review standards as human-written code.
- Do not submit generated code copied from incompatible or unknown sources.
- Do not provide an AI system with repository secrets or private user data.
- Disclose material AI assistance in the pull request when it substantially shaped the design or
  implementation.

## Releases

Only maintainers publish packages. Do not change package versions, distribution tags, or release
workflows unless the issue or pull request explicitly covers a release. A prepared version is not a
published version.

