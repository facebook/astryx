// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeAdaptations.ts
 * @input Ordered environment-conditioned theme value rules from defineTheme
 * @output Validated breakpoint metadata and resolved CSS-first rule layers
 * @position Theme system core; consumed by defineTheme, AppShell, and the CSS compiler
 *
 * Adaptations are deliberately closed and ordered. Width points are fixed names,
 * sparse rules and reserved token routing are rejected during normalization,
 * condition fields are ANDed, and rule order is the precedence model: every
 * matching rule writes after the root theme and later matching writes win. Token
 * cycles are judged only after each reachable ordered cascade is complete.
 *
 * Condition normalization, media-query compilation, and the width vocabulary
 * live in ./adaptationConditions.ts so theme CSS and component adaptations
 * (spec:AST-031) share one grammar; this module owns theme rule VALUES.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/adaptationConditions.ts (shared condition grammar)
 * - /packages/core/src/theme/defineTheme.ts (`DefineThemeInput.adaptations`)
 * - /packages/core/src/theme/generateThemeRules.ts (`generateAdaptationCSS`)
 * - /packages/core/src/AppShell/AppShell.tsx (named breakpoint consumption)
 * - /packages/cli/assets/theme.template.ts
 * - /packages/cli/assets/docs/theme.doc.mjs
 * - /packages/cli/api/theme/build/build.mjs
 */

import type {ComponentStyleMap, TokenName, TokenValue} from './defineTheme';
import type {TypographyConfig, TypographyRole} from './types';
import type {MotionScaleConfig} from './expandMotionScale';
import type {RadiusScaleConfig} from './expandRadiusScale';
import type {ColorScaleConfig} from './expandColorScale';
import {resolveThemeValues, type ThemeValuesInput} from './resolveThemeValues';
import {
  assertNoTokenCycles,
  isReservedThemeLocalTokenName,
  resolveAdaptationLocalTokens,
} from './localTokens';
import {
  DEFAULT_WIDTH_BREAKPOINTS,
  WIDTH_BREAKPOINT_NAMES,
  assertAllowedKeys,
  assertCompleteBreakpoints,
  assertIncreasingBreakpoints,
  assertRecord,
  cloneData,
  compileAdaptationConditionQuery,
  isRecord,
  normalizeAdaptationCondition,
  normalizeBreakpointOverrides,
  type ThemeAdaptationCondition,
  type WidthBreakpoints,
} from './adaptationConditions';

// =============================================================================
// Public authoring vocabulary
// =============================================================================

// The width vocabulary and condition grammar are shared with component
// adaptations; they are re-exported here so theme consumers keep one import.
export {
  DEFAULT_WIDTH_BREAKPOINTS,
  WIDTH_BREAKPOINT_NAMES,
} from './adaptationConditions';
export type {
  ThemeAdaptationCondition,
  ThemeAdaptationWidthCondition,
  WidthBreakpointName,
  WidthBreakpoints,
} from './adaptationConditions';

/** Typography overrides inside an adaptation rule. */
export interface ThemeAdaptationTypographyConfig extends Omit<
  TypographyConfig,
  'scale'
> {
  /** Partial type scale, completed from the effective root axis. */
  scale?: Partial<NonNullable<TypographyConfig['scale']>>;
}

/** Theme values an adaptation rule may write. */
export interface ThemeAdaptationValue {
  /** Typography axis overrides, completed from root metadata. */
  typography?: ThemeAdaptationTypographyConfig;
  /** Color axis overrides, completed from root metadata. */
  color?: Partial<ColorScaleConfig>;
  /** Radius axis overrides, completed from root metadata. */
  radius?: Partial<RadiusScaleConfig>;
  /** Motion axis overrides, completed from root metadata. */
  motion?: Partial<MotionScaleConfig>;
  /** Portable semantic-token writes. */
  tokens?: Partial<Record<TokenName, TokenValue>>;
  /** Replacements for exact theme-local names enrolled by the root lineage. */
  localTokens?: Record<string, TokenValue>;
  /** Component target/style-key writes. */
  components?: ComponentStyleMap;
}

/** One ordered condition-to-value adaptation rule. */
export interface ThemeAdaptationRule {
  /** Environmental fields that must all match. */
  when: ThemeAdaptationCondition;
  /** Theme values written while the condition matches. */
  value: ThemeAdaptationValue;
}

/** Adaptation authoring input accepted by defineTheme. */
export interface ThemeAdaptations {
  /** Overrides for the five fixed width points. Configuration alone emits no CSS. */
  widthBreakpoints?: Partial<WidthBreakpoints>;
  /** Ordered condition-to-value rules. */
  rules?: ThemeAdaptationRule[];
}

// =============================================================================
// Normalized and resolved metadata
// =============================================================================

/** Validated authoring data retained for source-equivalent theme extension. */
export interface NormalizedThemeAdaptations {
  /** Effective complete width map, including defaults and inherited overrides. */
  widthBreakpoints: WidthBreakpoints;
  /** Inherited rules followed by child-authored rules, preserving order. */
  rules: ThemeAdaptationRule[];
}

/** Generative-axis metadata needed to complete partial adaptation values. */
export interface ThemeGenerativeAxes {
  typography?: TypographyConfig;
  color?: ColorScaleConfig;
  radius?: RadiusScaleConfig;
  motion?: MotionScaleConfig;
}

/** One rule lowered to concrete CSS writes. */
export interface ResolvedThemeAdaptationRule {
  /** Validated condition, retained for diagnostics. */
  when: ThemeAdaptationCondition;
  /** CSS media-query prelude without the `@media` keyword. */
  query: string;
  /** Concrete portable token writes produced by this rule. */
  tokens: Record<string, string>;
  /** Concrete theme-local token writes produced by this rule. */
  localTokens?: Record<string, string>;
  /** Concrete component writes produced by this rule. */
  components?: ComponentStyleMap;
}

// =============================================================================
// Structural validation
// =============================================================================

const ADAPTATION_KEYS = new Set(['widthBreakpoints', 'rules']);
const RULE_KEYS = new Set(['when', 'value']);
const VALUE_KEYS = new Set([
  'typography',
  'color',
  'radius',
  'motion',
  'tokens',
  'localTokens',
  'components',
]);

function normalizeValue(value: unknown, path: string): ThemeAdaptationValue {
  assertRecord(value, path);
  assertAllowedKeys(value, VALUE_KEYS, path);
  for (const key of VALUE_KEYS) {
    const nested = value[key];
    if (nested !== undefined && !isRecord(nested)) {
      throw new Error(`${path}.${key} must be an object.`);
    }
  }
  return cloneData(value);
}

function normalizeRule(value: unknown, path: string): ThemeAdaptationRule {
  assertRecord(value, path);
  assertAllowedKeys(value, RULE_KEYS, path);
  if (!Object.prototype.hasOwnProperty.call(value, 'when')) {
    throw new Error(`${path}.when is required.`);
  }
  if (!Object.prototype.hasOwnProperty.call(value, 'value')) {
    throw new Error(`${path}.value is required.`);
  }
  return {
    when: normalizeAdaptationCondition(value.when, `${path}.when`),
    value: normalizeValue(value.value, `${path}.value`),
  };
}

function normalizeRules(value: unknown, path: string): ThemeAdaptationRule[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array of {when, value} objects.`);
  }
  for (let index = 0; index < value.length; index++) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) {
      throw new Error(`${path}[${index}] must be present.`);
    }
  }
  return value.map((rule, index) => normalizeRule(rule, `${path}[${index}]`));
}

/**
 * Merge and validate inherited plus locally-authored adaptation metadata.
 * Inherited rules retain order; child rules append.
 */
export function normalizeThemeAdaptations(
  themeName: string,
  inherited: NormalizedThemeAdaptations | undefined,
  input: ThemeAdaptations | undefined,
): NormalizedThemeAdaptations {
  const rootPath = `defineTheme("${themeName}").adaptations`;

  let inheritedPoints: WidthBreakpoints = {...DEFAULT_WIDTH_BREAKPOINTS};
  let inheritedRules: ThemeAdaptationRule[] = [];
  if (inherited !== undefined) {
    assertRecord(
      inherited,
      `defineTheme("${themeName}").extends.__adaptations`,
    );
    assertAllowedKeys(
      inherited,
      new Set(['widthBreakpoints', 'rules']),
      `defineTheme("${themeName}").extends.__adaptations`,
    );
    inheritedPoints = assertCompleteBreakpoints(
      inherited.widthBreakpoints,
      `defineTheme("${themeName}").extends.__adaptations.widthBreakpoints`,
    );
    inheritedRules = normalizeRules(
      inherited.rules,
      `defineTheme("${themeName}").extends.__adaptations.rules`,
    );
  }

  let ownPoints: Partial<WidthBreakpoints> = {};
  let ownRules: ThemeAdaptationRule[] = [];
  if (input !== undefined) {
    assertRecord(input, rootPath);
    assertAllowedKeys(input, ADAPTATION_KEYS, rootPath);
    if (input.widthBreakpoints !== undefined) {
      ownPoints = normalizeBreakpointOverrides(
        input.widthBreakpoints,
        `${rootPath}.widthBreakpoints`,
      );
    }
    if (input.rules !== undefined) {
      ownRules = normalizeRules(input.rules, `${rootPath}.rules`);
    }
  }

  const widthBreakpoints: WidthBreakpoints = {
    ...inheritedPoints,
    ...ownPoints,
  };
  assertIncreasingBreakpoints(widthBreakpoints, `${rootPath}.widthBreakpoints`);

  return {
    widthBreakpoints,
    rules: [...inheritedRules, ...ownRules],
  };
}

// =============================================================================
// Axis completion and rule resolution
// =============================================================================

function mergeRole(
  root: TypographyRole | undefined,
  rule: TypographyRole | undefined,
): TypographyRole | undefined {
  if (!root) {
    return rule;
  }
  if (!rule) {
    return root;
  }
  return {
    ...root,
    ...rule,
    weights:
      root.weights || rule.weights
        ? {...root.weights, ...rule.weights}
        : undefined,
  };
}

function assertFiniteNumber(
  value: unknown,
  path: string,
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number.`);
  }
}

function completeTypography(
  root: TypographyConfig | undefined,
  rule: ThemeAdaptationTypographyConfig,
  path: string,
): TypographyConfig {
  const writesScale =
    rule.scale !== undefined ||
    [rule.body, rule.heading, rule.code].some(
      role => role?.weight !== undefined || role?.weights !== undefined,
    );
  let scale = writesScale ? root?.scale : undefined;
  if (rule.scale !== undefined) {
    const base = rule.scale.base ?? root?.scale?.base;
    const ratio = rule.scale.ratio ?? root?.scale?.ratio;
    if (base === undefined || ratio === undefined) {
      throw new Error(
        `${path}.scale must supply both \`base\` and \`ratio\` unless the missing field exists on the effective root typography axis.`,
      );
    }
    assertFiniteNumber(base, `${path}.scale.base`);
    assertFiniteNumber(ratio, `${path}.scale.ratio`);
    scale = {base, ratio};
  } else if (writesScale && scale === undefined) {
    throw new Error(
      `${path} sets typography weights without an effective root scale. Supply \`scale.base\` and \`scale.ratio\` in the same rule.`,
    );
  }

  return {
    ...(scale ? {scale} : {}),
    body: mergeRole(root?.body, rule.body),
    heading: mergeRole(root?.heading, rule.heading),
    code: mergeRole(root?.code, rule.code),
  };
}

function completeRadius(
  root: RadiusScaleConfig | undefined,
  rule: Partial<RadiusScaleConfig>,
  path: string,
): RadiusScaleConfig {
  const base = rule.base ?? root?.base;
  const multiplier = rule.multiplier ?? root?.multiplier;
  if (base === undefined || multiplier === undefined) {
    throw new Error(
      `${path} must supply both \`base\` and \`multiplier\` unless the missing field exists on the effective root radius axis.`,
    );
  }
  assertFiniteNumber(base, `${path}.base`);
  assertFiniteNumber(multiplier, `${path}.multiplier`);
  return {base, multiplier};
}

function completeMotion(
  root: MotionScaleConfig | undefined,
  rule: Partial<MotionScaleConfig>,
  path: string,
): MotionScaleConfig {
  const fast = rule.fast ?? root?.fast;
  const medium = rule.medium ?? root?.medium;
  const ratio = rule.ratio ?? root?.ratio;
  if (fast === undefined || medium === undefined || ratio === undefined) {
    throw new Error(
      `${path} must supply \`fast\`, \`medium\`, and \`ratio\` unless each missing field exists on the effective root motion axis.`,
    );
  }
  assertFiniteNumber(fast, `${path}.fast`);
  assertFiniteNumber(medium, `${path}.medium`);
  assertFiniteNumber(ratio, `${path}.ratio`);
  const slow = rule.slow ?? root?.slow;
  if (slow !== undefined) {
    assertFiniteNumber(slow, `${path}.slow`);
  }
  const easing = rule.easing ?? root?.easing;
  return {
    fast,
    medium,
    ratio,
    ...(slow !== undefined ? {slow} : {}),
    ...(easing !== undefined ? {easing} : {}),
  };
}

function valueToThemeInput(
  themeName: string,
  ruleIndex: number,
  value: ThemeAdaptationValue,
  axes: ThemeGenerativeAxes,
): ThemeValuesInput {
  const path = `defineTheme("${themeName}").adaptations.rules[${ruleIndex}].value`;
  return {
    typography: value.typography
      ? completeTypography(
          axes.typography,
          value.typography,
          `${path}.typography`,
        )
      : undefined,
    color: value.color ? {...axes.color, ...value.color} : undefined,
    radius: value.radius
      ? completeRadius(axes.radius, value.radius, `${path}.radius`)
      : undefined,
    motion: value.motion
      ? completeMotion(axes.motion, value.motion, `${path}.motion`)
      : undefined,
    tokens: value.tokens,
    components: value.components,
  };
}

function assertConcreteLeaf(value: unknown, path: string): void {
  if (typeof value === 'string') {
    if (/\b(?:NaN|undefined)\b/.test(value)) {
      throw new Error(`${path} resolved to the invalid CSS value "${value}".`);
    }
    return;
  }
  if (isRecord(value)) {
    for (const [key, nested] of Object.entries(value)) {
      assertConcreteLeaf(nested, `${path}.${key}`);
    }
    return;
  }
  throw new Error(`${path} must resolve to a concrete CSS string.`);
}

function mediaQueryForCondition(
  themeName: string,
  ruleIndex: number,
  condition: ThemeAdaptationCondition,
  points: WidthBreakpoints,
): string {
  return compileAdaptationConditionQuery(
    condition,
    points,
    `defineTheme("${themeName}").adaptations.rules[${ruleIndex}].when`,
  );
}

type PointerEnvironment =
  NonNullable<ThemeAdaptationCondition['pointer']> | 'none';
type ContrastEnvironment =
  NonNullable<ThemeAdaptationCondition['contrast']> | 'custom';
type MotionEnvironment = NonNullable<ThemeAdaptationCondition['motion']>;

interface AdaptationEnvironment {
  width: number;
  pointer: PointerEnvironment;
  contrast: ContrastEnvironment;
  motion: MotionEnvironment;
}

const ENVIRONMENT_VALUES = {
  pointer: ['coarse', 'fine', 'none'],
  contrast: ['more', 'less', 'no-preference', 'custom'],
  motion: ['reduce', 'no-preference'],
} as const satisfies {
  pointer: ReadonlyArray<PointerEnvironment>;
  contrast: ReadonlyArray<ContrastEnvironment>;
  motion: ReadonlyArray<MotionEnvironment>;
};
type EnvironmentTypes = {
  pointer: PointerEnvironment;
  contrast: ContrastEnvironment;
  motion: MotionEnvironment;
};
const COMPLETE_ENVIRONMENT_VALUES: {
  [Axis in keyof EnvironmentTypes]: Exclude<
    EnvironmentTypes[Axis],
    (typeof ENVIRONMENT_VALUES)[Axis][number]
  > extends never
    ? (typeof ENVIRONMENT_VALUES)[Axis]
    : never;
} = ENVIRONMENT_VALUES;

/** Whether one normalized rule matches one representative environment cell. */
function conditionMatchesEnvironment(
  condition: ThemeAdaptationCondition,
  points: WidthBreakpoints,
  environment: AdaptationEnvironment,
): boolean {
  const from = condition.width?.from;
  if (from !== undefined && environment.width < points[from]) {
    return false;
  }
  const below = condition.width?.below;
  if (below !== undefined && environment.width >= points[below]) {
    return false;
  }
  if (
    condition.pointer !== undefined &&
    condition.pointer !== environment.pointer
  ) {
    return false;
  }
  if (
    condition.contrast !== undefined &&
    condition.contrast !== environment.contrast
  ) {
    return false;
  }
  if (
    condition.motion !== undefined &&
    condition.motion !== environment.motion
  ) {
    return false;
  }
  return true;
}

/**
 * Reject token cycles reachable in any matching adaptation-rule cascade.
 *
 * Conditions use a finite, closed vocabulary. Sampling zero and each named
 * width boundary covers every distinct width truth region; the discrete axes
 * enumerate every browser state relevant to the supported queries. For each
 * reachable match set, portable and local writes are applied in authored order
 * before checking the effective graph, so a later matching rule may
 * intentionally repair an earlier cycle just as it does in CSS.
 */
function assertNoReachableTokenCycles(
  themeName: string,
  points: WidthBreakpoints,
  rootTokens: Record<string, string>,
  rootLocalTokens: Record<string, string> | undefined,
  rules: ResolvedThemeAdaptationRule[],
): void {
  const tokenRuleIndexes = rules.flatMap((rule, index) =>
    Object.keys(rule.tokens).length > 0 ||
    (rule.localTokens && Object.keys(rule.localTokens).length > 0)
      ? [index]
      : [],
  );
  if (tokenRuleIndexes.length === 0) {
    return;
  }

  const widthEnvironments = [
    0,
    ...WIDTH_BREAKPOINT_NAMES.map(name => points[name]),
  ];
  const checkedMatchSets = new Set<string>();

  for (const width of widthEnvironments) {
    for (const pointer of COMPLETE_ENVIRONMENT_VALUES.pointer) {
      for (const contrast of COMPLETE_ENVIRONMENT_VALUES.contrast) {
        for (const motion of COMPLETE_ENVIRONMENT_VALUES.motion) {
          const environment = {width, pointer, contrast, motion};
          const matchingRuleIndexes = tokenRuleIndexes.filter(index =>
            conditionMatchesEnvironment(rules[index].when, points, environment),
          );
          if (matchingRuleIndexes.length === 0) {
            continue;
          }

          const signature = matchingRuleIndexes.join(',');
          if (checkedMatchSets.has(signature)) {
            continue;
          }
          checkedMatchSets.add(signature);

          const effective = {...rootTokens, ...rootLocalTokens};
          const relevantNames = new Set<string>();
          for (const index of matchingRuleIndexes) {
            const rule = rules[index];
            Object.assign(effective, rule.tokens, rule.localTokens);
            for (const name of Object.keys(rule.tokens)) {
              relevantNames.add(name);
            }
            for (const name of Object.keys(rule.localTokens ?? {})) {
              relevantNames.add(name);
            }
          }

          const indexes = matchingRuleIndexes.join(', ');
          const queries = matchingRuleIndexes
            .map(index => rules[index].query)
            .join('; ');
          assertNoTokenCycles(
            effective,
            `defineTheme("${themeName}").adaptations ${
              matchingRuleIndexes.length === 1 ? 'rule' : 'overlapping rules'
            } [${indexes}] (${queries})`,
            relevantNames,
          );
        }
      }
    }
  }
}

/**
 * Resolve the effective root generative metadata through a theme extension.
 * An explicitly supplied root axis replaces the inherited axis; omission inherits.
 */
export function resolveThemeGenerativeAxes(
  inherited: ThemeGenerativeAxes | undefined,
  own: ThemeGenerativeAxes,
): ThemeGenerativeAxes {
  const inheritedTypography = inherited?.typography;
  const ownTypography = own.typography;
  const resolveFamily = (
    inheritedRole: TypographyRole | undefined,
    ownRole: TypographyRole | undefined,
    followsOwnBody = false,
  ): TypographyRole | undefined => {
    const merged = mergeRole(inheritedRole, ownRole);
    if (!merged) {
      return undefined;
    }
    if (ownRole?.family) {
      return {
        ...merged,
        family: ownRole.family,
        fallbacks: ownRole.fallbacks,
      };
    }
    if (followsOwnBody) {
      return {...merged, family: undefined, fallbacks: undefined};
    }
    // A fallback without a family is inert in buildFontFamilyTokens(), so it
    // cannot replace the fallback attached to an inherited effective family.
    return {
      ...merged,
      family: inheritedRole?.family,
      fallbacks: inheritedRole?.fallbacks,
    };
  };

  let body = resolveFamily(inheritedTypography?.body, ownTypography?.body);
  let heading = resolveFamily(
    inheritedTypography?.heading,
    ownTypography?.heading,
    Boolean(ownTypography?.body?.family && !ownTypography?.heading?.family),
  );
  let code = resolveFamily(inheritedTypography?.code, ownTypography?.code);

  // Weights reach tokens only when a scale is expanded. The most recent
  // config that declares a scale owns every weight; omitted weights become the
  // expander defaults rather than resurrecting values from an earlier scale.
  const weightOwner = ownTypography?.scale
    ? ownTypography
    : inheritedTypography?.scale
      ? inheritedTypography
      : undefined;
  const applyWeights = (
    role: TypographyRole | undefined,
    owner: TypographyRole | undefined,
  ): TypographyRole | undefined =>
    role
      ? {...role, weight: owner?.weight, weights: owner?.weights}
      : undefined;
  body = applyWeights(body, weightOwner?.body);
  heading = applyWeights(heading, weightOwner?.heading);
  code = applyWeights(code, weightOwner?.code);

  const typography =
    inheritedTypography || ownTypography
      ? {
          ...inheritedTypography,
          ...ownTypography,
          scale: ownTypography?.scale ?? inheritedTypography?.scale,
          body,
          heading,
          code,
        }
      : undefined;
  // A color config regenerates its neutral ramp even when `accent` is omitted,
  // so an authored child config replaces rather than field-merges the base axis.
  const color = own.color ?? inherited?.color;
  const radius = own.radius
    ? {...inherited?.radius, ...own.radius}
    : inherited?.radius;
  const motion = own.motion
    ? {...inherited?.motion, ...own.motion}
    : inherited?.motion;

  return {
    ...(typography ? {typography} : {}),
    ...(color ? {color} : {}),
    ...(radius ? {radius} : {}),
    ...(motion ? {motion} : {}),
  };
}

/** Lower ordered normalized rules to concrete CSS writes. */
export function resolveThemeAdaptationRules(
  themeName: string,
  adaptations: NormalizedThemeAdaptations,
  axes: ThemeGenerativeAxes,
  rootTokens: Record<string, string>,
  rootLocalTokens: Record<string, string> | undefined,
): ResolvedThemeAdaptationRule[] | undefined {
  if (adaptations.rules.length === 0) {
    return undefined;
  }

  const resolvedRules = adaptations.rules.map((rule, index) => {
    const resolved = resolveThemeValues(
      valueToThemeInput(themeName, index, rule.value, axes),
      undefined,
      // Authored adaptation values are a new surface with no legacy
      // acceptance to preserve, so a malformed token is rejected here rather
      // than emitted. The root path stays lenient for compatibility.
      // SYNC: packages/core/src/theme/resolveThemeValues.ts (resolveTokenValue)
      {strictTokens: true},
    );
    for (const [name, value] of Object.entries(resolved.tokens)) {
      assertConcreteLeaf(
        value,
        `defineTheme("${themeName}").adaptations.rules[${index}].value.tokens["${name}"]`,
      );
    }
    if (resolved.components) {
      assertConcreteLeaf(
        resolved.components,
        `defineTheme("${themeName}").adaptations.rules[${index}].value.components`,
      );
    }

    for (const name of Object.keys(rule.value.tokens ?? {})) {
      if (isReservedThemeLocalTokenName(name)) {
        throw new Error(
          `defineTheme("${themeName}").adaptations.rules[${index}].value.tokens["${name}"] uses the reserved --astryx-theme-* namespace; write it through value.localTokens instead.`,
        );
      }
    }

    const localTokens = resolveAdaptationLocalTokens(
      themeName,
      index,
      rule.value.localTokens,
      rootLocalTokens,
      resolved.tokens,
      resolved.components,
    );

    return {
      when: rule.when,
      query: mediaQueryForCondition(
        themeName,
        index,
        rule.when,
        adaptations.widthBreakpoints,
      ),
      tokens: resolved.tokens,
      localTokens,
      components: resolved.components,
    };
  });

  assertNoReachableTokenCycles(
    themeName,
    adaptations.widthBreakpoints,
    rootTokens,
    rootLocalTokens,
    resolvedRules,
  );
  return resolvedRules;
}
