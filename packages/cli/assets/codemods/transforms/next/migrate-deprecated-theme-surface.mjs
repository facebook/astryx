// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Migrate the component-theming compatibility surface removed in 0.7.
 *
 * Static keys directly inside a JavaScript or TypeScript `components` object
 * move to their canonical target. CSS selectors move the same target classes
 * and replace target-qualified bare prop/state classes with reflected `data-*`
 * selectors. Dynamic theme keys, unqualified classes, declarations, comments,
 * and strings containing CSS are left for manual review.
 */

import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import {migrateAstryxThemeSelectors} from '../v0.6.0/migrate-astryx-theme-selectors-to-data-attrs.mjs';
import {
  V054_THEME_SELECTOR_DYNAMIC_AXES,
  V054_THEME_SELECTOR_TARGETS,
} from '../v0.6.0/migrate-astryx-theme-selectors-v0.5.4-data.mjs';

/** @type {Readonly<Record<string, string>>} */
export const DEPRECATED_THEME_TARGETS = Object.freeze({
  'base-table': 'table',
  checkbox: 'checkbox-indicator',
  codeblock: 'code-block',
  'codeblock-copy-button': 'code-block-copy-button',
  'codeblock-header': 'code-block-header',
  'codeblock-title': 'code-block-title',
  'date-input-clear-icon': 'input-clear-icon',
  'date-range-input-clear-icon': 'input-clear-icon',
  hovercard: 'hover-card',
  'multi-selector-clear-icon': 'input-clear-icon',
  navicon: 'nav-icon',
  'popover-surface': 'popover',
  progressbar: 'progress-bar',
  'progressbar-fill': 'progress-bar-fill',
  'progressbar-mark': 'progress-bar-mark',
  'progressbar-track': 'progress-bar-track',
  radio: 'radio-indicator',
  'radio-dot': 'radio-indicator-dot',
  'selector-clear-icon': 'input-clear-icon',
  statusdot: 'status-dot',
  textarea: 'text-area',
});

export const meta = {
  title: 'Migrate removed component theme aliases and selectors',
  description:
    'Renames all 21 removed component target aliases in static theme maps and CSS, and replaces target-qualified bare prop/state classes with reflected data attributes.',
  fileExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.css'],
};

const TODO_PREFIX = ' TODO(astryx upgrade): merge deprecated theme target ';
const KNOWN_SELECTOR_TARGETS = new Set([
  ...Object.keys(V054_THEME_SELECTOR_TARGETS),
  ...Object.keys(V054_THEME_SELECTOR_DYNAMIC_AXES),
]);

/** @param {string} target @param {string} token */
function targetEmittedBareClass(target, token) {
  if (V054_THEME_SELECTOR_TARGETS[target]?.[token] != null) return true;
  return (V054_THEME_SELECTOR_DYNAMIC_AXES[target] ?? []).some(rule =>
    rule.token === 'class-value'
      ? true
      : typeof rule.prefix === 'string' &&
        token.startsWith(rule.prefix) &&
        /^\d/.test(token.slice(rule.prefix.length)),
  );
}

/** @param {any} pseudo @returns {Set<string>} */
function compoundTargetsForPseudo(pseudo) {
  const parent = pseudo.parent;
  if (parent?.type !== 'selector' || !Array.isArray(parent.nodes)) {
    return new Set();
  }

  const index = parent.nodes.indexOf(pseudo);
  const compound = [];
  for (let cursor = index - 1; cursor >= 0; cursor--) {
    const node = parent.nodes[cursor];
    if (node.type === 'combinator') break;
    compound.push(node);
  }
  for (let cursor = index + 1; cursor < parent.nodes.length; cursor++) {
    const node = parent.nodes[cursor];
    if (node.type === 'combinator') break;
    compound.push(node);
  }

  const targets = new Set();
  for (const node of compound) {
    if (node.type !== 'class' || !node.value.startsWith('astryx-')) continue;
    const target = node.value.slice('astryx-'.length);
    if (KNOWN_SELECTOR_TARGETS.has(target)) targets.add(target);
  }
  return targets;
}

/** @param {any} selector */
function finishSelectorMigration(selector) {
  selector.walkPseudos((/** @type {any} */ pseudo) => {
    if (pseudo.value !== ':is' || !Array.isArray(pseudo.nodes)) return;
    const targets = compoundTargetsForPseudo(pseudo);
    if (targets.size === 0) return;
    const hasAttributeArm = pseudo.nodes.some(
      (/** @type {any} */ arm) =>
        arm.type === 'selector' &&
        arm.nodes.some((/** @type {any} */ node) => node.type === 'attribute'),
    );
    if (!hasAttributeArm) return;

    for (const arm of [...pseudo.nodes]) {
      if (arm.type !== 'selector' || arm.nodes.length !== 1) continue;
      const only = arm.nodes[0];
      if (
        only.type !== 'class' ||
        only.value.startsWith('astryx-') ||
        ![...targets].some(target => targetEmittedBareClass(target, only.value))
      ) {
        continue;
      }
      arm.remove();
    }
  });

  selector.walkClasses((/** @type {any} */ classNode) => {
    if (!classNode.value.startsWith('astryx-')) return;
    const oldKey = classNode.value.slice('astryx-'.length);
    const newKey = DEPRECATED_THEME_TARGETS[oldKey];
    if (newKey) classNode.value = `astryx-${newKey}`;
  });
}

/** @param {string} selector */
function finishSelectorText(selector) {
  return selectorParser(selectors => {
    selectors.each(finishSelectorMigration);
  }).processSync(selector, {lossless: true});
}

/** @param {string} params */
function finishScopeParams(params) {
  let result = '';
  let last = 0;
  let depth = 0;
  let groupStart = -1;
  let quote = '';
  let escaped = false;

  for (let index = 0; index < params.length; index++) {
    const char = params[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') {
      if (depth === 0) {
        result += params.slice(last, index + 1);
        groupStart = index + 1;
      }
      depth++;
      continue;
    }
    if (char === ')' && depth > 0) {
      depth--;
      if (depth === 0 && groupStart >= 0) {
        result += finishSelectorText(params.slice(groupStart, index));
        result += ')';
        last = index + 1;
        groupStart = -1;
      }
    }
  }
  return result + params.slice(last);
}

/** @param {string} source @param {string} from */
function migrateCss(source, from) {
  const migrated = migrateAstryxThemeSelectors(source, from);
  const root = postcss.parse(migrated, {from});
  root.walkRules(rule => {
    rule.selector = finishSelectorText(rule.selector);
  });
  root.walkAtRules('scope', atRule => {
    atRule.params = finishScopeParams(atRule.params);
  });
  return root.toString();
}

/** @param {any} property @returns {string | null} */
function staticPropertyName(property) {
  const key = property?.key;
  if (!key) return null;
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (
    (key.type === 'StringLiteral' || key.type === 'Literal') &&
    typeof key.value === 'string'
  ) {
    return key.value;
  }
  return null;
}

/** @param {any} path */
function hasThemeContext(path) {
  for (let current = path; current != null; current = current.parent) {
    const node = current.node;
    if (
      node?.type === 'CallExpression' &&
      node.callee?.type === 'Identifier' &&
      node.callee.name === 'defineTheme'
    ) {
      return true;
    }
    if (node?.type === 'VariableDeclarator' && node.id?.type === 'Identifier') {
      if (/^(?:theme(?:[A-Z_].*)?|.*Theme)$/u.test(node.id.name)) return true;
    }
    if (node?.type === 'ExportDefaultDeclaration') return true;
  }
  return false;
}

/** @param {any} objectPath @param {any} root @param {any} j */
function componentsVariableFeedsTheme(objectPath, root, j) {
  const parent = objectPath.parent?.node;
  if (
    parent?.type !== 'VariableDeclarator' ||
    parent.id?.type !== 'Identifier' ||
    parent.id.name !== 'components'
  ) {
    return false;
  }

  const bindingScope = objectPath.scope.lookup('components');
  let feedsTheme = false;
  root.find(j.ObjectProperty).forEach((/** @type {any} */ propertyPath) => {
    if (feedsTheme) return;
    const property = propertyPath.node;
    if (
      staticPropertyName(property) !== 'components' ||
      property.value?.type !== 'Identifier' ||
      property.value.name !== 'components'
    ) {
      return;
    }
    if (
      bindingScope != null &&
      propertyPath.scope.lookup('components') !== bindingScope
    ) {
      return;
    }
    if (hasThemeContext(propertyPath)) feedsTheme = true;
  });
  return feedsTheme;
}

/** @param {any} path @param {any} root @param {any} j */
function isComponentsMap(path, root, j) {
  const parentPath = path.parent;
  const parent = parentPath?.node;
  if (
    (parent?.type === 'ObjectProperty' || parent?.type === 'Property') &&
    staticPropertyName(parent) === 'components'
  ) {
    return hasThemeContext(parentPath);
  }
  return componentsVariableFeedsTheme(path, root, j);
}

/** @param {any} property @param {string} oldKey @param {string} newKey @param {any} j */
function addCollisionTodo(property, oldKey, newKey, j) {
  const message = `${TODO_PREFIX}\`${oldKey}\` into \`${newKey}\`; both keys are present. `;
  if (
    property.comments?.some(
      (/** @type {any} */ comment) => comment.value === message,
    )
  )
    return;
  property.comments = [
    ...(property.comments ?? []),
    j.commentBlock(message, true, false),
  ];
}

/** @param {string} source @param {any} j */
function migrateStaticThemeKeys(source, j) {
  const root = j(source);
  let changed = false;

  root.find(j.ObjectExpression).forEach((/** @type {any} */ objectPath) => {
    if (!isComponentsMap(objectPath, root, j)) return;
    const properties = objectPath.node.properties ?? [];
    const staticKeys = new Set(
      properties.map(staticPropertyName).filter(Boolean),
    );

    for (const property of properties) {
      if (property.type !== 'ObjectProperty' && property.type !== 'Property') {
        continue;
      }
      const oldKey = staticPropertyName(property);
      const newKey = oldKey ? DEPRECATED_THEME_TARGETS[oldKey] : undefined;
      if (!oldKey || !newKey) continue;

      if (staticKeys.has(newKey)) {
        const before = property.comments?.length ?? 0;
        addCollisionTodo(property, oldKey, newKey, j);
        if ((property.comments?.length ?? 0) !== before) changed = true;
        continue;
      }

      property.key = j.stringLiteral(newKey);
      property.computed = false;
      property.shorthand = false;
      staticKeys.delete(oldKey);
      staticKeys.add(newKey);
      changed = true;
    }
  });

  return changed ? root.toSource({quote: 'single'}) : undefined;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function migrateDeprecatedThemeSurface(file, api) {
  const extension = path.extname(file.path).toLowerCase();
  if (extension === '.css') {
    const result = migrateCss(file.source, file.path);
    return result === file.source ? undefined : result;
  }
  return migrateStaticThemeKeys(file.source, api.jscodeshift);
}
