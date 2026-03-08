/**
 * Merge stylex.props result with an xds-* class name.
 *
 * stylex.props() returns { className, style }. This merges the xds-*
 * class name into the className string so both StyleX styles and the
 * stable theme-targeting class are applied.
 *
 * @example
 * ```tsx
 * <div {...mergeProps(
 *   xdsClassName('button', { variant }),
 *   stylex.props(styles.base, variants[variant])
 * )} />
 * ```
 */
export function mergeProps(
  xdsClass: string,
  stylexResult: {className?: string; style?: object},
): {className: string; style?: object} {
  const merged = stylexResult.className
    ? `${xdsClass} ${stylexResult.className}`
    : xdsClass;
  return {className: merged, style: stylexResult.style};
}
