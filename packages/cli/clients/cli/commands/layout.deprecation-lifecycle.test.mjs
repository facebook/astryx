// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Deprecation lifecycle coverage for the layout command group (DEP-0006).
 *
 * Mirrors the DEP-0005 theme-add-lifecycle tests: pins the JSON
 * `meta.deprecations` entry, the human-mode stderr warning, the help label,
 * and the docs reference pages.
 */

import {describe, it, expect} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';

const SLOW = 30_000;

describe('layout DEP-0006 lifecycle', () => {
  it('JSON mode carries meta.deprecations with DEP-0006 and its replacements', async () => {
    const result = await runCli(['layout', 'grammar', '--json']);
    expect(result.status).toBe(0);
    const envelope = JSON.parse(result.stdout);
    expect(envelope.meta).toBeDefined();
    expect(envelope.meta.deprecations).toEqual([
      {
        id: 'DEP-0006',
        replacements: ['build', 'template', 'docs layout'],
      },
    ]);
    // Canonical data is unchanged
    expect(envelope.type).toBe('layout.grammar');
    expect(envelope.data.text).toBeDefined();
    expect(envelope.data.aliases).toBeDefined();
  }, SLOW);

  it('human mode emits one stderr deprecation warning', async () => {
    const result = await runCli(['layout', 'grammar']);
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('[DEP-0006]');
    expect(result.stderr).toContain('astryx layout is deprecated');
    expect(result.stderr).toContain('astryx build');
    expect(result.stderr).toContain('astryx template');
    expect(result.stderr).toContain('astryx docs layout');
  }, SLOW);

  it('JSON mode does NOT emit the stderr warning', async () => {
    const result = await runCli(['layout', 'grammar', '--json']);
    expect(result.stderr).not.toContain('[DEP-0006]');
  }, SLOW);

  it('layout --help labels the command as deprecated', async () => {
    const result = await runCli(['layout', '--help']);
    expect(result.stdout).toContain('DEPRECATED');
    expect(result.stdout).toContain('DEP-0006');
  });

  it('layout expand --json carries the same meta.deprecations', async () => {
    const result = await runCli([
      'layout', 'expand', 'V[g6] > C*2', '--json',
    ]);
    expect(result.status).toBe(0);
    const envelope = JSON.parse(result.stdout);
    expect(envelope.meta.deprecations).toEqual([
      {
        id: 'DEP-0006',
        replacements: ['build', 'template', 'docs layout'],
      },
    ]);
    expect(envelope.type).toBe('layout.expand');
  }, SLOW);

  it('layout check --json carries the same meta.deprecations', async () => {
    const result = await runCli([
      'layout', 'check', 'V[g6] > C*2', '--json',
    ]);
    expect(result.status).toBe(0);
    const envelope = JSON.parse(result.stdout);
    expect(envelope.meta.deprecations).toEqual([
      {
        id: 'DEP-0006',
        replacements: ['build', 'template', 'docs layout'],
      },
    ]);
    expect(envelope.type).toBe('layout.check');
  }, SLOW);

  // FR29d: every reference page names DEP-0006 and the replacements.
  // Removing the label from any single page must fail this test.
  describe('docs reference pages name DEP-0006', () => {
    const COMMAND_PAGES = [
      'cli/commands/layout',
      'cli/commands/layout-expand',
      'cli/commands/layout-check',
      'cli/commands/layout-grammar',
    ];

    const FUNCTION_PAGES = [
      'cli/api/functions/layout-expand',
      'cli/api/functions/layout-check',
      'cli/api/functions/layout-grammar',
    ];

    for (const page of COMMAND_PAGES) {
      it(`${page} names DEP-0006 and replacements`, async () => {
        const result = await runCli(['docs', page, '--json']);
        expect(result.status, result.stderr).toBe(0);
        const body = result.stdout;
        expect(body).toContain('DEP-0006');
        expect(body).toContain('build');
        expect(body).toContain('template');
        expect(body).toContain('docs layout');
      }, SLOW);
    }

    for (const page of FUNCTION_PAGES) {
      it(`${page} names DEP-0006 and replacements`, async () => {
        const result = await runCli(['docs', page, '--json']);
        expect(result.status, result.stderr).toBe(0);
        const body = result.stdout;
        expect(body).toContain('DEP-0006');
        expect(body).toContain('build');
        expect(body).toContain('template');
        expect(body).toContain('docs layout');
      }, SLOW);
    }
  });

  it('response-types reference names DEP-0006 in each layout entry description', async () => {
    const result = await runCli(['docs', 'cli/api/enums/response-types', '--json']);
    expect(result.status, result.stderr).toBe(0);
    const envelope = JSON.parse(result.stdout);
    // The enum page has a table in its content; each row is [value, description].
    const tables = envelope.data.content.filter(b => b.type === 'table');
    const rows = tables.flatMap(t => t.rows || []);
    for (const type of ['layout.expand', 'layout.check', 'layout.grammar']) {
      const row = rows.find(r => r[0] && r[0].includes(type));
      expect(row, `${type} not found in response-types table`).toBeDefined();
      expect(row[1], `${type} description missing DEP-0006`).toContain('DEP-0006');
      expect(row[1], `${type} description missing replacements`).toContain('replacement');
    }
  }, SLOW);
});
