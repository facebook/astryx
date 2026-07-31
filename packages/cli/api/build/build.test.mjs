// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the build API (playbook signal + composition kit).
 */

import {describe, it, expect, vi} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from './build.mjs';

// api/build/ -> up 3 = packages/cli, up 4 = repo root (has packages/core).
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

// build() delegates to search(), whose first (cold) call is slow under vitest.
vi.setConfig({testTimeout: 30000});

describe('build API', () => {
  it('no query → build.help playbook signal', async () => {
    const r = await build();
    expect(r.type).toBe('build.help');
    expect(r.data).toEqual({playbook: true});
  });

  it('query → build.kit with raw entries + static frame/foundation', async () => {
    const r = await build('dashboard', {cwd: REPO});
    expect(r.type).toBe('build.kit');
    if (r.type !== 'build.kit') return;
    expect(r.data.query).toBe('dashboard');
    expect(r.data.hasResults).toBe(true);
    expect(r.data.frame).toContain('AppShell');
    expect(r.data.foundation).toContain('Button');
    expect(Array.isArray(r.data.pages)).toBe(true);

    // Entries are RAW SearchResultEntry objects — never package-manager-prefixed
    // command strings (that formatting is the CLI renderer's job).
    for (const e of [...r.data.pages, ...r.data.blocks, ...r.data.domain]) {
      expect(typeof e.name).toBe('string');
      expect(typeof e.score).toBe('number');
      expect(e.command).not.toMatch(/^(pnpm|npm|yarn|bun|npx)\b/);
    }
  });

  it('excludes always-on frame/foundation names from the domain group', async () => {
    const r = await build('dashboard', {cwd: REPO});
    if (r.type !== 'build.kit') throw new Error('expected build.kit');
    const names = r.data.domain.map(d => d.name);
    expect(names).not.toContain('Button');
    expect(names).not.toContain('AppShell');
  });

  it('applies grouping caps, score floors, and directMatch threshold', async () => {
    const r = await build('dashboard', {cwd: REPO});
    if (r.type !== 'build.kit') throw new Error('expected build.kit');
    const {pages, blocks, domain, directMatch} = r.data;

    // Caps: pages ≤ 3, blocks ≤ 5, domain ≤ 6.
    expect(pages.length).toBeLessThanOrEqual(3);
    expect(blocks.length).toBeLessThanOrEqual(5);
    expect(domain.length).toBeLessThanOrEqual(6);

    // Score floors: pages ≥ PAGE_FLOOR(50); blocks/domain ≥ DOMAIN_FLOOR(55).
    for (const p of pages) expect(p.score).toBeGreaterThanOrEqual(50);
    for (const b of blocks) expect(b.score).toBeGreaterThanOrEqual(55);
    for (const d of domain) expect(d.score).toBeGreaterThanOrEqual(55);

    // directMatch iff the top page is a confident match (PAGE_DIRECT = 95).
    expect(directMatch).toBe(pages.length > 0 && pages[0].score >= 95);

    // Domain partitioning: pages = non-block templates, blocks = block templates,
    // domain = components/hooks.
    for (const p of pages) {
      expect(p.domain).toBe('template');
      expect(p.kind).not.toBe('block');
    }
    for (const b of blocks) {
      expect(b.domain).toBe('template');
      expect(b.kind).toBe('block');
    }
    for (const d of domain) expect(['component', 'hook']).toContain(d.domain);
  });

  it('no matches → build.kit with hasResults=false and empty groups', async () => {
    const r = await build('zzznomatch99', {cwd: REPO});
    expect(r.type).toBe('build.kit');
    if (r.type !== 'build.kit') return;
    expect(r.data.hasResults).toBe(false);
    expect(r.data.pages).toHaveLength(0);
    expect(r.data.blocks).toHaveLength(0);
    expect(r.data.domain).toHaveLength(0);
  });
});
