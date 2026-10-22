// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {checkBuilt, scanBuilt} from './built-checks.mjs';
import {runChecks} from './doctor.mjs';

/** @type {string} */
let dir;

/**
 * @param {Record<string, string>} files relative path → contents
 */
function write(files) {
  for (const [rel, text] of Object.entries(files)) {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, text);
  }
}

/** @param {string} target @param {string[]} [packages] */
function check(target, packages = []) {
  const [usage, purity] = checkBuilt(target, {cwd: dir, packages});
  return {usage, purity};
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-built-'));
});

afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

describe('built-astryx-usage', () => {
  it('fails a hand-written page with no Astryx at all, with the way to rebuild it', () => {
    write({
      'out/index.html':
        '<!doctype html><html><head><style>.cat{display:flex}</style></head><body><div class="cat"><h1>Cats</h1></div></body></html>',
    });

    for (const target of ['out', 'out/index.html']) {
      const {usage, purity} = check(target);
      expect(usage.status).toBe('fail');
      expect(usage.message).toContain('does not use Astryx');
      expect(usage.fix).toContain('astryx build');
      expect(usage.fix).toContain('Do not deliver');
      // Built HTML is not source: the purity check says it did not run.
      expect(purity.status).toBe('info');
    }
  });

  it('passes source that imports Astryx components and uses them', () => {
    write({
      'src/Page.tsx':
        'import {Button} from \'@astryxdesign/core/Button\';\nexport const Page = () => <Button label="Go" />;\n',
    });

    const {usage} = check('.');
    expect(usage.status).toBe('pass');
    expect(usage.message).toContain('1 import from @astryxdesign/core');
    expect(usage.message).toContain('1 component use');
  });

  it("counts an integration's components as Astryx, by the package names the project loads", () => {
    write({
      'app/page.tsx':
        'import {MetaEmployeeLink} from \'@meta-internal/ui/Employee\';\nexport default () => <MetaEmployeeLink unixname="jdoe" />;\n',
    });

    expect(check('.').usage.status).toBe('fail');
    const {usage} = check('.', ['@meta-internal/ui']);
    expect(usage.status).toBe('pass');
    expect(usage.message).toContain('@meta-internal/ui');
  });

  it('passes built output that carries Astryx styles, minified', () => {
    write({
      'dist/assets/app.css':
        '@layer reset,astryx-base,astryx-theme;@layer astryx-base{.x1{color:red}}',
    });

    const {usage, purity} = check('dist');
    expect(usage.status).toBe('pass');
    expect(usage.message).toContain('Astryx styles in assets/app.css');
    expect(purity.status).toBe('info');
  });

  it('reads a build folder inside a project for styles but never as source', () => {
    write({
      'src/page.tsx': '<div />',
      '.next/static/chunk.js': 'var a="<div className=x>";',
      '.next/static/app.css': ':root{--astryx-layer-modal:10}',
      'node_modules/@astryxdesign/core/index.js':
        "import '@astryxdesign/core';",
    });

    const scan = scanBuilt(dir, []);
    expect(scan.sourceFiles).toBe(1);
    expect(scan.stylesheets).toEqual(['.next/static/app.css']);
    expect(scan.imports).toBe(0);
  });

  it('fails a path that does not exist, saying nothing was checked', () => {
    const [usage, ...rest] = checkBuilt('missing', {cwd: dir, packages: []});
    expect(usage.status).toBe('fail');
    expect(usage.message).toContain('does not exist');
    expect(rest).toEqual([]);
  });
});

describe('built-astryx-purity', () => {
  it("names each finding of the rubric's source check with its file and line", () => {
    write({
      'src/Page.tsx': [
        "import {VStack} from '@astryxdesign/core/VStack';",
        "import {Search} from 'lucide-react';",
        "import './page.css';",
        '// <div> in a comment is not a finding',
        'export function Page() {',
        '  return (',
        '    <VStack>',
        '      <div className="row" style={{gap: 4}}>',
        '        <Search />',
        '        <svg viewBox="0 0 1 1"><path d="M0 0" /></svg>',
        '        <input type="hidden" name="x" />',
        '      </div>',
        '    </VStack>',
        '  );',
        '}',
        '',
      ].join('\n'),
    });

    const {usage, purity} = check('.');
    expect(usage.status).toBe('pass');
    expect(purity.status).toBe('warn');
    expect(purity.message).toMatch(/^6 findings/);
    expect(purity.message).toContain(
      'src/Page.tsx:3 imports the stylesheet `./page.css`',
    );
    expect(purity.message).toContain('src/Page.tsx:8 raw `<div>`');
    expect(purity.message).toContain(
      'src/Page.tsx:9 `<Search>` from an icon library',
    );
    // The message names the first five and counts the rest.
    expect(purity.message).toContain('and 1 more');
    const all = scanBuilt(dir, [])
      .findings.map(f => `${f.file}:${f.line} ${f.message}`)
      .join('\n');
    expect(all).toContain('src/Page.tsx:10 raw `<svg>`');
    // A helper's SVG counts once, and hidden form state keeps its element.
    expect(all).not.toContain('`<path>`');
    expect(all).not.toContain('`<input>`');
    expect(purity.fix).toContain('astryx docs is-my-code-good');
  });

  it('passes source with no raw element, icon or custom style', () => {
    write({
      'src/Page.tsx':
        "import {Text} from '@astryxdesign/core/Text';\nimport type {ReactNode} from 'react';\nexport const Page = (): ReactNode => <Text>Hi</Text>;\n",
    });

    expect(check('src').purity.status).toBe('pass');
  });
});

describe('doctor --built', () => {
  it('adds the two checks after the others, and plain doctor runs without them', async () => {
    write({'out/index.html': '<div>no astryx</div>'});

    const plain = await runChecks({cwd: dir});
    const built = await runChecks({cwd: dir, built: 'out'});

    expect(plain.checks.some(c => c.id.startsWith('built-'))).toBe(false);
    expect(built.checks.map(c => c.id)).toEqual([
      ...plain.checks.map(c => c.id),
      'built-astryx-usage',
      'built-astryx-purity',
    ]);
    expect(built.summary.fail).toBe(plain.summary.fail + 1);
  });
});
