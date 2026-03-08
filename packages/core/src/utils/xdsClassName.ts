/**
 * Build the xds-* class name string for a component.
 *
 * Every XDS component renders a base class (`xds-button`, `xds-card`, etc.)
 * plus variant classes derived from visual props. These stable class names
 * enable CSS-based theming via @scope'd selectors in defineTheme.
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number (e.g. level=1 → "level-1").
 *
 * @param component - Component name in lowercase (e.g. 'button', 'card')
 * @param props - Visual prop values to include as variant classes
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
  props?: Record<string, string | number | undefined | null>,
): string {
  const classes = [`xds-${component}`];

  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (value == null) continue;
      const strValue = String(value);
      // CSS classes can't start with a digit — prefix with prop name
      if (/^\d/.test(strValue)) {
        classes.push(`${prop}-${strValue}`);
      } else {
        classes.push(strValue);
      }
    }
  }

  return classes.join(' ');
}
