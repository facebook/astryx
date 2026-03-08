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
 * <div {...mergeProps(
 *   xdsClassName('button', { variant }),
 *   stylex.props(styles.base, variants[variant]),
 *   className,
 *   style,
 * )} />
 * ```
 */
export function mergeProps(
  xdsClass: string,
  stylexResult: {className?: string; style?: object},
  className?: string,
  style?: React.CSSProperties,
): {className: string; style?: object} {
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
