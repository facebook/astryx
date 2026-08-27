// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the project context the MCP server reports at handshake.
 *
 * This is the whole reason a LOCAL server exists: the hosted server at
 * /mcp answers for whatever version the docsite was deployed with, and cannot
 * see the caller's project at all. These tests pin that the local one reads
 * the real installed core, the real config, and says so.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {loadProjectContext, renderInstructions} from './project-context.mjs';

/** @type {string} */
let withCore;
/** @type {string} */
let bare;

beforeAll(() => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-mcp-'));
  withCore = path.join(root, 'with-core');
  bare = path.join(root, 'bare');

  const coreDir = path.join(withCore, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(coreDir, {recursive: true});
  fs.writeFileSync(
    path.join(coreDir, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '9.9.9'}),
  );
  fs.writeFileSync(
    path.join(withCore, 'package.json'),
    JSON.stringify({name: 'consumer', astryx: {theme: 'neutral'}}),
  );

  fs.mkdirSync(bare, {recursive: true});
});

afterAll(() => {
  fs.rmSync(path.dirname(withCore), {recursive: true, force: true});
});

describe('loadProjectContext', () => {
  it('reports the version of the core actually installed in the project', async () => {
    const context = await loadProjectContext(withCore);
    expect(context.coreVersion).toBe('9.9.9');
  });

  it('reports no core version when the project has not installed one', async () => {
    const context = await loadProjectContext(bare);
    expect(context.coreVersion).toBeNull();
  });

  it('reports the project directory it answered for', async () => {
    const context = await loadProjectContext(withCore);
    expect(context.cwd).toBe(withCore);
  });

  it('reports configured integrations as a list', async () => {
    const context = await loadProjectContext(bare);
    expect(context.integrations).toEqual([]);
  });

  it('never throws on a directory it cannot read', async () => {
    await expect(
      loadProjectContext(path.join(bare, 'does', 'not', 'exist')),
    ).resolves.toBeDefined();
  });

  it('reports null rather than a lie when the installed core package.json is malformed', async () => {
    const broken = path.join(path.dirname(withCore), 'broken');
    const coreDir = path.join(broken, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(path.join(coreDir, 'package.json'), '{not json');
    const context = await loadProjectContext(broken);
    expect(context.coreVersion).toBeNull();
  });
});

describe('renderInstructions', () => {
  it('names the installed core version so the model answers for it', () => {
    const text = renderInstructions({
      cwd: '/p',
      coreVersion: '9.9.9',
      theme: null,
      integrations: [],
      configPath: null,
    });
    expect(text).toContain('9.9.9');
  });

  it('says the version is unknown rather than inventing one', () => {
    const text = renderInstructions({
      cwd: '/p',
      coreVersion: null,
      theme: null,
      integrations: [],
      configPath: null,
    });
    expect(text).not.toContain('null');
    expect(text.toLowerCase()).toContain('not installed');
  });

  // Without core installed, api/search throws "Could not find @astryxdesign/core
  // package" before it reads any bundled doc, so BOTH tools hard-fail. Promising
  // a fallback that does not exist is worse than promising nothing.
  it('does not promise a fallback the tools cannot deliver', () => {
    const text = renderInstructions({
      cwd: '/p',
      coreVersion: null,
      theme: null,
      integrations: [],
      configPath: null,
    });
    expect(text.toLowerCase()).not.toContain('fall back');
    expect(text.toLowerCase()).toContain('cannot answer');
  });

  it('lists configured integrations so the model knows they exist', () => {
    const text = renderInstructions({
      cwd: '/p',
      coreVersion: '1.0.0',
      theme: null,
      integrations: ['@acme/xds-widgets'],
      configPath: '/p/astryx.config.mjs',
    });
    expect(text).toContain('@acme/xds-widgets');
  });
});
