// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Package mistakes `astryx doctor integration validate` and
 * `astryx integration check` used to pass, crash on, or describe badly: names
 * that differ from file names, ids readers cannot take, duplicate and
 * case-mismatched docs, symlinked or absolute roots, a root that is a file, a
 * package.json missing what npm needs, manifest key typos, docs and manifests
 * with no default export, and theme descriptors named for built output. Each
 * finding carries a `Fix:` that holds when followed.
 *
 * Temp dirs live under the repo root, as in validate-integration.test.mjs.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  validateIntegration,
  validateLocalIntegration,
} from './validate-integration.mjs';
import {
  integrationCheck,
  strictIssues,
  summarizeCheck,
} from './check/check.mjs';

const CLI = fileURLToPath(
  new URL('../../clients/cli/bin/astryx.mjs', import.meta.url),
);

let tmpDir;
let copies = 0;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-validate-gaps-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

const MANIFEST = 'astryx.integration.mjs';
const THEME_TYPE =
  "/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\n";

/** @param {Record<string, unknown>} roots */
const manifest = roots => `export default ${JSON.stringify(roots)};\n`;
/** @param {string} name */
const componentDoc = name =>
  `export default {type: 'component', name: '${name}', displayName: '${name}', usage: {description: '${name}.'}, props: []};\n`;
/** @param {string} name */
const componentSource = name => `export function ${name}() { return null; }\n`;
/** @param {string} name */
const topic = name =>
  `export default ${JSON.stringify({
    type: 'generic',
    name,
    title: name,
    description: `The ${name} topic.`,
    sections: [{title: 'Overview', content: [{type: 'prose', text: name}]}],
  })};\n`;
/** @param {string} name */
const templateDoc = name =>
  `export default {type: 'block', name: '${name}', displayName: '${name}', aspectRatio: 1};\n`;
const templateSource = 'export default function Block() { return null; }\n';

/**
 * @param {Record<string, string>} files package-relative path -> contents
 * @param {Record<string, unknown>} [pkg] package.json
 * @returns {string} the package directory
 */
function writePackage(files, pkg = {name: '@acme/kit', version: '1.0.0'}) {
  const dir = path.join(tmpDir, 'pkg');
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  for (const [file, contents] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
    fs.writeFileSync(path.join(dir, file), contents);
  }
  return dir;
}

/**
 * Carry out a fix on a fresh copy of the package.
 * @param {string} dir
 * @param {{move?: Array<[string, string]>, write?: Record<string, string>, remove?: string[]}} steps
 */
function follow(dir, {move = [], write = {}, remove = []}) {
  copies += 1;
  const copy = path.join(tmpDir, `followed-${copies}`);
  fs.cpSync(dir, copy, {recursive: true, verbatimSymlinks: true});
  for (const file of remove) {
    fs.rmSync(path.join(copy, file), {recursive: true, force: true});
  }
  for (const [from, to] of move) {
    fs.mkdirSync(path.dirname(path.join(copy, to)), {recursive: true});
    fs.renameSync(path.join(copy, from), path.join(copy, to));
  }
  for (const [file, contents] of Object.entries(write)) {
    fs.mkdirSync(path.dirname(path.join(copy, file)), {recursive: true});
    fs.writeFileSync(path.join(copy, file), contents);
  }
  return copy;
}

/** @param {string} dir */
async function issuesOf(dir) {
  return (await validateLocalIntegration(dir)).issues;
}

/**
 * The notes validate lists beside its issues, which count nowhere: the layout
 * findings added after the last minor release, each with its fix.
 * @param {string} dir
 * @returns {Promise<Array<{code: string, message: string}>>}
 */
async function listedOf(dir) {
  return (await validateIntegration(undefined, {cwd: dir})).data.notes ?? [];
}

/**
 * Issues and notes together: what a followed fix must clear.
 * @param {string} dir
 */
async function allOf(dir) {
  return [...(await issuesOf(dir)), ...(await listedOf(dir))];
}

/**
 * The one issue with this code, which the test is about.
 * @param {Array<{code: string, message: string}>} issues
 * @param {string} code
 */
function only(issues, code) {
  const found = issues.filter(issue => issue.code === code);
  expect(found).toHaveLength(1);
  return found[0].message;
}

describe('a name that differs from its file name', () => {
  it('accepts a kebab-case file whose doc names the export it holds', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({components: './components'}),
      'components/acme-widget.doc.mjs': componentDoc('AcmeWidget'),
      'components/acme-widget.tsx': componentSource('AcmeWidget'),
    });

    expect(await issuesOf(dir)).toEqual([]);
  });

  it('leaves a doc topic named differently from its file alone: the code does not contradict it', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({docs: './docs'}),
      'docs/deploying.doc.mjs': topic('deploy'),
    });

    expect(await issuesOf(dir)).toEqual([]);
  });

  it('leaves a template name alone: it is the display title', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({templates: './templates'}),
      'templates/account-card.doc.mjs': templateDoc('Account card'),
      'templates/account-card.tsx': templateSource,
    });

    expect(await issuesOf(dir)).toEqual([]);
  });
});

describe('template ids', () => {
  it('leaves an id with spaces alone: it is naming policy, not a contradiction', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({templates: './templates'}),
      'templates/AI Chat Conversation.doc.mjs': templateDoc(
        'AI Chat Conversation',
      ),
      'templates/AI Chat Conversation.tsx': templateSource,
    });

    expect(await issuesOf(dir)).toEqual([]);
  });
});

describe('component doc files', () => {
  it('lists two docs for one component, naming the one read, without an issue', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({components: './components'}),
      'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
      'components/AcmeWidget.doc.js': componentDoc('AcmeWidget'),
      'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
    });

    expect(await issuesOf(dir)).toEqual([]);
    const message = only(await listedOf(dir), 'duplicate_component_doc');
    expect(message).toBe(
      'Component "AcmeWidget" has 2 docs: AcmeWidget.doc.mjs, AcmeWidget.doc.js. Astryx reads AcmeWidget.doc.mjs and ignores AcmeWidget.doc.js. Fix: delete AcmeWidget.doc.js, moving anything only it says into AcmeWidget.doc.mjs.',
    );

    const fixed = follow(dir, {remove: ['components/AcmeWidget.doc.js']});
    expect(await allOf(fixed)).toEqual([]);
  });

  it('gives one finding for a doc whose name differs from its source only in case', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({components: './components'}),
      'components/Acmewidget.doc.mjs': componentDoc('AcmeWidget'),
      'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
    });

    const issues = await issuesOf(dir);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({
      code: 'invalid_component',
      severity: 'error',
      message:
        'Component doc "Acmewidget.doc.mjs" and its source "AcmeWidget.tsx" differ only in letter case. They pair on a case-insensitive disk (macOS, Windows) but not on Linux, where CI and most installs run, so here the component is missing. Fix: rename Acmewidget.doc.mjs to AcmeWidget.doc.mjs.',
    });

    // Through a temporary name, so a case-insensitive disk renames it too.
    const fixed = follow(dir, {
      move: [
        ['components/Acmewidget.doc.mjs', 'components/tmp.doc.mjs'],
        ['components/tmp.doc.mjs', 'components/AcmeWidget.doc.mjs'],
      ],
    });
    expect(await issuesOf(fixed)).toEqual([]);
  });
});

describe('a hidden doc beside a source whose name differs only in case', () => {
  it('keeps the source warning 0.7.2 gives where the hidden doc does not pair, as on Linux', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({components: './components'}),
      'components/Acmewidget.doc.mjs': componentDoc('AcmeWidget').replace(
        "type: 'component',",
        "type: 'component',\n  hidden: true,",
      ),
      'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
    });

    const issues = await issuesOf(dir);
    expect(issues.map(issue => [issue.code, issue.severity])).toEqual([
      ['source_without_component_doc', 'warning'],
    ]);
    expect(issues[0].message).toMatch(
      /^Component source "AcmeWidget\.tsx" has no same-stem metadata file AcmeWidget\.doc\.mjs, so Astryx ignores it\. Fix: /u,
    );
    expect(await listedOf(dir)).toEqual([]);
  });
});

describe('roots', () => {
  it('lists that npm pack does not follow a symlinked root, and reads its folder through it', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({components: './components'}),
      'real-components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
      'real-components/AcmeWidget.tsx': componentSource('AcmeWidget'),
    });
    fs.symlinkSync('real-components', path.join(dir, 'components'));

    expect(await issuesOf(dir)).toEqual([]);
    const issues = await listedOf(dir);
    expect(issues.map(issue => issue.code)).toEqual(['symlinked_root']);
    expect(issues[0].message).toBe(
      'Declared components root "components" is reached through the symlink "components" (to "real-components"). Astryx follows it locally, but npm pack does not follow a symlinked folder, so the published package ships none of these files. Fix: replace the link with the folder itself (move real-components/ to components/), or set `components: \'./real-components\'` in astryx.integration.mjs.',
    );

    const fixed = follow(dir, {
      remove: ['components'],
      move: [['real-components', 'components']],
    });
    expect(await allOf(fixed)).toEqual([]);
  });

  it('says an absolute root inside the package must be relative', async () => {
    const dir = writePackage({
      'docs/deploying.doc.mjs': topic('deploying'),
    });
    fs.writeFileSync(
      path.join(dir, MANIFEST),
      manifest({docs: path.join(dir, 'docs')}),
    );

    const issues = await issuesOf(dir);
    expect(issues).toEqual([
      {
        code: 'root_outside_package',
        severity: 'error',
        message: `The docs root "${path.join(dir, 'docs')}" is an absolute path, so Astryx reads nothing from it: a root is relative to the package, so it resolves the same wherever the package is installed. Fix: set \`docs: './docs'\` in astryx.integration.mjs.`,
      },
    ]);
    expect(issues[0].message).not.toContain('outside');

    const fixed = follow(dir, {
      write: {[MANIFEST]: manifest({docs: './docs'})},
    });
    expect(await issuesOf(fixed)).toEqual([]);
  });

  it('reports a root that is a file from every check, without crashing', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({
        components: './components/AcmeWidget.tsx',
        templates: './templates/account-card.tsx',
        docs: './docs/deploying.doc.mjs',
      }),
      'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
      'templates/account-card.tsx': templateSource,
      'docs/deploying.doc.mjs': topic('deploying'),
    });

    const result = await integrationCheck({cwd: dir});
    expect(result.data.checks.map(check => check.check)).toEqual([
      'validate',
      'components',
      'templates',
      'docs',
    ]);
    for (const check of result.data.checks) {
      const codes = check.response.data.issues
        .filter(issue => issue.severity === 'error')
        .map(issue => issue.code);
      expect(codes).toEqual(['invalid_root', 'invalid_root', 'invalid_root']);
    }
  });
});

describe('package.json', () => {
  it('lists a missing name and keeps checking, without crashing any check', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({components: './components', docs: './docs'}),
        'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
        'docs/deploying.doc.mjs': topic('deploying'),
      },
      {version: '1.0.0'},
    );

    const result = await integrationCheck({cwd: dir});
    for (const check of result.data.checks) {
      expect(
        check.response.data.issues.map(issue => [issue.code, issue.severity]),
      ).toEqual([['invalid_component', 'error']]);
    }
    const validate = result.data.checks[0].response.data;
    expect('notes' in validate ? validate.notes : undefined).toEqual([
      {
        code: 'invalid_package_json',
        message:
          'package.json has no "name", so npm cannot pack or publish the package, and a project that installs it has no name to select it by. Fix: add "name": "@your-scope/your-package" to package.json.',
      },
    ]);
    expect(result.data.failed).toBe(true);
  });

  it('still compares documented props for a package without a name', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({components: './components'}),
        'components/AcmeWidget.doc.mjs':
          "export default {type: 'component', name: 'AcmeWidget', displayName: 'AcmeWidget', usage: {description: 'A widget.'}, props: [{name: 'label', type: 'string', description: 'Text.'}]};\n",
        'components/AcmeWidget.tsx':
          'export function AcmeWidget(props: {title: string}) { return null; }\n',
      },
      {version: '1.0.0'},
    );

    const result = await integrationCheck({cwd: dir, strict: true});
    const components = result.data.checks.find(
      check => check.check === 'components',
    );
    const propDrift = /** @type {any} */ (components?.response.data)?.propDrift;
    expect(propDrift).toBeDefined();
    const failures = result.data.failures.map(failure => failure.code);
    expect(failures).not.toContain('invalid_package_json');
    if (propDrift.status === 'skipped') {
      // No TypeScript here: --strict names the skipped comparison.
      expect(failures).toContain('prop_drift_skipped');
    } else {
      expect(propDrift.findings.map((/** @type {any} */ f) => f.kind)).toEqual(
        expect.arrayContaining(['not_in_code', 'not_in_doc']),
      );
    }
  });

  it('completes --strict for a package without a name whose component docs hold links, reporting none', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({components: './components'}),
        'components/AcmeWidget.doc.mjs':
          "export default {type: 'component', name: 'AcmeWidget', displayName: 'AcmeWidget', usage: {description: 'Read {@link generic:x} first.'}, props: []};\n",
        'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
      },
      {version: '1.0.0'},
    );

    const result = await integrationCheck({cwd: dir, strict: true});
    const components = result.data.checks.find(
      check => check.check === 'components',
    );
    expect(components?.response.data.issues.map(issue => issue.code)).toEqual(
      [],
    );
    expect(
      result.data.failures.filter(
        failure => failure.code === 'invalid_doc_graph',
      ),
    ).toEqual([]);
  });

  it('checks the docs of a package without a name, naming them by path', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({docs: './docs'}),
        'docs/deploying.doc.mjs': topic('deploying').replace(
          '"text":"deploying"',
          '"text":"See {@link generic:no-such-topic}."',
        ),
      },
      {version: '1.0.0'},
    );

    const result = await integrationCheck({cwd: dir});
    const docs = result.data.checks.find(check => check.check === 'docs');
    const messages =
      docs?.response.data.issues.map(issue => issue.message) ?? [];
    expect(messages.join('\n')).not.toContain('astryx-unnamed-local-package');
    expect(docs?.response.data.issues.map(issue => issue.code)).toEqual([
      'invalid_doc_graph',
    ]);
    expect(messages[0]).toMatch(
      /^deploying § overview: "generic:no-such-topic" names no doc\./u,
    );
  });

  it.each([
    ['acme kit'],
    ['_acme'],
    ['acme/kit'],
    ['-acme'],
    ['@acme/-kit'],
    ['~acme'],
  ])(
    'lists that no provider ID can be derived from the name %s, and keeps checking',
    async name => {
      const dir = writePackage(
        {
          [MANIFEST]: manifest({components: './components'}),
          'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
        },
        {name, version: '1.0.0'},
      );

      expect(
        (await issuesOf(dir)).map(issue => [issue.code, issue.severity]),
      ).toEqual([['invalid_component', 'error']]);
      const issues = await listedOf(dir);
      expect(issues.map(issue => issue.code)).toEqual(['no_provider_id']);
      expect(issues[0].message).toBe(
        `No provider ID can be derived for this package: package.json "name" ${JSON.stringify(name)} is not a bare package name (an optional @scope/ and a name, each starting with a lowercase letter or digit and holding only lowercase letters, digits, "-", ".", "_" and "~"), and astryx.integration.mjs declares no providerId that is one. Astryx files the package's components, templates and docs under that ID, so links to them and selecting the package cannot work. Fix: rename the package, such as "@your-scope/your-package", or set \`providerId: '@your-scope/your-package'\` in astryx.integration.mjs.`,
      );
      expect(issues[0].message).not.toContain('npm cannot pack');
      const result = await integrationCheck({cwd: dir});
      expect(result.data.checks.every(check => check.response.type)).toBe(true);
    },
  );

  it('leaves the provider ID to invalid_manifest when the manifest does not load', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({providerId: '@acme/kit', issuesUrl: 42}),
      },
      {name: '-acme', version: '1.0.0'},
    );

    const issues = await issuesOf(dir);
    expect(issues.map(issue => issue.code)).toEqual(['invalid_manifest']);
    expect(await listedOf(dir)).toEqual([]);
  });

  it('derives the provider ID from the manifest when the name cannot give one', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({
          providerId: '@acme/kit',
          components: './components',
        }),
        'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
        'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
      },
      {name: '@acme/_kit', version: '1.0.0'},
    );

    expect(await issuesOf(dir)).toEqual([]);
    expect((await integrationCheck({cwd: dir, strict: true})).data.failed).toBe(
      false,
    );
  });

  it('checks a package without a name whose root is a file, without crashing', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({
          templates: './templates/account-card.tsx',
          docs: './docs/deploying.doc.mjs',
        }),
        'templates/account-card.tsx': templateSource,
        'docs/deploying.doc.mjs': topic('deploying'),
      },
      {version: '1.0.0'},
    );

    const result = await integrationCheck({cwd: dir});
    for (const check of result.data.checks) {
      expect(
        check.response.data.issues
          .filter(issue => issue.severity === 'error')
          .map(issue => issue.code),
      ).toEqual(['invalid_root', 'invalid_root']);
    }
  });

  it('checks links under the manifest providerId when the name gives none', async () => {
    const linked = (/** @type {string} */ name, /** @type {string} */ text) =>
      `export default ${JSON.stringify({
        type: 'generic',
        name,
        title: name,
        description: `The ${name} topic.`,
        sections: [{title: 'Overview', content: [{type: 'prose', text}]}],
      })};\n`;
    const dir = writePackage(
      {
        [MANIFEST]: manifest({
          providerId: '@acme/kit',
          components: './components',
          docs: './docs',
        }),
        'components/AcmeWidget.doc.mjs':
          "export default {type: 'component', name: 'AcmeWidget', displayName: 'AcmeWidget', usage: {description: 'Read {@link generic:no-such-topic}.'}, props: []};\n",
        'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
        'docs/deploying.doc.mjs': linked(
          'deploying',
          'See {@link @acme/kit:generic:other}.',
        ),
        'docs/other.doc.mjs': linked('other', 'The other topic.'),
      },
      {name: '@acme/_kit', version: '1.0.0'},
    );

    const result = await integrationCheck({cwd: dir});
    const issuesOf = (/** @type {string} */ name) =>
      result.data.checks.find(check => check.check === name)?.response.data
        .issues ?? [];
    const componentLinks = issuesOf('components').filter(
      issue => issue.code === 'invalid_doc_graph',
    );
    expect(componentLinks).toHaveLength(1);
    expect(componentLinks[0].message).toContain('no-such-topic');
    expect(
      issuesOf('docs').filter(issue => issue.code === 'invalid_doc_graph'),
    ).toEqual([]);
  });

  it('fails neither run on a missing name when nothing else is wrong: it is listed until the next minor', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({docs: './docs'}),
        'docs/deploying.doc.mjs': topic('deploying'),
      },
      {version: '1.0.0'},
    );

    expect((await integrationCheck({cwd: dir})).data.failed).toBe(false);
    expect((await integrationCheck({cwd: dir, strict: true})).data.failed).toBe(
      false,
    );
  });

  it('lists a missing version and still checks the rest', async () => {
    const dir = writePackage(
      {
        [MANIFEST]: manifest({components: './components'}),
        'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
      },
      {name: '@acme/kit'},
    );

    expect(
      (await issuesOf(dir)).map(issue => [issue.code, issue.severity]),
    ).toEqual([['invalid_component', 'error']]);
    const issues = await listedOf(dir);
    expect(issues.map(issue => issue.code)).toEqual(['invalid_package_json']);
    expect(issues[0].message).toBe(
      'package.json has no "version", so npm cannot pack or publish the package. Fix: add "version": "0.1.0" to package.json.',
    );
  });

  it('asks no version of a private package', async () => {
    const dir = writePackage(
      {[MANIFEST]: manifest({docs: './docs'}), 'docs/a.doc.mjs': topic('a')},
      {name: '@acme/kit', private: true},
    );

    expect(await allOf(dir)).toEqual([]);
  });
});

describe('unreadable files and theme names', () => {
  const asRoot = process.getuid?.() === 0;

  it.skipIf(asRoot)(
    'reports a contribution file it cannot read, which npm pack would fail on',
    async () => {
      const dir = writePackage({
        [MANIFEST]: manifest({components: './components'}),
        'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
        'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
      });
      const file = path.join(dir, 'components', 'AcmeWidget.tsx');
      fs.chmodSync(file, 0);
      try {
        expect(await issuesOf(dir)).toEqual([]);
        const message = only(await listedOf(dir), 'unreadable_file');
        expect(message).toBe(
          'Could not read "components/AcmeWidget.tsx" (EACCES), so Astryx cannot check it and npm pack fails on it. Fix: make it readable (chmod a+r components/AcmeWidget.tsx), or delete it if it does not belong in the package.',
        );
      } finally {
        fs.chmodSync(file, 0o644);
      }
      expect(await allOf(dir)).toEqual([]);
    },
  );

  it.skipIf(asRoot)(
    'ignores an unreadable file no reader and no pack reads, such as .DS_Store',
    async () => {
      const dir = writePackage({
        [MANIFEST]: manifest({components: './components'}),
        'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
        'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
        'components/.DS_Store': 'x',
        'components/notes.txt': 'x',
      });
      const files = ['.DS_Store', 'notes.txt'].map(name =>
        path.join(dir, 'components', name),
      );
      for (const file of files) fs.chmodSync(file, 0);
      try {
        expect(await allOf(dir)).toEqual([]);
      } finally {
        for (const file of files) fs.chmodSync(file, 0o644);
      }
    },
  );

  const themeDoc = `${THEME_TYPE}export default {type: 'theme', name: 'ocean', displayName: 'Ocean', description: 'A theme.', maintained: true};\n`;
  /** @param {string} name */
  const themeSource = name =>
    `import {defineTheme} from '@astryxdesign/core/theme';\nexport const oceanTheme = defineTheme({\n  name: '${name}',\n});\n`;

  it('accepts a theme that names itself differently from its folder', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({themes: './themes'}),
      'themes/ocean/oceanTheme.doc.mjs': themeDoc,
      'themes/ocean/oceanTheme.ts': themeSource('deep-sea'),
    });

    expect(
      (await issuesOf(dir)).filter(issue => issue.code === 'invalid_theme'),
    ).toEqual([]);
  });

  it('leaves a theme name it can only know by building alone', async () => {
    const dir = writePackage({
      [MANIFEST]: manifest({themes: './themes'}),
      'themes/ocean/oceanTheme.doc.mjs': themeDoc,
      'themes/ocean/oceanTheme.ts':
        "import {defineTheme} from '@astryxdesign/core/theme';\nconst name = 'sea';\nexport const oceanTheme = defineTheme({name});\n",
    });

    expect(
      (await issuesOf(dir)).filter(issue => issue.code === 'invalid_theme'),
    ).toEqual([]);
  });
});

describe('layout findings 0.7.2 did not fail on', () => {
  it('never fails --strict on a note: notes count nowhere', () => {
    /** @type {any} */
    const response = {
      type: 'integration.validate',
      data: {
        validated: true,
        name: '@acme/kit',
        version: '1.0.0',
        issues: [],
        notes: [
          {code: 'duplicate_component_doc', message: 'Two docs. Fix: one.'},
        ],
      },
    };
    expect(strictIssues('validate', response)).toEqual({
      warnings: [],
      skipped: [],
    });
    expect(summarizeCheck(response)).toEqual({
      errors: 0,
      warnings: 0,
      skipped: [],
      failed: false,
    });
  });

  const asRoot = process.getuid?.() === 0;

  /** @type {Array<[string, () => string]>} */
  const layouts = [
    [
      'two docs for one component',
      () =>
        writePackage({
          [MANIFEST]: manifest({components: './components'}),
          'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
          'components/AcmeWidget.doc.js': componentDoc('AcmeWidget'),
          'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
        }),
    ],
    [
      'a root reached through a symlink',
      () => {
        const dir = writePackage({
          [MANIFEST]: manifest({components: './components'}),
          'real-components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
          'real-components/AcmeWidget.tsx': componentSource('AcmeWidget'),
        });
        fs.symlinkSync('real-components', path.join(dir, 'components'));
        return dir;
      },
    ],
    [
      'a package.json without a version',
      () =>
        writePackage(
          {
            [MANIFEST]: manifest({docs: './docs'}),
            'docs/a.doc.mjs': topic('a'),
          },
          {name: '@acme/kit'},
        ),
    ],
    [
      'a package.json without a name',
      () =>
        writePackage(
          {
            [MANIFEST]: manifest({docs: './docs'}),
            'docs/a.doc.mjs': topic('a'),
          },
          {version: '1.0.0'},
        ),
    ],
    ...(asRoot
      ? []
      : /** @type {Array<[string, () => string]>} */ ([
          [
            'a contribution file it cannot read',
            () => {
              const dir = writePackage({
                [MANIFEST]: manifest({components: './components'}),
                'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
                'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
              });
              fs.chmodSync(path.join(dir, 'components', 'AcmeWidget.tsx'), 0);
              return dir;
            },
          ],
        ])),
  ];

  it.each(layouts)(
    'lists %s as a note and passes integration check --strict',
    async (_label, make) => {
      const dir = make();
      try {
        const result = await integrationCheck({cwd: dir, strict: true});
        expect(result.data.failures).toEqual([]);
        expect(result.data.failed).toBe(false);
        const validate = /** @type {any} */ (
          result.data.checks[0].response.data
        );
        expect(validate.notes.length).toBeGreaterThan(0);
        for (const note of validate.notes) {
          expect(Object.keys(note).sort()).toEqual(['code', 'message']);
          expect(note.message).toContain('Fix: ');
        }
      } finally {
        const file = path.join(dir, 'components', 'AcmeWidget.tsx');
        if (fs.existsSync(file)) fs.chmodSync(file, 0o644);
      }
    },
  );

  it('prints the notes and counts none of them', () => {
    const dir = writePackage({
      [MANIFEST]: manifest({components: './components'}),
      'components/AcmeWidget.doc.mjs': componentDoc('AcmeWidget'),
      'components/AcmeWidget.doc.js': componentDoc('AcmeWidget'),
      'components/AcmeWidget.tsx': componentSource('AcmeWidget'),
    });

    const run = spawnSync(
      process.execPath,
      [CLI, 'doctor', 'integration', 'validate'],
      {cwd: dir, encoding: 'utf-8', timeout: 60_000},
    );
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain(
      'note (duplicate_component_doc): Component "AcmeWidget" has 2 docs:',
    );
    expect(run.stdout).toContain('Summary: 0 errors, 0 warnings');
  });
});
