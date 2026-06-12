// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Parse a component style key into a CSS selector suffix.
 *
 * Used by both defineTheme (CSS generation) and components (class name rendering)
 * to ensure the same convention is applied consistently.
 *
 * <!-- SYNC: packages/cli/src/commands/build-theme.mjs (parseStyleKey) -->
 * <!-- SYNC: packages/core/src/utils/xdsClassName.ts -->
 *
 * Uses compatibility class names for visual prop values in generated theme CSS.
 * Components also reflect the same props as data attributes via `xdsProps()`;
 * new external CSS selectors should prefer those data attributes.
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number.
 *
 * Bare state names (no colon) are used directly as compatibility class names.
 * This supports state-based theming targets like 'checked', 'disabled',
 * 'selected' while components migrate selector consumers toward data attributes.
 *
 * @example
 * ```ts
 * parseStyleKey('base')                        // ''
 * parseStyleKey('checked')                      // '.checked'
 * parseStyleKey('checked+disabled')             // '.checked.disabled'
 * parseStyleKey('variant:secondary')            // '.secondary'
 * parseStyleKey('level:1')                      // '.level-1'
 * parseStyleKey('variant:destructive+size:sm')  // '.destructive.sm'
 * ```
 */
export function parseStyleKey(key: string): string {
  if (key === 'base') {
    return '';
  }

  return key
    .split('+')
    .map(part => {
      const [prop, value] = part.split(':');
      // Bare state name (no colon) — e.g. 'checked', 'disabled', 'selected'
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
