// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentAdaptations.ts
 * @input One component's authored adaptation policy and the effective width map
 * @output Public component-adaptation authoring types plus package-internal
 *   validation and media-query compilation for the JavaScript resolver
 * @position spec:AST-031 FR1/FR2/IR1/IR3. Split surface: the AUTHORING
 *   VOCABULARY below (`ComponentAdaptations`, `ComponentAdaptationRule`,
 *   `ComponentAdaptationCondition`) is exported from the package entry point,
 *   because Selector's `adaptations` prop is a public policy a caller cannot
 *   type without it. Everything under "Package-internal compilation" is not:
 *   components own their public policy props, and the compiler stays behind
 *   them.
 *
 * A component adaptation is ONE closed policy value, not a bag of conditional
 * props: `default` is the server-rendered, hydration, and no-match value, and
 * ordered `rules` map environmental conditions to the same value domain. Rule
 * order is precedence — the LAST matching rule wins — and condition shape
 * creates no specificity score. An empty rule list is well-formed and resolves
 * to `default` everywhere.
 *
 * Conditions reuse AST-012's grammar through ./adaptationConditions.ts, closed
 * to `width` and `pointer`. Contrast and motion stay CSS-owned: they must not
 * silently become structural switches.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/adaptationConditions.ts (shared condition grammar)
 * - /packages/core/src/theme/useComponentAdaptations.ts (runtime resolver)
 * - /packages/core/src/theme/index.ts (re-exports the authoring vocabulary
 *   only; the compiler stays package-internal)
 * - /packages/core/src/Selector/Selector.tsx (first public consumer)
 * - /packages/core/src/theme/componentAdaptations.test.ts
 */

import {
  COMPONENT_ADAPTATION_AXES,
  assertAllowedKeys,
  assertRecord,
  compileAdaptationConditionQuery,
  normalizeAdaptationCondition,
  type ThemeAdaptationCondition,
  type WidthBreakpoints,
} from './adaptationConditions';

// =============================================================================
// Authoring vocabulary (public; re-exported from the package entry point)
// =============================================================================

/**
 * Environmental conditions a component adaptation rule may test.
 *
 * A closed subset of the theme condition grammar, so the two cannot drift:
 * viewport width against the theme's named points, and primary-pointer
 * precision. Fields are ANDed; `width.from` is inclusive and `width.below` is
 * exclusive; raw media-query strings are never accepted.
 */
export type ComponentAdaptationCondition = Pick<
  ThemeAdaptationCondition,
  'width' | 'pointer'
>;

/**
 * One ordered condition-to-value rule for a component policy.
 *
 * @typeParam T - The component's admitted policy values.
 */
export interface ComponentAdaptationRule<T extends string> {
  /** Environmental fields that must all match. */
  readonly when: ComponentAdaptationCondition;
  /** Policy value published while the condition matches. */
  readonly value: T;
}

/**
 * A component's environment-conditioned policy.
 *
 * `default` is required: it is the server-rendered value, the hydration value,
 * and the value used whenever no rule matches. `rules` is required too, and MAY
 * be empty — an empty policy is well-formed and always resolves to `default`,
 * which keeps a caller's computed rule list (a `.filter()` that matched
 * nothing, a feature flag that dropped every rule) from becoming a type or
 * runtime error at the call site.
 *
 * @typeParam T - The component's admitted policy values.
 *
 * @example
 * ```
 * <Selector
 *   adaptations={{
 *     default: 'popover',
 *     rules: [
 *       {when: {width: {below: 'md'}, pointer: 'coarse'}, value: 'bottom-sheet'},
 *     ],
 *   }}
 * />
 * ```
 */
export interface ComponentAdaptations<T extends string> {
  /** Server-rendered, hydration, and no-match value. */
  readonly default: T;
  /** Ordered rules; the last matching rule wins. May be empty. */
  readonly rules: ReadonlyArray<ComponentAdaptationRule<T>>;
}

// =============================================================================
// Package-internal compilation
// =============================================================================

/**
 * One policy compiled to parallel query and value lists.
 * @internal
 */
export interface CompiledComponentAdaptations<T extends string> {
  /** No-match value, carried through for the resolver. */
  readonly default: T;
  /** Compiled media queries, in authored rule order. */
  readonly queries: ReadonlyArray<string>;
  /** Rule values, in authored rule order. */
  readonly values: ReadonlyArray<T>;
}

const ADAPTATIONS_KEYS = new Set(['default', 'rules']);
const RULE_KEYS = new Set(['when', 'value']);

function assertAdmittedValue<T extends string>(
  value: unknown,
  path: string,
  admitted: ReadonlyArray<T> | undefined,
): T {
  if (typeof value !== 'string' || value === '') {
    throw new Error(`${path} must be a non-empty string value.`);
  }
  if (admitted !== undefined && !admitted.includes(value as T)) {
    throw new Error(
      `${path} must be one of ${admitted.join(', ')}; received "${value}".`,
    );
  }
  return value as T;
}

/**
 * Validate one component policy and lower every rule to a media query.
 *
 * Diagnostics are path-specific (spec:AST-031 IR3): the caller passes the
 * component and prop it is resolving — `<Selector adaptations>` — and every
 * message names the offending rule inside it, so an invalid policy fails
 * before a surface opens rather than at match time.
 *
 * @param adaptations - The authored policy, from an untrusted caller.
 * @param points - The nearest Theme's effective width-breakpoint map.
 * @param path - Diagnostic root, e.g. `<Selector adaptations>`.
 * @param admittedValues - The component's closed value domain, when it has one.
 * @internal
 */
export function compileComponentAdaptations<T extends string>(
  adaptations: ComponentAdaptations<T>,
  points: WidthBreakpoints,
  path: string,
  admittedValues?: ReadonlyArray<T>,
): CompiledComponentAdaptations<T> {
  assertRecord(adaptations, path);
  assertAllowedKeys(adaptations, ADAPTATIONS_KEYS, path);

  if (!Object.prototype.hasOwnProperty.call(adaptations, 'default')) {
    throw new Error(
      `${path}.default is required; it is the server-rendered and no-match value.`,
    );
  }
  const defaultValue = assertAdmittedValue(
    adaptations.default,
    `${path}.default`,
    admittedValues,
  );

  const rules: unknown = adaptations.rules;
  if (!Object.prototype.hasOwnProperty.call(adaptations, 'rules')) {
    throw new Error(`${path}.rules is required; pass [] for no rules.`);
  }
  if (!Array.isArray(rules)) {
    throw new Error(`${path}.rules must be an array of {when, value} objects.`);
  }

  const queries: string[] = [];
  const values: T[] = [];
  rules.forEach((rule: unknown, index) => {
    const rulePath = `${path}.rules[${index}]`;
    assertRecord(rule, rulePath);
    assertAllowedKeys(rule, RULE_KEYS, rulePath);
    if (!Object.prototype.hasOwnProperty.call(rule, 'when')) {
      throw new Error(`${rulePath}.when is required.`);
    }
    if (!Object.prototype.hasOwnProperty.call(rule, 'value')) {
      throw new Error(`${rulePath}.value is required.`);
    }

    const condition = normalizeAdaptationCondition(
      rule.when,
      `${rulePath}.when`,
      COMPONENT_ADAPTATION_AXES,
    );
    queries.push(
      compileAdaptationConditionQuery(condition, points, `${rulePath}.when`),
    );
    values.push(
      assertAdmittedValue(rule.value, `${rulePath}.value`, admittedValues),
    );
  });

  return {default: defaultValue, queries, values};
}
