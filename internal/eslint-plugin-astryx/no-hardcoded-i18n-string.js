// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-hardcoded-i18n-string.js
 * @description Disallow hardcoded English string literals in user-facing
 * props. Any package that ships translatable UI can enable this rule; scope
 * it with the standard flat-config `files: [...]` pattern.
 *
 * The rule itself is filesystem-agnostic — it does not hardcode any path.
 * The caller decides where to run it via `files` / `ignores` in the ESLint
 * config, and where the i18n runtime itself lives via `ignores`.
 *
 * Flags:
 *   1. JSX attributes named like *Label / *Text / *Placeholder / *Title
 *      / *Message / *Tooltip / *Hint / *Description / *Summary, plus
 *      `label`, `placeholder`, `title`, `tooltip`, `text`, `summary`,
 *      `message`, `description`, `hint`, and the specific `aria-*`
 *      attributes that take user-visible text (`aria-label`,
 *      `aria-description`, `aria-placeholder`, `aria-roledescription`,
 *      `aria-valuetext`, `aria-braillelabel`, `aria-brailleroledescription`,
 *      `aria-keyshortcuts`), when the value is a hardcoded string literal
 *      that "looks user-facing". Other `aria-*` attributes (aria-controls,
 *      aria-expanded, aria-hidden, …) take IDs / booleans / enums and are
 *      NOT flagged.
 *   2. Object property assignments of the same names inside .tsx files.
 *   3. Destructure defaults (`function Foo({label = 'X'})`) of the same names.
 *
 * Ignores:
 *   - Test files (*.test.*, __tests__/**)
 *   - Storybook stories (*.stories.*)
 *   - Doc files (*.doc.mjs)
 *   - JSDoc @example blocks (comments)
 *   - Values that look non-user-facing (lowercase identifier-only, empty, etc.)
 *
 * Good:
 *   <button aria-label={t('foo.label')}>
 *   {label: t('powersearch.operator.contains')}
 *   function Foo({label: labelFromProps}) {
 *     const label = labelFromProps ?? t('foo.label');
 *   }
 *
 * Bad:
 *   <button aria-label="Close">
 *   {key: 'contains', label: 'contains'}
 *   function Foo({label = 'Cancel'})
 */

/**
 * Attribute / property names that we consider user-facing text sinks.
 * Exact matches AND suffix-match patterns.
 */
const EXACT_NAMES = new Set([
  'label',
  'placeholder',
  'title',
  'tooltip',
  'text',
  'summary',
  'message',
  'description',
  'hint',
]);

/**
 * `aria-*` attributes whose values are user-visible text per WAI-ARIA 1.3.
 * All other aria-* attributes take IDs, booleans, tristates, integers, or
 * enum tokens — not translatable prose — so we deliberately do NOT flag them.
 */
const ARIA_TEXT_ATTRS = new Set([
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
  'aria-braillelabel',
  'aria-brailleroledescription',
  // Note: aria-keyshortcuts contains keyboard key names ("Alt+Shift+P"); those
  // are typically NOT translated (key names are usually a locale/OS concern
  // handled by the platform), but consumers who DO want to localize should
  // still route them through i18n — we include it to prevent hardcoded English
  // key hints from slipping in.
  'aria-keyshortcuts',
]);

/**
 * Suffix patterns for user-facing prop names. Any prop name ending in
 * one of these is flagged.
 */
const SUFFIX_PATTERNS = [
  /Label$/,      // saveButtonLabel, cancelLabel, previousLabel, ...
  /Text$/,       // emptySearchText, helperText, errorText, ...
  /Placeholder$/,// searchPlaceholder, timePlaceholder, ...
  /Title$/,      // dialogTitle, ...
  /Message$/,    // disabledMessage, errorMessage, ...
  /Tooltip$/,    // ...
  /Hint$/,       // ...
  /Description$/,// ...
  /Summary$/,    // ...
];

function isUserFacingName(name) {
  if (typeof name !== 'string') return false;
  if (EXACT_NAMES.has(name)) return true;
  if (ARIA_TEXT_ATTRS.has(name)) return true;
  for (const pat of SUFFIX_PATTERNS) {
    if (pat.test(name)) return true;
  }
  return false;
}

/**
 * Heuristic — does this string LOOK like user-facing English?
 *   - Non-empty, longer than 1 char.
 *   - Starts with a capital, OR contains a space, OR ends with punctuation.
 *   - Not obviously an identifier (single lowercase word, all-caps constant).
 *   - Not a URL, path, or data: URI.
 */
function looksUserFacing(value) {
  if (typeof value !== 'string') return false;
  if (value.length < 2) return false;
  if (value.length > 200) return false; // probably not a UI label
  // URL / path / data
  if (
    value.startsWith('/') ||
    value.startsWith('http') ||
    value.startsWith('data:') ||
    value.startsWith('#') ||
    value.startsWith('.')
  ) {
    return false;
  }
  // All-caps enum constant like `IS_ANY_OF`
  if (value === value.toUpperCase() && /[A-Z_]/.test(value) && !/\s/.test(value)) {
    return false;
  }
  // Single lowercase word (identifier-shaped: `contains`, `email`, `foo123`)
  if (/^[a-z][a-z0-9]*$/.test(value)) return false;
  // Has a space, OR starts with uppercase, OR ends with ., …, !, ?
  const hasSpace = /\s/.test(value);
  const startsUpper = /^[A-Z]/.test(value);
  const endsWithPunct = /[.…!?]$/.test(value);
  return hasSpace || startsUpper || endsWithPunct;
}

const IGNORED_FILE_PATTERNS = [
  /\.test\./,
  /\.stories\./,
  /\.doc\.mjs$/,
  /__tests__/,
  /\.perf\.test\./,
];

function shouldIgnoreFile(filename) {
  return IGNORED_FILE_PATTERNS.some(p => p.test(filename));
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded user-facing strings; route through useTranslator() instead',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcodedString:
        'Hardcoded user-facing string {{value}} in `{{name}}`. ' +
        'Route through `t(\'<namespace>.<component>.<key>\')` via `useTranslator()` so it can be localized.',
      hardcodedDefault:
        'Hardcoded default {{value}} for prop `{{name}}`. ' +
        'Use the alias-and-resolve pattern: `{{name}}: {{name}}FromProps` in the destructure, then ' +
        '`const {{name}} = {{name}}FromProps ?? t(\'<namespace>.<component>.<key>\');` inside the body.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename;
    if (shouldIgnoreFile(filename)) return {};

    return {
      // 1. JSX attribute string literals:  <X label="Cancel">
      JSXAttribute(node) {
        if (!node.name || node.name.type === 'JSXNamespacedName') return;
        const name =
          node.name.type === 'JSXIdentifier'
            ? node.name.name
            : null;
        if (!isUserFacingName(name)) return;
        // Attribute value must be a string literal (not a JSX expression)
        if (
          node.value?.type !== 'Literal' ||
          typeof node.value.value !== 'string'
        )
          return;
        const val = node.value.value;
        if (!looksUserFacing(val)) return;
        context.report({
          node: node.value,
          messageId: 'hardcodedString',
          data: {value: JSON.stringify(val), name},
        });
      },

      // 2. Object property `label: 'Xxx'`
      Property(node) {
        if (node.computed || node.shorthand) return;
        const name =
          node.key.type === 'Identifier'
            ? node.key.name
            : node.key.type === 'Literal'
            ? node.key.value
            : null;
        if (!isUserFacingName(name)) return;
        if (
          node.value.type !== 'Literal' ||
          typeof node.value.value !== 'string'
        )
          return;
        const val = node.value.value;
        if (!looksUserFacing(val)) return;
        context.report({
          node: node.value,
          messageId: 'hardcodedString',
          data: {value: JSON.stringify(val), name},
        });
      },

      // 3. Destructure default: `function Foo({label = 'X'} : Props)`
      //    ObjectPattern > Property with a shorthand-alike `key = default` pattern.
      //    In AST that's an AssignmentPattern whose parent is a Property in an ObjectPattern.
      AssignmentPattern(node) {
        // Only when we're the value of a Property inside an ObjectPattern
        if (
          node.parent?.type !== 'Property' ||
          node.parent.parent?.type !== 'ObjectPattern'
        )
          return;
        const property = node.parent;
        const name =
          property.key.type === 'Identifier'
            ? property.key.name
            : property.key.type === 'Literal'
            ? property.key.value
            : null;
        if (!isUserFacingName(name)) return;
        if (
          node.right.type !== 'Literal' ||
          typeof node.right.value !== 'string'
        )
          return;
        const val = node.right.value;
        if (!looksUserFacing(val)) return;
        context.report({
          node: node.right,
          messageId: 'hardcodedDefault',
          data: {value: JSON.stringify(val), name},
        });
      },
    };
  },
};

export default rule;
