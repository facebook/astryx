// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-changesets.test.mjs
 * Unit tests for the changeset convention gate — specifically the 0.x semver
 * coupling: a [breaking] change must bump the minor, every other category must
 * bump the patch, and major is rejected while pre-1.0.
 */

import {describe, it, expect} from 'vitest';
import {validateChangeset} from './check-changesets.mjs';

const ctx = {
  pre1: true,
  pubNames: new Set(['@astryxdesign/core', '@astryxdesign/cli']),
  allNames: new Set([
    '@astryxdesign/core',
    '@astryxdesign/cli',
    '@astryxdesign/storybook',
  ]),
};

const cs = (frontmatter, body) => `---\n${frontmatter}\n---\n\n${body}\n`;

describe('validateChangeset — 0.x semver coupling', () => {
  it('accepts [breaking] with a minor bump', () => {
    const problems = validateChangeset(
      'a.md',
      cs(
        "'@astryxdesign/core': minor",
        '[breaking] Rename items to options (#1)\n@who',
      ),
      ctx,
    );
    expect(problems).toEqual([]);
  });

  it('accepts a non-breaking category with a patch bump', () => {
    for (const category of [
      'feat',
      'fix',
      'component',
      'perf',
      'docs',
      'chore',
    ]) {
      const problems = validateChangeset(
        'a.md',
        cs("'@astryxdesign/core': patch", `[${category}] Something (#1)\n@who`),
        ctx,
      );
      expect(problems, category).toEqual([]);
    }
  });

  it('rejects [breaking] declared as patch', () => {
    const problems = validateChangeset(
      'a.md',
      cs("'@astryxdesign/core': patch", '[breaking] Remove onHide (#1)\n@who'),
      ctx,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/breaking.*declares "patch".*Use "minor"/);
  });

  it('rejects a non-breaking category declared as minor', () => {
    const problems = validateChangeset(
      'a.md',
      cs(
        "'@astryxdesign/core': minor",
        '[feat] Add optional size prop (#1)\n@who',
      ),
      ctx,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/declares "minor".*category is \[feat\]/);
  });

  it('rejects a major bump while 0.x', () => {
    const problems = validateChangeset(
      'a.md',
      cs("'@astryxdesign/core': major", '[breaking] Total rewrite (#1)\n@who'),
      ctx,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/declares "major".*no major bump.*1\.0\.0/);
  });

  it('does not enforce the coupling once past 1.0', () => {
    const problems = validateChangeset(
      'a.md',
      cs("'@astryxdesign/core': minor", '[feat] Add prop (#1)\n@who'),
      {...ctx, pre1: false},
    );
    expect(problems).toEqual([]);
  });

  it('still flags a missing category and missing contributor', () => {
    const problems = validateChangeset(
      'a.md',
      cs("'@astryxdesign/core': patch", 'no category or handle here'),
      ctx,
    );
    expect(problems.some(p => /\[category\] tag/.test(p))).toBe(true);
    expect(problems.some(p => /contributor/.test(p))).toBe(true);
  });

  it('flags a private/ignored package', () => {
    const problems = validateChangeset(
      'a.md',
      cs("'@astryxdesign/storybook': patch", '[fix] x (#1)\n@who'),
      ctx,
    );
    expect(problems.some(p => /private\/ignored/.test(p))).toBe(true);
  });
});
