// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {themeAdd} from './add.mjs';
import {listThemes} from '../_adapter.mjs';
import {isErrorCode} from '../../../foundation/response/error-codes.mjs';

let tmpDir;
let outsideDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-themeadd-staging-'));
  outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-themeadd-outside-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  fs.rmSync(outsideDir, {recursive: true, force: true});
});

/**
 * Put a symlink where `theme add` stages the first file of `slug`.
 * @param {string} slug
 * @param {string} target
 */
function plantStagingLink(slug, target) {
  const theme = listThemes().find(entry => entry.slug === slug);
  if (!theme) throw new Error(`missing bundled theme ${slug}`);
  const first = theme.files[0];
  const dest = path.join(tmpDir, 'src', 'themes', slug, first);
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.symlinkSync(target, `${dest}.${process.pid}.tmp`);
  return dest;
}

describe('themeAdd staging writes stay inside the project', () => {
  it('refuses a staging path that links outside the project', async () => {
    const victim = path.join(outsideDir, 'victim.txt');
    fs.writeFileSync(victim, 'outside\n');
    const dest = plantStagingLink('stone', victim);

    await expect(themeAdd('stone', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_PATH_TRAVERSAL',
    });
    expect(fs.readFileSync(victim, 'utf-8')).toBe('outside\n');
    expect(fs.existsSync(dest)).toBe(false);
  });

  it('never creates a file through a dangling staging link', async () => {
    const victim = path.join(outsideDir, 'created.txt');
    plantStagingLink('stone', victim);

    let error;
    try {
      await themeAdd('stone', {cwd: tmpDir});
    } catch (caught) {
      error = caught;
    }

    expect(isErrorCode(error?.code)).toBe(true);
    expect(fs.existsSync(victim)).toBe(false);
  });
});
