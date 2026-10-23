// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for render() (`astryx experimental render`): a page to one
 * self-contained HTML file and back, each refusal, and the warnings.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {render} from './render.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

const CLI_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {string} */
let dir;

/** @param {string} name @param {string | Buffer} content */
const put = (name, content) => {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
  return file;
};

/** @param {() => Promise<unknown>} fn */
async function codeOf(fn) {
  try {
    await fn();
  } catch (e) {
    return /** @type {any} */ (e).code;
  }
  return 'no error';
}

// A 1×1 PNG.
const PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da6364f8cf00000301010018dd8db40000000049454e44ae426082',
  'hex',
);

const PAGE = `import * as stylex from '@stylexjs/stylex';
import {List, ListItem} from '@astryxdesign/core/List';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import dot from './dot.png';

const styles = stylex.create({box: {padding: 12}});

export default function Page() {
  return (
    <div {...stylex.props(styles.box)}>
      <Heading level={1}>Café ✓ report</Heading>
      <Text>{'</script><script>alert(1)</script>'}</Text>
      <img src={dot} alt="" />
      <List>
        <ListItem>Dropped child text</ListItem>
        <ListItem label="Kept label" />
      </List>
      <Button>Go</Button>
    </div>
  );
}
`;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(CLI_DIR, '.astryx-render-test-'));
  put('dot.png', PNG);
  put('page.tsx', PAGE);
});

afterAll(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

describe('render(): page to one HTML file', () => {
  /** @type {import('./render.type.mjs').RenderPageResponse} */
  let result;
  /** @type {string} */
  let html;

  beforeAll(async () => {
    result = /** @type {any} */ (await render('page.tsx', {cwd: dir}));
    html = fs.readFileSync(path.join(dir, 'page.html'), 'utf8');
  }, 60_000);

  it('answers render.page and writes beside the page by default', () => {
    expect(result.type).toBe('render.page');
    expect(result.data.output).toBe('page.html');
    expect(result.data.files).toEqual(['page.tsx', 'dot.png']);
    expect(result.data.bytes).toBe(Buffer.byteLength(html));
    expect(result.data.stylesheets).toContain('@astryxdesign/core/astryx.css');
  });

  it('is one static file: no external references, no running script', () => {
    expect(html).not.toMatch(/<link\b/i);
    expect(html).not.toMatch(/\ssrc="(?!data:)/);
    const scripts = [...html.matchAll(/<script\b([^>]*)>/gi)].map(m => m[1]);
    expect(scripts).toEqual([' type="application/x-astryx-source"']);
  });

  it('keeps text safe and the page title from its heading', () => {
    expect(html).toContain('<title>Café ✓ report</title>');
    expect(html).toContain('&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('inlines CSS for the classes it uses, its own StyleX, and the layer order once', () => {
    const style = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? '';
    expect(style).toMatch(/^:root\{color-scheme:light dark\}/);
    expect(style.match(/@layer reset, astryx-base, astryx-theme;/g)).toHaveLength(1);
    expect(style).toContain('padding:12px');
    const classes = new Set(
      [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)),
    );
    const astryx = [...classes].filter(c => c.startsWith('astryx-'));
    expect(astryx.length).toBeGreaterThan(0);
    // Core's stylesheet is cut: a component the page does not use is absent.
    expect(style).not.toContain('.astryx-calendar');
  });

  it('inlines a local image as a data: URI', () => {
    expect(result.data.images).toBe(1);
    expect(html).toContain('src="data:image/png;base64,');
  });

  it('warns when a component drops the text it was given', () => {
    const dropped = result.data.warnings.filter(w => w.code === 'dropped-children');
    expect(dropped).toHaveLength(1);
    expect(dropped[0].message).toContain('ListItem');
    expect(dropped[0].message).toContain('label=');
  });

  it('gives the page back byte for byte', async () => {
    const back = /** @type {any} */ (
      await render('page.html', {cwd: dir, reverse: true, out: 'back/page.tsx'})
    );
    expect(back.type).toBe('render.reverse');
    expect(back.data).toMatchObject({mode: 'embedded', exact: true, output: 'back/page.tsx'});
    expect(fs.readFileSync(path.join(dir, 'back/page.tsx'))).toEqual(
      fs.readFileSync(path.join(dir, 'page.tsx')),
    );
  });

  it('refuses to replace a page without --overwrite', async () => {
    expect(
      await codeOf(() => render('page.html', {cwd: dir, reverse: true, out: 'back/page.tsx'})),
    ).toBe('ERR_FILE_EXISTS');
    const again = /** @type {any} */ (
      await render('page.html', {cwd: dir, reverse: true, out: 'back/page.tsx', overwrite: true})
    );
    expect(again.data.mode).toBe('embedded');
  });

  it('rebuilds a page from Astryx markup when there is no embedded source', async () => {
    put('stripped.html', html.replace(/<script type="application\/x-astryx-source">[\s\S]*?<\/script>/, ''));
    const rebuilt = /** @type {any} */ (await render('stripped.html', {cwd: dir, reverse: true}));
    expect(rebuilt.data).toMatchObject({mode: 'rebuilt', exact: false, output: 'stripped.tsx'});
    expect(rebuilt.data.components).toEqual(expect.arrayContaining(['Button', 'Heading', 'List']));
    const source = fs.readFileSync(path.join(dir, 'stripped.tsx'), 'utf8');
    expect(source).toContain("from '@astryxdesign/core/Button'");
    expect(source).toContain('Café ✓ report');
    // The rebuilt page renders.
    const again = /** @type {any} */ (await render('stripped.tsx', {cwd: dir}));
    expect(again.type).toBe('render.page');
  }, 60_000);

  it('refuses HTML that is not an Astryx page, naming the next step', async () => {
    put('plain.html', '<!doctype html><html><body><h1>Hello</h1><p class="lead">Hi</p></body></html>');
    /** @type {any} */
    let error;
    try {
      await render('plain.html', {cwd: dir, reverse: true});
    } catch (e) {
      error = e;
    }
    expect(error.code).toBe('ERR_RENDER_NOT_ASTRYX');
    expect(error.suggestions[0].name).toBe('astryx build "<what the page is>"');
  });

  it('refuses a damaged embedded source', async () => {
    put(
      'damaged.html',
      html.replace(/"base64":"[^"]{4}/, '"base64":"AAAA'),
    );
    expect(await codeOf(() => render('damaged.html', {cwd: dir, reverse: true}))).toBe(
      'ERR_RENDER_SOURCE_DAMAGED',
    );
  });
});

describe('render(): embedded files stay inside the current folder', () => {
  it('refuses an embedded path that climbs out', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put(
      'escape.html',
      `<!doctype html><html><body><p class="astryx-text">x</p>${sourceBlock('p.tsx', [
        {path: 'p.tsx', bytes: Buffer.from('export default () => null;')},
        {path: '../../../escaped.tsx', bytes: Buffer.from('x')},
      ])}</body></html>`,
    );
    expect(await codeOf(() => render('escape.html', {cwd: dir, reverse: true, out: 'esc/p.tsx'}))).toBe(
      'ERR_PATH_TRAVERSAL',
    );
    expect(fs.existsSync(path.join(dir, 'esc/p.tsx'))).toBe(false);
  });
});

describe('render(): what a page imports', () => {
  it('inlines an imported theme stylesheet, embeds local CSS, JSON and images, and gives them all back', async () => {
    put('node_modules/@acme/theme/package.json', JSON.stringify({name: '@acme/theme', version: '1.0.0'}));
    put('node_modules/@acme/theme/theme.css', ':root{--acme-brand:#123456}.acme-unused{color:red}');
    put('site/local.css', '.site-title{letter-spacing:2px}');
    put('site/data.json', JSON.stringify({title: 'From JSON'}));
    put('site/dot.png', PNG);
    put(
      'site/page.tsx',
      `import '@acme/theme/theme.css';
import './local.css';
import data from './data.json';
import dot from './dot.png';
export default function Page() {
  return (<main><h1 className="site-title">{data.title}</h1><img src={dot} alt="" /><a href="https://example.com/docs">Docs</a></main>);
}
`,
    );
    const result = /** @type {any} */ (await render('site/page.tsx', {cwd: dir}));
    expect(result.data.stylesheets).toContain('@acme/theme/theme.css');
    expect(result.data.files).toEqual(expect.arrayContaining(['page.tsx', 'local.css', 'data.json', 'dot.png']));
    // A plain link loads nothing, so it is not a remote-asset warning.
    expect(result.data.warnings.filter((/** @type {any} */ w) => w.code === 'remote-asset')).toEqual([]);
    const html = fs.readFileSync(path.join(dir, 'site/page.html'), 'utf8');
    expect(html).toContain('--acme-brand:#123456');
    expect(html).not.toContain('.acme-unused');
    expect(html).toContain('letter-spacing:2px');
    expect(html).toContain('From JSON');
    fs.copyFileSync(path.join(dir, 'site/page.html'), path.join(dir, 'moved.html'));
    const back = /** @type {any} */ (await render('moved.html', {cwd: dir, reverse: true, out: 'moved/page.tsx'}));
    expect(back.data.files.sort()).toEqual(
      ['moved/data.json', 'moved/dot.png', 'moved/local.css', 'moved/page.tsx'].sort(),
    );
    for (const name of ['page.tsx', 'local.css', 'data.json', 'dot.png']) {
      expect(fs.readFileSync(path.join(dir, 'moved', name))).toEqual(fs.readFileSync(path.join(dir, 'site', name)));
    }
    // The moved copy renders the same page again.
    const again = /** @type {any} */ (await render('moved/page.tsx', {cwd: dir}));
    expect(fs.readFileSync(path.join(dir, 'moved/page.html'), 'utf8')).toContain('From JSON');
    expect(again.type).toBe('render.page');
  }, 60_000);

  it('uses an explicit --title', async () => {
    const r = /** @type {any} */ (await render('page.tsx', {cwd: dir, out: 'titled.html', title: 'Q3 <report>'}));
    expect(r.data.output).toBe('titled.html');
    expect(fs.readFileSync(path.join(dir, 'titled.html'), 'utf8')).toContain('<title>Q3 &lt;report&gt;</title>');
  }, 60_000);
});

describe('render(): every write stays inside the current folder', () => {
  it('keeps an embedded entry name inside: only its base name is used', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    fs.mkdirSync(path.join(dir, 'inner'), {recursive: true});
    put(
      'inner/entry.html',
      `<body><p class="astryx-text">x</p>${sourceBlock('../../../outside.tsx', [
        {path: '../../../outside.tsx', bytes: Buffer.from('export default () => null;')},
      ])}</body>`,
    );
    // Only the base name is used: it lands beside the HTML file.
    const r = /** @type {any} */ (await render('inner/entry.html', {cwd: dir, reverse: true}));
    expect(r.data.output).toBe('inner/outside.tsx');
  });

  it('refuses --out outside the current folder, and a write through a symlink that leaves it', async () => {
    expect(await codeOf(() => render('page.tsx', {cwd: dir, out: '../escaped.html'}))).toBe('ERR_PATH_TRAVERSAL');
    expect(await codeOf(() => render('page.html', {cwd: dir, reverse: true, out: '../escaped.tsx'}))).toBe(
      'ERR_PATH_TRAVERSAL',
    );
    const outside = fs.mkdtempSync(path.join(CLI_DIR, '.astryx-render-outside-'));
    try {
      fs.symlinkSync(outside, path.join(dir, 'link-out'));
      expect(
        await codeOf(() => render('page.html', {cwd: dir, reverse: true, out: 'link-out/page.tsx'})),
      ).toBe('ERR_PATH_TRAVERSAL');
      expect(fs.readdirSync(outside)).toEqual([]);
    } finally {
      fs.rmSync(outside, {recursive: true, force: true});
    }
  });
});

describe('astryx experimental render (CLI)', () => {
  it('answers --json with the render.page envelope and --title', async () => {
    const r = await runCli(['--json', 'experimental', 'render', 'page.tsx', '--out', 'cli.html', '--title', 'From the CLI'], dir);
    expect(r.status).toBe(0);
    const json = JSON.parse(r.stdout);
    expect(json.type).toBe('render.page');
    expect(json.data.output).toBe('cli.html');
    expect(fs.readFileSync(path.join(dir, 'cli.html'), 'utf8')).toContain('<title>From the CLI</title>');
  }, 60_000);

  it('fails with exit 1 and a JSON error envelope', async () => {
    const r = await runCli(['--json', 'experimental', 'render', '--reverse', 'plain.html'], dir);
    expect(r.status).toBe(1);
    const json = JSON.parse(r.stdout);
    expect(json.code).toBe('ERR_RENDER_NOT_ASTRYX');
    expect(json.suggestions?.[0]?.name ?? '').toContain('astryx build');
  });

  it('marks itself experimental in help', async () => {
    const r = await runCli(['experimental', '--help'], dir);
    expect(r.stdout).toMatch(/render[^\n]*\[experimental\]/);
  });
});

describe('render(): refusals', () => {
  it.each([
    ['syntax error', 'bad.tsx', 'export default function Page() { return <div>; }', 'ERR_RENDER_COMPILE'],
    ['no default export', 'named.tsx', 'export function Page() { return null; }', 'ERR_RENDER_NO_DEFAULT_EXPORT'],
    ['package not installed', 'dep.tsx', "import x from 'not-a-real-package-xyz';\nexport default () => <p>{String(x)}</p>;", 'ERR_RENDER_MISSING_DEPENDENCY'],
    ['browser API while rendering', 'win.tsx', 'export default function Page() { return <p>{window.innerWidth}</p>; }', 'ERR_RENDER_BROWSER_API'],
    ['missing local module', 'local.tsx', "import X from './nope';\nexport default () => <X />;", 'ERR_FILE_NOT_FOUND'],
    ['a throw', 'throw.tsx', "export default function Page() { throw new Error('boom'); }", 'ERR_RENDER_FAILED'],
  ])('%s', async (_, name, source, code) => {
    put(name, source);
    expect(await codeOf(() => render(name, {cwd: dir}))).toBe(code);
  }, 30_000);

  it('refuses wrong inputs and flags', async () => {
    expect(await codeOf(() => render('', {cwd: dir}))).toBe('ERR_MISSING_ARGUMENT');
    expect(await codeOf(() => render('missing.tsx', {cwd: dir}))).toBe('ERR_FILE_NOT_FOUND');
    expect(await codeOf(() => render('page.html', {cwd: dir}))).toBe('ERR_INVALID_ARGUMENT');
    expect(await codeOf(() => render('page.tsx', {cwd: dir, reverse: true}))).toBe('ERR_INVALID_ARGUMENT');
    expect(await codeOf(() => render('page.tsx', {cwd: dir, out: 'page.txt'}))).toBe('ERR_INVALID_ARGUMENT');
    expect(await codeOf(() => render('page.tsx', {cwd: dir, overwrite: true}))).toBe('ERR_INVALID_ARGUMENT');
    expect(await codeOf(() => render('page.tsx', {cwd: dir, out: 'page.tsx'}))).toBe('ERR_INVALID_ARGUMENT');
  });

  it('refuses an image too large to inline', async () => {
    put('big.png', Buffer.alloc(9 * 1024 * 1024));
    put('big.tsx', "import big from './big.png';\nexport default () => <img src={big} alt='' />;");
    expect(await codeOf(() => render('big.tsx', {cwd: dir}))).toBe('ERR_RENDER_ASSET_TOO_LARGE');
  }, 30_000);
});
