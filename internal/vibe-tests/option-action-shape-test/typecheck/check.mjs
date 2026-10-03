// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// Extracts the ```tsx block from every result and typechecks it against the
// arm's candidate-API stub. A deterministic correctness signal to sit beside
// the judged rubric: "does the code the agent wrote even fit the API it was
// documented?" Run from this directory: `node typecheck/check.mjs`.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const resultsDir = join(root, 'outputs');
const srcDir = join(here, 'src');
rmSync(srcDir, {recursive: true, force: true});

const arms = [
  'arm-a-render-prop',
  'arm-b-node',
  'arm-c-declared',
  'arm-d-array',
];

// Every task said these "already exist". Give the outputs the same promise,
// identically across arms. An output that declares or receives its own typed
// versions shadows these and is unaffected. `JSX` is the pre-React-19 global
// namespace some outputs still reach for.
const GLOBALS =
  "import type {ReactElement} from 'react';\n" +
  'declare global {\n' +
  '  const labels: Array<{id: string; name: string; isCustom: boolean}>;\n' +
  '  const selectedIds: string[];\n' +
  '  function setSelectedIds(ids: string[]): void;\n' +
  '  function openRename(id: string): void;\n' +
  '  const teammates: Array<{id: string; name: string; title: string}>;\n' +
  '  const selected: string[];\n' +
  '  function setSelected(ids: string[]): void;\n' +
  '  function showProfile(id: string): void;\n' +
  '  const filters: Array<{id: string; name: string}>;\n' +
  '  const activeIds: string[];\n' +
  '  function setActiveIds(ids: string[]): void;\n' +
  '  function rename(id: string): void;\n' +
  '  function remove(id: string): void;\n' +
  '  const projects: Array<{id: string; name: string}>;\n' +
  '  const chosen: string[];\n' +
  '  function setChosen(ids: string[]): void;\n' +
  '  function pin(id: string): void;\n' +
  '  const countries: Array<{code: string; name: string}>;\n' +
  '  namespace JSX { type Element = ReactElement; }\n' +
  '}\n' +
  'export {};\n';

const summary = [];
for (const arm of arms) {
  const armDir = join(srcDir, arm);
  mkdirSync(armDir, {recursive: true});
  writeFileSync(join(armDir, 'globals.d.ts'), GLOBALS);
  const files = readdirSync(resultsDir).filter(
    f => f.startsWith(arm + '--') && f.endsWith('.md'),
  );
  for (const f of files) {
    const md = readFileSync(join(resultsDir, f), 'utf8');
    const m = md.match(/```tsx\n([\s\S]*?)```/);
    if (!m) {
      summary.push({arm, file: f, status: 'no-code-block'});
      continue;
    }
    writeFileSync(join(armDir, f.replace(/\.md$/, '.tsx')), m[1]);
  }
  const tsconfig = {
    extends: '../../tsconfig.astryx.json',
    compilerOptions: {
      paths: {
        '@astryxdesign/core': [`./stubs/${arm}.ts`],
        '@astryxdesign/core/*': ['../../../../packages/core/src/*'],
        '@astryxdesign/theme/neutral': [
          '../../../../packages/themes/neutral/src/source.ts',
        ],
        '@stylexjs/stylex': ['../../../../node_modules/@stylexjs/stylex'],
      },
      types: ['react', 'react-dom'],
    },
    include: [
      `src/${arm}/*.tsx`,
      `src/${arm}/*.ts`,
      `src/${arm}/*.d.ts`,
      `stubs/${arm}.ts`,
    ],
  };
  const cfgPath = join(here, `tsconfig.${arm}.json`);
  writeFileSync(cfgPath, JSON.stringify(tsconfig, null, 2) + '\n');
  const tsc = join(root, '..', '..', '..', 'node_modules', '.bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('tsc not found at ' + tsc);
  const r = spawnSync(tsc, ['-p', cfgPath, '--pretty', 'false'], {
    encoding: 'utf8',
    cwd: here,
  });
  const lines = (r.stdout + r.stderr)
    .split('\n')
    .filter(l => l.includes(`src/${arm}/`));
  const perFile = {};
  for (const l of lines) {
    const mm = l.match(/src\/[^/]+\/([^(]+)\(/);
    if (!mm) continue;
    (perFile[mm[1]] ||= []).push(l.replace(/^.*?\(\d+,\d+\): /, ''));
  }
  for (const f of readdirSync(join(srcDir, arm)).filter(f =>
    f.endsWith('.tsx'),
  )) {
    summary.push({arm, file: f, errors: perFile[f] ?? []});
  }
}
for (const s of summary) {
  const n = s.errors ? s.errors.length : s.status;
  console.log(`${s.file}: ${n === 0 ? 'OK' : n}`);
  for (const e of s.errors ?? []) console.log('   ', e);
}
writeFileSync(
  join(here, 'summary.json'),
  JSON.stringify(summary, null, 2) + '\n',
);
