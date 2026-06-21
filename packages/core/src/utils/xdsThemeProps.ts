// Copyright (c) Meta Platforms, Inc. and affiliates.

import {stableClassName, legacyStableClassName} from '../naming';

export type ClassValue = string | number | undefined | null;
export type ClassProps = Record<string, ClassValue>;
export type ThemeDataAttributes = Record<`data-${string}`, string | undefined>;
export type ThemeProps = {className: string} & ThemeDataAttributes;

function toDataAttributeName(prop: string): `data-${string}` {
  return `data-${prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function classTokenForPropValue(prop: string, value: string): string {
  // CSS classes can't start with a digit — prefix with prop name.
  return /^\d/.test(value) ? `${prop}-${value}` : value;
}

/**
 * Build the legacy xds-* class name string for a component.
 *
 * Every XDS component renders a base class (`xds-button`, `xds-card`, etc.)
 * plus legacy variant classes derived from visual props. XDS also reflects
 * those visual props as data attributes via `xdsThemeProps()` (`data-variant`,
 * `data-size`, `data-level`, etc.) so consumers can migrate CSS selectors
 * away from collision-prone bare class names while old selectors keep working.
 *
 * The `xds-`/`astryx-` prefix comes from the centralized naming module
 * (`packages/core/src/naming.ts`) so the prefix migration flips in one place.
 *
 * <!-- SYNC: packages/core/src/naming.ts (namespace prefix source of truth) -->
 * <!-- SYNC: packages/core/src/utils/parseStyleKey.ts -->
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number (e.g. level=1 → "level-1").
 * Data attributes keep the literal value (e.g. `data-level="1"`).
 *
 * @param component - Component name in lowercase (e.g. 'button', 'card')
 * @param props - Visual prop values to include as legacy variant classes
 * @returns Class name string (e.g. "astryx-button xds-button secondary sm")
 *
 * @example
 * ```ts
 * dualClassName('button', { variant: 'secondary', size: 'sm' })
 * // → "astryx-button xds-button secondary sm"
 *
 * dualClassName('heading', { level: 1 })
 * // → "astryx-heading xds-heading level-1"
 *
 * dualClassName('card')
 * // → "astryx-card xds-card"
 * ```
 */
function dualClassName(component: string, props?: ClassProps): string {
  // Dual-emit both the new (astryx-*) and legacy (xds-*) base class so existing
  // consumer CSS selectors keep matching during the compat window. The new
  // prefix is listed first; legacy stays until the final cutover (P10).
  const classes = [
    stableClassName(component),
    legacyStableClassName(component),
  ];

  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      classes.push(classTokenForPropValue(prop, String(value)));
    }
  }

  return classes.join(' ');
}

/**
 * Reflect XDS visual props as `data-*` attributes.
 *
 * Keys are kebab-cased (`listStyle` → `data-list-style`) and values are the
 * literal prop values, including numeric values (`level: 1` → `data-level="1"`).
 * Nullish values are omitted.
 */
export function xdsThemeDataAttributes(
  props?: ClassProps,
): ThemeDataAttributes {
  const attrs: ThemeDataAttributes = {};

  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      attrs[toDataAttributeName(prop)] = String(value);
    }
  }

  return attrs;
}

/**
 * Build the props object components should spread onto the same element that
 * receives the stable XDS class name.
 *
 * This dual-emits the legacy bare classes and the new data-attribute reflection
 * surface. For example:
 *
 * ```ts
 * xdsThemeProps('button', { variant: 'primary', size: 'sm' })
 * // → { className: 'astryx-button xds-button primary sm', data-variant: 'primary', data-size: 'sm' }
 * ```
 */
export function xdsThemeProps(
  component: string,
  props?: ClassProps,
): ThemeProps {
  return {
    className: dualClassName(component, props),
    ...xdsThemeDataAttributes(props),
  };
}
