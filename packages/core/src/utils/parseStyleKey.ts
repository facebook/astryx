/**
 * Parse a component style key into a CSS selector suffix.
 *
 * Used by both defineTheme (CSS generation) and components (class name rendering)
 * to ensure the same convention is applied consistently.
 *
 * <!-- SYNC: packages/cli/src/commands/build-theme.mjs (parseStyleKey) -->
 * <!-- SYNC: packages/core/src/utils/xdsClassName.ts -->
 *
 * Uses class names for visual prop values — shorter HTML, easier to inspect.
 * The component class (e.g. .xds-button) disambiguates any value overlaps.
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number.
 *
 * @example
 * ```ts
 * parseStyleKey('base')                        // ''
 * parseStyleKey('variant:secondary')            // '.secondary'
 * parseStyleKey('level:1')                      // '.level-1'
 * parseStyleKey('variant:destructive+size:sm')  // '.destructive.sm'
 * ```
 */
export function parseStyleKey(key: string): string {
  if (key === 'base') return '';

  return key
    .split('+')
    .map(part => {
      const [prop, value] = part.split(':');
      // Bare key without colon (e.g. 'checked', 'selected') → state class
      if (value === undefined) {
        return `.${prop}`;
      }
      // CSS classes can't start with a digit — prefix with prop name
      if (/^\d/.test(value)) {
        return `.${prop}-${value}`;
      }
      return `.${value}`;
    })
    .join('');
}
