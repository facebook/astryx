# Setup test — zero-damage Astryx adoption in established apps

**Status:** integrated preparation and measurement harness. No executor runs or model findings are committed here.

## Goal and hard stop

The goal is zero unintended host damage. Installing Astryx alone must not change any existing host radius, color, typography or font metric, spacing, shadow, border, geometry, color-mode behavior, or layer order. A requested insertion or replacement may change only that explicitly named surface.

`cosmetic-drift` remains a useful diagnostic label, but it is a failed run. The iteration loop may use failures and per-dimension deltas to refine candidate instructions; it does not authorize shipping. Candidate instructions stop and ship only after a separate final confirmation has **100% valid runs classified `clean` with task-specific success** across every supported fixture × prompt × harness/model bundle × repetition. The final confirmation permits no broken, noisy, silent-damage, or cosmetic outcomes; missing probes; visible variable, contrast, layer, overlay, or geometry regressions; escape hatches; or post-run manual edits.

A classified stochastic infrastructure failure may be rerun only under the preregistered policy in `matrix.json`. The failed attempt remains recorded. A real agent failure is a valid failing run and may not be retried away. The configured Codex bundle is blocked by an upstream empty-turn issue, so final confirmation cannot start or claim all configured bundles until that blocker clears.

Damage in the directed `direct` control is a product gap. It blocks candidate-instruction shipping; it is not an accepted limitation or a documentation result.

## Canonical fixtures

Every run starts from the shared immutable fixtures in `../fixtures/`:

- `tailwind-v4-control` — a plain React, Vite, and Tailwind v4 app with only background/foreground semantics.
- `shadcn-tailwind-v4-established` — an established shadcn-style Tailwind v4 token vocabulary and card/form/table/status surface plus a portal dialog with independently controlled tooltip and menu portals.
- `enterprise-scoped-synthetic` — an original dense app with explicit light/dark control, non-shadcn tokens, a guest design-system subtree, and a guest-scoped portal dialog whose nested menu crosses the host boundary.

`run-setup.mjs` validates each fixture recipe and hash manifest, copies the fixture into a run sandbox, and never writes to committed fixture source. Tailwind v3 remains explicitly deferred until the v4 controls and measures separate.

## Tasks

The basic setup tasks remain: install-only proof (`s0`), button insertion (`s1`), status replacement (`s2`), and selector replacement (`s3`). `s0` deliberately measures the new proof component separately from every pre-existing host probe.

The two composition tasks run on different established fixtures:

- `s4`: an Astryx tooltip and selector popup inside the existing Tailwind/shadcn dialog;
- `s5`: the existing Tailwind menu inside a new Astryx dialog in the scoped enterprise fixture.

Each task declares stable task-owned `data-vibe-result` markers. They are measurement hooks, not implementation hints. The evaluator uses them to verify exact presence, task completion, keyboard reachability, visibility, clipping, center hit-testing, stack order, and—where host surfaces move into an Astryx dialog—baseline host-token styling. Fixture-owned `data-vibe-probe` markers remain the host baseline and may not be repurposed. Container text protection compares full normalized text from unmarked host descendants while excluding nested probe, result, and replacement subtrees. Each intentional replacement names exactly one fixture probe, requires the original probe to be absent afterward, and names a result that preserves its host text. Other allowances are fixture- and field-specific: a host allowance may permit only exact position coordinates, the block-axis growth a mandated insertion causes, and—declared separately as `textInsertionOnly`—text a container _gains_, never text it loses or rewrites; an overlay allowance may permit only exact bounds. They never exempt host or overlay computed styles, a container's width, or an entire neighboring probe.

## Controls

`conditions.json` defines four ordered controls. Astryx is preinstalled in none of them.

| Condition   | Purpose                                                                             |
| ----------- | ----------------------------------------------------------------------------------- |
| `floor`     | Task only; no added setup pointer.                                                  |
| `current`   | A pointer to the current public CLI documentation.                                  |
| `candidate` | Current pointer plus proposed existing-app guidance.                                |
| `direct`    | Exact installation edits; any residue identifies a product gap and blocks shipping. |

Guidance is committed into the sandbox baseline before execution, so the resulting diff contains only executor work.

## Evaluator correctness

Five faults where the evaluator reported an unchanged host as damaged, or reported unrelated problems with the same word. None of them relaxes what the evaluator considers host damage.

**1. `hardcoded-important` read prose as code.** The check matched `/!\s*important/i` against every added line of a host source file, so an executor told — correctly, by the guidance itself — not to paper over a containment problem with `!important` failed the run for writing that reasoning down beside the workaround it chose instead. The flag is now found by parsing rather than by matching: stylesheets go through postcss, where `Declaration.important` is the parser's own answer and a comment is a `Comment` node; scripts go through the TypeScript parser, where comments are trivia and only string and template literals are examined; HTML, Vue, and Svelte are split into their `<style>` blocks, `style` attributes, and `<script>` blocks. Ignoring comments and prose does not open a way through: a literal counts when it contains a declaration carrying the flag, when it is the value of a real CSS property (taken from `CSSStyleDeclaration` rather than a hand-written list), or when it is the priority argument of `setProperty`, which the old scan could not see at all. An unparsable stylesheet falls back to a scanner that skips only comments and quoted strings.

**2. `dark-mode-disabled` read a mode arm as a disabled mode.** `astryx theme build` emits, for any theme with `light-dark()` values, `:root { color-scheme: light dark; }` paired with a light arm and its dark twin. Those rules _implement_ mode support, but a lexical `color-scheme: light` scan reads the second one as disabling dark mode — and an established host that merely re-indented its own light arm tripped the same check. `color-scheme` is now read semantically. A single-mode declaration is exempt only as a **paired mode arm**: its own selectors and at-rules scope it to exactly one mode, its value is that same mode, and the complementary arm exists at the same scope in the same file. Generated files are not ignored as a class — a file claiming an `@generated by astryx theme build` header is checked against that claim, a file that lost a mode line in the same change gets no exemption at all, and every other escape hatch is scanned inside generated artifacts exactly as before. Forcing a host to one fixed scheme, rewriting one arm of a pair, dropping an arm, and pinning `:root` beside a real pair all still fail.

**3. A mandated insertion was scored as host damage.** A task that requires a new dialog obliges the executor to put a trigger for it in the host page, and the host container then grows by exactly that block and gains exactly that block's copy. The contract can now allow exactly those, on exactly the named probe: the container's height, the two geometry fields height moves, and — declared separately as `textInsertionOnly` — text the container _gains_. That is deliberately not the same as putting `text` in `fields`: every baseline word must still be present in its original order, so a container that may grow still cannot lose or rewrite the host's own copy. `text` has been removed from the exemptible host fields entirely, so no contract can ever wave the comparison through, and the container's position, its width, every computed style on it, and every other probe stay exact.

**4. A lost token boundary was indistinguishable from a restyle.** An established app frequently scopes part of its palette to a region, so host markup relocated into a design-system overlay can leave that region and fall back to global values — the classes do not change and the colour does, which reads like the design system repainting a host component and is not. Each measured surface now records which host token scopes it sits inside, and a mismatch against the reference reports as `host-boundary`, separately from the colours. The two have opposite fixes: restore the boundary, or accept a surface that matches today and silently desynchronizes the next time the host retunes its palette. Restating the colours is explicitly not a fix and cannot buy a pass, and keeping the boundary does not excuse a real repaint. Those scopes are declared per fixture in `probes.json`, because which selector marks a region is a fact about that host's CSS; an executor is never told them.

**5. The report spelled four different failures the same way.** `verdict` collapses measured host damage, an escape hatch, a task failure, and a broken measurement into `silent-damage`, which is right for a gate and useless in a report: an `!important` misread from a comment and a repainted host arrived as the same word. The score now also carries a failure breakdown — `hostDamage`, `runtime`, `integrity`, `task`, `telemetry` — and the per-cell table names the cause beside the verdict. Separately, a run whose executor did not complete is marked not comparable: nothing damaged the host because the work stopped, and that is not evidence about the condition it ran under.

## Hermetic measurement

Measurement reads a sandbox; it must not write to one. That tree is the attested artifact — the runner digested its bytes, the integrity checker reads them, and any re-measurement or recovery has to read them again — and building in place destroyed it: the fixtures' `prebuild` regenerates the app-owned theme over the executor's copy, `vite build` writes `dist/`, the CLI appends to its invocation log, and the bundler caches into `node_modules`. A failed build leaves the same debris. A measured cell then no longer hashed to its own digest and its evidence could not be re-derived.

**The build runs in a disposable copy.** Files are copied with `cp -a --reflink=auto`, which shares extents copy-on-write where the filesystem supports it and byte-copies where it does not, with a pure-Node fallback for a platform without a usable `cp`. It never hardlinks: a hardlinked file rewritten in the copy rewrites the original inode.

**The pnpm virtual store is copied, not linked.** A pnpm `node_modules` is mostly links into `.pnpm`, the store holding every real package tree, so mirroring it with a symlink hands the copy a door straight back into the sandbox — writing through a symlink writes to its target, and an install or rebuild in the copy would rewrite the original's store. Symlinks keep their target text, so a package link resolves within the copy; an absolute link that would reach into the sandbox is retargeted onto the copy, while one pointing at a workspace package elsewhere is left alone. `verifyWorkspaceIsolation` re-derives that claim from the finished copy — every symlink resolved, and inodes compared against the original — and the measurer runs it before any build. The build root is removed on every path out, including a thrown measurement.

Tests take a full byte-and-mtime manifest of the sandbox before and after a real measurement and require it identical for a build that succeeds and a build that fails, with the virtual store included. Mutation proofs put each way of getting it wrong back — the mirrored store, and a hardlinked copy — and show the sandbox is written through and the isolation check names it. Measurement output is unchanged: stable fixture ids, no private paths, and the build root redacted alongside them.

**Probes are read at rest.** `getComputedStyle` on an element with a running transition returns the interpolated value, which Chromium serializes in the interpolation space rather than the space the value was authored in — so a host colour that never changed reads back as `oklab(…)` mid-transition and `oklch(…)` at rest. The numbers are identical, only the spelling differs, and an exact comparison scores that as host damage. The harness triggers these itself, by clicking host controls to open an interaction, and whether a read lands inside the transition window depends on how fast the app's own bundle responds — which is stable per app, so it misreads deterministically for some apps and never for others. Running transitions are now settled before any read. Only `CSSTransition` is awaited: transitions always finish, while an infinite decorative animation never would.

**Container text counts only what the browser renders.** A container's protected text excludes task-owned subtrees, because a task that mandates a control necessarily adds that control's text. It could not exclude an overlay the design system hoists _out_ of the task-owned element — a `Button` with a `tooltip` renders it as a `display: none` sibling linked by `aria-describedby` — so a mandated control's own closed tooltip landed in the host container's text and scored as host damage while nothing on screen had changed. Unrendered subtrees no longer count. This is not a hole an executor can hide damage in: removing, rewriting, or hiding host copy all still change the string, and only invisible _additions_ stop counting.

**The local file server binds what it fetches.** `server.listen(0, …)` with no host binds the wildcard — `::` wherever Node has IPv6 — while the page fetch was a hardcoded `http://127.0.0.1:<port>`. Those agree only where the host maps v4-in-v6; where they do not, every page load fails to connect and the run looks like a broken app. The server now binds IPv4 loopback explicitly and the origin is read back from the socket, with a wildcard rewritten to the loopback of its own family and IPv6 literals bracketed. Measurement needs no network namespace or loopback shim; if a runner wraps it in one out of habit, drop the wrapper.

## Measurement and integrity

All conditions use the same evaluator against a pristine copy of the same fixture in light and dark modes:

1. Typecheck and production build.
2. Console, page, and failed-request errors.
3. Exact computed-style comparisons for color/background; per-side border color, width, and style; all four radii; shadow; font family, size, weight, line height, and letter spacing; per-side padding and margin; gaps; dimensions; position; and transform.
4. Exact `getBoundingClientRect()` snapshots after Chromium values are serialized to 1/64 CSS px, the browser's subpixel grid. This is normalization, not a pass tolerance: normalized values must match exactly.
5. WCAG AA contrast regressions, color-mode behavior, emitted cascade order, and visible consequences of changed host variables. Variable changes alone remain diagnostic only when every marked host computed style and geometry snapshot is unchanged.
6. Existing host overlays and both cross-system composition directions: presence, keyboard reachability, visibility, viewport intersection, clipping ancestors, center hit target, top-layer state, and stack order above dialog and backdrop.
7. Task-specific output markers and semantics, kept separate from host baseline probes.
8. The executor's source diff. The evaluator rejects deleted or wholesale-replaced host files, blanket resets, hardcoded `!important`, disabled dark-mode behavior, missing Astryx use, missing requested composition, and changed/deleted host probes or overlays. Replacement is judged on content, not on raw diff lines: lines are compared with their indentation and interior whitespace normalized, so wrapping a component tree in a provider — which re-indents every line under it — deletes nothing, while minifying or rewriting a file still deletes all of it. Disabled dark mode is judged semantically: a single-mode `color-scheme` declaration passes only as one arm of a mode-scoped light/dark pair in the same file, so a built theme is clean while forcing one fixed scheme still fails. A hardcoded `!important` is judged syntactically: the flag is found by parsing the file, so a comment or a prose string that names it is silent while a declaration that carries it fails wherever it is written — in a stylesheet, a style object, a CSS-in-JS value, an inline style, a `cssText` write, or a `setProperty` priority argument.
9. A runner-recorded agent diff digest. The evaluator only measures; it never patches. A missing or mismatched digest is post-run manual intervention and fails acceptance. Measuring never writes to the sandbox either: the agent's tree is the attested artifact, so it is copied into a disposable build root and only the copy is built and served. The copy is copy-on-write where the filesystem allows and a byte copy where it does not, never a hardlink, and every symlink — the package links of a pnpm virtual store above all — resolves inside the copy, so a build's own writes — a regenerated theme artifact, `dist/`, an appended CLI log, a bundler cache — land in the copy. The original's bytes and modification times are unchanged whether the build succeeds or fails, so a cell still hashes to the digest that attested it and can be re-measured or recovered from those same bytes.
10. Public artifact safety. Measurements use stable fixture identifiers instead of local app paths, redact private paths and hosts from diagnostics, normalize provenance usage sources to a generic label, and fail closed before setup or universal aggregate reports can emit private path data.

Verdicts remain `broken-build`, `noisy`, `silent-damage`, `cosmetic-drift`, and `clean`. `passesAcceptance` is true only when the verdict is `clean`, the task contract succeeds, no escape hatch is present, and the measured diff exactly matches the runner's agent-output digest.

The verdict is a gate, not a description. Several unrelated failures reduce to `silent-damage`, so every report also carries the failure kind — `hostDamage`, `runtime`, `integrity`, `task`, `telemetry` — and names it beside the verdict. Only `hostDamage` means the host changed.

## Exploratory iteration rule

The guidance report compares current and candidate runs cell-for-cell and prints candidate-minus-current deltas for every hard dimension: build, runtime, task completion, color, font, radius, border, shadow, geometry, contrast, and layering. It never collapses those results into a weighted score or an automatic advance/reject decision.

The operator reviews the explicit tradeoffs while refining instructions. A large gain with a small regression may be a useful next iteration, while a balanced tradeoff may not be; the harness does not invent a threshold for that judgment. This flexibility applies only to exploratory A/B selection. Final confirmation has no tradeoff allowance: every valid run must pass strict acceptance.

## Matrix and exact counts

Four paired executor bundles remain configured: native/Claude-family, Claude Code/Claude-family, native/GPT-family, and Codex/GPT-family. Exact model versions come from execution provenance.

Prompt applicability produces 14 fixture-prompt pairs: four basic tasks across three fixtures (12), plus one cross-system task on each established fixture (2).

1. **Separation — 48 prepared runs:** `3 fixtures × 2 controls × s1 × 4 bundles × K=2`.
2. **Guidance iteration — 400 additional prepared runs:** the full four-condition matrix has 448 unique cells; reuse the 48 separation cells and prepare the other 400. No control evidence is rerun or double-counted.
3. **Final confirmation — 112 required valid runs:** `14 supported fixture-prompt pairs × candidate × 4 bundles × K=2`.

The repository prepares tasks and sandboxes but does not launch executors. Missing, blocked, invalid, or omitted cells make the confirmation incomplete; they do not shrink its denominator.

## Commands

```bash
# Validate matrix expansion, evaluators, integrity checks, and provenance.
pnpm vitest run internal/vibe-tests/setup-test --project node

# Prepare one small cell without launching an executor.
node internal/vibe-tests/setup-test/run-setup.mjs \
  --stage separation \
  --fixtures tailwind-v4-control \
  --conditions floor \
  --prompts s1 \
  --bundles native-claude \
  --reps 1 \
  --out /tmp/setup-test

# Immediately after the executor settles, record this command's diffSha256 as
# execution.agentDiffSha256 in the sidecar before measurement.
node internal/vibe-tests/setup-test/setup-integrity.mjs --app <sandbox>

# Measure without modifying source and carry the sidecar forward.
node internal/vibe-tests/setup-test/setup-measure.mjs \
  --app <sandbox> \
  --fixture tailwind-v4-control \
  --provenance <run.provenance.json> \
  --out <measurement.json>
```
