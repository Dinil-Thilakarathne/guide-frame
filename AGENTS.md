# GuideFrame agent instructions

These instructions apply to coding agents working in this repository.

## Project boundaries

- Keep framework-independent behavior in `packages/core`.
- Keep React lifecycle and hook behavior in `packages/react`.
- Use `examples/vite` for focused local interaction testing.
- Treat `web` as a separate Bun-managed Next.js application.
- Preserve public props, defaults, exports, callbacks, refs, persistence, and controlled/uncontrolled
  behavior unless a breaking change is explicitly approved.

## Interaction safety

- GuideFrame overlays arbitrary host pages. Do not globally intercept page interactions unless the
  user has entered an explicit GuideFrame mode or gesture.
- Preserve page hover and scrolling when the active feature permits them.
- Maintain pointer capture, cancellation, Escape, locking, snapping, and selection invariants.
- Do not change established shortcuts without explicit approval and documentation.
- Respect reduced motion and keyboard accessibility.

## Development workflow

- Inspect existing behavior and tests before editing.
- Add or update tests for every behavior change.
- Run `npm run format:check`, `npm run lint`, `npm test`, `npm run type-check`, and `npm run build`.
- Report static checks and rendered browser verification separately.
- Do not edit generated `dist` files directly; rebuild packages instead.
- Do not commit secrets, local environment files, caches, or machine-specific settings.
- Preserve unrelated working-tree changes.

## Release safety

- Never publish, create a release, push, or change distribution tags without explicit maintainer
  approval.
- npm versions are immutable. Verify that a prepared version is unused before publishing.
- Keep `@guideframe/core` and `@guideframe/react` versions aligned, including the React dependency
  and lockfile.
- Build and dry-run both package tarballs before requesting release approval.
- A local build or prepared version is not a published release.

## AI responsibility

- Verify external claims against primary sources.
- Do not invent licensing permissions or security contacts.
- Flag third-party assets without documented redistribution rights.
- Human maintainers retain final responsibility for API, interaction, layout, licensing, and release
  decisions.

