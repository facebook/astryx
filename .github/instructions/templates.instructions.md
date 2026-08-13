---
applyTo: 'packages/cli/assets/templates/**'
---

# Template review instructions

These are Astryx **templates** — page templates
(`templates/pages/<name>/page.tsx` + `template.doc.mjs`) and block templates
(`templates/blocks/.../[Name].tsx` + `[Name].doc.mjs`). They are copy-paste
examples, so they carry design responsibility beyond any single component.

> **Scope note.** These files also match `packages.instructions.md`. For
> template files, the component-authoring checklist there (the `ref` prop,
> sync-exports, colocated `.test.tsx`, etc.) does **not** apply — templates are
> examples, not published components. Review them by the rubric below, plus the
> shared design and StyleX rules on the
> [Component Audit Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric).

## The grading rubric

Grade every changed template against the
**[Template Grading Rubric](https://github.com/facebook/astryx/wiki/Contributing-Templates#template-grading-rubric)**,
which carries the full criteria, the per-condition point tables, and the output
format. **Every template in the gallery should score B (75) or above.** Flag
anything that would land below B; post findings as a scorecard (advisory —
comment, don't hard-block).

The seven categories and their weights, as an index of what you are scoring:
component purity (30) · icon purity (15) · custom CSS (15) · layout & structure
(15) · doc metadata (10) · image handling (5) · code quality (10).

Two of those have repo-specific detail the wiki page does not carry — apply
these:

- **Layout & structure.** Page templates root in `Layout` or `Center`, never
  `AppShell` or a raw `<div>` — **exception:** `Shell -` category templates must
  root in `AppShell` with global `TopNav`/`SideNav`. No global app chrome
  otherwise (in-page nav → `LayoutPanel` start slot; page header →
  `LayoutHeader`). Navigation links are inert (`href="#"` / `onClick`) since a
  template is a single page. Block templates are not wrapped in `AppShell`,
  keep a single-pattern focus, and run ~20–100 lines.
- **Image handling.** Demo imagery is referenced by a **root-relative path under
  `/template-assets/<asset>.png`**, self-hosted in this repo under
  `apps/docsite/public/template-assets/` and mirrored into the sandbox preview
  at generate time. To use an existing image, browse that directory and
  reference it by name with an asset-name comment; to add one, drop the file in
  the same directory and reference it the same way. On scaffold,
  `stripTemplateAssetRefs` swaps these paths for an inline placeholder so a
  generated project renders with zero setup. Flag external URLs
  (unsplash/placehold/picsum), expiring signed CDN URLs, and inline data URIs.
  Image-backed `Thumbnail` examples are the one exception: they inline a
  same-origin, samplable `data:` URI, required by `useImageMode` — see
  `scripts/check-demo-media.mjs`.

## Step 0 — Triage first

Quick triage before grading. Two questions:

- **New template vs. edit to an existing one?** A _new_ template that lands
  already-visible (its `.doc.mjs` isn't `hidden: true`) skipped hidden-staging —
  flag it (see Lifecycle note) and hold it to the full B+ bar. An edit to an
  existing template is scoped to what changed.
- **Content-only vs. structural?** A copy/mock-data tweak is a fast grade
  (purity + metadata); a layout/root/`AppShell` change needs the full Layout &
  Structure pass.

State it briefly, e.g. `Triage: edit to existing template, layout change → full
structure pass`.

## Reporting

When a template diff is substantial (a new template, or a material change), post
the rubric's scorecard: per-category points, a letter grade, the specific
findings (raw HTML lines, raw SVG lines, custom-CSS declarations,
layout/doc/image/quality issues), and the **top 3 fixes**. For small tweaks,
just flag any category that now dips below B rather than re-grading the whole
file.

Templates are also judged on the shared design axes — see the Design review
section of [`packages.instructions.md`](./packages.instructions.md), which
points at [Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions).

## Lifecycle note

Templates are authored **hidden** and revealed only after they clear this bar.
The CLI reads `hidden: true` and `hiddenComponents: ['Name', ...]` from a
template's `.doc.mjs`; hidden entries are skipped from `--list`. The thing to
catch is a template that **skips hidden-staging**: **flag a diff that adds a
_new_ template/block whose `.doc.mjs` is not `hidden: true`** — it's publicly
listed the moment it lands and may not be hardened yet. Ask the author to
confirm it grades **B or above**, or to add `hidden: true` until it does. See
[Component Lifecycle](https://github.com/facebook/astryx/wiki/Component-Lifecycle#promotion-gates).
