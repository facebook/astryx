// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {
  analyzeSetupIntegrity,
  substantiveLineDelta,
  WHOLESALE_REPLACEMENT_THRESHOLD,
} from './setup-integrity.mjs';

const temporaryDirectories = [];
const INTEGRITY_CLI = fileURLToPath(
  new URL('./setup-integrity.mjs', import.meta.url),
);

function git(directory, args) {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'setup-integrity-tests',
      GIT_AUTHOR_EMAIL: 'setup-integrity-tests@example.com',
      GIT_COMMITTER_NAME: 'setup-integrity-tests',
      GIT_COMMITTER_EMAIL: 'setup-integrity-tests@example.com',
    },
  });
}

function write(directory, relativePath, content) {
  const file = path.join(directory, relativePath);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
}

function repository() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'setup-integrity-test-'),
  );
  temporaryDirectories.push(directory);
  write(directory, '.gitignore', 'ignored.txt\n');
  write(
    directory,
    'src/App.tsx',
    [
      'export function App() {',
      '  return <main className="host">Host application</main>;',
      '}',
      '',
    ].join('\n'),
  );
  write(
    directory,
    'src/index.css',
    [
      ':root {',
      '  color-scheme: light dark;',
      '}',
      '.host {',
      '  color: CanvasText;',
      '}',
      '',
    ].join('\n'),
  );
  git(directory, ['init', '-q']);
  git(directory, ['add', '-A']);
  git(directory, ['commit', '-qm', 'baseline']);
  return directory;
}

function addValidAstryxChange(directory) {
  write(
    directory,
    'src/App.tsx',
    [
      "import {Button} from '@astryxdesign/core/Button';",
      '',
      'export function App() {',
      '  return (',
      '    <main className="host">',
      '      Host application',
      '      <Button label="Continue" />',
      '    </main>',
      '  );',
      '}',
      '',
    ].join('\n'),
  );
}

function attest(directory) {
  return analyzeSetupIntegrity(directory).diffSha256;
}

function kinds(result) {
  return result.escapeHatches.map(finding => finding.kind);
}

const HOST_RECORDS = [
  {name: 'Quarterly plan', owner: 'Avery', state: 'Ready'},
  {name: 'Partner review', owner: 'Morgan', state: 'In progress'},
  {name: 'Launch checklist', owner: 'Riley', state: 'Blocked'},
  {name: 'Vendor renewal', owner: 'Jordan', state: 'Ready'},
  {name: 'Budget transfer', owner: 'Casey', state: 'In progress'},
  {name: 'Access request', owner: 'Quinn', state: 'Ready'},
  {name: 'Hardware order', owner: 'Reese', state: 'Blocked'},
  {name: 'Contract amendment', owner: 'Sasha', state: 'Ready'},
];

/**
 * The JSX a provider wrapper re-indents: everything between `return (` and the
 * closing paren, at the indentation an unwrapped component tree has.
 */
function hostAppTree() {
  return [
    "    <div className={dark ? 'dark' : ''}>",
    '      <main',
    '        className="min-h-screen bg-background px-6 py-8 text-foreground"',
    '        data-vibe-probe="host-shell">',
    '        <div className="mx-auto max-w-5xl space-y-6">',
    '          <header className="flex items-center justify-between gap-4">',
    '            <div>',
    '              <p className="text-sm text-muted-foreground">Review queue</p>',
    '              <h1',
    '                className="text-2xl font-semibold tracking-tight"',
    '                data-vibe-probe="page-title">',
    '                Purchase requests',
    '              </h1>',
    '            </div>',
    '            <div className="flex gap-2">',
    '              <Button',
    '                variant="outline"',
    '                onClick={() => setDark(value => !value)}>',
    '                Toggle mode',
    '              </Button>',
    '            </div>',
    '          </header>',
    '          <Card className="divide-y" data-vibe-probe="record-list">',
    ...HOST_RECORDS.flatMap(record => [
      '            <div className="flex items-center justify-between px-4 py-3">',
      `              <span className="font-medium">${record.name}</span>`,
      `              <span className="text-muted-foreground">${record.owner}</span>`,
      `              <span className="text-sm">${record.state}</span>`,
      '            </div>',
    ]),
    '          </Card>',
    '        </div>',
    '      </main>',
    '    </div>',
  ];
}

/** An established host `App.tsx`, most of whose lines sit inside the tree. */
function establishedHostApp() {
  return [
    "import {useState} from 'react';",
    "import {Button} from '@/components/ui/button';",
    "import {Card} from '@/components/ui/card';",
    '',
    'export default function App() {',
    '  const [dark, setDark] = useState(false);',
    '',
    '  return (',
    ...hostAppTree(),
    '  );',
    '}',
    '',
  ].join('\n');
}

/**
 * The same app after adding Astryx: three imports, a `<Theme>` wrapper, one new
 * button — and, because the wrapper adds a nesting level, two more spaces of
 * indentation on every line of the tree. This is the shape that made a raw
 * line diff report the whole component tree as deleted.
 */
function wrappedHostApp() {
  return [
    "import {useState} from 'react';",
    "import {Button as AstryxButton} from '@astryxdesign/core/Button';",
    "import {Theme} from '@astryxdesign/core/theme';",
    "import {neutralTheme} from '@astryxdesign/theme-neutral/built';",
    "import {Button} from '@/components/ui/button';",
    "import {Card} from '@/components/ui/card';",
    '',
    'export default function App() {',
    '  const [dark, setDark] = useState(false);',
    '',
    '  return (',
    "    <Theme theme={neutralTheme} mode={dark ? 'dark' : 'light'}>",
    ...hostAppTree().map(line => (line === '' ? line : `  ${line}`)),
    '    </Theme>',
    '  );',
    '}',
    '',
  ].join('\n');
}

function numstat(directory, relativePath) {
  return parseNumstat(
    git(directory, [
      'diff',
      '--numstat',
      '--no-renames',
      'HEAD',
      '--',
      relativePath,
    ]),
  );
}

function numstatIgnoringWhitespace(directory, relativePath) {
  return parseNumstat(
    git(directory, [
      'diff',
      '--numstat',
      '--no-renames',
      '-w',
      'HEAD',
      '--',
      relativePath,
    ]),
  );
}

function parseNumstat(output) {
  const [record] = output.split('\n').filter(Boolean);
  if (!record) return {added: 0, deleted: 0};
  const [added, deleted] = record.split('\t');
  return {added: Number(added), deleted: Number(deleted)};
}

function commitHostApp(directory, source) {
  write(directory, 'src/App.tsx', source);
  git(directory, ['add', 'src/App.tsx']);
  git(directory, ['commit', '-qm', 'establish host app']);
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('setup integrity', () => {
  it('accepts a clean Astryx diff with an exact runner attestation and stays read-only', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    const digest = attest(directory);
    const before = git(directory, [
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=all',
    ]);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(result).toMatchObject({
      schemaVersion: 1,
      diffSha256: digest,
      astryxUsage: {found: true},
      escapeHatches: [],
      attestation: {provided: true, expectedSha256: digest, matches: true},
      accepted: true,
      rejectionReasons: [],
    });
    expect(result.astryxUsage.evidence).toEqual([
      {
        path: 'src/App.tsx',
        line: 1,
        kind: 'code-import',
        text: "import {Button} from '@astryxdesign/core/Button';",
      },
    ]);
    expect(
      git(directory, [
        'status',
        '--porcelain=v1',
        '-z',
        '--untracked-files=all',
      ]),
    ).toBe(before);
  });

  it('reports deterministic changed-file inventory and line totals', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, 'src/new.css', '.panel { color: CanvasText; }\n');
    write(directory, 'ignored.txt', 'not part of the agent diff\n');

    const first = analyzeSetupIntegrity(directory);
    const second = analyzeSetupIntegrity(directory);

    expect(second.diffSha256).toBe(first.diffSha256);
    expect(first.changedFiles).toEqual([
      {
        path: 'src/App.tsx',
        status: 'modified',
        tracked: true,
        added: 8,
        deleted: 1,
        binary: false,
      },
      {
        path: 'src/new.css',
        status: 'untracked',
        tracked: false,
        added: 1,
        deleted: 0,
        binary: false,
      },
    ]);
    expect(first.counts).toEqual({files: 2, added: 9, deleted: 1});
    expect(first.rejectionReasons).toContain('missing-attestation');
  });

  it.each([
    {
      name: 'hardcoded !important',
      source: '.host { color: red !important; }\n',
      expected: 'hardcoded-important',
    },
    {
      name: 'blanket all-property reset',
      source: '.host { all: revert; }\n',
      expected: 'blanket-reset',
    },
    {
      name: 'explicit dark-mode disabling',
      source: ':root { color-scheme: light; }\n',
      expected: 'dark-mode-disabled',
    },
  ])('rejects added $name', ({source, expected}) => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, 'src/escape.css', source);
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).toContain(expected);
    expect(result.accepted).toBe(false);
  });

  it('allows the standard light-and-dark color-scheme declaration', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, 'src/theme.css', ':root { color-scheme: light dark; }\n');
    const digest = attest(directory);
    expect(kinds(analyzeSetupIntegrity(directory, digest))).not.toContain(
      'dark-mode-disabled',
    );
  });

  it('does not treat prose or lockfile text as a CSS escape hatch', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(
      directory,
      'README.md',
      'Avoid using !important in application CSS.\n',
    );
    const digest = attest(directory);
    expect(kinds(analyzeSetupIntegrity(directory, digest))).not.toContain(
      'hardcoded-important',
    );
  });

  it('rejects changing ignore rules after the execution baseline', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, '.gitignore', 'ignored.txt\nhidden.css\n');
    const digest = attest(directory);
    expect(kinds(analyzeSetupIntegrity(directory, digest))).toContain(
      'gitignore-modified',
    );
  });

  it('rejects deleting host source or CSS', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    fs.rmSync(path.join(directory, 'src', 'index.css'));
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(result.escapeHatches).toContainEqual({
      kind: 'deleted-host-source',
      path: 'src/index.css',
      line: null,
      message: 'deleted a host source or stylesheet file',
    });
    expect(result.accepted).toBe(false);
  });

  it('rejects neutralizing a short host stylesheet', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, 'src/index.css', ':root {}\n');
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).toContain('neutralized-host-css');
    expect(result.accepted).toBe(false);
  });

  it('rejects removing host dark-mode behavior', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, 'src/index.css', '.host {\n  color: CanvasText;\n}\n');
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).toContain('dark-mode-removed');
    expect(result.accepted).toBe(false);
  });

  it('rejects wholesale replacement at the documented threshold', () => {
    const directory = repository();
    const baselineLines = Array.from(
      {length: WHOLESALE_REPLACEMENT_THRESHOLD.minimumDeletedLines + 5},
      (_, index) => `export const value${index} = ${index};`,
    );
    write(directory, 'src/large.ts', `${baselineLines.join('\n')}\n`);
    git(directory, ['add', 'src/large.ts']);
    git(directory, ['commit', '-qm', 'add established source']);
    addValidAstryxChange(directory);
    write(directory, 'src/large.ts', "export const replacement = 'new';\n");
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);
    const finding = result.escapeHatches.find(
      candidate => candidate.kind === 'wholesale-replacement',
    );

    expect(finding).toMatchObject({
      path: 'src/large.ts',
      baselineLines: baselineLines.length,
      deletedLines: baselineLines.length,
      deletedFraction: 1,
    });
    expect(result.wholesaleReplacementThreshold).toEqual({
      minimumDeletedLines: 20,
      deletedFraction: 0.8,
    });
    expect(result.accepted).toBe(false);
  });

  it('rejects a mismatched runner attestation', () => {
    const directory = repository();
    addValidAstryxChange(directory);

    const result = analyzeSetupIntegrity(directory, '0'.repeat(64));

    expect(result.attestation).toEqual({
      provided: true,
      expectedSha256: '0'.repeat(64),
      matches: false,
    });
    expect(result.rejectionReasons).toContain('attestation-mismatch');
    expect(result.accepted).toBe(false);
  });

  it('rejects a missing runner attestation while still returning the digest', () => {
    const directory = repository();
    addValidAstryxChange(directory);

    const result = analyzeSetupIntegrity(directory);

    expect(result.diffSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.attestation).toEqual({
      provided: false,
      expectedSha256: null,
      matches: false,
    });
    expect(result.rejectionReasons).toContain('missing-attestation');
    expect(result.accepted).toBe(false);
  });

  it('rejects a diff with no Astryx usage evidence', () => {
    const directory = repository();
    write(
      directory,
      'src/App.tsx',
      'export function App() { return <main>Changed host</main>; }\n',
    );
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(result.astryxUsage).toEqual({found: false, evidence: []});
    expect(result.rejectionReasons).toContain('missing-astryx-usage');
    expect(result.accepted).toBe(false);
  });

  it('prints the immediate post-agent digest as JSON from the CLI', () => {
    const directory = repository();
    addValidAstryxChange(directory);

    const result = JSON.parse(
      execFileSync(process.execPath, [INTEGRITY_CLI, '--app', directory], {
        encoding: 'utf8',
      }),
    );

    expect(result.diffSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.attestation).toEqual({
      provided: false,
      expectedSha256: null,
      matches: false,
    });
  });

  it('changes the digest when a nonignored untracked file changes', () => {
    const directory = repository();
    addValidAstryxChange(directory);
    write(directory, 'notes.txt', 'first\n');
    const first = attest(directory);

    write(directory, 'notes.txt', 'second\n');
    const second = attest(directory);

    expect(second).not.toBe(first);
  });
});

describe('substantive line delta', () => {
  it('sees no deletion when a wrapper only re-indents the tree', () => {
    expect(substantiveLineDelta(establishedHostApp(), wrappedHostApp())).toEqual(
      {
        baselineLines: expect.any(Number),
        deletedLines: 0,
        deletedFraction: 0,
      },
    );
  });

  it('sees every line deleted when the same content is minified onto one line', () => {
    const baseline = establishedHostApp();
    const minified = `${baseline
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join(' ')}\n`;

    const delta = substantiveLineDelta(baseline, minified);

    expect(delta.deletedLines).toBe(delta.baselineLines);
    expect(delta.deletedFraction).toBe(1);
  });

  it('does not equate lines that differ by whitespace between tokens', () => {
    expect(
      substantiveLineDelta(
        'const label = "Purchase requests";\n',
        'constlabel="Purchaserequests";\n',
      ),
    ).toEqual({baselineLines: 1, deletedLines: 1, deletedFraction: 1});
  });

  it('treats a line as unchanged when only its indentation moved', () => {
    expect(
      substantiveLineDelta('  <Card className="divide-y">\n', '      <Card className="divide-y">\n'),
    ).toEqual({baselineLines: 1, deletedLines: 0, deletedFraction: 0});
  });
});

describe('setup integrity — reformatting versus replacement', () => {
  it('accepts a provider wrapper that re-indents an established component tree', () => {
    const directory = repository();
    commitHostApp(directory, establishedHostApp());
    write(directory, 'src/App.tsx', wrappedHostApp());
    const digest = attest(directory);

    // Non-vacuous: on the raw line diff this change clears both halves of the
    // documented threshold, so a guard reading `git diff --numstat` rejects it.
    const raw = numstat(directory, 'src/App.tsx');
    const baselineLines = establishedHostApp().split('\n').length - 1;
    expect(raw.deleted).toBeGreaterThanOrEqual(
      WHOLESALE_REPLACEMENT_THRESHOLD.minimumDeletedLines,
    );
    expect(raw.deleted / baselineLines).toBeGreaterThanOrEqual(
      WHOLESALE_REPLACEMENT_THRESHOLD.deletedFraction,
    );
    // ...and nothing was actually removed: the whole diff is added lines.
    expect(numstatIgnoringWhitespace(directory, 'src/App.tsx').deleted).toBe(0);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).not.toContain('wholesale-replacement');
    expect(result.rejectionReasons).toEqual([]);
    expect(result.accepted).toBe(true);
  });

  it('still rejects gutting the component tree, re-indentation notwithstanding', () => {
    const directory = repository();
    commitHostApp(directory, establishedHostApp());
    write(
      directory,
      'src/App.tsx',
      [
        "import {Button as AstryxButton} from '@astryxdesign/core/Button';",
        '',
        'export default function App() {',
        '  return (',
        '          <AstryxButton label="Deploy" variant="primary" />',
        '  );',
        '}',
        '',
      ].join('\n'),
    );
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);
    const finding = result.escapeHatches.find(
      candidate => candidate.kind === 'wholesale-replacement',
    );

    expect(finding).toMatchObject({path: 'src/App.tsx'});
    expect(finding.deletedFraction).toBeGreaterThanOrEqual(
      WHOLESALE_REPLACEMENT_THRESHOLD.deletedFraction,
    );
    expect(result.accepted).toBe(false);
  });

  it('rejects a rewrite that minifies the host source onto one line', () => {
    const directory = repository();
    commitHostApp(directory, establishedHostApp());
    write(
      directory,
      'src/App.tsx',
      [
        "import {Button as AstryxButton} from '@astryxdesign/core/Button';",
        establishedHostApp()
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .join(' '),
        '',
      ].join('\n'),
    );
    const digest = attest(directory);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).toContain('wholesale-replacement');
    expect(result.accepted).toBe(false);
  });

  it('rejects a rewrite that only removes the whitespace inside each line', () => {
    const directory = repository();
    const baselineLines = Array.from(
      {length: WHOLESALE_REPLACEMENT_THRESHOLD.minimumDeletedLines + 10},
      (_, index) => `export const value${index} = ${index};`,
    );
    write(directory, 'src/large.ts', `${baselineLines.join('\n')}\n`);
    git(directory, ['add', 'src/large.ts']);
    git(directory, ['commit', '-qm', 'add established source']);
    addValidAstryxChange(directory);
    write(
      directory,
      'src/large.ts',
      `${baselineLines.map(line => line.replaceAll(' ', '')).join('\n')}\n`,
    );
    const digest = attest(directory);

    // A guard that asked Git to ignore whitespace would see nothing at all
    // here, because `-w` equates `a b` with `ab`.
    expect(numstatIgnoringWhitespace(directory, 'src/large.ts').deleted).toBe(0);

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).toContain('wholesale-replacement');
    expect(result.accepted).toBe(false);
  });

  it('does not treat wrapping a stylesheet in a layer as neutralizing it', () => {
    const directory = repository();
    const rules = Array.from(
      {length: WHOLESALE_REPLACEMENT_THRESHOLD.minimumDeletedLines + 4},
      (_, index) => `.host-row-${index} {\n  color: CanvasText;\n}`,
    ).join('\n');
    write(directory, 'src/index.css', `:root {\n  color-scheme: light dark;\n}\n${rules}\n`);
    git(directory, ['add', 'src/index.css']);
    git(directory, ['commit', '-qm', 'establish host stylesheet']);
    addValidAstryxChange(directory);
    write(
      directory,
      'src/index.css',
      `@layer base {\n${`:root {\n  color-scheme: light dark;\n}\n${rules}`
        .split('\n')
        .map(line => (line === '' ? line : `  ${line}`))
        .join('\n')}\n}\n`,
    );
    const digest = attest(directory);

    const raw = numstat(directory, 'src/index.css');
    expect(raw.deleted).toBeGreaterThanOrEqual(
      WHOLESALE_REPLACEMENT_THRESHOLD.minimumDeletedLines,
    );

    const result = analyzeSetupIntegrity(directory, digest);

    expect(kinds(result)).not.toContain('neutralized-host-css');
    expect(kinds(result)).not.toContain('wholesale-replacement');
  });
});
