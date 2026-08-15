// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Direct API tests for `cdnTemplate()` — the function behind
 * `astryx cdn template`.
 *
 * Two things matter here: it never destroys work (the page lands once, a second
 * run leaves an edited copy alone, a path that escapes the project is refused),
 * and the page it writes is pinned — a leftover version placeholder would ship
 * a file whose every CDN URL 404s.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  cdnTemplate,
  CDN_TEMPLATE_DEFAULT_PATH,
  CDN_VERSION_PLACEHOLDER,
} from './template.mjs';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cdn-template-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

const written = () =>
  fs.readFileSync(path.join(tmpDir, CDN_TEMPLATE_DEFAULT_PATH), 'utf-8');

describe('cdnTemplate()', () => {
  it('writes the page and returns a cdn.template receipt', () => {
    const res = cdnTemplate({cwd: tmpDir});

    expect(res.type).toBe('cdn.template');
    expect(res.data.path).toBe(CDN_TEMPLATE_DEFAULT_PATH);
    expect(res.data.written).toBe(true);
    expect(res.data.reason).toBe(null);
    expect(res.data.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(written()).toMatch(/<script type="importmap">/);
  });

  it('pins every CDN url to the reported version', () => {
    const {data} = cdnTemplate({cwd: tmpDir});
    const html = written();

    expect(html).not.toContain(CDN_VERSION_PLACEHOLDER);
    const urls = html.match(/https:\/\/(?:cdn\.jsdelivr\.net\/npm|esm\.sh)\/@astryxdesign\/[^"?]+/g);
    expect(urls?.length).toBeGreaterThan(0);
    for (const url of urls ?? []) {
      expect(url).toContain(`@${data.version}`);
    }
  });

  it('does not carry our copyright header into the consumer tree', () => {
    cdnTemplate({cwd: tmpDir});

    expect(written()).not.toMatch(/Copyright \(c\) Meta Platforms/);
    expect(written().startsWith('<!doctype html>')).toBe(true);
  });

  it('leaves an existing file alone and says so', () => {
    const dest = path.join(tmpDir, CDN_TEMPLATE_DEFAULT_PATH);
    fs.writeFileSync(dest, '<!-- mine -->\n');

    const res = cdnTemplate({cwd: tmpDir});

    expect(res.data.written).toBe(false);
    expect(res.data.reason).toBe('exists');
    expect(fs.readFileSync(dest, 'utf-8')).toBe('<!-- mine -->\n');
  });

  it('overwrites when asked', () => {
    const dest = path.join(tmpDir, CDN_TEMPLATE_DEFAULT_PATH);
    fs.writeFileSync(dest, '<!-- mine -->\n');

    const res = cdnTemplate({cwd: tmpDir, overwrite: true});

    expect(res.data.written).toBe(true);
    expect(written()).toMatch(/importmap/);
  });

  it('honors a custom path and creates its directory', () => {
    const res = cdnTemplate({cwd: tmpDir, targetPath: 'public/demo.html'});

    expect(res.data.path).toBe(path.join('public', 'demo.html'));
    expect(fs.existsSync(path.join(tmpDir, 'public/demo.html'))).toBe(true);
  });

  it('refuses a path that escapes the project', () => {
    expect(() => cdnTemplate({cwd: tmpDir, targetPath: '../escaped.html'})).toThrow(
      /cdn template path/,
    );
    expect(fs.existsSync(path.join(path.dirname(tmpDir), 'escaped.html'))).toBe(false);
  });
});
