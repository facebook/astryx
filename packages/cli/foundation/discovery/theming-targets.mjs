// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The one enumeration of component theming targets.
 *
 * @input  a core `src` directory
 * @output every `theming.targets` entry authored in a component `.doc.mjs`,
 *         flattened into the `defineTheme` component key a theme author writes
 * @position packages/cli/foundation/discovery — shared by `theme targets` (the
 *           listing) and `theme build` (override validation). Both read the
 *           component docs, which are the source of truth `astryx component
 *           <Name>` prints; nothing here is a second registry, so the list a
 *           theme author can enumerate and the set the compiler accepts cannot
 *           drift from the components or from each other.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadComponentDoc} from './component-loader.mjs';

const SKIP_DIRS = new Set(['node_modules', '__tests__']);

/**
 * One theming target, as a theme author has to write it.
 * @typedef {object} ThemingTarget
 * @property {string} key - the `defineTheme` `components` key (class minus the `astryx-` prefix)
 * @property {string} className - the stable class the component renders
 * @property {string} component - the component whose doc declares it
 * @property {string[]} props - visual props the target reflects (`variant:value` keys)
 * @property {string[]} states - runtime states the target reflects (bare-name keys)
 */

/**
 * Strip the namespace prefix to get the `defineTheme` key for a class name.
 *
 * Keep the `astryx-` literal in sync with packages/core/src/naming.ts
 * (NAMESPACE / classPrefix), the same way component-format.mjs does.
 * <!-- SYNC: packages/core/src/naming.ts (namespace prefix source of truth) -->
 * @param {string} className
 * @returns {string}
 */
function targetKey(className) {
  return className.replace(/^astryx-/, '');
}

/**
 * Every theming target declared under a core `src` directory, sorted by key
 * then component. A key can appear more than once: a shared sub-element (the
 * radio indicator, say) is documented by every component that renders it.
 *
 * Unreadable docs are skipped rather than fatal — a single malformed doc must
 * not take out theme validation or the listing.
 *
 * @param {string} coreSrc - absolute path to `<core>/src`
 * @returns {Promise<ThemingTarget[]>}
 */
export async function collectThemingTargets(coreSrc) {
  if (!coreSrc || !fs.existsSync(coreSrc)) return [];

  /** @type {ThemingTarget[]} */
  const targets = [];

  /** @param {string} dir */
  async function scan(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await scan(full);
        continue;
      }
      if (!entry.name.endsWith('.doc.mjs')) continue;

      /** @type {any} */
      let doc;
      try {
        doc = await loadComponentDoc(full);
      } catch {
        continue;
      }

      const component =
        typeof doc?.name === 'string' && doc.name
          ? doc.name
          : path.basename(path.dirname(full));

      for (const target of doc?.theming?.targets || []) {
        const className = target?.className;
        if (typeof className !== 'string') continue;
        const key = targetKey(className);
        if (!key) continue;
        targets.push({
          key,
          className,
          component,
          props: stringList(target.visualProps),
          states: stringList(target.states),
        });
      }
    }
  }

  await scan(coreSrc);

  targets.sort(
    (a, b) => a.key.localeCompare(b.key) || a.component.localeCompare(b.component),
  );
  return targets;
}

/**
 * Collapse the enumeration into the `{key: [props and states]}` map theme
 * validation checks override keys against — both are legal override keys, so
 * they share one list.
 * @param {ThemingTarget[]} targets
 * @returns {Record<string, string[]>}
 */
export function targetsByKey(targets) {
  /** @type {Record<string, string[]>} */
  const byKey = {};
  for (const t of targets) {
    byKey[t.key] = [...new Set([...(byKey[t.key] || []), ...t.props, ...t.states])];
  }
  return byKey;
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function stringList(value) {
  return Array.isArray(value)
    ? value.filter((/** @type {unknown} */ v) => typeof v === 'string')
    : [];
}
