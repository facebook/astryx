---
applyTo: "packages/cli/templates/**"
---

# Template review instructions

These are Astryx **templates** — page templates (`templates/pages/<name>/page.tsx`
+ `template.doc.mjs`) and block templates (`templates/blocks/.../[Name].tsx` +
`[Name].doc.mjs`). They are copy-paste examples, so they carry design
responsibility beyond any single component.

> **Scope note.** These files also match `packages.instructions.md`. For
> template files, the component-authoring checklist there (forwardRef,
> sync-exports, colocated `.test.tsx`, etc.) does **not** apply — templates are
> examples, not published components. Review them by the rubric below (and the
> shared design and StyleX rules).

Grade every changed template against the
**[Template Grading Rubric](https://github.com/facebook/astryx/wiki/Contributing-Templates#template-grading-rubric)**
in [Contributing Templates](https://github.com/facebook/astryx/wiki/Contributing-Templates).
**Every template in the gallery should score B (75) or above.** Flag anything
that would land below B; post findings as a scorecard (advisory — comment, don't
hard-block).

## Step 0 — Triage first

Quick triage before grading. Two questions:

- **New template vs. edit to an existing one?** A *new* template that lands
  already-visible (its `.doc.mjs` isn't `hidden: true`) skipped hidden-staging —
  flag it (see Lifecycle note) and hold it to the full B+ bar. An edit to an
  existing template is scoped to what changed.
- **Content-only vs. structural?** A copy/mock-data tweak is a fast grade
  (purity + metadata); a layout/root/`AppShell` change needs the full Layout &
  Structure pass. State it briefly, e.g. `Triage: edit to existing template,
  layout change → full structure pass`.

## Score the 7 categories (100 pts)

1. **Astryx component purity (30)** — count JSX tags; every raw lowercase HTML
   tag (`div`, `span`, `button`, `nav`, `ul`, `p`, `h1`–`h6`, `form`, `input`,
   `table`, `img`, …) is a flag unless it has no Astryx equivalent. Use
   `VStack`/`HStack`/`Grid`/`Card`/`Center` over `<div>`, `Text`/`Heading` over
   text tags, `Button`/`Link`, `List`/`ListItem`, `Table`, `FormLayout`,
   `Divider`, `Dialog`, `Collapsible`. Necessary exceptions (don't penalize):
   `<img>` with an astryx CDN src, `<form>` wrapping `FormLayout`,
   `<input type="hidden">`. Fragments and local PascalCase helpers don't count.
2. **Icon purity (15)** — icons via `<Icon icon={X} />` or an `icon={X}` prop.
   Flag raw `<svg>`/`<path>`/etc., inline SVG components, and heroicons rendered
   without the `Icon` wrapper.
3. **Custom CSS (15)** — style through Astryx props (`gap`, `padding`,
   `variant`, `size`, `color`, `level`, `minChildWidth`, `height`), not custom
   CSS. Count each declaration in `stylex.create`/`style={{}}`, and each
   `className`/`stylex.props()` usage. Token-valued Astryx props do **not**
   count.
4. **Layout & structure (15)** —
   - *Page templates:* root is `Layout` or `Center`, never `AppShell` or a raw
     `<div>` — **exception:** `Shell -` category templates must root in
     `AppShell` with global `TopNav`/`SideNav`. No global app chrome otherwise
     (in-page nav → `LayoutPanel` start slot; page header → `LayoutHeader`).
     Responsive grids use `Grid` + `minChildWidth`; centering uses `Center`.
     Single page only — navigation links inert (`href="#"` / `onClick`).
   - *Block templates:* not wrapped in `AppShell`, single-pattern focus,
     ~20–100 lines.
5. **Doc metadata (10)** — read the `.doc.mjs`. Pages need
   `type:'page'`, `name`, `description`, `isReady`. Blocks need `type:'block'`,
   `name`, `description`, `isReady`, `aspectRatio` (matching component shape —
   wide `16/4`, square `1`, tall `3/4`, content/form `4/3`), and
   `componentsUsed` listing **every** Astryx component actually used. Flag
   missing fields, a wrong `aspectRatio`, `componentsUsed` drift, and missing
   `scale` for tiny components (Badge/StatusDot/single Icon/Spinner → `2` or
   `3`).
6. **Image handling (5)** — images only from the astryx CDN via the permanent
   lookaside URL (`https://lookaside.facebook.com/assets/astryx/<asset>.png`)
   with an asset-name comment. Flag external URLs (unsplash/placehold/picsum),
   checked-in image files, data URIs, and expiring signed `scontent…fbcdn.net`
   URLs.
7. **Code quality (10)** — `'use client';` first line; `export default`;
   self-contained imports (`@astryxdesign/core/*`, `@heroicons/react/*`, or
   local only); realistic mock data (real names/values, never
   "Lorem ipsum"/"Item 1"/"foo"); no dead code.

## Reporting

When a template diff is substantial (new template, or material change), post the
rubric's scorecard: per-category points, a letter grade, the specific findings
(raw HTML lines, raw SVG lines, custom-CSS declarations, layout/doc/image/quality
issues), and the **top 3 fixes**. For small tweaks, just flag any category that
now dips below B rather than re-grading the whole file.

Also apply the shared **Design review** rules (see `packages.instructions.md`):
templates are judged on the same visual axes — layout fidelity, visual
hierarchy, spacing/alignment, component fidelity, and color/theming in light +
dark.

## Lifecycle note

Templates are authored **hidden** and revealed only after they clear this bar
(`hidden: true` / a `hiddenComponents` entry in the `.doc.mjs` keeps a template
out of `--list`). The thing to catch is a template that **skips hidden-staging**:
**flag a diff that adds a *new* template/block whose `.doc.mjs` is not
`hidden: true`** — it's publicly listed the moment it lands and may not be
hardened yet. Ask the author to confirm it grades **B or above**, or to add
`hidden: true` until it does. See
[Component Lifecycle](https://github.com/facebook/astryx/wiki/Component-Lifecycle#promotion-gates).
