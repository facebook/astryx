// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme CSS generation utilities
 *
 * Shared logic for generating CSS rules from a resolved theme definition.
 * Used by both the runtime path (Theme injects <style>) and the build
 * path (`astryx theme build` pre-compiles to CSS files).
 *
 * Extracted from defineTheme.ts to reduce cyclomatic complexity and provide
 * a clear single-responsibility module for CSS generation.
 *
 * @input DefinedTheme (resolved theme object from defineTheme)
 * @output CSS rule strings, split by layer (component vs prose)
 * @position packages/core/src/theme/generateThemeRules.ts
 */

import type {DefinedTheme} from './defineTheme';
import {parseStyleKey} from '../utils/parseStyleKey';
import {getDerivedVars} from './derivedVarRegistry';
import {cssVar, classPrefix, dataAttrNamespace} from '../naming';

/**
 * Theme @scope selectors.
 *
 * Theme CSS is @scope'd to the theme-name data attribute that Theme writes
 * (`data-astryx-theme`).
 *
 * @example themeScopeStart('mytheme')
 *   -> '[data-astryx-theme="mytheme"]'
 */
function themeScopeStart(name: string): string {
  return `[data-${dataAttrNamespace}-theme="${name}"]`;
}

/** Scope limit matching the theme attribute (nested-theme boundary). */
const THEME_SCOPE_TO = `[data-${dataAttrNamespace}-theme]`;

/** Media-surface selector, e.g. for [data-astryx-media="dark"]. */
function mediaSelector(surface: string): string {
  return `[data-${dataAttrNamespace}-media="${surface}"]`;
}

/** Component base-class selector, e.g. '.astryx-button'. */
function componentClassSelector(component: string, suffix: string): string {
  return `.${classPrefix}-${component}${suffix}`;
}

/**
 * Append a pseudo-class to every selector in a comma-separated selector list.
 *
 * Selector helpers may emit comma-separated lists. CSS does not distribute a
 * trailing pseudo over selector lists, so `${list}:hover` would only target the
 * final selector. Rewrite each item so the pseudo applies to all of them.
 */
function appendPseudoToSelectorList(selector: string, pseudo: string): string {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    } else if (char === ',' && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selector.slice(start).trim());

  return parts.map(part => `${part}${pseudo}`).join(', ');
}

// =============================================================================
// Types
// =============================================================================

/**
 * Structured output from generateThemeRulesSplit.
 * Separates prose element defaults from component/token overrides
 * so callers can place them in different CSS layers.
 */
export interface ThemeRulesSplit {
  /** Token overrides + component .astryx-* overrides + prop-level color rules */
  component: string[];
  /** Prose element defaults (h1-h6, p, small, code, hr) — belongs in reset layer */
  prose: string[];
}

/**
 * Output from generateThemeCSS — two CSS blocks for different layers.
 */
export interface ThemeCSSOutput {
  /**
   * Prose element defaults (p, h1-h6, small, code, hr) scoped to the theme.
   * Should be injected into @layer reset — lowest priority, any class wins.
   * Empty string if no prose rules.
   */
  prose: string;
  /**
   * Token overrides + component .astryx-* overrides scoped to the theme.
   * Should be injected into @layer astryx-theme — above StyleX layers so
   * theme component overrides take effect. Empty string if no rules.
   */
  component: string;
}

// =============================================================================
// Internal helpers
// =============================================================================

/** Convert camelCase CSS property to kebab-case */
function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

/** Padding properties that trigger container token mapping */
const PADDING_PROPS = new Set([
  'padding',
  'paddingBlock',
  'paddingInline',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInlineStart',
  'paddingInlineEnd',
]);

interface ParsedPadding {
  blockStart?: string;
  blockEnd?: string;
  inline?: string;
  inlineStart?: string;
  inlineEnd?: string;
}

/**
 * Parse CSS padding shorthand/longhand into block/inline values.
 * Supports 1-3 value shorthands and logical properties.
 */
function parsePadding(props: [string, string][]): ParsedPadding {
  const result: ParsedPadding = {};

  for (const [prop, value] of props) {
    switch (prop) {
      case 'padding': {
        const parts = value.trim().split(/\s+/);
        if (parts.length === 1) {
          result.blockStart = parts[0];
          result.blockEnd = parts[0];
          result.inline = parts[0];
        } else if (parts.length === 2) {
          result.blockStart = parts[0];
          result.blockEnd = parts[0];
          result.inline = parts[1];
        } else if (parts.length >= 3) {
          result.blockStart = parts[0];
          result.inline = parts[1];
          result.blockEnd = parts[2];
        }
        break;
      }
      case 'paddingBlock': {
        const parts = value.trim().split(/\s+/);
        result.blockStart = parts[0];
        result.blockEnd = parts[1] ?? parts[0];
        break;
      }
      case 'paddingInline': {
        const parts = value.trim().split(/\s+/);
        if (parts.length === 1) {
          result.inline = parts[0];
        } else {
          result.inlineStart = parts[0];
          result.inlineEnd = parts[1];
        }
        break;
      }
      case 'paddingBlockStart':
        result.blockStart = value;
        break;
      case 'paddingBlockEnd':
        result.blockEnd = value;
        break;
      case 'paddingInlineStart':
        result.inlineStart = value;
        break;
      case 'paddingInlineEnd':
        result.inlineEnd = value;
        break;
    }
  }

  return result;
}

/**
 * Expand parsed padding into component-scoped public tokens.
 *
 * Emits the rebranded --astryx-<component>-padding tokens (shorthand +
 * directional overrides), e.g.:
 *   --astryx-card-padding: 20px
 *   --astryx-card-padding-inline: 20px
 *   --astryx-card-padding-block-start: 20px
 *   --astryx-card-padding-block-end: 20px
 *
 * The component reads these with an inverted fallback chain
 * (var(--astryx-*, default)). The container.stylex.ts default styles read
 * these via var() fallbacks,
 * so the theme CSS sets the value and the component picks it up through
 * CSS custom property cascade — no layer competition with StyleX output.
 */
function expandContainerPadding(
  component: string,
  parsed: ParsedPadding,
): [string, string][] {
  const prefix = cssVar(`${component}-padding`);
  const tokens: [string, string][] = [];

  // Resolve effective inline values (inlineStart/End override inline)
  const effectiveInlineStart = parsed.inlineStart ?? parsed.inline;
  const effectiveInlineEnd = parsed.inlineEnd ?? parsed.inline;
  const inlineSymmetric =
    effectiveInlineStart != null &&
    effectiveInlineEnd != null &&
    effectiveInlineStart === effectiveInlineEnd;

  // If all sides are the same, emit the shorthand token only
  const allSame =
    inlineSymmetric &&
    parsed.blockStart != null &&
    parsed.blockEnd != null &&
    effectiveInlineStart === parsed.blockStart &&
    parsed.blockStart === parsed.blockEnd;

  if (allSame) {
    tokens.push([prefix, effectiveInlineStart ?? '']);
    return tokens;
  }

  // Directional tokens
  if (parsed.inlineStart != null || parsed.inlineEnd != null) {
    // Asymmetric inline — emit start and end separately
    if (effectiveInlineStart != null) {
      tokens.push([`${prefix}-inline-start`, effectiveInlineStart]);
    }
    if (effectiveInlineEnd != null) {
      tokens.push([`${prefix}-inline-end`, effectiveInlineEnd]);
    }
  } else if (parsed.inline != null) {
    tokens.push([`${prefix}-inline`, parsed.inline]);
  }
  if (parsed.blockStart != null) {
    tokens.push([`${prefix}-block-start`, parsed.blockStart]);
  }
  if (parsed.blockEnd != null) {
    tokens.push([`${prefix}-block-end`, parsed.blockEnd]);
  }

  return tokens;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Generate the intermediary CSS rules for a theme.
 *
 * Returns an array of CSS rule strings — the shared format used by both
 * the runtime path (useInsertionEffect) and the build path (astryx theme build).
 */
export function generateThemeRules(theme: DefinedTheme): string[] {
  const parts: string[] = [];
  const tokens = theme.tokens;

  // Helper: resolve a token value — tokens always have computed values
  // since defineTheme runs expandTypeScale to produce them.
  const val = (key: string): string => tokens[key] || `var(${key})`;

  // 1. Token block — CSS custom properties on :scope
  const tokenEntries = Object.entries(tokens);
  if (tokenEntries.length > 0) {
    const declarations = tokenEntries
      .map(([prop, value]) => `    ${prop}: ${value};`)
      .join('\n');
    parts.push(`  :scope {\n${declarations}\n  }`);
  }

  // 2. Component overrides (.astryx-* class rules; components also emit
  // data-* prop reflections for external selector migrations)
  if (theme.components) {
    generateComponentRules(theme.components, parts);
  }

  // 3. Prose HTML element rules (h1-h6, p, small, code, hr)
  generateProseRules(val, parts);

  // 4. Prop-level color overrides (for text/heading/link specificity)
  generateColorOverrides(theme.components || {}, parts);

  // 5. Text `size`-prop font-size overrides (so an explicit size beats a
  //    themed type's font-size across the astryx-base → astryx-theme layers)
  generateSizeOverrides(theme.components || {}, parts);

  // (on-media rules are generated separately — see generateOnMediaCSS)

  return parts;
}

/**
 * Generate component override rules using the .astryx-* class selector
 * format. Runtime components also emit matching data-* prop reflections; the
 * theme CSS generator will move to data-attribute selectors in a later step.
 * Handles derived var expansion and container padding mapping.
 */
function generateComponentRules(
  components: Record<
    string,
    Record<string, Record<string, string | Record<string, string>>>
  >,
  parts: string[],
): void {
  for (const [component, rules] of Object.entries(components)) {
    for (const [key, styles] of Object.entries(rules)) {
      const entries = Object.entries(styles);
      if (entries.length === 0) {
        continue;
      }

      const suffix = parseStyleKey(key);
      const baseSelector = componentClassSelector(component, suffix);

      // Separate regular properties from pseudo-class overrides
      const props: [string, string][] = [];
      const pseudos: [string, Record<string, string>][] = [];

      for (const [prop, value] of entries) {
        if (prop.startsWith(':') && typeof value === 'object') {
          pseudos.push([prop, value]);
        } else {
          props.push([prop, value as string]);
        }
      }

      // Derived var expansion: for each CSS property, check if the
      // component has derived var entries and emit additional declarations.
      // Entries are processed in order (priority).
      // - `vars`: emit internal CSS custom property declarations
      // - `expand: 'container'`: expand padding to container layout tokens
      let finalProps = props;
      const derivedProps: [string, string][] = [];
      let containerExpanded = false;

      for (const [prop, value] of props) {
        const derived = getDerivedVars(component, prop);
        // Padding longhands (paddingBlock, paddingInline, etc.) also
        // match the 'padding' derived entry for container expansion.
        const paddingDerived =
          PADDING_PROPS.has(prop) && prop !== 'padding'
            ? getDerivedVars(component, 'padding')
            : [];
        for (const entry of [...derived, ...paddingDerived]) {
          if (entry.expand === 'container' && PADDING_PROPS.has(prop)) {
            containerExpanded = true;
          }
          if (entry.vars) {
            for (const varName of entry.vars) {
              derivedProps.push([varName, value]);
            }
          }
        }
      }

      // Container padding expansion: replace padding props with
      // component-scoped container tokens for layout integration.
      if (containerExpanded) {
        const paddingProps = props.filter(([p]) => PADDING_PROPS.has(p));
        const nonPaddingProps = props.filter(([p]) => !PADDING_PROPS.has(p));
        const parsed = parsePadding(paddingProps);
        const containerTokens = expandContainerPadding(component, parsed);
        finalProps = [...nonPaddingProps, ...containerTokens];
      }

      if (derivedProps.length > 0) {
        finalProps = [...finalProps, ...derivedProps];
      }

      // Emit base rule
      if (finalProps.length > 0) {
        const declarations = finalProps
          .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
          .join('\n');
        parts.push(`  ${baseSelector} {\n${declarations}\n  }`);
      }

      // Emit pseudo-class rules
      for (const [pseudo, pseudoStyles] of pseudos) {
        const pseudoEntries = Object.entries(pseudoStyles);
        if (pseudoEntries.length > 0) {
          const declarations = pseudoEntries
            .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
            .join('\n');
          parts.push(
            `  ${appendPseudoToSelectorList(baseSelector, pseudo)} {\n${declarations}\n  }`,
          );
        }
      }
    }
  }
}

/**
 * Generate prose HTML element default rules (h1-h6, p, small, code, hr).
 * Wrapped in :where() for zero specificity — these are defaults that
 * any class-based style (StyleX, .astryx-* overrides) should beat.
 * The caller places these in the reset layer (not astryx-theme) so they
 * sit below all component styles in the cascade.
 */
function generateProseRules(
  val: (key: string) => string,
  parts: string[],
): void {
  parts.push(`  :where(h1, h2, h3, h4, h5, h6) {
    font-family: var(--font-family-heading);
    color: var(--color-text-primary);
  }`);

  for (let level = 1; level <= 6; level++) {
    parts.push(`  :where(h${level}) {
    font-size: ${val(`--text-heading-${level}-size`)};
    font-weight: ${val(`--text-heading-${level}-weight`)};
    line-height: ${val(`--text-heading-${level}-leading`)};
  }`);
  }

  parts.push(`  :where(p) {
    font-family: var(--font-family-body);
    font-size: ${val('--text-body-size')};
    font-weight: ${val('--text-body-weight')};
    line-height: ${val('--text-body-leading')};
    color: var(--color-text-primary);
  }`);

  parts.push(`  :where(small) {
    font-size: ${val('--text-supporting-size')};
    font-weight: ${val('--text-supporting-weight')};
    line-height: ${val('--text-supporting-leading')};
    color: var(--color-text-secondary);
  }`);

  parts.push(`  :where(code, pre) {
    font-family: var(--font-family-code);
    font-size: ${val('--text-code-size')};
    line-height: ${val('--text-code-leading')};
  }`);

  parts.push(`  :where(hr) {
    border: none;
    border-top: 1px solid var(--color-border);
  }`);
}

/**
 * Generate prop-level color override rules for text/heading/link components.
 * These ensure color prop classes override theme token changes.
 */
function generateColorOverrides(
  components: Record<string, unknown>,
  parts: string[],
): void {
  const TEXT_COLOR_MAP: Record<string, string> = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    disabled: 'var(--color-text-disabled)',
    placeholder: 'var(--color-text-secondary)',
    accent: 'var(--color-text-accent)',
  };

  const touchesText = 'text' in components;
  const touchesHeading = 'heading' in components;
  const touchesLink = 'link' in components;

  if (touchesText || touchesHeading || touchesLink) {
    for (const [colorName, colorValue] of Object.entries(TEXT_COLOR_MAP)) {
      if (touchesText) {
        parts.push(
          `  ${componentClassSelector('text', `.${colorName}`)} { color: ${colorValue}; }`,
        );
      }
      if (touchesHeading) {
        parts.push(
          `  ${componentClassSelector('heading', `.${colorName}`)} { color: ${colorValue}; }`,
        );
      }
      if (touchesLink) {
        parts.push(
          `  ${componentClassSelector('link', `.${colorName}`)} { color: ${colorValue}; }`,
        );
      }
    }
  }
}

/**
 * Map a Text `size` prop value to its raw font-size token.
 * Mirrors `sizeStyles` in `Text/text.stylex.ts` (note `xsm` → `--font-size-xs`).
 * <!-- SYNC: packages/core/src/Text/text.stylex.ts (sizeStyles) -->
 */
const TEXT_SIZE_TOKEN_MAP: Record<string, string> = {
  '4xs': 'var(--font-size-4xs)',
  '3xs': 'var(--font-size-3xs)',
  '2xs': 'var(--font-size-2xs)',
  xsm: 'var(--font-size-xs)',
  sm: 'var(--font-size-sm)',
  base: 'var(--font-size-base)',
  lg: 'var(--font-size-lg)',
  xl: 'var(--font-size-xl)',
  '2xl': 'var(--font-size-2xl)',
  '3xl': 'var(--font-size-3xl)',
  '4xl': 'var(--font-size-4xl)',
};

/**
 * Generate `size`-prop font-size overrides for the Text component.
 *
 * The `size` prop is documented as a font-size override that wins over the
 * size implied by `type`. Its StyleX class lives in `@layer astryx-base`, but a
 * theme's per-type font-size rule (`.astryx-text.<type>`) lives in the higher
 * `@layer astryx-theme`, so the layer cascade let the theme silently shadow
 * `size` for any `type` the theme styled. Re-emitting the size classes here —
 * same layer as the type rules, same `.astryx-text.<x>` specificity, later in
 * source — restores `size` as a real override.
 *
 * Only `font-size` is overridden; line-height and other type properties are
 * intentionally preserved, matching the prop's documented contract.
 *
 * Gated on the theme touching `text` (which includes the auto-generated
 * type-scale rules) — with no theme type rule to beat, the base-layer StyleX
 * class already wins and no override is needed.
 */
function generateSizeOverrides(
  components: Record<string, unknown>,
  parts: string[],
): void {
  if (!('text' in components)) {
    return;
  }
  for (const [sizeName, sizeValue] of Object.entries(TEXT_SIZE_TOKEN_MAP)) {
    const suffix = parseStyleKey(`size:${sizeName}`);
    parts.push(
      `  ${componentClassSelector('text', suffix)} { font-size: ${sizeValue}; }`,
    );
  }
}

/**
 * Generate theme rules split into component and prose groups.
 *
 * Prose element rules (h1-h6, p, small, code, hr) style bare HTML elements
 * as themed defaults — conceptually the same tier as the CSS reset. They
 * belong in the reset layer so any class-based style wins.
 *
 * Component rules (tokens, .astryx-* overrides) are intentional theme overrides
 * that need to beat StyleX — they stay in astryx-theme (above StyleX layers).
 */
export function generateThemeRulesSplit(theme: DefinedTheme): ThemeRulesSplit {
  const allRules = generateThemeRules(theme);

  const prose: string[] = [];
  const component: string[] = [];

  for (const rule of allRules) {
    if (rule.trimStart().startsWith(':where(')) {
      prose.push(rule);
    } else {
      component.push(rule);
    }
  }

  return {component, prose};
}

/**
 * Generate CSS for on-media token and component overrides.
 *
 * Emitted in an unbounded @scope (no `to` limit) so the rules can reach
 * [data-astryx-media] elements. Parent theme component overrides flow through
 * to media contexts — only tokens change. Themes can further customize
 * via onDark.components / onLight.components.
 */
export function generateOnMediaCSS(theme: DefinedTheme): string {
  const parts: string[] = [];
  const scopeSelector = themeScopeStart(theme.name);

  for (const surface of ['dark', 'light'] as const) {
    const onMedia = surface === 'dark' ? theme.__onDark : theme.__onLight;
    if (!onMedia) {
      continue;
    }

    // Token overrides
    const tokenEntries = Object.entries(onMedia.tokens);
    if (tokenEntries.length > 0) {
      const declarations = tokenEntries
        .map(([prop, value]) => `    ${prop}: ${value};`)
        .join('\n');
      parts.push(`  ${mediaSelector(surface)} {\n${declarations}\n  }`);
    }

    // Component overrides
    if (onMedia.components) {
      for (const [component, rules] of Object.entries(onMedia.components)) {
        for (const [key, styles] of Object.entries(
          rules as Record<
            string,
            Record<string, string | Record<string, string>>
          >,
        )) {
          const entries = Object.entries(styles);
          if (entries.length === 0) {
            continue;
          }

          const suffix = parseStyleKey(key);
          const baseSelector = `:is(${mediaSelector(surface)}) :is(${componentClassSelector(component, suffix)})`;

          const props: [string, string][] = [];
          const pseudos: [string, Record<string, string>][] = [];

          for (const [prop, value] of entries) {
            if (prop.startsWith(':') && typeof value === 'object') {
              pseudos.push([prop, value]);
            } else {
              props.push([prop, value as string]);
            }
          }

          if (props.length > 0) {
            const declarations = props
              .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
              .join('\n');
            parts.push(`  ${baseSelector} {\n${declarations}\n  }`);
          }

          for (const [pseudo, pseudoStyles] of pseudos) {
            const pseudoEntries = Object.entries(pseudoStyles);
            if (pseudoEntries.length > 0) {
              const declarations = pseudoEntries
                .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
                .join('\n');
              parts.push(
                `  ${appendPseudoToSelectorList(baseSelector, pseudo)} {\n${declarations}\n  }`,
              );
            }
          }
        }
      }
    }
  }

  if (parts.length === 0) {
    return '';
  }

  const inner = parts.join('\n\n');
  return `@scope (${scopeSelector}) to (${THEME_SCOPE_TO}) {\n${inner}\n}`;
}

/**
 * Generate layered CSS for a theme — runtime path.
 *
 * Returns two CSS blocks for injection into different layers:
 * - `prose`: @scope'd element defaults → inject into @layer reset
 * - `component`: @scope'd token + .astryx-* overrides → inject into @layer astryx-theme
 *
 * This separation ensures prose defaults (what bare HTML looks like in a theme)
 * sit at reset-layer priority where any class-based style wins, while component
 * overrides sit above StyleX so themes can restyle components intentionally.
 */
export function generateThemeCSS(theme: DefinedTheme): ThemeCSSOutput {
  const {component, prose} = generateThemeRulesSplit(theme);
  const scopeSelector = themeScopeStart(theme.name);
  const scopeTo = THEME_SCOPE_TO;

  let proseCss = '';
  if (prose.length > 0) {
    const proseInner = prose.join('\n\n');
    proseCss = `@scope (${scopeSelector}) to (${scopeTo}) {\n${proseInner}\n}`;
  }

  // Component rules: bounded scope (stops at nested themes) +
  // on-media rules in unbounded scope (can reach [data-astryx-media] elements)
  let componentCss = '';
  if (component.length > 0) {
    const componentInner = component.join('\n\n');
    componentCss = `@scope (${scopeSelector}) to (${scopeTo}) {\n${componentInner}\n}`;
  }

  const onMediaCss = generateOnMediaCSS(theme);
  if (onMediaCss) {
    componentCss = componentCss
      ? `${componentCss}\n\n${onMediaCss}`
      : onMediaCss;
  }

  return {prose: proseCss, component: componentCss};
}

/**
 * Generate the full CSS string for a theme as a single string.
 * @deprecated Use generateThemeCSS() which returns { prose, component } for proper layering.
 * This flat version is kept for backwards compatibility with tests and simple cases.
 */
export function generateThemeCSSFlat(theme: DefinedTheme): string {
  const rules = generateThemeRules(theme);
  if (rules.length === 0) {
    return '';
  }
  const scopeSelector = themeScopeStart(theme.name);
  const inner = rules.join('\n\n');
  return `@scope (${scopeSelector}) to (${THEME_SCOPE_TO}) {\n${inner}\n}`;
}
