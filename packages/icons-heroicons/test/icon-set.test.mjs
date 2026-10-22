// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The experimental Heroicons icon set (spec:AST-084 FR19): every icon
 * export renders as an icon (takes SVG props, draws with currentColor), the
 * theme map covers every built-in definition, and the package passes its own
 * `astryx integration check --strict`.
 */

import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import * as icons from '../index.js';

const PACKAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const CLI = path.resolve(PACKAGE_DIR, '../cli/clients/cli/bin/astryx.mjs');
const DATA = JSON.parse(
  fs.readFileSync(
    path.join(PACKAGE_DIR, 'icon-sets/heroicons/heroicons.icons.json'),
    'utf-8',
  ),
);

describe('@astryxdesign/icons-heroicons', () => {
  it('exports every icon of the data file in every look, and each renders as an icon', () => {
    const exported = Object.keys(icons).filter(name => name.endsWith('Icon'));
    const declared = DATA.icons.flatMap(icon => [
      icon.export,
      ...(icon.variants ?? []).map(variant => variant.export),
    ]);
    expect(exported.sort()).toEqual([...declared].sort());
    expect(DATA.variants).toEqual(['outline', 'solid', 'mini']);
    for (const name of exported) {
      const html = renderToStaticMarkup(
        createElement(icons[name], {className: 'x'}),
      );
      expect(html, name).toContain('class="x"');
      expect(html, name).toContain('currentColor');
    }
  });

  it('maps every built-in definition, and its theme map draws each with the mapped icon', async () => {
    const {astryxDefinitionsByName} =
      await import('../../cli/foundation/discovery/icon-definition-discovery.mjs');
    const builtIn = [...astryxDefinitionsByName().values()]
      .filter(doc => doc.builtIn === true)
      .map(doc => doc.name);
    const exportOf = new Map(DATA.icons.map(icon => [icon.id, icon.export]));
    expect(Object.keys(icons.themeIcons).sort()).toEqual([...builtIn].sort());
    for (const name of builtIn) {
      expect(icons.themeIcons[name].type, name).toBe(
        icons[exportOf.get(DATA.map[name])],
      );
    }
  });

  it('passes astryx integration check --strict', () => {
    const run = spawnSync(
      process.execPath,
      [CLI, 'integration', 'check', '--strict', '--json'],
      {cwd: PACKAGE_DIR, encoding: 'utf-8'},
    );
    expect(run.status, run.stdout + run.stderr).toBe(0);
    const validate = JSON.parse(run.stdout).data.checks.find(
      each => each.check === 'validate',
    );
    const unmapped = validate.response.data.iconSets;
    expect(unmapped).toEqual([
      expect.objectContaining({
        set: 'heroicons',
        unmappedDefinitions: [
          expect.objectContaining({name: 'drag'}),
          expect.objectContaining({name: 'pin'}),
        ],
      }),
    ]);
  }, 60_000);
});
