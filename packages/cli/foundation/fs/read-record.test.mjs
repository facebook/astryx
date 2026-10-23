// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for read-record: which paths an operation read, and whether
 * any changed since, including a change made while the operation ran.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  recordContentRead,
  recordReads,
  unchangedSince,
} from './read-record.mjs';

function scratch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-read-record-'));
  const file = path.join(dir, 'doc.txt');
  fs.writeFileSync(file, 'one');
  return {dir, file};
}

describe('recordReads', () => {
  it('records a read file and a listed folder, and sees them unchanged', () => {
    const {dir, file} = scratch();
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => {
      fs.readFileSync(file, 'utf8');
      fs.readdirSync(dir);
    });
    expect([...seen.keys()]).toEqual(expect.arrayContaining([file, dir]));
    expect(unchangedSince(seen)).toBe(true);
  });

  it('sees an edit made after the operation', () => {
    const {file} = scratch();
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => fs.readFileSync(file, 'utf8'));
    const later = new Date(Date.now() + 5_000);
    fs.writeFileSync(file, 'two, longer');
    fs.utimesSync(file, later, later);
    expect(unchangedSince(seen)).toBe(false);
  });

  it('sees an edit made while the operation ran, after the file was read', () => {
    const {file} = scratch();
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => {
      fs.readFileSync(file, 'utf8');
      const later = new Date(Date.now() + 5_000);
      fs.writeFileSync(file, 'edited mid-run');
      fs.utimesSync(file, later, later);
    });
    expect(unchangedSince(seen)).toBe(false);
  });

  it('sees a file added to a folder it probed', () => {
    const {dir} = scratch();
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => fs.existsSync(path.join(dir, 'missing.txt')));
    const later = new Date(Date.now() + 5_000);
    fs.writeFileSync(path.join(dir, 'missing.txt'), 'now here');
    fs.utimesSync(dir, later, later);
    expect(unchangedSince(seen)).toBe(false);
  });

  it('records nothing outside an operation', () => {
    const {file} = scratch();
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => {});
    fs.readFileSync(file, 'utf8');
    recordContentRead(file);
    expect(seen.size).toBe(0);
  });

  it('records a file read without fs, such as an imported doc module, and sees it edited', () => {
    const {file} = scratch();
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => recordContentRead(file));
    expect([...seen.keys()]).toEqual([file]);
    expect(unchangedSince(seen)).toBe(true);
    fs.writeFileSync(file, 'two, longer');
    expect(unchangedSince(seen)).toBe(false);
  });

  it('sees a rewrite that keeps the size and modification time, as an npm reinstall does', () => {
    const {file} = scratch();
    const stamped = new Date('1985-10-26T08:15:00Z');
    fs.utimesSync(file, stamped, stamped);
    /** @type {Map<string, string>} */
    const seen = new Map();
    recordReads(seen, () => fs.readFileSync(file, 'utf8'));
    // Same size, and the same modification time npm stamps on every file.
    const replacement = `${file}.new`;
    fs.writeFileSync(replacement, 'two');
    fs.utimesSync(replacement, stamped, stamped);
    fs.renameSync(replacement, file);
    expect(unchangedSince(seen)).toBe(false);
  });
});
