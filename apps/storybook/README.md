# /apps/storybook

Storybook application for component development and visual documentation.

<!-- SYNC: When files in this directory change, update this document. -->

## How stories are organized

One shape, so a reader can guess where anything lives and the visual gate can
find it:

```
<Package>/<Component>/(Default | Theme Sheet | …)
<Package>/Hooks/<hook>
<Package>/Themes/<theme feature>
```

- **`<Package>`** is `Core`, `Lab`, `Charts`, `Vega` or `RichText` — the package
  the thing ships from, never a category like "Components".
- **`Default` comes first.** The simplest honest use, and the first thing a
  builder sees.
- **`Theme Sheet` comes second** — every themeable target of that component, in
  every variant and state its `.doc.mjs` declares, on one page. It is the
  reference for theme authors and the surface the visual gate photographs under
  the probe theme, which is how a theming target is proven to still reach the
  pixels. A component whose sheet is missing a target has a target nothing can
  verify.
- **Hooks and theme-level features are not components** and do not sit beside
  them. Icon and indicator registries, `MediaTheme`, `CodeTheme` and the like
  live under `Themes/`.

## Generated icon role review

`Core/Icon Role Inventory → Generated` is the proposed central role/state review
surface. Use the existing Theme and Mode toolbar; `Synthetic Policy` deliberately
pins a labelled test theme to demonstrate role sizes, finite-state appearance and
size-selected weight. Single-state cases are shown once; the pinned synthetic
provider preserves the toolbar-selected light/dark mode. The direct-probe control
shows ordinary SVG fallback behavior.

The Vite plugin derives the roster from canonical `ComponentIconSlotMap` types and
imports each runtime declaration owner. Nothing is cataloged or written to disk;
new owner roles appear without editing the story. True slots have one visibly
stateless/nonparticipating row. Metadata roles show no condition, each finite
state and all conditions active to expose precedence. The shared check fallback
is a glyph probe, not the component's actual default artwork or layout proof.

`pnpm check:icon-conformance` runs with `check:repo`, beside the knowledge checks.
It checks discoverable declarations, state coverage, named default-size metadata
and mechanically visible shared-rendering bypasses in enrolled owner modules.
Dynamic data flow and component interaction/layout still need owner tests and
browser review. UI inventory tests run in the root `ui` project; discovery and
build-field preservation tests run in their existing Node lanes.

This location/tooling is a concrete proposal, not an approval of inventory
ownership or a replacement for component stories and real screenshots.

### A Theme Sheet must not pin its own theme

Render the component plainly and let the toolbar drive the theme. A story that
wraps itself in `<Theme theme={…}>` overrides the global, so the toolbar cannot
switch it and the visual gate can never probe it — the story becomes invisible
to exactly the testing it looks like it is helping with.

```tsx
// Good — the toolbar (and the gate) control the theme
export const ThemeSheet: Story = {
  name: 'Theme Sheet',
  render: () => (
    <>
      {VARIANTS.map(v => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </>
  ),
};
```

| File                             | Role          | Purpose                                                                            |
| -------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `.storybook/main.ts`             | Config        | Storybook Vite integration, preview build target, and shared workspace alias table |
| `.storybook/main.test.ts`        | Tests         | Source alias coverage and cold-clone config loading                                |
| `LOCAL_STARTUP_INVESTIGATION.md` | Investigation | Why local Storybook previews can appear before they are ready                      |
| `package.json`                   | Config        | Package dependencies and scripts                                                   |
| `tsconfig.json`                  | Config        | TypeScript compiler configuration                                                  |
| `vite.config.ts`                 | Config        | Vite bundler configuration with path aliases                                       |
