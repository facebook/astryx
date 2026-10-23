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

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(CLI_DIR, '.astryx-render-test-'));
  put('dot.png', PNG);
  put('page.tsx', PAGE);
  put('plain.html', '<!doctype html><html><body><h1>Hello</h1><p class="lead">Hi</p></body></html>');
  // Every test can read the rendered page, whatever runs first.
  await render('page.tsx', {cwd: dir});
}, 60_000);

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

  it('refuses to replace a page without --overwrite, and never adds neighbours to a folder that exists', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put('alone-page.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [{path: 'page.tsx', bytes: Buffer.from('export default () => null;\n')}])}</body>`);
    await render('alone-page.html', {cwd: dir, reverse: true, out: 'twice/page.tsx'});
    expect(await codeOf(() => render('alone-page.html', {cwd: dir, reverse: true, out: 'twice/page.tsx'}))).toBe(
      'ERR_FILE_EXISTS',
    );
    const again = /** @type {any} */ (
      await render('alone-page.html', {cwd: dir, reverse: true, out: 'twice/page.tsx', overwrite: true})
    );
    expect(again.data.mode).toBe('embedded');
    // A page with a neighbour (its image) comes back only into a new folder.
    await render('page.html', {cwd: dir, reverse: true, out: 'twice-img/page.tsx'});
    expect(
      await codeOf(() => render('page.html', {cwd: dir, reverse: true, out: 'twice-img/page.tsx', overwrite: true})),
    ).toBe('ERR_PATH_TRAVERSAL');
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
  it('refuses an embedded entry path that climbs out', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    fs.mkdirSync(path.join(dir, 'inner'), {recursive: true});
    put(
      'inner/entry.html',
      `<body><p class="astryx-text">x</p>${sourceBlock('../../../outside.tsx', [
        {path: '../../../outside.tsx', bytes: Buffer.from('export default () => null;')},
      ])}</body>`,
    );
    expect(await codeOf(() => render('inner/entry.html', {cwd: dir, reverse: true}))).toBe('ERR_PATH_TRAVERSAL');
    expect(fs.existsSync(path.join(dir, 'inner/outside.tsx'))).toBe(false);
  });

  it('gives back a page that imports from a parent folder, keeping the layout inside the current folder', async () => {
    put('tree/src/components/Footer.tsx', 'export function Footer() { return <p>Parent footer</p>; }\n');
    put(
      'tree/src/app/page.tsx',
      "import {Footer} from '../components/Footer';\nexport default function Page() { return <main><h1>Tree</h1><Footer /></main>; }\n",
    );
    const cwd = path.join(dir, 'tree/src/app');
    const r = /** @type {any} */ (await render('page.tsx', {cwd}));
    expect(r.data.files).toEqual(['app/page.tsx', 'components/Footer.tsx']);
    // From the page's own folder, the neighbour would land outside it, beside
    // existing files: refused, naming a new folder to restore into.
    /** @type {any} */
    let refused;
    try {
      await render('page.html', {cwd, reverse: true, out: 'back.tsx'});
    } catch (e) {
      refused = e;
    }
    expect(refused?.code).toBe('ERR_PATH_TRAVERSAL');
    expect(refused.message).toContain('--out restored/app/back.tsx');
    expect(fs.existsSync(path.join(cwd, 'back.tsx'))).toBe(false);
    const back = /** @type {any} */ (await render('page.html', {cwd, reverse: true, out: 'restored/app/back.tsx'}));
    expect(back.data.files).toEqual(['restored/app/back.tsx', 'restored/components/Footer.tsx']);
    const again = /** @type {any} */ (await render('restored/app/back.tsx', {cwd}));
    expect(again.type).toBe('render.page');
    // From a folder that holds the whole tree, the page lands where asked.
    const up = path.join(dir, 'tree');
    const back2 = /** @type {any} */ (await render('src/app/page.html', {cwd: up, reverse: true, out: 'copy/app/page.tsx'}));
    expect(back2.data.output).toBe('copy/app/page.tsx');
    expect(back2.data.files).toEqual(['copy/app/page.tsx', 'copy/components/Footer.tsx']);
    // Into a folder with another name: each neighbour goes where the page's
    // own imports find it from there, and the page renders again.
    const renamed = /** @type {any} */ (
      await render('src/app/page.html', {cwd: up, reverse: true, out: 'src/reports/today/page.tsx'})
    );
    expect(renamed.data.output).toBe('src/reports/today/page.tsx');
    expect(renamed.data.files).toEqual(['src/reports/today/page.tsx', 'src/reports/components/Footer.tsx']);
    const rerendered = /** @type {any} */ (await render('src/reports/today/page.tsx', {cwd: up}));
    expect(rerendered.type).toBe('render.page');
  }, 60_000);

  it('resolves a tsconfig path alias', async () => {
    put('aliased/tsconfig.json', '{\n  // paths\n  "compilerOptions": {"baseUrl": ".", "paths": {"@/*": ["./src/*"]}},\n}\n');
    put('aliased/package.json', '{"name":"aliased","private":true}');
    put('aliased/src/Header.tsx', 'export function Header() { return <p>Aliased header</p>; }\n');
    put('aliased/src/page.tsx', "import {Header} from '@/Header';\nexport default function Page() { return <Header />; }\n");
    put('aliased/src/bad.tsx', "import X from '@/nope';\nexport default function Page() { return <X />; }\n");
    const r = /** @type {any} */ (await render('aliased/src/page.tsx', {cwd: dir}));
    expect(fs.readFileSync(path.join(dir, 'aliased/src/page.html'), 'utf8')).toContain('Aliased header');
    expect(r.data.files).toEqual(['page.tsx', 'Header.tsx']);
    expect(await codeOf(() => render('aliased/src/bad.tsx', {cwd: dir}))).toBe('ERR_FILE_NOT_FOUND');
  }, 60_000);

  it('gives back a page that imports through an alias where this project\'s alias points', async () => {
    put('aliased-src/tsconfig.json', '{"compilerOptions": {"baseUrl": ".", "paths": {"@/*": ["./src/*"]}}}\n');
    put('aliased-src/package.json', '{"name":"aliased-src","private":true}');
    put('aliased-src/src/components/Header.tsx', 'export function Header() { return <p>Alias header</p>; }\n');
    put(
      'aliased-src/src/app/page.tsx',
      "import {Header} from '@/components/Header';\nexport default function Page() { return <Header />; }\n",
    );
    await render('aliased-src/src/app/page.tsx', {cwd: dir});
    // Another project with the same alias, and the guide's own command.
    put('aliased-to/tsconfig.json', '{"compilerOptions": {"baseUrl": ".", "paths": {"@/*": ["./src/*"]}}}\n');
    put('aliased-to/package.json', '{"name":"aliased-to","private":true}');
    fs.copyFileSync(path.join(dir, 'aliased-src/src/app/page.html'), path.join(dir, 'aliased-to/page.html'));
    const cwd = path.join(dir, 'aliased-to');
    // Into the project's existing folders: refused, without a suggestion that cannot work.
    put('aliased-to/src/keep.txt', 'existing\n');
    /** @type {any} */
    let refused;
    try {
      await render('page.html', {cwd, reverse: true, out: 'page.tsx'});
    } catch (e) {
      refused = e;
    }
    expect(refused?.code).toBe('ERR_PATH_TRAVERSAL');
    expect(refused.message).toContain('path alias');
    expect(refused.suggestions ?? []).toEqual([]);
    fs.rmSync(path.join(cwd, 'src'), {recursive: true});
    // Into a new folder the alias points into: the page and its import come back.
    const back = /** @type {any} */ (await render('page.html', {cwd, reverse: true, out: 'src/app/page.tsx'}));
    expect(back.data.files).toEqual(['src/app/page.tsx', 'src/components/Header.tsx']);
    const again = /** @type {any} */ (await render('src/app/page.tsx', {cwd}));
    expect(again.type).toBe('render.page');
    expect(fs.readFileSync(path.join(cwd, 'src/app/page.html'), 'utf8')).toContain('Alias header');
    // Without the alias, the file it names is refused, naming why.
    put('no-alias/package.json', '{"name":"no-alias","private":true}');
    fs.copyFileSync(path.join(dir, 'aliased-src/src/app/page.html'), path.join(dir, 'no-alias/page.html'));
    expect(
      await codeOf(() => render('page.html', {cwd: path.join(dir, 'no-alias'), reverse: true, out: 'page.tsx'})),
    ).toBe('ERR_RENDER_SOURCE_DAMAGED');
  }, 60_000);

  it('never writes through a symbolic link or over a protected file, even with --overwrite', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    const page = {path: 'page.tsx', bytes: Buffer.from("import './styles.css';\nexport default () => null;\n")};
    const css = {path: 'styles.css', bytes: Buffer.from('.a{}\n')};
    put('prot/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [page, css])}</body>`);
    const cwd = path.join(dir, 'prot');
    // A symbolic link inside the folder, onto a file the refusal never named.
    put('prot/real.css', 'original\n');
    fs.mkdirSync(path.join(cwd, 'out'), {recursive: true});
    fs.symlinkSync(path.join(cwd, 'real.css'), path.join(cwd, 'out/styles.css'));
    expect(await codeOf(() => render('page.html', {cwd, reverse: true, out: 'out/page.tsx', overwrite: true}))).toBe(
      'ERR_PATH_TRAVERSAL',
    );
    expect(fs.readFileSync(path.join(cwd, 'real.css'), 'utf8')).toBe('original\n');
    // A generated file and an ignored file are never replaced.
    put('prot/alone.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [{path: 'page.tsx', bytes: Buffer.from('export default () => null;\n')}])}</body>`);
    put('prot/gen/page.tsx', '// @generated\nexport default () => null;\n');
    expect(await codeOf(() => render('alone.html', {cwd, reverse: true, out: 'gen/page.tsx', overwrite: true}))).toBe(
      'ERR_FILE_EXISTS',
    );
    expect(fs.readFileSync(path.join(cwd, 'gen/page.tsx'), 'utf8')).toContain('@generated');
    put('prot/.gitignore', 'ignored/\n');
    put('prot/ignored/page.tsx', 'mine\n');
    expect(await codeOf(() => render('alone.html', {cwd, reverse: true, out: 'ignored/page.tsx', overwrite: true}))).toBe(
      'ERR_FILE_EXISTS',
    );
    expect(fs.readFileSync(path.join(cwd, 'ignored/page.tsx'), 'utf8')).toBe('mine\n');
  });

  it('refuses a configuration file a received page imports from above it', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    for (const name of ['babel.config.json', 'jest.config.json', 'project.json']) {
      const page = {path: 'src/app/page.tsx', bytes: Buffer.from(`import c from '../../${name}';\nexport default () => null;\n`)};
      put('cfg-above.html', `<body><p class="astryx-text">x</p>${sourceBlock('src/app/page.tsx', [page, {path: name, bytes: Buffer.from('{}')}])}</body>`);
      expect(await codeOf(() => render('cfg-above.html', {cwd: dir, reverse: true, out: 'cfg-above/src/app/page.tsx'}))).toBe(
        'ERR_RENDER_SOURCE_DAMAGED',
      );
      expect(fs.existsSync(path.join(dir, 'cfg-above', name))).toBe(false);
    }
  });

  it('restores a short alias import to the file it names', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put('short-alias/tsconfig.json', '{"compilerOptions": {"baseUrl": ".", "paths": {"@/*": ["./src/*"]}}}\n');
    const page = {path: 'page.tsx', bytes: Buffer.from("import {t} from '@/t';\nexport default () => t;\n")};
    put('short-alias/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [page, {path: 't.ts', bytes: Buffer.from("export const t = 'x';\n")}])}</body>`);
    const back = /** @type {any} */ (await render('page.html', {cwd: path.join(dir, 'short-alias'), reverse: true, out: 'src/page.tsx'}));
    expect(back.data.files).toEqual(['src/page.tsx', 'src/t.ts']);
  });

  it('rebuilds a quoted attribute as JSX that compiles', async () => {
    put(
      'quoted.html',
      '<body><div class="astryx-stack"><img src="data:image/png;base64,iVBORw0KGgo=" alt="say &quot;hi&quot; {now}"><a class="astryx-link" href="/x?a=&quot;b&quot;">Go</a></div></body>',
    );
    const back = /** @type {any} */ (await render('quoted.html', {cwd: dir, reverse: true, out: 'quoted/page.tsx'}));
    expect(back.data.mode).toBe('rebuilt');
    const source = fs.readFileSync(path.join(dir, 'quoted/page.tsx'), 'utf8');
    expect(source).toContain('alt={"say \\"hi\\" {now}"}');
    const again = /** @type {any} */ (await render('quoted/page.tsx', {cwd: dir}));
    expect(again.type).toBe('render.page');
  }, 60_000);

  it('never adds a file outside the page\'s own folder beside existing project files', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put('plant/app/keep.txt', 'existing\n');
    for (const [spec, name] of [
      ['../../nodemon.json', 'nodemon.json'],
      ['../../jsr.json', 'jsr.json'],
      ['../../instrumentation', 'instrumentation.ts'],
      ['../middleware', 'src/middleware.ts'],
    ]) {
      const page = {path: 'src/app/page.tsx', bytes: Buffer.from(`import x from '${spec}';\nexport default () => null;\n`)};
      put('plant/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('src/app/page.tsx', [page, {path: name, bytes: Buffer.from('{}')}])}</body>`);
      expect(
        await codeOf(() => render('page.html', {cwd: path.join(dir, 'plant'), reverse: true, out: 'app/page.tsx', overwrite: true})),
      ).toMatch(/ERR_PATH_TRAVERSAL|ERR_RENDER_SOURCE_DAMAGED/);
      expect(fs.existsSync(path.join(dir, 'plant', path.basename(name)))).toBe(false);
      expect(fs.existsSync(path.join(dir, 'plant/app/page.tsx'))).toBe(false);
    }
  });

  it('writes all or nothing: a failure part-way leaves nothing behind', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    // The second file's name is longer than a file system allows, so its
    // write fails after the page's has been staged.
    const long = 'C'.repeat(300);
    const page = {path: 'app/page.tsx', bytes: Buffer.from(`import {C} from './components/${long}';\nexport default () => <C />;\n`)};
    const comp = {path: `app/components/${long}.tsx`, bytes: Buffer.from('export const C = () => null;\n')};
    put('atomic/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('app/page.tsx', [page, comp])}</body>`);
    expect(await codeOf(() => render('page.html', {cwd: path.join(dir, 'atomic'), reverse: true, out: 'out/page.tsx'}))).toBe(
      'ERR_WRITE_FAILED',
    );
    expect(fs.readdirSync(path.join(dir, 'atomic'))).toEqual(['page.html']);
  });



  it('restores an exact alias import to the file it names', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put('exact-alias/tsconfig.json', '{"compilerOptions": {"baseUrl": ".", "paths": {"@theme": ["./src/theme.ts"]}}}\n');
    const page = {path: 'page.tsx', bytes: Buffer.from("import {t} from '@theme';\nexport default () => t;\n")};
    put('exact-alias/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [page, {path: 'theme.ts', bytes: Buffer.from("export const t = 'x';\n")}])}</body>`);
    const back = /** @type {any} */ (await render('page.html', {cwd: path.join(dir, 'exact-alias'), reverse: true, out: 'src/page.tsx'}));
    expect(back.data.files).toEqual(['src/page.tsx', 'src/theme.ts']);
  });

  it('keeps every neighbour inside the one folder the restore creates', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put('depth/app/layout.tsx', 'existing\n');
    const page = {path: 'restored/report.tsx', bytes: Buffer.from("import r from '../app/report-export/route';\nexport default () => null;\n")};
    put('depth/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('restored/report.tsx', [page, {path: 'app/report-export/route.ts', bytes: Buffer.from('export {};\n')}])}</body>`);
    /** @type {any} */
    let refused;
    try {
      await render('page.html', {cwd: path.join(dir, 'depth'), reverse: true, out: 'restored/report.tsx'});
    } catch (e) {
      refused = e;
    }
    expect(refused?.code).toBe('ERR_PATH_TRAVERSAL');
    expect(fs.existsSync(path.join(dir, 'depth/app/report-export'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'depth/restored'))).toBe(false);
    // The suggested folder works.
    const suggestion = refused.suggestions[0].name.replace('--out ', '');
    const back = /** @type {any} */ (await render('page.html', {cwd: path.join(dir, 'depth'), reverse: true, out: suggestion}));
    expect(back.data.mode).toBe('embedded');
  });

  it('refuses test, spec and story files a received page imports', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    for (const name of ['report.test.ts', 'report.spec.tsx', 'Report.stories.tsx', '__tests__/r.ts']) {
      const page = {path: 'page.tsx', bytes: Buffer.from(`import './${name.replace(/\.tsx?$/, '')}';\nexport default () => null;\n`)};
      put('tests-in.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [page, {path: name, bytes: Buffer.from('export {};\n')}])}</body>`);
      expect(await codeOf(() => render('tests-in.html', {cwd: dir, reverse: true, out: 'tests-in/page.tsx'}))).toBe(
        'ERR_RENDER_SOURCE_DAMAGED',
      );
    }
  });

  it('keeps a received title out of the rebuilt code', async () => {
    put('evil-title.html', '<html><head><title>x\rprocess.exit(7)\u2028//</title></head><body><div class="astryx-stack"><p class="astryx-text">Hi</p></div></body></html>');
    await render('evil-title.html', {cwd: dir, reverse: true, out: 'evil-title/page.tsx'});
    const first = fs.readFileSync(path.join(dir, 'evil-title/page.tsx'), 'utf8').split(/\r\n|\r|\n|\u2028|\u2029/)[0];
    expect(first).toContain('process.exit(7)');
    expect(first.startsWith('//')).toBe(true);
  });

  it('never adds a neighbour to an existing folder, a project root included', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put('rooted/package.json', '{"name":"rooted","private":true}');
    for (const name of ['instrumentation.ts', 'middleware.ts', 'nodemon.json']) {
      const spec = `./${name.replace(/\.ts$/, '')}`;
      const page = {path: 'page.tsx', bytes: Buffer.from(`import x from '${spec}';\nexport default () => null;\n`)};
      put('rooted/page.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [page, {path: name, bytes: Buffer.from('{}')}])}</body>`);
      expect(
        await codeOf(() => render('page.html', {cwd: path.join(dir, 'rooted'), reverse: true, out: 'page.tsx', overwrite: true})),
      ).toMatch(/ERR_PATH_TRAVERSAL|ERR_RENDER_SOURCE_DAMAGED/);
      expect(fs.existsSync(path.join(dir, 'rooted', name))).toBe(false);
      expect(fs.existsSync(path.join(dir, 'rooted/page.tsx'))).toBe(false);
    }
    // The default name comes from the file given, never from inside it.
    put('rooted/shared.html', `<body><p class="astryx-text">x</p>${sourceBlock('instrumentation.ts', [{path: 'instrumentation.ts', bytes: Buffer.from('export function register() {}\n')}])}</body>`);
    const back = /** @type {any} */ (await render('shared.html', {cwd: path.join(dir, 'rooted'), reverse: true}));
    expect(back.data.output).toBe('shared.ts');
  });

  it('replaces an existing output only when a render wrote it, and never an ignored one', async () => {
    put('fwd/page.tsx', PAGE);
    fs.copyFileSync(path.join(dir, 'dot.png'), path.join(dir, 'fwd/dot.png'));
    put('fwd/mine.html', '<p>hand-written</p>\n');
    const cwd = path.join(dir, 'fwd');
    expect(await codeOf(() => render('page.tsx', {cwd, out: 'mine.html'}))).toBe('ERR_FILE_EXISTS');
    expect(fs.readFileSync(path.join(cwd, 'mine.html'), 'utf8')).toBe('<p>hand-written</p>\n');
    await render('page.tsx', {cwd});
    const again = /** @type {any} */ (await render('page.tsx', {cwd}));
    expect(again.type).toBe('render.page');
    put('fwd/.gitignore', 'page.html\n');
    expect(await codeOf(() => render('page.tsx', {cwd}))).toBe('ERR_FILE_EXISTS');
  }, 60_000);

  it('refuses a received file that lists one path twice', async () => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    const page = {path: 'page.tsx', bytes: Buffer.from('export default () => null;\n')};
    put('twice.html', `<body><p class="astryx-text">x</p>${sourceBlock('page.tsx', [page, {path: 'page.tsx', bytes: Buffer.from("import './instrumentation';\n")}, {path: 'instrumentation.ts', bytes: Buffer.from('export {};\n')}])}</body>`);
    expect(await codeOf(() => render('twice.html', {cwd: dir, reverse: true, out: 'twice-out/page.tsx'}))).toBe(
      'ERR_RENDER_SOURCE_DAMAGED',
    );
    expect(fs.existsSync(path.join(dir, 'twice-out'))).toBe(false);
  });

  it('reports ERR_WRITE_FAILED when the output cannot be written', async () => {
    fs.mkdirSync(path.join(dir, 'a-folder.html'), {recursive: true});
    expect(await codeOf(() => render('page.tsx', {cwd: dir, out: 'a-folder.html'}))).toBe('ERR_WRITE_FAILED');
  }, 60_000);

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

describe('render --reverse: a received file may carry only what a render embeds', () => {
  /** @param {string} name @param {{path: string, text: string}[]} files */
  const crafted = async (name, files) => {
    const {sourceBlock} = await import('../../foundation/render/source-block.mjs');
    put(
      name,
      `<body><p class="astryx-text">x</p>${sourceBlock(files[0].path, files.map(f => ({path: f.path, bytes: Buffer.from(f.text)})))}</body>`,
    );
  };
  it.each([
    ['a git hook', '.git/hooks/pre-commit', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['a dotfile', '.env', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['a tool configuration module', 'vite.config.ts', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['an rc module', '.eslintrc.js', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['the Astryx configuration', 'astryx.config.mjs', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['the package manifest', 'package.json', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['a TypeScript configuration', 'tsconfig.json', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['a package inside node_modules', 'node_modules/react/index.js', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['a shell script', 'scripts/install.sh', 'ERR_RENDER_SOURCE_DAMAGED'],
    ['a climbing path', '../escape.css', 'ERR_PATH_TRAVERSAL'],
    ['an absolute path', '/tmp/escape.css', 'ERR_PATH_TRAVERSAL'],
  ])('refuses %s, writing nothing', async (_, bad, code) => {
    const name = `crafted-${bad.replace(/[^a-z0-9]/gi, '_')}.html`;
    await crafted(name, [
      {path: 'page.tsx', text: 'export default () => null;\n'},
      {path: bad, text: 'echo pwned\n'},
    ]);
    const out = `crafted-out-${bad.replace(/[^a-z0-9]/gi, '_')}`;
    expect(await codeOf(() => render(name, {cwd: dir, reverse: true, out: `${out}/page.tsx`}))).toBe(code);
    expect(fs.existsSync(path.join(dir, out))).toBe(false);
  });

  it.each([
    ['a framework hook file', 'instrumentation.ts'],
    ['a middleware module', 'src/middleware.ts'],
    ['a JSON tool configuration', 'babel.config.json'],
    ['a module in a tools folder', 'tools/plugin.js'],
    ['a stylesheet the page never imports', 'theme.css'],
  ])('refuses %s the page does not import, writing nothing', async (_, extra) => {
    const name = `stray-${extra.replace(/[^a-z0-9]/gi, '_')}.html`;
    await crafted(name, [
      {path: 'page.tsx', text: "import {Header} from './Header';\nexport default () => <Header />;\n"},
      {path: 'Header.tsx', text: 'export const Header = () => <h1>Hi</h1>;\n'},
      {path: extra, text: 'export default {};\n'},
    ]);
    const out = `stray-out-${extra.replace(/[^a-z0-9]/gi, '_')}`;
    /** @type {any} */
    let error;
    try {
      await render(name, {cwd: dir, reverse: true, out: `${out}/page.tsx`});
    } catch (e) {
      error = e;
    }
    expect(error?.code).toBe('ERR_RENDER_SOURCE_DAMAGED');
    expect(error.message).toContain(extra);
    expect(fs.existsSync(path.join(dir, out))).toBe(false);
  });

  it('writes every file the page reaches: re-exports, import(), require() and a folder index', async () => {
    await crafted('reach.html', [
      {
        path: 'page.tsx',
        text: "export {a} from './a';\nconst b = import('./b');\nconst c = require('./c.json');\nimport './parts';\nexport default () => null;\n",
      },
      {path: 'a.ts', text: "import './a.css';\nexport const a = 1;\n"},
      {path: 'a.css', text: '.a{}\n'},
      {path: 'b.tsx', text: 'export default 2;\n'},
      {path: 'c.json', text: '{}\n'},
      {path: 'parts/index.ts', text: 'export {};\n'},
    ]);
    const r = /** @type {any} */ (await render('reach.html', {cwd: dir, reverse: true, out: 'reach/page.tsx'}));
    expect(r.data.files.length).toBe(6);
  });

  it('refuses a page entry that is not a page module, and an --out that names a configuration file', async () => {
    await crafted('crafted-entry.html', [{path: 'vite.config.ts', text: 'export default {};\n'}]);
    expect(await codeOf(() => render('crafted-entry.html', {cwd: dir, reverse: true}))).toBe('ERR_RENDER_SOURCE_DAMAGED');
    await crafted('crafted-good.html', [{path: 'page.tsx', text: 'export default () => null;\n'}]);
    expect(await codeOf(() => render('crafted-good.html', {cwd: dir, reverse: true, out: 'vite.config.ts'}))).toBe(
      'ERR_INVALID_ARGUMENT',
    );
    // Refused before the input is read: a missing input gives the same answer.
    expect(await codeOf(() => render('missing.html', {cwd: dir, reverse: true, out: 'vite.config.ts'}))).toBe(
      'ERR_INVALID_ARGUMENT',
    );
    expect(fs.existsSync(path.join(dir, 'vite.config.ts'))).toBe(false);
  });

  it('refuses neighbours into a folder that already exists, naming them, and writes nothing', async () => {
    await crafted('crafted-exists.html', [
      {path: 'page.tsx', text: "import './styles.css';\nexport default () => null;\n"},
      {path: 'styles.css', text: '.a{}\n'},
    ]);
    put('exists/keep.txt', 'existing\n');
    /** @type {any} */
    let error;
    try {
      await render('crafted-exists.html', {cwd: dir, reverse: true, out: 'exists/page.tsx', overwrite: true});
    } catch (e) {
      error = e;
    }
    expect(error.code).toBe('ERR_PATH_TRAVERSAL');
    expect(error.message).toContain('exists/styles.css');
    expect(fs.readdirSync(path.join(dir, 'exists'))).toEqual(['keep.txt']);
  });

  it('never embeds a configuration file the page imports, and says so', async () => {
    put('cfg/package.json', JSON.stringify({name: 'cfg', version: '1.2.3'}));
    put('cfg/page.tsx', "import pkg from './package.json';\nexport default function Page() { return <p>v{pkg.version}</p>; }\n");
    const r = /** @type {any} */ (await render('cfg/page.tsx', {cwd: dir}));
    expect(r.data.files).toEqual(['page.tsx']);
    expect(r.data.warnings.map((/** @type {any} */ w) => w.code)).toContain('not-embedded');
    expect(fs.readFileSync(path.join(dir, 'cfg/page.html'), 'utf8')).toContain('v1.2.3');
  }, 60_000);
});

describe('astryx experimental render (CLI)', () => {
  it('refuses an unknown experimental subcommand with exit 1', async () => {
    const r = await runCli(['--json', 'experimental', 'nope'], dir);
    expect(r.status).toBe(1);
    const out = JSON.parse(r.stdout);
    expect(out.code).toBe('ERR_UNKNOWN_SUBCOMMAND');
    expect(out.suggestions.map((/** @type {any} */ s) => s.name)).toContain('render');
  });

  it('fails with exit 1 and a readable message without --json', async () => {
    const r = await runCli(['experimental', 'render', '--reverse', 'plain.html'], dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('is not an Astryx page');
    expect(r.stderr).toContain('astryx build');
  });


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
