// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Merge xds-* props, stylex.props result, and optional consumer className/style.
 *
 * stylex.props() returns { className, style }. This merges the Astryx stable
 * class name plus any data-attribute reflection from `themeProps()` with the
 * StyleX class name so both StyleX styles and the theme-targeting surface are
 * applied.
 *
 * Consumer className is appended after StyleX classes.
 * Consumer style is spread after StyleX inline styles, so these values take priority.
 *
 * @example
 * ```tsx
 * // Root element with themeProps
 * <div {...mergeProps(
 *   themeProps('button', { variant }),
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
type PropsObject = {
  className?: string;
  style?: StyleObject;
  [key: string]: unknown;
};

function mergeTwoProps(base: PropsObject, overrides: PropsObject): PropsObject {
  const merged: PropsObject = {...base, ...overrides};

  const cls = [base.className, overrides.className].filter(Boolean).join(' ');
  if (cls) {
    merged.className = cls;
  } else {
    delete merged.className;
  }

  const mergedStyle =
    overrides.style && base.style
      ? {...base.style, ...overrides.style}
      : overrides.style || base.style;
  if (mergedStyle) {
    merged.style = mergedStyle;
  } else {
    delete merged.style;
  }

  return merged;
}

export function mergeProps(
  xdsClassOrStylexResult: string | PropsObject,
  stylexResultOrClassName?: PropsObject | string,
  classNameOrStyle?: string | React.CSSProperties,
  style?: React.CSSProperties,
): PropsObject {
  // Disambiguate: first arg is string → (xdsClass, stylexResult, className?, style?)
  // first arg is object → merge arbitrary props (supports themeProps + data attrs).
  if (typeof xdsClassOrStylexResult === 'string') {
    const xdsClass = xdsClassOrStylexResult;
    const stylexResult = (stylexResultOrClassName as PropsObject) ?? {
      className: '',
    };
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

    return {...stylexResult, className: cls, style: mergedStyle};
  }

  const first = xdsClassOrStylexResult;
  const second =
    typeof stylexResultOrClassName === 'string'
      ? {className: stylexResultOrClassName}
      : (stylexResultOrClassName ?? {});
  let merged = mergeTwoProps(first, second);

  if (typeof classNameOrStyle === 'string') {
    merged = mergeTwoProps(merged, {className: classNameOrStyle});
  } else if (classNameOrStyle != null) {
    merged = mergeTwoProps(merged, {style: classNameOrStyle});
  }

  if (style != null) {
    merged = mergeTwoProps(merged, {style});
  }

  return merged;
}
