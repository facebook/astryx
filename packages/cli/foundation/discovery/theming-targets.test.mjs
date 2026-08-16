// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The enumerability guard for component theming targets.
 *
 * A theming target is only useful if a theme author can find it. These tests
 * run against the REAL core docs and fail if any component's targets stop
 * being enumerable — a doc that moves out of the scanned tree, a target shape
 * that stops being read, or a component whose Theming table says one thing
 * while `theme targets` says another. That divergence is the failure the
 * listing exists to prevent: a target list that can drift from the components
 * is worse than no list.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {findCoreDir} from '../fs/paths.mjs';
import {
  discoverComponents,
  findComponentReadme,
} from './component-discovery.mjs';
import {loadComponentDoc} from './component-loader.mjs';
import {collectThemingTargets, targetsByKey} from './theming-targets.mjs';

const coreDir = /** @type {string} */ (findCoreDir(process.cwd()));
const coreSrc = path.join(coreDir, 'src');

/** @type {Promise<import('./theming-targets.mjs').ThemingTarget[]>} */
const enumerated = collectThemingTargets(coreSrc);

describe('collectThemingTargets', () => {
  it('enumerates the whole surface, not a handful', async () => {
    const targets = await enumerated;
    expect(targets.length).toBeGreaterThan(100);
    expect(new Set(targets.map(t => t.component)).size).toBeGreaterThan(50);
  });

  it('drops the namespace prefix so each key is what defineTheme takes', async () => {
    for (const t of await enumerated) {
      expect(t.className).toBe(`astryx-${t.key}`);
      expect(t.component).toBeTruthy();
    }
  });

  it('carries the props and states a target reflects', async () => {
    const targets = await enumerated;
    expect(targets.find(t => t.key === 'switch-thumb')).toEqual({
      key: 'switch-thumb',
      className: 'astryx-switch-thumb',
      component: 'Switch',
      props: ['size'],
      states: ['checked'],
    });
  });

  it('is sorted by key, so a diff of two runs is readable', async () => {
    const keys = (await enumerated).map(t => t.key);
    expect(keys).toEqual([...keys].sort((a, b) => a.localeCompare(b)));
  });

  // The listing and `theme build`'s override validation read this one
  // enumeration. `targetsByKey` is the shape validation wants: props and
  // states merged, because both are legal override keys.
  it('collapses to the override keys, merging the components that share one', async () => {
    const byKey = targetsByKey(await enumerated);
    expect(byKey['switch']).toEqual(['size', 'checked', 'disabled']);
    // `radio` is documented by both Indicator and RadioList.
    const radio = (await enumerated).filter(t => t.key === 'radio');
    expect(radio.length).toBeGreaterThan(1);
    for (const t of radio) {
      for (const name of [...t.props, ...t.states]) {
        expect(byKey['radio']).toContain(name);
      }
    }
  });

  it('every component doc that declares targets has them enumerated', async () => {
    const targets = await enumerated;
    /** @type {Map<string, Set<string>>} key -> props+states */
    const byKey = new Map(
      Object.entries(targetsByKey(targets)).map(([k, v]) => [k, new Set(v)]),
    );

    const names = Object.values(discoverComponents(coreDir)).flat();
    /** @type {string[]} */
    const missing = [];
    /** @type {Set<string>} */
    const seenDocs = new Set();
    let checked = 0;

    for (const name of names) {
      const docPath = findComponentReadme(coreDir, name);
      if (!docPath || seenDocs.has(docPath)) continue;
      seenDocs.add(docPath);

      /** @type {any} */
      let doc;
      try {
        doc = await loadComponentDoc(docPath);
      } catch {
        continue;
      }

      for (const target of doc?.theming?.targets || []) {
        if (typeof target?.className !== 'string') continue;
        checked++;
        const key = target.className.replace(/^astryx-/, '');
        const known = byKey.get(key);
        if (!known) {
          missing.push(`${name}: ${target.className} is not enumerable`);
          continue;
        }
        for (const prop of [
          ...(target.visualProps || []),
          ...(target.states || []),
        ]) {
          if (!known.has(prop)) {
            missing.push(`${name}: ${target.className} lost "${prop}"`);
          }
        }
      }
    }

    expect(checked).toBeGreaterThan(100);
    expect(missing).toEqual([]);
  }, 60_000);
});
