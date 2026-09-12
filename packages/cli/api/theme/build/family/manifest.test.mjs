// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createHash} from 'node:crypto';
import {describe, expect, it} from 'vitest';
import {SECTION_KINDS} from './plan.mjs';
import {createFamilyGeneration} from './manifest.mjs';

const digest = value =>
  `sha256-${createHash('sha256').update(value).digest('hex')}`;

function plan(name, parentName) {
  return {
    identity: {name, parentName, sourceId: `themes/${name}.mjs`},
    planDigest: `sha256-plan-${name}`,
    sections: SECTION_KINDS.map(kind => ({
      id: kind,
      kind,
      tracks: kind === 'tokens' ? ['css', 'js', 'receipts'] : ['receipts'],
      empty: kind !== 'tokens',
    })),
  };
}

function generation() {
  const plans = [plan('ocean', null), plan('ocean-calm', 'ocean')];
  return createFamilyGeneration({
    artifactKey: 'ocean-family',
    graph: {
      rootName: 'ocean',
      sourceGraphDigest: 'sha256-source-graph',
    },
    plans,
    css: '/* family css */\n',
    js: 'export const oceanTheme = {};\n',
    dts: 'export declare const oceanTheme: object;\n',
    tools: {cli: '0.6.0', core: '0.6.0'},
    command:
      'astryx theme build --family themes/ocean.mjs themes/ocean-calm.mjs --family-key ocean-family',
    warnings: [],
    notices: [],
  });
}

describe('family manifest', () => {
  it('records deterministic graph, section, ownership, digest, and receipt evidence', () => {
    const first = generation();
    const second = generation();
    expect(first.generationId).toBe(second.generationId);
    expect([...first.files]).toEqual([...second.files]);
    const changedCommand = createFamilyGeneration({
      artifactKey: 'ocean-family',
      graph: {
        rootName: 'ocean',
        sourceGraphDigest: 'sha256-source-graph',
      },
      plans: [plan('ocean', null), plan('ocean-calm', 'ocean')],
      css: '/* family css */\n',
      js: 'export const oceanTheme = {};\n',
      dts: 'export declare const oceanTheme: object;\n',
      tools: {cli: '0.6.0', core: '0.6.0'},
      command: 'astryx theme build --family changed --family-key ocean-family',
      warnings: [],
      notices: [],
    });
    expect(changedCommand.generationId).not.toBe(first.generationId);
    expect(first.manifest).toMatchObject({
      schemaVersion: 1,
      artifactKey: 'ocean-family',
      generationId: first.generationId,
      family: {
        rootName: 'ocean',
        sourceGraphDigest: 'sha256-source-graph',
      },
      artifacts: {
        css: 'ocean-family.css',
        js: 'ocean-family.js',
        dts: 'ocean-family.d.ts',
        manifest: 'ocean-family.manifest.json',
      },
    });
    expect(first.manifest.members.map(member => member.name)).toEqual([
      'ocean',
      'ocean-calm',
    ]);
    expect(first.manifest.members[1]).toMatchObject({
      parent: 'ocean',
      sectionIds: SECTION_KINDS,
      receipt: 'receipts/members/001-ocean-calm.json',
    });

    for (const owned of first.manifest.owned) {
      expect(owned.path.startsWith('/')).toBe(false);
      expect(owned.path).not.toContain('..');
      expect(digest(first.files.get(owned.path))).toBe(owned.digest);
    }
    expect(first.manifest.owned.map(item => item.path)).toEqual(
      expect.arrayContaining([
        'ocean-family.css',
        'ocean-family.js',
        'ocean-family.d.ts',
        'receipts/build.json',
        'receipts/members/000-ocean.json',
        'receipts/members/001-ocean-calm.json',
      ]),
    );
    const serialized = JSON.stringify(first.manifest);
    expect(serialized).not.toMatch(/\/Users\/|\/home\/|T\d{2}:\d{2}:\d{2}/);
  });
});
