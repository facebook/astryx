// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the config-based package scanner. Focuses on adversarial
 * node_modules — a dependency's package.json is fully third-party-controlled,
 * so a malformed `astryx.docs` (non-string, path-escaping) must degrade the
 * scan (skip that entry) rather than crash or expose foreign docs.
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  scanDirectory,
  scanAllPackages,
  findComponentInPackages,
} from './_package-scanner.mjs';

let tmp;
afterEach(() => {
  if (tmp) fs.rmSync(tmp, {recursive: true, force: true});
  tmp = undefined;
});

/** Write a package dir with a package.json + optional docs files. */
function writePkg(root, name, {astryx, docs} = {}) {
  const dir = path.join(root, name);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name, ...(astryx ? {astryx} : {})}),
  );
  if (docs) {
    for (const [rel, contents] of Object.entries(docs)) {
      const p = path.join(dir, rel);
      fs.mkdirSync(path.dirname(p), {recursive: true});
      fs.writeFileSync(p, contents);
    }
  }
  return dir;
}

describe('scanDirectory — adversarial node_modules', () => {
  it('skips a package with a non-string astryx.docs instead of crashing', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-nonstr-'));
    writePkg(tmp, 'good', {
      astryx: {docs: 'docs'},
      docs: {'docs/Btn.doc.mjs': 'export const docs = {};'},
    });
    // number, not string — must not slip past the guard and crash path.resolve.
    writePkg(tmp, 'bad', {astryx: {docs: 123}});
    const res = scanDirectory(tmp);
    expect(res.map(p => p.name)).toEqual(['good']);
  });

  it('skips a docs dir that escapes its own package (../.. traversal)', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-escape-'));
    // A sibling with real docs the escaper would try to reach.
    writePkg(tmp, 'victim', {
      docs: {'Secret.doc.mjs': 'export const docs = {};'},
    });
    writePkg(tmp, 'escaper', {astryx: {docs: '../victim'}});
    const res = scanDirectory(tmp);
    // escaper is skipped (docs escapes its package); victim has no astryx.docs.
    expect(res.map(p => p.name)).toEqual([]);
  });

  it('coerces a non-string package name to a string', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-name-'));
    const dir = path.join(tmp, 'weird');
    fs.mkdirSync(path.join(dir, 'docs'), {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({name: 12345, astryx: {docs: 'docs'}}),
    );
    fs.writeFileSync(path.join(dir, 'docs', 'X.doc.mjs'), 'export const docs = {};');
    const res = scanDirectory(tmp);
    expect(res).toHaveLength(1);
    expect(typeof res[0].name).toBe('string');
    expect(res[0].name).toBe('12345');
  });

  it('discovers a well-formed package with nested docs (skips node_modules)', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-ok-'));
    writePkg(tmp, 'ds', {
      astryx: {docs: 'docs'},
      docs: {
        'docs/A.doc.mjs': 'export const docs = {};',
        'docs/nested/B.doc.mjs': 'export const docs = {};',
        'docs/node_modules/Skip.doc.mjs': 'export const docs = {};',
      },
    });
    const res = scanDirectory(tmp);
    expect(res).toHaveLength(1);
    expect(res[0].components).toEqual(['A', 'B']);
  });

  it('returns [] for a missing scan dir', () => {
    expect(scanDirectory('/no/such/dir/anywhere')).toEqual([]);
  });
});

describe('scanAllPackages + findComponentInPackages', () => {
  it('dedups by name and finds a component case-insensitively', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-all-'));
    writePkg(tmp, 'ds', {
      astryx: {docs: 'docs'},
      docs: {'docs/Button.doc.mjs': 'export const docs = {};'},
    });
    const all = scanAllPackages([tmp]);
    expect(all.map(p => p.name)).toEqual(['ds']);
    const found = findComponentInPackages(all, 'button');
    expect(found).not.toBeNull();
    expect(found.componentName).toBe('Button');
  });
});
