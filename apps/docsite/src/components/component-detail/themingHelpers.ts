// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themingHelpers.ts
 * @input A component's `theming` doc (targets, iconSlots, vars, derived) and its props.
 * @output Pure helpers that shape theming data for the component-detail
 *   Theming section — deriving `defineTheme` config keys, reflected data
 *   attributes, prop-value lists, the copyable config example, and the set of
 *   publicly-settable CSS variables.
 * @position Consumed by Theming.tsx; kept separate so the logic is unit-testable
 *   without rendering React.
 *
 * Mirrors the theming output of the CLI (`packages/cli/lib/component-format.mjs`)
 * so the docsite and `astryx component <Name>` present the same contract.
 */

import type {
  PropDoc,
  ThemingDoc,
  ThemingTarget,
  ComponentVar,
} from '../../generated/componentRegistry';

const NAMESPACE_PREFIX = 'astryx-';

/**
 * The key a target takes inside a `defineTheme` `components` config — the
 * stable class name with the `astryx-` namespace stripped. `astryx-button` →
 * `button`, `astryx-banner-icon` → `banner-icon`. Kept in sync with the CLI's
 * `targetKey` (packages/cli/lib/component-format.mjs) and `generateThemeRules`,
 * which re-adds the prefix when building the `.astryx-*` selector.
 */
export function configKey(target: ThemingTarget): string {
  return target.className.startsWith(NAMESPACE_PREFIX)
    ? target.className.slice(NAMESPACE_PREFIX.length)
    : target.className;
}

/** Kebab-case a visual-prop/state name into its reflected `data-*` attribute. */
export function dataAttrForName(name: string): string {
  return `data-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

/** All `data-*` attributes reflected on a target, from visual props + states. */
export function targetDataAttributes(target: ThemingTarget): string[] {
  return [
    ...(target.visualProps ?? []).map(dataAttrForName),
    ...(target.states ?? []).map(dataAttrForName),
  ];
}

/**
 * Resolve the display values for a target's props column. When `variant` is a
 * visual prop, expand it to the actual literal values from the component's
 * `variant` prop type (`'primary' | 'secondary'` → `primary, secondary`);
 * otherwise list the visual prop names as-is (`size`, `orientation`, …).
 */
export function targetPropValues(
  target: ThemingTarget,
  props: PropDoc[],
): string[] {
  if (!target.visualProps?.length) {
    return [];
  }
  if (target.visualProps.includes('variant')) {
    const variantProp = props.find(p => p.name === 'variant');
    if (variantProp && variantProp.type.includes('|')) {
      return variantProp.type
        .replace(/['"]/g, '')
        .split('|')
        .map(v => v.trim())
        .filter(Boolean);
    }
  }
  return target.visualProps;
}

export function canonicalTargets(theming: ThemingDoc): ThemingTarget[] {
  return theming.targets.filter(target => !target.deprecatedFor);
}

/**
 * Build a copyable `defineTheme` excerpt for the component's target and icon
 * slot surfaces. Each block is optional, so a slot-only component still gets a
 * useful example.
 */
export function buildDefineThemeExample(theming: ThemingDoc): string {
  const targets = canonicalTargets(theming);
  const lines: string[] = [];

  if (targets.length) {
    lines.push('components: {');

    const root = targets[0];
    lines.push(`  '${configKey(root)}': {`);
    lines.push(`    base: { /* CSS properties */ },`);
    if (root.visualProps?.length) {
      lines.push(
        `    '${root.visualProps[0]}:value': { /* prop-specific */ },`,
      );
    }
    if (root.states?.length) {
      lines.push(`    '${root.states[0]}': { /* state-specific */ },`);
    }
    lines.push(`  },`);

    if (targets.length > 1) {
      const sub = targets[1];
      lines.push(`  '${configKey(sub)}': {`);
      lines.push(`    base: { /* CSS properties */ },`);
      if (sub.states?.length) {
        lines.push(`    '${sub.states[0]}': { /* state-specific */ },`);
      }
      lines.push(`  },`);
    }

    lines.push(theming.iconSlots?.length ? '},' : '}');
  }

  if (theming.iconSlots?.length) {
    if (lines.length) {
      lines.push('');
    }
    lines.push('componentIcons: {');
    for (const icon of theming.iconSlots) {
      const fallback = icon.default == null ? 'null' : `'${icon.default}'`;
      lines.push(`  '${icon.slot}': ${fallback},`);
    }
    lines.push('}');
  }

  return lines.join('\n');
}

/** Public, directly-settable vars — private + derived vars are hidden. */
export function publicVars(theming: ThemingDoc): ComponentVar[] {
  return (theming.vars ?? []).filter(v => !v.private && !v.derived);
}

/**
 * Whether a component has any themeable surface worth documenting — at least
 * one theme target, component icon slot, or publicly-settable CSS variable. Mirrors the render
 * gate in Theming.tsx so the "Theming" tab is only shown when the panel would
 * have content.
 */
export function hasThemingContent(theming: ThemingDoc | null): boolean {
  if (!theming) {
    return false;
  }
  return (
    theming.targets.length > 0 ||
    (theming.iconSlots?.length ?? 0) > 0 ||
    publicVars(theming).length > 0
  );
}
