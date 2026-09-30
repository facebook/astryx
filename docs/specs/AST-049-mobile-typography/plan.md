---
schema_version: 1
template_version: 1
kind: implementation-plan
id: plan:AST-049
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
spec: spec:AST-049
owners: [imdreamrunner]
---

# First-party mobile typography implementation plan

## Phases

This is a proposed implementation sequence for [spec:AST-049](spec.md), not
current product authority or a claim that the code/device work has run. The
system spec owns observable outcomes; this optional companion records concrete
source paths, sketches, and commands. Equivalent internal implementations are
valid. Paths and observations below refer to public source at
`9057ebe308c1625b587927583654f5a2ef391e80` unless stated otherwise.

### Phase 1 — Resolve the candidate contract and coordinate its owners

- [ ] Recheck `AST-049` against current main and open work. It is a draft
      placeholder, not a reservation. Rename the spec directory, both ids, and
      references together if another record has taken it.
- [ ] Obtain written advisory analysis of ownership, overlapping work, exact
      claim scope, implementation leakage, and unresolved human decisions before
      human adoption, following `architecture:knowledge-contracts`.
- [ ] Resolve OQ1: adopt the complete semantic-floor policy or a deliberately
      smaller policy. Do not silently describe the five themes needing floor writes
      as pure Pin, or let a historical PR stand in for numeric approval.
- [ ] Reconcile package-local theme records where their explicit claims are
      affected. AST-012 remains the adaptation-mechanism owner;
      `docs/design/typography-hierarchy.md` remains qualitative and is currently a
      draft. Add appropriate backlinks only through owner-reviewed adoption; do not
      make a current record rely on an unapproved draft.
- [ ] Record authorized exact-head approval metadata only when actually given.
      This documentation-only proposal needs no Changeset and changes no package.

### Phase 2 — Author first-party values using the existing adaptation surface

Reference source files:

```text
packages/themes/neutral/src/neutralTheme.ts
packages/themes/chocolate/src/chocolateTheme.ts
packages/themes/butter/src/butterTheme.ts
packages/themes/stone/src/stoneTheme.ts
packages/themes/gothic/src/gothicTheme.ts
packages/themes/matcha/src/matchaTheme.ts
packages/themes/y2k/src/y2kTheme.ts
```

- [ ] Retain stock root scales, weights, families, supporting-size pins, and
      unrelated values.
- [ ] Use `{width: {below: 'md'}, pointer: 'coarse'}` for the matching profile.
- [ ] Neutral/chocolate: `typography.scale = {base: 16, ratio: 1.1736}`. Their
      semantic minima follow from Pin without extra floor writes.
- [ ] Butter/stone: `typography.scale = {base: 16, ratio: 1.2225}` plus the six
      proposed size/leading overrides shown below.
- [ ] Gothic/matcha/y2k: the same condition and six semantic writes, **without**
      `typography.scale`; their raw geometric ladder already remains correct.

Illustrative public authoring fragment for butter/stone:

```ts
adaptations: {
  rules: [
    {
      when: {width: {below: 'md'}, pointer: 'coarse'},
      value: {
        typography: {scale: {base: 16, ratio: 1.2225}},
        tokens: {
          '--text-heading-5-size': '0.875rem',
          '--text-heading-5-leading': '1.4286',
          '--text-heading-6-size': '0.75rem',
          '--text-heading-6-leading': '1.6667',
          '--text-supporting-size': '0.875rem',
          '--text-supporting-leading': '1.4286',
        },
      },
    },
  ],
},
```

The existing value resolver lets explicitly authored tokens win over values
expanded within the same rule. Matching rules then apply after root values in
order. Keep theme sources self-contained enough for the CLI's copied sources;
do not introduce an unresolvable repository-private import into a scaffold.

No production change is anticipated in these inspected mechanism files:

```text
packages/core/src/theme/expandTypeScale.ts
packages/core/src/theme/themeAdaptations.ts
packages/core/src/theme/resolveThemeValues.ts
packages/core/src/theme/generateThemeRules.ts
packages/core/src/reset.css
packages/core/src/hooks/useMediaQuery.ts
```

This is a planning observation, not a rule freezing private files. In the current
implementation, `omitRootTypeScaleDefaults` prevents a scale adaptation from
re-emitting invariant component defaults over authored root component pins. Keep
regression evidence for the observable preservation—especially the Text display
families and explicit weights—regardless of how that behavior is implemented.

The following is an illustrative excerpt of equivalent generated output, not a
new handwritten global stylesheet or a required private compilation arrangement:

```css
@layer astryx-theme {
  @media (width < 768px) and (pointer: coarse) {
    @scope ([data-astryx-theme="butter"]) to ([data-astryx-theme]) {
      :scope {
        --font-size-base: 1rem;
        --text-body-size: var(--font-size-base);
        --text-body-leading: 1.5;
        --text-heading-5-size: 0.875rem;
        --text-heading-5-leading: 1.4286;
        --text-heading-6-size: 0.75rem;
        --text-heading-6-leading: 1.6667;
        --text-supporting-size: 0.875rem;
        --text-supporting-leading: 1.4286;
        /* Remaining generated raw and semantic writes omitted. */
      }
    }
  }
}
```

The effective theme scope needs both raw and semantic results when a scale
changes. A raw-only descendant write can fail to retarget a semantic alias
already resolved on an ancestor; the existing mobile-type explorer documents
that trap. Test actual rendered semantic text, not only a raw custom property.

Reference calculation used by the inspected generator for final-size leading:

```text
target(size) = 1.5 if size < 20
               1.4 if 20 <= size < 32
               1.25 otherwise
linePx = max(
  Math.round(size * target(size) / 4) * 4,
  Math.ceil((size + 4) / 4) * 4
)
leading = roundToFourDecimals(linePx / size)
```

This explains the spec's current numeric projections; it does not require a new
public leading helper. Assert `16/24`, `14/~20`, and `12/~20` final role results,
including the four-decimal unitless values. Do not preserve old leading merely
because the new size was applied through an explicit token.

### Phase 3 — Verify token, inheritance, build, and copied-source parity

- [ ] Extend the existing tests for neutral/chocolate/butter/stone and add or
      extend same-stem tests for gothic/matcha/y2k:
      `packages/themes/<theme>/src/<theme>Theme.test.ts`.
- [ ] Assert all twelve raw sizes and fourteen semantic size/leading/weight
      triples, complete theme-specific overrides, and exact versus four-decimal Pin
      ratios. Include explicit body/h4/label/code 16px-reference checks, all small
      floors, and the separate literal supporting desktop values.
- [ ] Compare root/nonmatching tokens and component maps, not only Display 1.
- [ ] Verify condition compilation, strict boundaries, effective custom md,
      source/built inheritance, later child opt-out and larger values, root-only and
      empty-rule non-opt-outs, explicit Text size/Heading weight, nested scopes, and
      onDark/onLight collisions.
- [ ] Regenerate copied source under
      `packages/cli/assets/templates/themes/<theme>/<theme>Theme.ts` for every
      changed theme using `pnpm bundle:cli-themes`. Do not maintain divergent copies
      by hand. `scripts/check-cli-theme-bundle.test.mjs` checks byte parity.
- [ ] Build core before themes, inspect each theme's `dist/theme.css`, and verify
      runtime/static computed metrics. Built modules must retain adaptation metadata
      for equivalent extension. Existing capability rejection should remain visible
      when a build cannot support the profile.

Suggested existing focused commands, subject to the workspace's normal setup:

```bash
pnpm exec vitest run --project=node packages/themes
pnpm exec vitest run --project=ui \
  packages/core/src/theme/expandTypeScale.test.ts \
  packages/core/src/theme/themeAdaptations.test.ts \
  packages/core/src/theme/generateThemeRules.test.ts \
  packages/core/src/hooks/useMediaQuery.test.ts

pnpm -F @astryxdesign/core build
for theme in neutral chocolate butter stone gothic matcha y2k; do
  pnpm -F "@astryxdesign/theme-$theme" build
done
pnpm bundle:cli-themes
pnpm exec vitest run --project=node scripts/check-cli-theme-bundle.test.mjs
```

Commands are grounded in the inspected root `package.json`, `vitest.config.ts`,
theme package build scripts, and CLI bundle guard; their presence here is not a
claim that this implementation suite has run for the draft.

### Phase 4 — Explain the profile and provide representative examples

- [ ] Update `packages/cli/assets/docs/typography.doc.mjs` with the root/base
      distinction, named roles, full first-party endpoints, semantic floors, raw
      primitives, and the literal-versus-token-backed size distinction.
- [ ] Update `packages/cli/assets/docs/theme.doc.mjs` with the exact AND predicate,
      inherited custom md, source/built pairing, CSS-first selection, and later-rule
      customization. Existing consumer copies require an explicit update.
- [ ] In `apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx`, add a named
      first-party-policy preset if adopted. Keep generic Lift, Pin, and Custom modes
      separate; generic Pin does not currently implement the floors.
- [ ] Use `apps/storybook/stories/Text.stories.tsx` and
      `apps/storybook/stories/Heading.stories.tsx` for semantic/explicit comparison
      cases and theme family preservation.
- [ ] Include multiline body, meaningful supporting text, labels with controls,
      long translated headings, and monospace code, not only a short specimen.

If documentation or diagnostics need JavaScript observation, the existing public
hook already provides
`useMediaQuery(query: string, serverDefault = false): boolean`. It uses
`useSyncExternalStore`, MediaQueryList change events, and subscription cleanup.
The following helper is **documentation-local only**, not a new core export:

```ts
function mobileTypographyQuery(md: number): string {
  return `(width < ${md}px) and (pointer: coarse)`;
}

// Use the active theme's effective md, not a second independent breakpoint.
const matchesMobileTypography = useMediaQuery(
  mobileTypographyQuery(effectiveMd),
  false,
);
```

Do not render different text, heading levels, or required actions from that
boolean. A non-React one-shot diagnostic guards browser APIs and otherwise
returns false. A runtime theme's `useInsertionEffect` CSS injection does not
establish pre-hydration behavior; use initial built CSS and unchanged scope
markup for the no-JavaScript first-paint fixture. Read computed styles rather
than treating `useTheme`/root token values as a mobile snapshot.

### Phase 5 — Gather browser evidence and assess released compatibility

- [ ] Execute the spec's full browser/visual/device matrix and capture actual
      query results, computed metrics, and before/after pixels.
- [ ] Verify the intended matching differences and unchanged nonmatching views;
      do not silently refresh visual baselines.
- [ ] Test root preferences, fonts/scripts, 200% text enlargement, 400% reflow,
      user spacing, keyboard/assistive technology, and fixed-height consumers.
- [ ] Obtain actual iOS Safari evidence for iOS/focus-zoom claims. WebKit
      emulation is useful but not interchangeable; mark unavailable evidence pending.
- [ ] Compare each updated published package against its latest stable contract
      and supported companion-version ranges under AST-017. An automatic theme
      update is not made nonbreaking merely by calling it additive.
- [ ] If compatible, use the repository's nonbreaking category/bump pairing
      (`[feat]` → patch while 0.x). A real stable break uses `[breaking]` → minor,
      with concrete migration. Include each genuinely changed theme/CLI package;
      avoid changeset entries for version-only co-bumps.
- [ ] Describe environment, full changed-role scope, compatible module/CSS
      pairing, custom-theme rebuilds, copied-source migration, and explicit opt-out.
      Never use a document-root reset as a rollback.
- [ ] Run the normal knowledge and Changeset checks for the eventual scope:

```bash
pnpm check:knowledge
pnpm check:changesets
```

For a specification-only edit, the direct validator is also:

```bash
node scripts/check-knowledge.mjs
```

The inspected validator checks the knowledge root; it has no single-file
`--file` mode. If unrelated baseline problems exist, preserve the unmodified
baseline diagnostics, report the candidate diagnostics separately, and still
check the new records against their exact templates/schemas. Do not call a
baseline-red root check a green run.

## Verification

| Phase | Contract                                          | Evidence                                                                                                                                     |
| ----- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `spec:AST-049` ownership, provisional id, and OQ1 | Existing-owner/open-work search, explicit advisory review, human decision, reconciled records, exact draft/current metadata                  |
| 2     | `spec:AST-049/FR1`–`FR6`, `FR8`, `FR10`           | Full root and matching size/leading/weight projections, unchanged families/root/geometry, all semantic floors and literal-pin exceptions     |
| 3     | `spec:AST-049/FR3`–`FR6`, `FR8`, `FR9`            | Focused scale/condition/cascade tests; complete source/runtime/built metadata and CSS comparison; CLI copied-source parity                   |
| 4     | `spec:AST-049/FR2`, `FR3`, `FR7`–`FR9`            | Consumer docs, realistic examples, accurate named sizes, SSR false observation and cleanup, initial built-CSS fixture                        |
| 5     | `spec:AST-049/FR6`–`FR12`                         | Rendered matching/nonmatching matrix; actual named-browser evidence; zoom/reflow/spacing/scripts; released-consumer comparison and migration |

## Status

- Current phase: Phase 1, proposed contract awaiting human adoption. This
  companion preserves implementation detail; no production implementation phase
  or device test is marked complete by document authoring.
- Blockers: OQ1's semantic-floor decision; the eventual implementation's
  compatibility evidence (OQ2); rendered and actual-device evidence before
  claiming those outcomes.
- Identifier: `AST-049` is provisional. This candidate was initially drafted as
  AST-048, then renumbered when the pre-submission check found AST-048 Build
  recommendation on main. The fixed typography base ends at AST-043; current
  main at `1ffe66db85490c7c6b9fa4378e18183a66eff2f9` includes AST-048, and
  open #6042 occupies AST-044. The exact AST-049 open-PR query found no collision
  at that check. Recheck before a later submission; no reservation is claimed.
- Change boundary: draft documentation only. No source, schema, template,
  current-authority, or published-package change is performed by this plan.
