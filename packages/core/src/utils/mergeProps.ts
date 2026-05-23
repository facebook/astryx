// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Merge xds-* class name, stylex.props result, and optional consumer className/style.
 *
 * stylex.props() returns { className, style }. This merges the xds-*
 * class name into the className string so both StyleX styles and the
 * stable theme-targeting class are applied.
 *
 * Consumer className is appended after StyleX classes.
 * Consumer style is spread after StyleX inline styles, so these values take priority.
 *
 * @example
 * ```tsx
 * // Root element with xdsClassName
 * <div {...mergeProps(
 *   xdsClassName('button', { variant }),
 *   stylex.props(styles.base, variants[variant]),
 *   className,
 *   style,
 * )} />
 *
 * // Internal element — stylex + dynamic style only
 * <div {...mergeProps(
 *   stylex.props(styles.track),
 *   { style: { width: dynamicWidth } },
 * )} />
 * ```
 */

type StyleObject = React.CSSProperties;

export function mergeProps(
  xdsClassOrStylexResult: string | {className?: string; style?: StyleObject},
  stylexResultOrClassName?:
    | {className?: string; style?: StyleObject}
    | string
    | undefined,
  classNameOrStyle?: string | React.CSSProperties,
  style?: React.CSSProperties,
): {className: string; style?: StyleObject} {
  // Disambiguate: first arg is string → (xdsClass, stylexResult, className?, style?)
  // first arg is object → (stylexResult, overrides?, ...)
  if (typeof xdsClassOrStylexResult === 'string') {
    const xdsClass = xdsClassOrStylexResult;
    const stylexResult = (stylexResultOrClassName as {
      className?: string;
      style?: StyleObject;
    }) ?? {className: ''};
    const className = classNameOrStyle as string | undefined;

    let cls = stylexResult.className
      ? `${xdsClass} ${stylexResult.className}`
      : xdsClass;
    if (className) {
      cls = `${cls} ${className}`;
    }

    const mergedStyle =
      style && stylexResult.style
        ? {...stylexResult.style, ...style}
        : style || stylexResult.style;

    return {className: cls, style: mergedStyle};
  }

  // Object form: mergeProps(stylex.props(...), { style, className })
  const base = xdsClassOrStylexResult;
  const overrides =
    (stylexResultOrClassName as {
      className?: string;
      style?: StyleObject;
    }) ?? {};

  let cls = base.className ?? '';
  if (overrides.className) {
    cls = cls ? `${cls} ${overrides.className}` : overrides.className;
  }

  const mergedStyle =
    overrides.style && base.style
      ? {...base.style, ...overrides.style}
      : overrides.style || base.style;

  return {className: cls, style: mergedStyle};
}
