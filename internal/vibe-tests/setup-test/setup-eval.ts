// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-eval.ts
 * @input Two measurement JSONs from setup-measure.mjs: the pristine app, and an arm
 * @output A deterministic score for what installing the system did to the app
 * @position internal/vibe-tests/setup-test — the scoring half
 *
 * The claim this file encodes: a setup is not "correct" because it compiles. It
 * is correct when the app that already existed still looks and reads the way it
 * did, and the system's own components render properly beside it. So every
 * measure here is a DELTA against the app before the install — never an absolute
 * judgement of taste, which is what the nightly evaluation is for.
 *
 * No LLM in this path. Every arm is measured by the same code and the analyzers
 * never see the condition id (Checker Protocol §1).
 */

// ── measurement shapes (mirror setup-measure.mjs) ────────────────────

export type ProbeReading =
  | {missing: true}
  | {style: Record<string, string>; text: string; contrast: number | null};

export type SchemeReading = {
  probes: Record<string, ProbeReading>;
  variables: Record<string, string>;
  colorScheme: string;
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
};

export type Measurement = {
  label: string;
  build: {
    ok: boolean;
    status: number;
    ms: number;
    stdout: string;
    stderr: string;
  };
  schemes: Record<'light' | 'dark', SchemeReading>;
};

export type Scheme = 'light' | 'dark';

// ── categories ───────────────────────────────────────────────────────

export type Category = 'typography' | 'color' | 'geometry' | 'spacing';

const CATEGORY_OF: Record<string, Category> = {
  color: 'color',
  backgroundColor: 'color',
  borderColor: 'color',
  boxShadow: 'color',
  fontFamily: 'typography',
  fontSize: 'typography',
  fontWeight: 'typography',
  lineHeight: 'typography',
  letterSpacing: 'typography',
  borderRadius: 'geometry',
  borderWidth: 'geometry',
  height: 'spacing',
  paddingLeft: 'spacing',
  paddingTop: 'spacing',
};

export const categoryOf = (property: string): Category =>
  CATEGORY_OF[property] ?? 'geometry';

// ── 1. regressions: the app's own chrome moved ───────────────────────

export type Regression = {
  probe: string;
  property: string;
  category: Category;
  before: string;
  after: string;
};

/**
 * Every computed property that changed on a piece of the app the task never
 * asked anyone to touch. A probe the arm dropped is reported as `missing`, not
 * skipped — a setup that deletes the app's chrome must not score as clean.
 */
export function regressions(
  before: SchemeReading,
  after: SchemeReading,
): {changed: Regression[]; missing: string[]} {
  const changed: Regression[] = [];
  const missing: string[] = [];
  for (const [probe, baselineReading] of Object.entries(before.probes)) {
    const armReading = after.probes[probe];
    if (!armReading || 'missing' in armReading) {
      if (!('missing' in baselineReading)) {
        missing.push(probe);
      }
      continue;
    }
    if ('missing' in baselineReading) {
      continue;
    }
    for (const [property, value] of Object.entries(baselineReading.style)) {
      const armValue = armReading.style[property];
      if (armValue !== undefined && armValue !== value) {
        changed.push({
          probe,
          property,
          category: categoryOf(property),
          before: value,
          after: armValue,
        });
      }
    }
  }
  return {changed, missing};
}

export function countByCategory(
  changed: Regression[],
): Record<Category, number> {
  const counts: Record<Category, number> = {
    typography: 0,
    color: 0,
    geometry: 0,
    spacing: 0,
  };
  for (const r of changed) {
    counts[r.category] += 1;
  }
  return counts;
}

// ── 2. legibility: the delta that is not cosmetic ────────────────────

export type ContrastFinding = {probe: string; before: number; after: number};

/**
 * Text that stopped being readable. Counting changed properties alone cannot
 * separate "the font moved half a step" from "the text is now the same colour
 * as the surface" — and both arms of a real run produced the same COUNT while
 * one of them was unreadable. WCAG AA body text is 4.5:1; this reports a probe
 * that was above the floor before the install and is below it after.
 */
export function contrastFailures(
  before: SchemeReading,
  after: SchemeReading,
  floor = 4.5,
): ContrastFinding[] {
  const findings: ContrastFinding[] = [];
  for (const [probe, baselineReading] of Object.entries(before.probes)) {
    const armReading = after.probes[probe];
    if (
      'missing' in baselineReading ||
      !armReading ||
      'missing' in armReading
    ) {
      continue;
    }
    const b = baselineReading.contrast;
    const a = armReading.contrast;
    if (b == null || a == null) {
      continue;
    }
    if (b >= floor && a < floor) {
      findings.push({probe, before: b, after: a});
    }
  }
  return findings;
}

// ── 3. mode dependence: "works on my machine", made measurable ───────

/**
 * Probes that render differently under `prefers-color-scheme: light` and `dark`
 * in the ARM, but did not in the app before the install.
 *
 * This is the finding a single-scheme test cannot produce. The system paints
 * through `light-dark()`; an app whose dark look is its own CSS variables has no
 * `data-theme` for the system to read, so an install that omits the color-scheme
 * wiring is correct on a dark-mode laptop and broken in headless CI — or on a
 * colleague's machine.
 */
export function modeDependence(
  baseline: Measurement,
  arm: Measurement,
): string[] {
  const wasStable = (probe: string) => stable(baseline, probe);
  const isStable = (probe: string) => stable(arm, probe);
  const probes = Object.keys(arm.schemes.light.probes);
  return probes.filter(probe => wasStable(probe) && !isStable(probe));
}

function stable(m: Measurement, probe: string): boolean {
  const light = m.schemes.light.probes[probe];
  const dark = m.schemes.dark.probes[probe];
  if (!light || !dark || 'missing' in light || 'missing' in dark) {
    return true;
  }
  return JSON.stringify(light.style) === JSON.stringify(dark.style);
}

// ── 4. cascade inversion: the layer statement in the wrong place ─────

/**
 * True when a system layer ends up ranking ABOVE the app's utility layer.
 *
 * The recipe's whole job is to put the system's sheets between the app's base
 * and its utilities, so a utility class the app already uses still wins. Whether
 * it does is decided by WHERE the `@layer` statement sits: the statement only
 * orders names that are not yet registered, so below the app's own Tailwind
 * import it can only append the system's layers after `utilities` — silently
 * inverting the thing the recipe exists to arrange.
 *
 * Worth detecting separately from the regression count because the two do not
 * agree on severity: an inverted cascade is one edit away from correct, and it
 * damages more of the app than the recipe it was trying to follow.
 */
export function cascadeInverted(
  layerOrder: string[] | undefined,
  {systemPrefix = 'astryx', utilityLayer = 'utilities'} = {},
): boolean {
  if (!layerOrder?.length) {
    return false;
  }
  const utilities = layerOrder.indexOf(utilityLayer);
  if (utilities === -1) {
    return false;
  }
  return layerOrder.some(
    (layer, i) => i > utilities && layer.startsWith(systemPrefix),
  );
}

// ── 5. variable capture: names the app already owned ─────────────────

export type VariableFinding = {name: string; before: string; after: string};

/**
 * Root custom properties whose resolved value changed. An existing Tailwind app
 * owns a vocabulary (`--color-card`, `--radius-md`, `--spacing`, `--text-xs`, …)
 * and the system's Tailwind bridge declares the same names, so importing it
 * re-points utilities the app is already using — everywhere, silently. The
 * inverse also matters: a name that resolves EMPTY after the install is one the
 * app's own CSS can no longer read.
 */
export function variableCapture(
  before: SchemeReading,
  after: SchemeReading,
): VariableFinding[] {
  const findings: VariableFinding[] = [];
  for (const [name, value] of Object.entries(before.variables)) {
    const armValue = after.variables[name];
    if (armValue !== undefined && armValue !== value) {
      findings.push({name, before: value, after: armValue});
    }
  }
  return findings;
}

// ── 6. the score ─────────────────────────────────────────────────────

export type SetupScore = {
  label: string;
  /** Did the app still build? A setup that does not compile fails everything below. */
  builds: boolean;
  /** Did it render without shouting? Note that a silent page proves nothing on its own. */
  clean: boolean;
  consoleErrors: number;
  failedRequests: number;
  /** Probes of the app's own chrome the install moved, in the reference scheme. */
  regressions: number;
  byCategory: Record<Category, number>;
  missingProbes: string[];
  /** Text that fell below the readability floor. This is the severity axis. */
  contrastFailures: ContrastFinding[];
  /** Probes the install made OS-color-scheme dependent. */
  modeDependent: string[];
  /** Root variables whose value the install changed or emptied. */
  variablesCaptured: VariableFinding[];
  /** The system's layers outrank the app's utilities — the recipe, inverted. */
  cascadeInverted: boolean;
  layerOrder: string[];
};

export function scoreArm(
  baseline: Measurement,
  arm: Measurement,
  {scheme = 'light' as Scheme} = {},
): SetupScore {
  if (!arm.build.ok) {
    return {
      label: arm.label,
      builds: false,
      clean: false,
      consoleErrors: 0,
      failedRequests: 0,
      regressions: 0,
      byCategory: {typography: 0, color: 0, geometry: 0, spacing: 0},
      missingProbes: [],
      contrastFailures: [],
      modeDependent: [],
      variablesCaptured: [],
      cascadeInverted: false,
      layerOrder: [],
    };
  }
  const before = baseline.schemes[scheme];
  const after = arm.schemes[scheme];
  const {changed, missing} = regressions(before, after);
  return {
    label: arm.label,
    builds: true,
    clean:
      after.consoleErrors.length === 0 &&
      after.pageErrors.length === 0 &&
      after.failedRequests.length === 0,
    consoleErrors: after.consoleErrors.length + after.pageErrors.length,
    failedRequests: after.failedRequests.length,
    regressions: changed.length,
    byCategory: countByCategory(changed),
    missingProbes: missing,
    contrastFailures: contrastFailures(before, after),
    modeDependent: modeDependence(baseline, arm),
    variablesCaptured: variableCapture(before, after),
    cascadeInverted: cascadeInverted(arm.layerOrder),
    layerOrder: arm.layerOrder ?? [],
  };
}

/**
 * The one-line verdict. `silent-damage` is the outcome this whole test exists to
 * name: it built, it rendered, nothing complained, and the app is wrong.
 */
export type Verdict =
  'broken-build' | 'noisy' | 'silent-damage' | 'cosmetic-drift' | 'clean';

export function verdict(score: SetupScore): Verdict {
  if (!score.builds) {
    return 'broken-build';
  }
  if (
    score.contrastFailures.length > 0 ||
    score.missingProbes.length > 0 ||
    score.cascadeInverted
  ) {
    return score.clean ? 'silent-damage' : 'noisy';
  }
  if (!score.clean) {
    return 'noisy';
  }
  return score.regressions > 0 || score.modeDependent.length > 0
    ? 'cosmetic-drift'
    : 'clean';
}
