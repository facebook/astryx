// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  AUTHORING_SELF_DOCS,
  auditAuthoringSelfDocs,
  buildAuthoringTopic,
  discoverAuthoringSelfDocSources,
} from './authoring-self-docs.mjs';
import {problemsInTopic} from './docs-discovery.mjs';
import {docs} from '../../api/docs/docs.mjs';

const SLOW = 60_000;

describe('authoring self-docs', () => {
  it('lists every self-doc on disk exactly once', () => {
    expect([...AUTHORING_SELF_DOCS].sort()).toEqual(
      discoverAuthoringSelfDocSources(),
    );
    expect(new Set(AUTHORING_SELF_DOCS).size).toBe(AUTHORING_SELF_DOCS.length);
  });

  it('audits clean: every self-doc loads, is reachable, and fits one read', async () => {
    expect(await auditAuthoringSelfDocs()).toEqual({
      sections: AUTHORING_SELF_DOCS.length,
      unreachable: [],
      failed: [],
      oversized: [],
    });
  });

  it('builds a valid topic with one section per self-doc', async () => {
    const topic = await buildAuthoringTopic();
    expect(problemsInTopic(topic)).toEqual([]);
    expect(topic.sections).toHaveLength(AUTHORING_SELF_DOCS.length);
  });

  it('is readable progressively through the docs API', async () => {
    const index = await docs('authoring', undefined, {index: true});
    expect(index.type).toBe('docs.index');
    expect(index.data.sections.map(s => s.id)).toContain('integration');
    const section = await docs('authoring', 'integration');
    expect(section.data.title).toBe('Astryx Integration');
    expect(section.data.content.some(block => block.type === 'table')).toBe(true);
  }, SLOW);
});

describe('auditAuthoringSelfDocs', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(process.cwd(), '.astryx-self-docs-'));
    fs.mkdirSync(path.join(root, 'kept'));
    fs.writeFileSync(
      path.join(root, 'kept', 'kept.doc.mjs'),
      "export const doc = {type: 'schema', name: 'kept', displayName: 'Kept', description: 'Listed.', fields: []};\n",
    );
  });

  afterEach(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  it('names a self-doc on disk that the list leaves out', async () => {
    fs.writeFileSync(
      path.join(root, 'kept', 'forgotten.doc.mjs'),
      "export const doc = {name: 'forgotten', description: 'Not listed.'};\n",
    );
    const audit = await auditAuthoringSelfDocs({root, sources: ['kept/kept.doc.mjs']});
    expect(audit.unreachable).toEqual(['kept/forgotten.doc.mjs']);
  });

  it('reports a self-doc that fails to load instead of throwing', async () => {
    fs.writeFileSync(path.join(root, 'kept', 'broken.doc.mjs'), 'export const doc = {;\n');
    const audit = await auditAuthoringSelfDocs({
      root,
      sources: ['kept/kept.doc.mjs', 'kept/broken.doc.mjs'],
    });
    expect(audit.failed.map(entry => entry.source)).toEqual(['kept/broken.doc.mjs']);
    expect(audit.sections).toBe(1);
  });

  it('names a section over the budget', async () => {
    const audit = await auditAuthoringSelfDocs({
      root,
      sources: ['kept/kept.doc.mjs'],
      budget: 10,
    });
    expect(audit.oversized).toEqual([
      expect.objectContaining({key: 'kept', title: 'Kept'}),
    ]);
  });
});
