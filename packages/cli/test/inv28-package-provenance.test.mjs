// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file INV28 enforcement: every JSON response that surfaces a CLI artifact
 * must include `package` — the npm package that owns the artifact.
 *
 * This test runs every artifact-surfacing response type through the real CLI
 * and asserts `package` appears where the contract requires it. A new surface
 * that omits `package` fails here before it ships.
 *
 * Scope: response types whose payload names a specific authored artifact
 * (component, doc topic, template, theme, block, build start).
 * Structural/aggregate types (help, version, manifest, doctor, upgrade) are
 * out of scope — they describe the CLI itself, not an authored artifact.
 *
 * @position packages/cli/test — INV28 provenance enforcement
 */

import {describe, it, expect} from 'vitest';
import {runCli} from '../test-utils/run-cli.mjs';

/** @param {string[]} args @param {string} [cwd] */
async function json(args, cwd) {
  const {status, stdout} = await runCli(['--json', ...args], cwd ? {cwd} : undefined);
  expect(status, `CLI failed: ${stdout}`).toBe(0);
  return JSON.parse(stdout);
}

// ── component surfaces ─────────────────────────────────────────────────

describe('INV28: component surfaces carry `package`', () => {
  it('component.detail', async () => {
    const res = await json(['component', 'Button']);
    expect(res.type).toBe('component.detail');
    expect(res.data).toHaveProperty('package');
    expect(typeof res.data.package).toBe('string');
  });

  it('component.detail.props (meta.package)', async () => {
    const res = await json(['component', 'Button', '--props']);
    expect(res.type).toBe('component.detail.props');
    expect(res.meta).toHaveProperty('package');
    expect(typeof res.meta.package).toBe('string');
  });

  it('component.detail.source', async () => {
    const res = await json(['component', 'Button', '--source']);
    expect(res.type).toBe('component.detail.source');
    expect(res.data).toHaveProperty('package');
    expect(typeof res.data.package).toBe('string');
  });

  it('component.detail.showcase', async () => {
    const res = await json(['component', 'Button', '--showcase']);
    expect(res.type).toBe('component.detail.showcase');
    expect(res.data).toHaveProperty('package');
    expect(typeof res.data.package).toBe('string');
  });

  it('component.detail.blocks', async () => {
    const res = await json(['component', 'Button', '--blocks']);
    expect(res.type).toBe('component.detail.blocks');
    expect(res.data).toHaveProperty('package');
    expect(typeof res.data.package).toBe('string');
  });

  it('component.list entries each have `package`', async () => {
    const res = await json(['component', '--list']);
    expect(res.type).toBe('component.list');
    for (const [group, entries] of Object.entries(res.data.components)) {
      for (const entry of /** @type {any[]} */ (entries)) {
        expect(entry, `${group}/${entry.name}`).toHaveProperty('package');
      }
    }
  });

  it('component.batch: found rows carry `package` in result.data', async () => {
    const res = await json(['component', 'Button', 'Badge']);
    expect(res.type).toBe('component.batch');
    const found = res.data.results.filter((/** @type {any} */ r) => r.status === 'found');
    expect(found.length).toBeGreaterThan(0);
    for (const row of found) {
      expect(row.result.data, `batch result for ${row.selector}`).toHaveProperty('package');
    }
  });
});

// ── docs surfaces ───────────────────────────────────────────────────────

describe('INV28: docs surfaces carry `package`', () => {
  it('docs.list entries', async () => {
    const res = await json(['docs']);
    expect(res.type).toBe('docs.list');
    for (const entry of res.data) {
      expect(entry, entry.topic).toHaveProperty('package');
    }
  });

  it('docs.detail', async () => {
    const res = await json(['docs', 'theme']);
    expect(res.type).toBe('docs.detail');
    expect(res.data).toHaveProperty('package');
  });

  it('docs.index', async () => {
    const res = await json(['docs', 'theme', '--index']);
    expect(res.type).toBe('docs.index');
    expect(res.data).toHaveProperty('package');
  });

  it('docs.detail.section', async () => {
    const res = await json(['docs', 'theme', 'quick-start']);
    expect(res.type).toBe('docs.detail.section');
    expect(res.data).toHaveProperty('package');
  });

  it('docs.node', async () => {
    const res = await json(['docs', 'cli']);
    expect(res.type).toBe('docs.node');
    expect(res.data).toHaveProperty('package');
  });
});

// ── template surfaces ───────────────────────────────────────────────────

describe('INV28: template surfaces carry `package`', () => {
  it('template.list entries', async () => {
    const res = await json(['template', '--list']);
    expect(res.type).toBe('template.list');
    expect(res.data.length).toBeGreaterThan(0);
    for (const entry of res.data) {
      expect(entry, entry.id ?? entry.name).toHaveProperty('package');
    }
  });
});

// ── build surfaces ──────────────────────────────────────────────────────

describe('INV28: build surfaces carry `package`', () => {
  it('build.kit start and alternatives carry `package`', async () => {
    const res = await json(['build', 'admin dashboard']);
    expect(res.type).toBe('build.kit');
    if (res.data.start) {
      expect(res.data.start, 'build.kit start').toHaveProperty('package');
      for (const alt of res.data.start.alternatives ?? []) {
        expect(alt, `alternative ${alt.name}`).toHaveProperty('package');
      }
    }
  });
});

// ── theme surfaces ──────────────────────────────────────────────────────

describe('INV28: theme surfaces carry `package`', () => {
  it('theme.list entries', async () => {
    const res = await json(['theme', 'list']);
    expect(res.type).toBe('theme.list');
    expect(res.data.length).toBeGreaterThan(0);
    for (const entry of res.data) {
      expect(entry, entry.slug).toHaveProperty('package');
    }
  });
});
