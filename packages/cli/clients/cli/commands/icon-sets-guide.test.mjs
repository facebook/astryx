// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The icon-set guide reads on its experimental route, each section on
 * its own, and `astryx search` never returns it or any experimental doc
 * (spec:AST-017 FR27, spec:AST-084 FR11).
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {formatCliCommand} from '../../../foundation/env/package-manager.mjs';
import {writeIconSetProject} from '../../../test-utils/icon-set-fixture.mjs';

const GUIDE = 'cli/experimental/icon-sets';

/** @type {string} */
let tmp;
/** @type {string} */
let withSet;
/** @type {string} */
let withoutSet;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-icon-guide-'));
  withSet = writeIconSetProject(path.join(tmp, 'with'), {
    config: {experimental: {iconSet: 'glyphs'}},
  });
  withoutSet = writeIconSetProject(path.join(tmp, 'without'), {packages: []});
});

afterAll(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

/** @param {string} query @param {string} cwd */
async function topDoc(query, cwd) {
  const {status, stdout} = await runCli(
    ['search', ...query.split(' '), '--type', 'doc', '--json'],
    cwd,
  );
  expect(status).toBe(0);
  return JSON.parse(stdout).data.results;
}

describe('icon-set guide', () => {
  it('search leaves every experimental doc out, with or without an icon set', async () => {
    // Icon sets join `astryx search` only at promotion (spec:AST-084 FR11);
    // the guide is read on its experimental route.
    for (const query of ['icon set', 'add icons', 'close']) {
      for (const result of [
        ...(await topDoc(query, withoutSet)),
        ...(await topDoc(query, withSet)),
      ]) {
        expect(result.name).not.toMatch(/experimental|icon-definitions/);
        expect(result.command).not.toMatch(/experimental|icon-definitions/);
        expect(result.section ?? '').not.toMatch(/^icon-(set|definition)/);
      }
    }
  });

  it('covers adding a set, adding icons, the export contract, library shapes, checks, and how apps use it', async () => {
    const {status, stdout} = await runCli(['docs', GUIDE, '--full']);
    expect(status).toBe(0);
    for (const phrase of [
      'Icon sets are experimental',
      'patch release',
      formatCliCommand('experimental icon new-set outline'),
      formatCliCommand(
        'experimental icon add Bin --from @acme/glyph-library --definition delete',
      ),
      '--new-definition',
      formatCliCommand('docs cli/experimental/icon-definitions'),
      'icon_builtin_definition_missing',
      'Unmapped icon definitions (optional)',
      'unmappedDefinitions',
      'icon_module_not_public',
      'icon_not_component',
      'icon_theme_map_unchecked',
      'icon_module_invalid',
      'icon_generated_types_mismatch',
      'themeIcons',
      "defineTheme({name: 'brand', icons: themeIcons})",
      'prepublishOnly',
      'optional peer',
      'never fail a check',
      'adapter',
      '`experimental.iconSet`',
      '`experimental.iconSets`',
      '`icon.newSet`',
    ]) {
      expect(stdout).toContain(phrase);
    }
  });

  it('tells authors no version range promises icon sets, and what a CLI without them says', async () => {
    const {stdout} = await runCli(['docs', GUIDE, 'publish']);
    expect(stdout).toContain('no version range promises them');
    expect(stdout).not.toContain('>=0.8.0');
    expect(stdout).toContain('published against a newer Astryx CLI');
    const versioning = await runCli([
      'docs',
      'cli/integrations/ship/versioning',
      '--full',
    ]);
    expect(versioning.stdout).not.toMatch(/icon/i);
  });

  it('every icon-set doc says it is experimental and carries the marker', async () => {
    for (const route of [
      'cli/experimental',
      GUIDE,
      'cli/experimental/icon-definitions',
      'cli/commands/experimental-icon',
      'cli/commands/experimental-icon-new-set',
    ]) {
      const {status, stdout} = await runCli(['docs', route, '--json']);
      expect(status, route).toBe(0);
      expect(stdout, route).toMatch(/[Ee]xperimental/);
    }
  });
});
