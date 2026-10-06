// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Direct API tests for `templateCdn()` — the function behind
 * `astryx template --cdn`.
 *
 * Two things matter here: it never destroys work (the page lands once, a second
 * run leaves an edited copy alone, a path that escapes the project is refused),
 * and every CDN recipe is pinned and reuses the import map's React. A leftover
 * version placeholder would ship URLs that 404; an unexternalized Astryx module
 * would bundle a second React and fail when a themed icon reads context.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  templateCdn,
  CDN_TEMPLATE_DEFAULT_PATH,
  CDN_VERSION_PLACEHOLDER,
} from './cdn.mjs';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-template-cdn-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

const written = () =>
  fs.readFileSync(path.join(tmpDir, CDN_TEMPLATE_DEFAULT_PATH), 'utf-8');
const repoRoot = path.resolve(import.meta.dirname, '../../../../..');
const coreReadme = path.join(repoRoot, 'packages/core/README.md');
const astryxEsmImports = source =>
  source.match(/https:\/\/esm\.sh\/@astryxdesign\/[^\s"'<>`]+/g) ?? [];

describe('templateCdn()', () => {
  it('writes the page and returns a template.cdn receipt', () => {
    const res = templateCdn({cwd: tmpDir});

    expect(res.type).toBe('template.cdn');
    expect(res.data.path).toBe(CDN_TEMPLATE_DEFAULT_PATH);
    expect(res.data.written).toBe(true);
    expect(res.data.reason).toBe(null);
    expect(res.data.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(written()).toMatch(/<script type="importmap">/);
  });

  it('pins every CDN url to the reported version', () => {
    const {data} = templateCdn({cwd: tmpDir});
    const html = written();

    expect(html).not.toContain(CDN_VERSION_PLACEHOLDER);
    const urls = html.match(/https:\/\/(?:cdn\.jsdelivr\.net\/npm|esm\.sh)\/@astryxdesign\/[^"?]+/g);
    expect(urls?.length).toBeGreaterThan(0);
    for (const url of urls ?? []) {
      expect(url).toContain(`@${data.version}`);
    }
  });

  it('externalizes React for every Astryx esm.sh import in CDN recipes', () => {
    templateCdn({cwd: tmpDir});
    const recipes = [
      ['generated CDN page', written()],
      ['Core README', fs.readFileSync(coreReadme, 'utf-8')],
    ];

    for (const [label, source] of recipes) {
      const urls = astryxEsmImports(source);
      expect(
        urls.length,
        `${label} should contain Astryx esm.sh imports`,
      ).toBeGreaterThan(0);
      for (const url of urls) {
        const external =
          new URL(url).searchParams.get('external')?.split(',') ?? [];
        expect(external, `${label}: ${url}`).toEqual(['react', 'react-dom']);
      }
    }
  });

  it('loads the font family the theme names', () => {
    templateCdn({cwd: tmpDir});
    const html = written();

    // The theme names Figtree and never loads it (#5015): without the webfont
    // link every viewer silently gets the fallback stack instead.
    expect(html).toMatch(/fonts\.googleapis\.com\/css2\?family=Figtree/);
  });

  it('does not carry our copyright header into the consumer tree', () => {
    templateCdn({cwd: tmpDir});

    expect(written()).not.toMatch(/Copyright \(c\) Meta Platforms/);
    expect(written().startsWith('<!doctype html>')).toBe(true);
  });

  it('leaves an existing file alone and says so', () => {
    const dest = path.join(tmpDir, CDN_TEMPLATE_DEFAULT_PATH);
    fs.writeFileSync(dest, '<!-- mine -->\n');

    const res = templateCdn({cwd: tmpDir});

    expect(res.data.written).toBe(false);
    expect(res.data.reason).toBe('exists');
    expect(fs.readFileSync(dest, 'utf-8')).toBe('<!-- mine -->\n');
  });

  it('overwrites when asked', () => {
    const dest = path.join(tmpDir, CDN_TEMPLATE_DEFAULT_PATH);
    fs.writeFileSync(dest, '<!-- mine -->\n');

    const res = templateCdn({cwd: tmpDir, overwrite: true});

    expect(res.data.written).toBe(true);
    expect(written()).toMatch(/importmap/);
  });

  it('honors a custom path and creates its directory', () => {
    const res = templateCdn({cwd: tmpDir, targetPath: 'public/demo.html'});

    expect(res.data.path).toBe(path.join('public', 'demo.html'));
    expect(fs.existsSync(path.join(tmpDir, 'public/demo.html'))).toBe(true);
  });

  it('refuses a path that escapes the project', () => {
    expect(() => templateCdn({cwd: tmpDir, targetPath: '../escaped.html'})).toThrow(
      /cdn template path/,
    );
    expect(fs.existsSync(path.join(path.dirname(tmpDir), 'escaped.html'))).toBe(false);
  });
});
