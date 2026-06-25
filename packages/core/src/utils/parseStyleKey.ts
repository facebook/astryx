// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Parse a component style key into a CSS selector suffix.
 *
 * Used by both defineTheme (CSS generation) and components (class name rendering)
 * to ensure the same convention is applied consistently.
 *
 * <!-- SYNC: packages/core/src/utils/themeProps.ts -->
 *
 * Emits the legacy class-selector suffix used by defineTheme/component override
 * generation today. Components also reflect the same prop values as data
 * attributes via `themeProps()` (`variant:secondary` renders both `.secondary`
 * and `[data-variant="secondary"]` in the DOM), but generated theme CSS still
 * uses these class selectors until the selector contract migrates fully.
 *
 * Values starting with a digit get prefixed with the prop name since
 * CSS class names can't start with a number.
 *
 * Bare state names (no colon) are used directly as class names.
 * This supports state-based theming targets like 'checked', 'disabled',
 * 'selected' documented in the Theming Infrastructure wiki.
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
