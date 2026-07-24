// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate legacy bare XDS theme selectors to data attributes.
 *
 * Converts selectors like:
 *   .xds-button.primary.sm:hover
 * to:
 *   .xds-button[data-variant="primary"][data-size="sm"]:hover
 *
 * The transform is intentionally conservative: it only rewrites component/value
 * pairs where the prop/state axis is known. Unknown component classes and
 * ambiguous values are left unchanged.
 */

export const meta = {
  title: 'Migrate XDS theme selectors to data attributes',
  description:
    'Rewrites legacy bare prop/state class selectors such as `.xds-button.primary` ' +
    'to preferred data-attribute selectors such as `.xds-button[data-variant="primary"]`.',
  fileExtensions: [
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
  ],
};

const COLOR_VALUES = new Set([
  'primary',
  'secondary',
  'disabled',
  'placeholder',
  'active',
  'accent',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
  'gray',
]);

const STATE_VALUES = new Set([
  'active',
  'checked',
  'disabled',
  'expanded',
  'focused',
  'hidden',
  'indeterminate',
  'invalid',
  'open',
  'pressed',
  'selected',
  'today',
  'visible',
]);

const STATUS_VALUES = new Set([
  'info',
  'neutral',
  'success',
  'warning',
  'error',
]);
const SIZE_VALUES = new Set([
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'small',
  'medium',
  'large',
]);
const TEXT_TYPES = new Set([
  'body',
  'large',
  'label',
  'code',
  'supporting',
  'display-1',
  'display-2',
  'display-3',
]);
const APP_SHELL_VARIANTS = new Set(['wash', 'surface', 'section', 'elevated']);
const SECTION_VARIANTS = new Set(['section', 'transparent', 'muted']);
const DIVIDER_VARIANTS = new Set(['subtle', 'strong']);
const ORIENTATIONS = new Set(['horizontal', 'vertical']);

function attr(/** @type {any} */ name, /** @type {any} */ value) {
  return `[data-${name}="${value}"]`;
}

function valueToAttr(/** @type {any} */ component, /** @type {any} */ value) {
  // Numeric-prefixed classes emitted as prop-value (level-2, gap-4, cols-3).
  let match = value.match(/^level-(\d+)$/);
  if (match) return attr('level', match[1]);

  match = value.match(/^gap-(\d+(?:-\d+)?)$/);
  if (match) return attr('gap', match[1].replace('-', '.'));

  match = value.match(/^(?:columns|cols)-(\d+)$/);
  if (match) return attr('columns', match[1]);

  switch (component) {
    case 'xds-button':
      if (SIZE_VALUES.has(value)) return attr('size', value);
      // Button variants are extensible, so unknown non-size values are most
      // likely custom variants.
      return attr('variant', value);

    case 'xds-badge':
    case 'xds-statusdot':
    case 'xds-avatar-status-dot':
    case 'xds-card':
    case 'xds-clickable-card':
      return attr('variant', value);

    case 'xds-app-shell':
    case 'xds-app-shell-header':
    case 'xds-app-shell-sidenav':
      if (APP_SHELL_VARIANTS.has(value)) return attr('variant', value);
      return null;

    case 'xds-section':
      if (SECTION_VARIANTS.has(value)) return attr('variant', value);
      return null;

    case 'xds-heading':
      if (TEXT_TYPES.has(value)) return attr('type', value);
      if (COLOR_VALUES.has(value)) return attr('color', value);
      return null;

    case 'xds-text':
      if (TEXT_TYPES.has(value)) return attr('type', value);
      if (COLOR_VALUES.has(value)) return attr('color', value);
      return null;

    case 'xds-link':
      if (COLOR_VALUES.has(value)) return attr('color', value);
      return null;

    case 'xds-icon':
      if (SIZE_VALUES.has(value)) return attr('size', value);
      if (COLOR_VALUES.has(value)) return attr('color', value);
      return null;

    case 'xds-divider':
      if (DIVIDER_VARIANTS.has(value)) return attr('variant', value);
      if (ORIENTATIONS.has(value)) return attr('orientation', value);
      return null;

    case 'xds-stack':
      if (ORIENTATIONS.has(value)) return attr('direction', value);
      if (value === 'wrap' || value === 'nowrap') return attr('wrap', value);
      return null;

    case 'xds-grid':
      if (['start', 'center', 'end', 'stretch'].includes(value))
        return attr('align', value);
      return null;

    case 'xds-banner':
    case 'xds-banner-icon':
    case 'xds-banner-content':
      if (STATUS_VALUES.has(value)) return attr('status', value);
      if (['card', 'inline'].includes(value)) return attr('container', value);
      return null;

    case 'xds-spinner':
      if (SIZE_VALUES.has(value)) return attr('size', value);
      if (['default', 'onMedia', 'subtle'].includes(value))
        return attr('shade', value);
      return null;

    case 'xds-progressbar':
    case 'xds-progressbar-fill':
      if (STATUS_VALUES.has(value) || value === 'accent')
        return attr('variant', value);
      return null;

    case 'xds-tab':
    case 'xds-side-nav-item':
    case 'xds-segmented-control-item':
    case 'xds-switch':
      if (STATE_VALUES.has(value)) return attr(value, value);
      return null;

    default:
      if (STATE_VALUES.has(value)) return attr(value, value);
      return null;
  }
}

const SELECTOR_RE = /\.((?:xds-[a-z0-9-]+))(\.(?:-?[_a-zA-Z][_a-zA-Z0-9-]*))+/g;

export function migrateThemeSelectors(/** @type {any} */ source) {
  return source.replace(SELECTOR_RE, (/** @type {any} */ full, /** @type {any} */ component) => {
    const classChain = full.slice(component.length + 1);
    const values = classChain.split('.').filter(Boolean);

    const attrs = [];
    for (const value of values) {
      // Preserve additional xds-* classes; those are not bare variant/state values.
      if (value.startsWith('xds-')) return full;
      const converted = valueToAttr(component, value);
      if (!converted) return full;
      attrs.push(converted);
    }

    return `.${component}${attrs.join('')}`;
  });
}

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @returns {string | null | undefined}
 */
export default function transformer(file) {
  const result = migrateThemeSelectors(file.source);
  return result === file.source ? undefined : result;
}
