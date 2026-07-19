// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file form-eval.ts — form-specific deterministic evaluation
 *
 * Scores generated FORM code across 5 form-specific dimensions on a 0-100 scale,
 * composed on top of the universal 5 (correctness/a11y/codeQuality/efficiency/
 * maintainability). All analyzers are pure functions with NO LLM calls.
 *
 * Fairness (see README "Checker Protocol"):
 *   - The JUDGMENT is identical across the four form frameworks. Only the
 *     COUNTING differs, because each framework expresses the same concept with
 *     a different idiom (e.g. Formentor `fields.x.render` ≡ RHF `<Controller>` ≡
 *     Formisch `<Field>` ≡ TanStack `form.Field`/`useFieldContext`). A branch is
 *     only allowed to recognize the equivalent concept for its target — never to
 *     hand one target a bonus or penalty the others cannot earn.
 *   - The design system is CONSTANT (Astryx), so "idiomatic use" measures form-
 *     framework wiring ceremony, not component choice.
 *
 * Dimensions:
 *   1. schemaFidelity       — did it model the data shape + constraints correctly?
 *   2. validationCorrectness — right validation for the ask (required/format/
 *                              cross-field/async), wired so it actually runs?
 *   3. formA11y             — label assoc, error wiring, submit semantics
 *   4. stateSubmission      — controlled state, submit handling, no phantom bugs
 *   5. idiomaticUse         — used the framework's binding vs hand-rolled useState
 */

import type {DimensionScore, UniversalFinding} from './types.js';

export type FormTarget = 'formentor' | 'formisch' | 'tanstack' | 'rhf';

export type FormDimension =
  | 'schemaFidelity'
  | 'validationCorrectness'
  | 'formA11y'
  | 'stateSubmission'
  | 'idiomaticUse';

export interface FormScore {
  schemaFidelity: DimensionScore;
  validationCorrectness: DimensionScore;
  formA11y: DimensionScore;
  stateSubmission: DimensionScore;
  idiomaticUse: DimensionScore;
}

/** Behaviors the prompt expects — used for eval only, never shown to agents. */
export interface FormPromptSpec {
  id: string;
  category: string;
  tier: 'core' | 'stretch';
  expectedBehaviors: string[];
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ── Concept detectors (target-aware, equivalent judgments) ───────────────────

/** Did the solution declare a schema / typed data shape (each framework's way)? */
function hasSchema(code: string, target: FormTarget): boolean {
  switch (target) {
    case 'formentor':
      return /\bobject\s*\(\s*\{[\s\S]*properties/.test(code);
    case 'formisch':
      return /\bv\.object\s*\(/.test(code) || /valibot/.test(code);
    case 'tanstack':
    case 'rhf':
      // Zod/Valibot/Standard Schema object, or explicit typed defaultValues.
      return (
        /\bz\.object\s*\(/.test(code) ||
        /\bv\.object\s*\(/.test(code) ||
        /defaultValues\s*:/.test(code)
      );
    default:
      return false;
  }
}

/** Count field bindings through the framework's field primitive. */
function fieldBindingCount(code: string, target: FormTarget): number {
  switch (target) {
    case 'formentor':
      return (code.match(/\bfields\.\w+\.render\s*\(/g) ?? []).length +
        // Auto-layout render() counts as binding all fields at once.
        (/\bform\.render\s*\(\s*\)/.test(code) ? 1 : 0);
    case 'formisch':
      return (code.match(/<(Astryx\w*Field|Field)\b/g) ?? []).length;
    case 'tanstack':
      return (code.match(/<form\.(App)?Field\b/g) ?? []).length +
        (code.match(/<Astryx\w*Field\b/g) ?? []).length;
    case 'rhf':
      return (code.match(/<(Astryx\w*Field|Controller)\b/g) ?? []).length;
    default:
      return 0;
  }
}

/** Did they express validation the framework's way (schema or validator hook)? */
function hasValidationWiring(code: string, target: FormTarget): boolean {
  // A schema with non-optional fields encodes required-ness by default in every
  // framework (Formentor non-omissible, Valibot/Zod non-optional). So a declared
  // schema is itself basic (required-field) validation — recognized equally for
  // all targets so no framework is penalized for expressing "required" tersely.
  if (hasSchema(code, target)) {
    return true;
  }
  const common =
    /\bvalidate\b|\brequired\b|minLength|maxLength|\bmin\b|\bmax\b|\bemail\b|refine|check|\bpipe\b/;
  switch (target) {
    case 'formentor':
      return common.test(code) || /format\s*:/.test(code);
    case 'formisch':
      return /v\.(pipe|email|minLength|minValue|maxValue|check|forward)/.test(code) ||
        common.test(code);
    case 'tanstack':
      return /validators\s*:/.test(code) || /onChange|onSubmit|onBlur/.test(code) ||
        common.test(code);
    case 'rhf':
      return /resolver\s*:/.test(code) || /rules\s*=/.test(code) || common.test(code);
    default:
      return false;
  }
}

/** Cross-field validation present (password==confirm style). */
function hasCrossFieldValidation(code: string, target: FormTarget): boolean {
  switch (target) {
    case 'formentor':
      // form-level validate that compares two fields
      return /validate\s*:\s*\([\s\S]*\)\s*=>[\s\S]*(===|!==)/.test(code) &&
        /valuePath|fail\s*\(/.test(code);
    case 'formisch':
      return /v\.forward|v\.check/.test(code);
    case 'tanstack':
    case 'rhf':
      return /\.refine|\.superRefine|superRefine/.test(code);
    default:
      return false;
  }
}

/** Submit-time / async validation wired. */
function hasSubmitOrAsync(code: string, target: FormTarget): boolean {
  const async = /\basync\b|await|fetch\(|Promise|signal/;
  switch (target) {
    case 'formentor':
      return /onSubmit\s*:/.test(code) && (async.test(code) || /fail\s*\(/.test(code));
    case 'formisch':
      return /onSubmit\s*=/.test(code) || async.test(code);
    case 'tanstack':
      return /onSubmit\s*:/.test(code) || /onSubmitAsync/.test(code) || async.test(code);
    case 'rhf':
      return /handleSubmit\s*\(/.test(code) || /setError/.test(code) || async.test(code);
    default:
      return false;
  }
}

/** Uses the framework's controlled binding rather than raw useState per field. */
function usesFrameworkState(code: string, target: FormTarget): boolean {
  return fieldBindingCount(code, target) > 0;
}

/** Count raw useState hooks (hand-rolled field state = ceremony/anti-idiom). */
function rawUseStateCount(code: string): number {
  return (code.match(/useState\s*[<(]/g) ?? []).length;
}

/** Raw HTML inputs used instead of Astryx components (design system is constant!). */
function rawInputCount(code: string): number {
  return (code.match(/<(input|select|textarea)\b/gi) ?? []).length;
}

// ── Dimension analyzers ──────────────────────────────────────────────────────

function scoreSchemaFidelity(
  code: string,
  target: FormTarget,
  spec: FormPromptSpec,
): DimensionScore {
  const findings: UniversalFinding[] = [];
  let score = 100;

  if (!hasSchema(code, target)) {
    // RHF/TanStack can be typed via defaultValues without a schema for trivial
    // forms; only penalize when the prompt implies constraints/validation.
    const needsSchema = spec.expectedBehaviors.some((b) =>
      /valid|match|min|max|integer|required|format/i.test(b),
    );
    if (needsSchema) {
      findings.push({
        rule: 'no-schema',
        severity: 'critical',
        detail: 'No schema / typed data shape for a form that needs validation',
      });
      score -= 40;
    } else {
      score -= 10;
    }
  }

  // Reward modeling optional/required distinction when the prompt calls for it.
  const needsOptional = spec.expectedBehaviors.some((b) => /optional/i.test(b));
  if (needsOptional) {
    const modelsOptional =
      /omissible|optional|\.optional\(\)|voidable|isOptional/.test(code);
    if (!modelsOptional) {
      findings.push({
        rule: 'missing-optional',
        severity: 'moderate',
        detail: 'Prompt calls for an optional field but none is modeled optional',
      });
      score -= 15;
    }
  }

  return {score: clamp(score), findings};
}

function scoreValidationCorrectness(
  code: string,
  target: FormTarget,
  spec: FormPromptSpec,
): DimensionScore {
  const findings: UniversalFinding[] = [];
  let score = 100;

  const needsValidation = spec.expectedBehaviors.some((b) =>
    /valid|match|min|max|integer|required|format|check/i.test(b),
  );
  if (needsValidation && !hasValidationWiring(code, target)) {
    findings.push({
      rule: 'no-validation',
      severity: 'critical',
      detail: 'Prompt requires validation but none is wired',
    });
    score -= 40;
  }

  const needsCrossField = spec.expectedBehaviors.some((b) =>
    /match|cross-field|confirm/i.test(b),
  );
  if (needsCrossField && !hasCrossFieldValidation(code, target)) {
    findings.push({
      rule: 'no-cross-field',
      severity: 'critical',
      detail: 'Prompt requires cross-field validation (e.g. password match) but none present',
    });
    score -= 30;
  }

  const needsAsync = spec.expectedBehaviors.some((b) =>
    /async|server|check with the server|taken|availab/i.test(b),
  );
  if (needsAsync && !hasSubmitOrAsync(code, target)) {
    findings.push({
      rule: 'no-submit-validation',
      severity: 'moderate',
      detail: 'Prompt implies server/submit-time validation but none is wired',
    });
    score -= 20;
  }

  return {score: clamp(score), findings};
}

function scoreFormA11y(code: string, target: FormTarget): DimensionScore {
  const findings: UniversalFinding[] = [];
  let score = 100;

  // Design system is constant: Astryx inputs carry label/aria wiring. Raw HTML
  // inputs bypass that and are the main a11y regression across all targets.
  const raw = rawInputCount(code);
  if (raw > 0) {
    findings.push({
      rule: 'raw-input',
      severity: 'critical',
      detail: `${raw} raw HTML <input>/<select>/<textarea> instead of Astryx inputs (loses built-in label/aria wiring)`,
      count: raw,
    });
    score -= Math.min(60, raw * 20);
  }

  // Submit affordance present. Recognize each framework's idiom, including
  // Formentor's auto-layout `form.render()` and explicit `submitButton.render()`,
  // which generate the submit button without a literal type="submit" in source.
  const hasSubmit =
    /type=["']submit["']|handleSubmit|\.submit\(|submitButton|form\.render\s*\(/.test(
      code,
    );
  if (!hasSubmit) {
    findings.push({
      rule: 'no-submit',
      severity: 'moderate',
      detail: 'No discernible submit affordance',
    });
    score -= 15;
  }

  // Bound labels: every Astryx field component / render carries a label prop.
  const labelledFields = (code.match(/label\s*[=:]/g) ?? []).length;
  const bindings = fieldBindingCount(code, target);
  if (bindings > 0 && labelledFields === 0 && !/form\.render\s*\(\s*\)/.test(code)) {
    findings.push({
      rule: 'unlabelled-fields',
      severity: 'moderate',
      detail: 'Field bindings without visible label props',
    });
    score -= 15;
  }

  return {score: clamp(score), findings};
}

function scoreStateSubmission(
  code: string,
  target: FormTarget,
): DimensionScore {
  const findings: UniversalFinding[] = [];
  let score = 100;

  // Phantom handlers that never fire in React DOM (applied equally to all).
  if (/\bonPress\b/.test(code)) {
    findings.push({
      rule: 'phantom-onpress',
      severity: 'critical',
      detail: 'onPress is React Native; never fires in React DOM',
    });
    score -= 30;
  }

  // Hand-rolled per-field useState defeats the framework — count it as ceremony
  // and a state-integrity risk. Frameworks manage state; a couple of useState
  // for UI toggles (e.g. view/edit) is fine, so only penalize excess.
  const useStates = rawUseStateCount(code);
  const usesFramework = usesFrameworkState(code, target);
  if (usesFramework && useStates > 2) {
    findings.push({
      rule: 'redundant-usestate',
      severity: 'moderate',
      detail: `${useStates} useState hooks alongside framework-managed fields`,
      count: useStates,
    });
    score -= Math.min(30, (useStates - 2) * 10);
  }
  if (!usesFramework && useStates > 0) {
    findings.push({
      rule: 'hand-rolled-state',
      severity: 'critical',
      detail: 'Form state hand-rolled with useState instead of the form framework',
    });
    score -= 40;
  }

  return {score: clamp(score), findings};
}

function scoreIdiomaticUse(
  code: string,
  target: FormTarget,
): DimensionScore {
  const findings: UniversalFinding[] = [];
  let score = 100;

  const bindings = fieldBindingCount(code, target);
  if (bindings === 0) {
    findings.push({
      rule: 'no-framework-binding',
      severity: 'critical',
      detail: `No ${target} field bindings — the framework under test is not actually used`,
    });
    score -= 50;
  }

  // Raw inputs when the whole point is to bind Astryx inputs via the framework.
  const raw = rawInputCount(code);
  if (raw > 0) {
    findings.push({
      rule: 'raw-input-not-idiomatic',
      severity: 'moderate',
      detail: `${raw} raw HTML input(s) instead of the framework+Astryx binding`,
      count: raw,
    });
    score -= Math.min(40, raw * 15);
  }

  return {score: clamp(score), findings};
}

/**
 * Run all 5 form-specific analyzers.
 */
export function evaluateForm(
  code: string,
  target: FormTarget,
  spec: FormPromptSpec,
): FormScore {
  return {
    schemaFidelity: scoreSchemaFidelity(code, target, spec),
    validationCorrectness: scoreValidationCorrectness(code, target, spec),
    formA11y: scoreFormA11y(code, target),
    stateSubmission: scoreStateSubmission(code, target),
    idiomaticUse: scoreIdiomaticUse(code, target),
  };
}

export function getFormDimensionNames(): FormDimension[] {
  return [
    'schemaFidelity',
    'validationCorrectness',
    'formA11y',
    'stateSubmission',
    'idiomaticUse',
  ];
}

export function getFormAverage(score: FormScore): number {
  const dims = getFormDimensionNames();
  const total = dims.reduce((sum, d) => sum + score[d].score, 0);
  return Math.round(total / dims.length);
}
