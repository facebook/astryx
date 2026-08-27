// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the two MCP tools.
 *
 * The tool SURFACE is deliberately identical to the shipped hosted server
 * (search + get, PR #2513) — matching what shipped, rather than re-opening the
 * question. What differs is where the answers come from: `api/` reading the
 * caller's project, not a registry frozen at deploy time.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {createTools} from './tools.mjs';
import {readInstalledCoreVersion} from './project-context.mjs';

/** The repo root — a project that really does have core installed. */
const REPO_ROOT = path.resolve(import.meta.dirname, '../../../..');

const tools = () => createTools({cwd: REPO_ROOT});
/** @param {string} name */
const tool = name => {
  const found = tools().find(t => t.name === name);
  if (!found) throw new Error(`no tool named ${name}`);
  return found;
};

describe('tool surface', () => {
  it('exposes exactly the hosted server two tools, in the same order', () => {
    expect(tools().map(t => t.name)).toEqual(['search', 'get']);
  });

  it('requires query on search and leaves limit optional', () => {
    const {inputSchema} = tool('search');
    expect(inputSchema.required).toEqual(['query']);
    expect(inputSchema.properties.query.type).toBe('string');
    expect(inputSchema.properties.limit.type).toBe('number');
  });

  it('requires name on get and leaves section optional', () => {
    const {inputSchema} = tool('get');
    expect(inputSchema.required).toEqual(['name']);
    expect(inputSchema.properties.section.type).toBe('string');
  });

  it('describes every tool and every property for the model', () => {
    for (const t of tools()) {
      expect(t.description.length).toBeGreaterThan(0);
      for (const key of Object.keys(t.inputSchema.properties)) {
        expect(t.inputSchema.properties[key].description).toBeTruthy();
      }
    }
  });
});

describe('search', () => {
  it('ranks an exact component name first', async () => {
    const result = await tool('search').run({query: 'button'});
    expect(result.results[0]).toMatchObject({
      domain: 'component',
      name: 'Button',
    });
  });

  it('honors the limit argument', async () => {
    const result = await tool('search').run({query: 'button', limit: 2});
    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  it('rejects a missing query rather than searching for undefined', async () => {
    await expect(tool('search').run({})).rejects.toThrow(/query/i);
  });

  // The api validates limit loudly ("must be a positive integer"). A
  // truthiness check here used to swallow limit: 0 and quietly serve the
  // default 20 instead of letting that contract answer.
  it('passes limit 0 through to the api validation instead of ignoring it', async () => {
    await expect(
      tool('search').run({query: 'button', limit: 0}),
    ).rejects.toThrow(/positive integer/i);
  });
});

describe('get', () => {
  it('rejects a missing name rather than resolving undefined', async () => {
    await expect(tool('get').run({})).rejects.toThrow(/name/i);
  });

  it('resolves a component to its full detail', async () => {
    const result = await tool('get').run({name: 'Button'});
    expect(result.kind).toBe('component');
    expect(result.data.name).toBe('Button');
  });

  it('resolves a hook', async () => {
    const result = await tool('get').run({name: 'useToast'});
    expect(result.kind).toBe('hook');
  });

  it('resolves a doc topic', async () => {
    const result = await tool('get').run({name: 'spacing'});
    expect(result.kind).toBe('doc');
  });

  it('resolves a template by its id', async () => {
    const result = await tool('get').run({name: 'ai-chat'});
    expect(result.kind).toBe('template');
    expect(result.name).toBe('ai-chat');
  });

  // Search matches names case-insensitively, but template() resolves by exact
  // dirName — so fetching with the caller's casing answered "Unknown template"
  // for a template the server itself had just found. Fetch by the hit's own
  // canonical name instead.
  it('resolves a template whatever casing the model used', async () => {
    const result = await tool('get').run({name: 'AI-CHAT'});
    expect(result.kind).toBe('template');
    expect(result.name).toBe('ai-chat');
  });

  // Regression: component() fuzzy-matches, so resolving by "try each api in
  // turn" answered get('spacing') with the Stack COMPONENT — a confidently
  // wrong artifact. Domain now comes from search(), which tags every hit.
  it('does not answer a doc topic with a fuzzy component match', async () => {
    const result = await tool('get').run({name: 'spacing'});
    expect(result.name).toBe('spacing');
    expect(result.data.name).not.toBe('Stack');
  });

  // toHaveProperty('coreVersion') would pass even if the value were always
  // null, which is the exact failure worth catching: reporting the version
  // actually installed here is the whole reason a local server exists.
  it('reports the real installed core version alongside the answer', async () => {
    const result = await tool('get').run({name: 'Button'});
    expect(result.coreVersion).toBe(readInstalledCoreVersion(REPO_ROOT));
    expect(result.coreVersion).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('fails with a message naming what it could not find', async () => {
    await expect(
      tool('get').run({name: 'DefinitelyNotAThing'}),
    ).rejects.toThrow(/DefinitelyNotAThing/);
  });

  it('names the closest matches when the name is near a real one', async () => {
    await expect(tool('get').run({name: 'Buttonn'})).rejects.toThrow(
      /Closest matches: .*Button/,
    );
  });

  // Same dynamic-fixture pattern as api/docs tests: read a real section title
  // off the detail, then ask for just that section.
  it('returns just the asked section of a doc topic', async () => {
    const detail = await tool('get').run({name: 'spacing'});
    const sections = detail.data.sections;
    expect(Array.isArray(sections) && sections.length > 0).toBe(true);
    const result = await tool('get').run({
      name: 'spacing',
      section: sections[0].title,
    });
    expect(result.kind).toBe('doc');
    expect(result.type).toBe('docs.detail.section');
  });
});
