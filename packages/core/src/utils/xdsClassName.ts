// Copyright (c) Meta Platforms, Inc. and affiliates.

type XDSVisualPropValue = string | number | undefined | null;

export type XDSDataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

export type XDSClassNameProps = XDSDataAttributes & {
  className: string;
};

export const XDS_PROPS_MARKER: unique symbol = Symbol('xdsProps');

export type XDSPropsObject = XDSClassNameProps & {
  [XDS_PROPS_MARKER]: true;
};

function variantClassName(prop: string, value: string): string {
  // CSS classes can't start with a digit — prefix with prop name.
  return /^\d/.test(value) ? `${prop}-${value}` : value;
}

function dataAttributeName(prop: string): `data-${string}` {
  return `data-${prop.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`;
}

/**
 * Build the xds-* class name string for a component.
 *
 * Every XDS component renders a base class (`xds-button`, `xds-card`, etc.)
 * plus compatibility value classes derived from visual props. Components should
 * use `xdsProps()` so those same visual props are reflected as `data-*`
 * attributes for safer external CSS selectors.
 *
 * <!-- SYNC: packages/cli/src/commands/build-theme.mjs (parseStyleKey + selector generation) -->
 * <!-- SYNC: packages/core/src/utils/parseStyleKey.ts -->
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number (e.g. level=1 → "level-1").
 *
 * @param component - Component name in lowercase (e.g. 'button', 'card')
 * @param props - Visual prop values to include as compatibility value classes
 * @returns Class name string (e.g. "xds-button secondary sm")
 *
 * @example
 * ```ts
 * xdsClassName('button', { variant: 'secondary', size: 'sm' })
 * // → "xds-button secondary sm"
 *
 * xdsClassName('heading', { level: 1 })
 * // → "xds-heading level-1"
 *
 * xdsClassName('card')
 * // → "xds-card"
 * ```
 */
export function xdsClassName(
  component: string,
  props?: Record<string, XDSVisualPropValue>,
): string {
  const classes = [`xds-${component}`];

  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      classes.push(variantClassName(prop, String(value)));
    }
  }

  return classes.join(' ');
}

/**
 * Reflect visual prop values into stable data attributes.
 *
 * This is emitted alongside the existing bare classes during the compatibility
 * window so selectors can migrate from `.xds-button.primary` to
 * `.xds-button[data-variant="primary"]` without breaking current themes.
 */
export function xdsDataAttributes(
  props?: Record<string, XDSVisualPropValue>,
): XDSDataAttributes {
  const attributes: XDSDataAttributes = {};

  if (!props) {
    return attributes;
  }

  for (const [prop, value] of Object.entries(props)) {
    if (value == null) {
      continue;
    }
    attributes[dataAttributeName(prop)] = String(value);
  }

  return attributes;
}

/**
 * Build root props for an XDS component: the current class-name contract plus
 * data-* attributes that reflect visual prop values.
 */
export function xdsProps(
  component: string,
  props?: Record<string, XDSVisualPropValue>,
): XDSPropsObject {
  const result: XDSPropsObject = {
    [XDS_PROPS_MARKER]: true,
    className: xdsClassName(component, props),
    ...xdsDataAttributes(props),
  };

  Object.defineProperty(result, XDS_PROPS_MARKER, {
    value: true,
    enumerable: false,
  });

  return result;
}

export function isXDSPropsObject(value: unknown): value is XDSPropsObject {
  return (
    typeof value === 'object' &&
    value != null &&
    (value as Partial<XDSPropsObject>)[XDS_PROPS_MARKER] === true
  );
}
