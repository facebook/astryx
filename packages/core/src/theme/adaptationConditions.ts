// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adaptationConditions.ts
 * @input Authored adaptation conditions and width-breakpoint maps
 * @output Package-internal condition vocabulary, normalization, and media-query
 *   compilation shared by every adaptation consumer
 * @position Shared owner of AST-012 condition semantics (spec:AST-031 IR1);
 *   consumed by themeAdaptations (CSS compiler) and componentAdaptations
 *   (JavaScript resolver). Not re-exported from the package entry point.
 *
 * One module owns what a condition means so the theme and component grammars
 * cannot drift. Callers supply their own diagnostic path — `defineTheme("x")
 * .adaptations.rules[0].when` or `<Selector adaptations>.rules[0].when` — and
 * their own allowed axis set, so a component may admit a closed subset of the
 * theme vocabulary while sharing one normalizer and one compiler.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/adaptationConditions.test.ts
 * - /packages/core/src/theme/themeAdaptations.ts (theme rules and CSS output)
 * - /packages/core/src/theme/componentAdaptations.ts (component policy values)
 * - /packages/core/src/theme/useComponentAdaptations.ts (runtime resolver)
 */

// =============================================================================
// Width vocabulary
// =============================================================================

/** Fixed names for viewport-width tier start points. */
export const WIDTH_BREAKPOINT_NAMES = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

/** One fixed viewport-width breakpoint name. */
export type WidthBreakpointName = (typeof WIDTH_BREAKPOINT_NAMES)[number];

/** A complete, validated map of viewport-width tier start points in CSS px. */
export type WidthBreakpoints = Record<WidthBreakpointName, number>;

/** The default Astryx viewport-width tier start points in CSS px. */
export const DEFAULT_WIDTH_BREAKPOINTS: Readonly<WidthBreakpoints> =
  Object.freeze({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  });

// =============================================================================
// Condition vocabulary
// =============================================================================

/** Inclusive lower and exclusive upper edges for one width condition. */
export interface ThemeAdaptationWidthCondition {
  /** Match at and above this named point. */
  from?: WidthBreakpointName;
  /** Match strictly below this named point. */
  below?: WidthBreakpointName;
}

/** Closed environmental condition vocabulary. Fields are ANDed. */
export interface ThemeAdaptationCondition {
  /** Viewport-width range, using named start points. */
  width?: ThemeAdaptationWidthCondition;
  /** Primary pointing-device precision. */
  pointer?: 'coarse' | 'fine';
  /** User contrast preference. */
  contrast?: 'more' | 'less' | 'no-preference';
  /** User reduced-motion preference. */
  motion?: 'reduce' | 'no-preference';
}

/** One named environmental axis inside a condition. */
export type AdaptationConditionAxis = keyof ThemeAdaptationCondition;

const THEME_CONDITION_AXES = [
  'width',
  'pointer',
  'contrast',
  'motion',
] as const satisfies ReadonlyArray<AdaptationConditionAxis>;
type UnhandledConditionAxis = Exclude<
  AdaptationConditionAxis,
  (typeof THEME_CONDITION_AXES)[number]
>;

/**
 * Every axis a theme rule may use. The conditional type keeps this exhaustive:
 * adding a field to `ThemeAdaptationCondition` without listing it here fails to
 * compile rather than silently becoming unsupported.
 */
export const THEME_ADAPTATION_AXES: UnhandledConditionAxis extends never
  ? ReadonlyArray<AdaptationConditionAxis>
  : never = THEME_CONDITION_AXES;

/**
 * The closed subset component adaptations admit (spec:AST-031 FR2/DEC-3).
 * Contrast and motion stay CSS-owned; they never select a component tree.
 */
export const COMPONENT_ADAPTATION_AXES = [
  'width',
  'pointer',
] as const satisfies ReadonlyArray<AdaptationConditionAxis>;

// =============================================================================
// Shared structural helpers
// =============================================================================

/** Whether a value is a plain object (not null, not an array). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Assert a plain object, naming the caller's diagnostic path. */
export function assertRecord(
  value: unknown,
  path: string,
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }
}

/** Reject any key outside the closed set, naming the offending path. */
export function assertAllowedKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  path: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new Error(`${path}.${key} is not supported.`);
    }
  }
}

/** Deep-clone plain data so normalized output never aliases caller input. */
export function cloneData<T>(value: T): T {
  if (Array.isArray(value)) {
    const cloned: unknown[] = [];
    for (const item of value) {
      cloned.push(cloneData(item));
    }
    return cloned as T;
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneData(nested)]),
    ) as T;
  }
  return value;
}

// =============================================================================
// Width-breakpoint map validation
// =============================================================================

const BREAKPOINT_NAMES = new Set<string>(WIDTH_BREAKPOINT_NAMES);
const WIDTH_CONDITION_KEYS = new Set(['from', 'below']);

/** Validate a partial override map of fixed width points. */
export function normalizeBreakpointOverrides(
  value: unknown,
  path: string,
): Partial<WidthBreakpoints> {
  assertRecord(value, path);
  assertAllowedKeys(value, BREAKPOINT_NAMES, path);
  const result: Partial<WidthBreakpoints> = {};
  for (const name of WIDTH_BREAKPOINT_NAMES) {
    const point = value[name];
    if (point === undefined) {
      continue;
    }
    if (typeof point !== 'number' || !Number.isFinite(point) || point <= 0) {
      throw new Error(
        `${path}.${name} must be a finite positive number of CSS pixels.`,
      );
    }
    result[name] = point;
  }
  return result;
}

/** Validate a map that must already name every fixed width point. */
export function assertCompleteBreakpoints(
  value: unknown,
  path: string,
): WidthBreakpoints {
  const overrides = normalizeBreakpointOverrides(value, path);
  for (const name of WIDTH_BREAKPOINT_NAMES) {
    if (overrides[name] === undefined) {
      throw new Error(
        `${path}.${name} is missing from the effective breakpoint map.`,
      );
    }
  }
  return overrides as WidthBreakpoints;
}

/** Reject a width map whose named points are not strictly increasing. */
export function assertIncreasingBreakpoints(
  points: WidthBreakpoints,
  path: string,
): void {
  let previous: WidthBreakpointName | undefined;
  for (const name of WIDTH_BREAKPOINT_NAMES) {
    if (previous !== undefined && points[name] <= points[previous]) {
      throw new Error(
        `${path} must be strictly increasing: ${name} (${points[name]}) is not above ${previous} (${points[previous]}).`,
      );
    }
    previous = name;
  }
}

// =============================================================================
// Condition normalization
// =============================================================================

/**
 * Validate one authored condition against a closed axis set.
 *
 * `axes` is the caller's admitted vocabulary: theme rules pass every axis,
 * component adaptations pass width and pointer only, so an unsupported axis
 * fails with the caller's own path rather than a shared generic message.
 */
export function normalizeAdaptationCondition(
  value: unknown,
  path: string,
  axes: ReadonlyArray<AdaptationConditionAxis> = THEME_ADAPTATION_AXES,
): ThemeAdaptationCondition {
  assertRecord(value, path);
  assertAllowedKeys(value, new Set<string>(axes), path);
  const defined = Object.fromEntries(
    Object.entries(value).filter(([, nested]) => nested !== undefined),
  );
  if (Object.keys(defined).length === 0) {
    throw new Error(`${path} must contain at least one condition.`);
  }

  const condition = cloneData(defined) as ThemeAdaptationCondition;
  if (condition.width !== undefined) {
    assertRecord(condition.width, `${path}.width`);
    assertAllowedKeys(condition.width, WIDTH_CONDITION_KEYS, `${path}.width`);
    if (
      condition.width.from === undefined &&
      condition.width.below === undefined
    ) {
      throw new Error(
        `${path}.width must contain \`from\`, \`below\`, or both.`,
      );
    }
    for (const edge of ['from', 'below'] as const) {
      const name = condition.width[edge];
      if (
        name !== undefined &&
        (typeof name !== 'string' || !BREAKPOINT_NAMES.has(name))
      ) {
        throw new Error(
          `${path}.width.${edge} must be one of ${WIDTH_BREAKPOINT_NAMES.join(', ')}.`,
        );
      }
    }
  }

  if (
    condition.pointer !== undefined &&
    condition.pointer !== 'coarse' &&
    condition.pointer !== 'fine'
  ) {
    throw new Error(`${path}.pointer must be 'coarse' or 'fine'.`);
  }
  if (
    condition.contrast !== undefined &&
    condition.contrast !== 'more' &&
    condition.contrast !== 'less' &&
    condition.contrast !== 'no-preference'
  ) {
    throw new Error(
      `${path}.contrast must be 'more', 'less', or 'no-preference'.`,
    );
  }
  if (
    condition.motion !== undefined &&
    condition.motion !== 'reduce' &&
    condition.motion !== 'no-preference'
  ) {
    throw new Error(`${path}.motion must be 'reduce' or 'no-preference'.`);
  }

  return condition;
}

// =============================================================================
// Media-query compilation
// =============================================================================

/**
 * Lower one normalized condition to a media-query prelude (no `@media`).
 *
 * The part order is stable — width edges, pointer, contrast, motion — and both
 * the theme CSS compiler and the component resolver call this, so a component
 * query and its theme equivalent are the same string for the same condition.
 */
export function compileAdaptationConditionQuery(
  condition: ThemeAdaptationCondition,
  points: WidthBreakpoints,
  path: string,
): string {
  const parts: string[] = [];

  if (condition.width) {
    const from = condition.width.from;
    const below = condition.width.below;
    if (
      from !== undefined &&
      below !== undefined &&
      points[from] >= points[below]
    ) {
      throw new Error(
        `${path}.width must resolve to \`from < below\`; ${from} is ${points[from]}px and ${below} is ${points[below]}px.`,
      );
    }
    if (from !== undefined) {
      parts.push(`(width >= ${points[from]}px)`);
    }
    if (below !== undefined) {
      parts.push(`(width < ${points[below]}px)`);
    }
  }
  if (condition.pointer !== undefined) {
    parts.push(`(pointer: ${condition.pointer})`);
  }
  if (condition.contrast !== undefined) {
    parts.push(`(prefers-contrast: ${condition.contrast})`);
  }
  if (condition.motion !== undefined) {
    parts.push(`(prefers-reduced-motion: ${condition.motion})`);
  }

  if (parts.length === 0) {
    throw new Error(`${path} must contain at least one concrete condition.`);
  }
  return parts.join(' and ');
}
