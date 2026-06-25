// Copyright (c) Meta Platforms, Inc. and affiliates.

import {stableClassName} from '../naming';

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
 * Build the astryx-* class name string for a component.
 *
 * Every component renders a stable base class (`astryx-button`, `astryx-card`,
 * etc.) plus variant classes derived from visual props. Components also reflect
 * those visual props as data attributes via `themeProps()` (`data-variant`,
 * `data-size`, `data-level`, etc.) so consumers target stable data-attribute
 * selectors rather than collision-prone bare class names.
 *
 * The `astryx-` prefix comes from the centralized naming module
 * (`packages/core/src/naming.ts`) so the namespace lives in one place.
 *
 * <!-- SYNC: packages/core/src/naming.ts (namespace prefix source of truth) -->
 * <!-- SYNC: packages/core/src/utils/parseStyleKey.ts -->
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number (e.g. level=1 → "level-1").
 * Data attributes keep the literal value (e.g. `data-level="1"`).
 *
 * @param component - Component name in lowercase (e.g. 'button', 'card')
 * @param props - Visual prop values to include as variant classes
 * @returns Class name string (e.g. "astryx-button secondary sm")
 *
 * @example
 * ```ts
 * buildClassName('button', { variant: 'secondary', size: 'sm' })
 * // → "astryx-button secondary sm"
 *
 * buildClassName('heading', { level: 1 })
 * // → "astryx-heading level-1"
 *
 * buildClassName('card')
 * // → "astryx-card"
 * ```
 */
function buildClassName(component: string, props?: ClassProps): string {
  const classes = [stableClassName(component)];

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
 * Reflect Astryx visual props as `data-*` attributes.
 *
 * Keys are kebab-cased (`listStyle` → `data-list-style`) and values are the
 * literal prop values, including numeric values (`level: 1` → `data-level="1"`).
 * Nullish values are omitted.
 */
export function themeDataAttributes(
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
 * receives the stable Astryx class name.
 *
 * This emits the stable astryx class plus the data-attribute reflection
 * surface. For example:
 *
 * ```ts
 * themeProps('button', { variant: 'primary', size: 'sm' })
 * // → { className: 'astryx-button primary sm', data-variant: 'primary', data-size: 'sm' }
 * ```
 */
export function themeProps(
  component: string,
  props?: ClassProps,
): ThemeProps {
  return {
    className: buildClassName(component, props),
    ...themeDataAttributes(props),
  };
}
