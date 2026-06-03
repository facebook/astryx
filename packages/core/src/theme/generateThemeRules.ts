// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme CSS generation utilities
 *
 * Shared logic for generating CSS rules from a resolved theme definition.
 * Used by both the runtime path (XDSTheme injects <style>) and the build
 * path (`xds theme build` pre-compiles to CSS files).
 *
 * Extracted from defineTheme.ts to reduce cyclomatic complexity and provide
 * a clear single-responsibility module for CSS generation.
 *
 * @input XDSDefinedTheme (resolved theme object from defineTheme)
 * @output CSS rule strings, split by layer (component vs prose)
 * @position packages/core/src/theme/generateThemeRules.ts
 */

import type {XDSDefinedTheme} from './defineTheme';
import {parseStyleKey} from '../utils/parseStyleKey';
import {getDerivedVars} from './derivedVarRegistry';

// =============================================================================
// Types
// =============================================================================

/**
 * Structured output from generateThemeRulesSplit.
 * Separates prose element defaults from component/token overrides
 * so callers can place them in different CSS layers.
 */
export interface ThemeRulesSplit {
  /** Token overrides + component .xds-* overrides + prop-level color rules */
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
   * Token overrides + component .xds-* overrides scoped to the theme.
   * Should be injected into @layer xds-theme — above StyleX layers so
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
 * Emits --xds-<component>-padding (shorthand) and directional overrides:
 *   --xds-card-padding: 20px
 *   --xds-card-padding-inline: 20px
 *   --xds-card-padding-block-start: 20px
 *   --xds-card-padding-block-end: 20px
 *
 * The container.stylex.ts default styles read these via var() fallbacks,
 * so the theme CSS sets the value and the component picks it up through
 * CSS custom property cascade — no layer competition with StyleX output.
 */
function expandContainerPadding(
  component: string,
  parsed: ParsedPadding,
): [string, string][] {
  const prefix = `--xds-${component}-padding`;
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
 * the runtime path (useInsertionEffect) and the build path (xds theme build).
 */
export function generateThemeRules(theme: XDSDefinedTheme): string[] {
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

  // 2. Component overrides (.xds-* class rules)
  if (theme.components) {
    generateComponentRules(theme.components, parts);
  }

  // 3. Prose HTML element rules (h1-h6, p, small, code, hr)
  generateProseRules(val, parts);

  // 4. Prop-level color overrides (for text/heading/link specificity)
  generateColorOverrides(theme.components || {}, parts);

  // (on-media rules are generated separately — see generateOnMediaCSS)

  return parts;
}

/**
 * Generate component .xds-* class override rules.
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
    for (const [key, styles] of Object.entries(
      rules,
    )) {
      const entries = Object.entries(styles);
      if (entries.length === 0) {continue;}

      const suffix = parseStyleKey(key);
      const baseSelector = `.xds-${component}${suffix}`;

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
          parts.push(`  ${baseSelector}${pseudo} {\n${declarations}\n  }`);
        }
      }
    }
  }
}

/**
 * Generate prose HTML element default rules (h1-h6, p, small, code, hr).
 * Wrapped in :where() for zero specificity — these are defaults that
 * any class-based style (StyleX, .xds-* overrides) should beat.
 * The caller places these in the reset layer (not xds-theme) so they
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
    font-family: var(--font-family-heading);
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
    active: 'var(--color-accent)',
  };

  const touchesText = 'text' in components;
  const touchesHeading = 'heading' in components;
  const touchesLink = 'link' in components;

  if (touchesText || touchesHeading || touchesLink) {
    for (const [colorName, colorValue] of Object.entries(TEXT_COLOR_MAP)) {
      if (touchesText) {
        parts.push(`  .xds-text.${colorName} { color: ${colorValue}; }`);
      }
      if (touchesHeading) {
        parts.push(`  .xds-heading.${colorName} { color: ${colorValue}; }`);
      }
      if (touchesLink) {
        parts.push(`  .xds-link.${colorName} { color: ${colorValue}; }`);
      }
    }
  }
}

/**
 * Generate theme rules split into component and prose groups.
 *
 * Prose element rules (h1-h6, p, small, code, hr) style bare HTML elements
 * as themed defaults — conceptually the same tier as the CSS reset. They
 * belong in the reset layer so any class-based style wins.
 *
 * Component rules (tokens, .xds-* overrides) are intentional theme overrides
 * that need to beat StyleX — they stay in xds-theme (above StyleX layers).
 */
export function generateThemeRulesSplit(
  theme: XDSDefinedTheme,
): ThemeRulesSplit {
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
 * [data-xds-media] elements. Parent theme component overrides flow through
 * to media contexts — only tokens change. Themes can further customize
 * via onDark.components / onLight.components.
 */
export function generateOnMediaCSS(theme: XDSDefinedTheme): string {
  const parts: string[] = [];
  const scopeSelector = `[data-xds-theme="${theme.name}"]`;

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
      parts.push(`  [data-xds-media="${surface}"] {\n${declarations}\n  }`);
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
          if (entries.length === 0) {continue;}

          const suffix = parseStyleKey(key);
          const baseSelector = `[data-xds-media="${surface}"] .xds-${component}${suffix}`;

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
              parts.push(`  ${baseSelector}${pseudo} {\n${declarations}\n  }`);
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
  return `@scope (${scopeSelector}) to ([data-xds-theme]) {\n${inner}\n}`;
}

/**
 * Generate layered CSS for a theme — runtime path.
 *
 * Returns two CSS blocks for injection into different layers:
 * - `prose`: @scope'd element defaults → inject into @layer reset
 * - `component`: @scope'd token + .xds-* overrides → inject into @layer xds-theme
 *
 * This separation ensures prose defaults (what bare HTML looks like in a theme)
 * sit at reset-layer priority where any class-based style wins, while component
 * overrides sit above StyleX so themes can restyle components intentionally.
 */
export function generateThemeCSS(theme: XDSDefinedTheme): ThemeCSSOutput {
  const {component, prose} = generateThemeRulesSplit(theme);
  const scopeSelector = `[data-xds-theme="${theme.name}"]`;
  const scopeTo = `[data-xds-theme]`;

  let proseCss = '';
  if (prose.length > 0) {
    const proseInner = prose.join('\n\n');
    proseCss = `@scope (${scopeSelector}) to (${scopeTo}) {\n${proseInner}\n}`;
  }

  // Component rules: bounded scope (stops at nested themes) +
  // on-media rules in unbounded scope (can reach [data-xds-media] elements)
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
export function generateThemeCSSFlat(theme: XDSDefinedTheme): string {
  const rules = generateThemeRules(theme);
  if (rules.length === 0) {
    return '';
  }
  const scopeSelector = `[data-xds-theme="${theme.name}"]`;
  const inner = rules.join('\n\n');
  return `@scope (${scopeSelector}) to ([data-xds-theme]) {\n${inner}\n}`;
}
