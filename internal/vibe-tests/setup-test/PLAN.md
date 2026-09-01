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

Each task declares stable task-owned `data-vibe-result` markers. They are measurement hooks, not implementation hints. The evaluator uses them to verify exact presence, task completion, keyboard reachability, visibility, clipping, center hit-testing, stack order, and—where host surfaces move into an Astryx dialog—baseline host-token styling. Fixture-owned `data-vibe-probe` markers remain the host baseline and may not be repurposed. Container text protection compares full normalized text from unmarked host descendants while excluding nested probe, result, and replacement subtrees. Each intentional replacement names exactly one fixture probe, requires the original probe to be absent afterward, and names a result that preserves its host text. Other allowances are fixture- and field-specific: host allowances may permit only text or exact position coordinates, while overlay allowances may permit only exact bounds. They never exempt host or overlay computed styles, or an entire neighboring probe.

## Controls

`conditions.json` defines four ordered controls. Astryx is preinstalled in none of them.

| Condition   | Purpose                                                                             |
| ----------- | ----------------------------------------------------------------------------------- |
| `floor`     | Task only; no added setup pointer.                                                  |
| `current`   | A pointer to the current public CLI documentation.                                  |
| `candidate` | Current pointer plus proposed existing-app guidance.                                |
| `direct`    | Exact installation edits; any residue identifies a product gap and blocks shipping. |

Guidance is committed into the sandbox baseline before execution, so the resulting diff contains only executor work.

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
8. The executor's source diff. The evaluator rejects deleted or wholesale-replaced host files, blanket resets, hardcoded `!important`, disabled dark-mode behavior, missing Astryx use, missing requested composition, and changed/deleted host probes or overlays. Replacement is judged on content, not on raw diff lines: lines are compared with their indentation and interior whitespace normalized, so wrapping a component tree in a provider — which re-indents every line under it — deletes nothing, while minifying or rewriting a file still deletes all of it.
9. A runner-recorded agent diff digest. The evaluator only measures; it never patches. A missing or mismatched digest is post-run manual intervention and fails acceptance. Measuring never writes to the sandbox either: the agent's tree is the attested artifact, so it is copied into a disposable build root and only the copy is built and served. The copy is copy-on-write where the filesystem allows and a byte copy where it does not, never a hardlink, and every symlink — the package links of a pnpm virtual store above all — resolves inside the copy, so a build's own writes — a regenerated theme artifact, `dist/`, an appended CLI log, a bundler cache — land in the copy. The original's bytes and modification times are unchanged whether the build succeeds or fails, so a cell still hashes to the digest that attested it and can be re-measured or recovered from those same bytes.
10. Public artifact safety. Measurements use stable fixture identifiers instead of local app paths, redact private paths and hosts from diagnostics, normalize provenance usage sources to a generic label, and fail closed before setup or universal aggregate reports can emit private path data.

Verdicts remain `broken-build`, `noisy`, `silent-damage`, `cosmetic-drift`, and `clean`. `passesAcceptance` is true only when the verdict is `clean`, the task contract succeeds, no escape hatch is present, and the measured diff exactly matches the runner's agent-output digest.

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
