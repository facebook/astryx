# Astryx repository guidance

Astryx is a public design-system repository. Never commit internal links,
identifiers, service names, private operational instructions, or other
Meta-only context.

## Start here

- Product builders: use `astryx docs`, component `{Name}.doc.mjs` files, and
  `packages/cli/assets/docs/`.
- Contributors: read `CONTRIBUTING.md` and the relevant guidance linked from
  `docs/README.md`.
- Component work: read the component's `{Name}.spec.md` when one exists, then
  its consumer docs, tests, and implementation.
- Cross-component work: read the relevant contract under `docs/families/`,
  applicable design spec under `docs/design/`, and current architecture under
  `docs/architecture/`.
- Consequential shared-system changes: use a record under `docs/specs/`.

## Authority

Knowledge records declare `authority`:

- `draft`: not authoritative; may still need evidence or owner review;
- `current`: explicitly approved and authoritative;
- `archived`: context only, with a reason such as `superseded`, `withdrawn`,
  or `historical` and a replacement link when one exists.

Only `current` records govern implementation and review. Never infer approval
from merged code, silence, an old review, or an existing wiki page.

## Judgment boundary

Resolve checkable behavior from code, tests, and browser evidence. Ask a human
only when a stable public API, theme contract, ownership boundary, compatibility
policy, or genuinely subjective visual direction remains undecided. Ask one
question at a time.

Before reviewing or implementing a proposed outcome, check current `main` and
newer overlapping pull requests. Do not create new policy for work that is
already complete or superseded.

## Validation

Run `pnpm check:knowledge` after editing knowledge records or templates. A
material template-shape change requires a schema-version bump and migration of
active records; changing template guidance alone does not rewrite accepted
history.
