// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the `doctor` leaf (api/doctor/doctor.mjs). `doctor`
 * had no api-level tests; this locks the envelope shape and the summary
 * invariant (the counts must always add up to the number of checks).
 */

import {describe, it, expect, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DocsCatalog} from '../../foundation/discovery/docs-discovery.mjs';
import {
  AUTHORING_ROOT,
  AUTHORING_SELF_DOCS,
  auditAuthoringSelfDocs,
} from '../../foundation/discovery/authoring-self-docs.mjs';
import {docs} from '../docs/docs.mjs';
import {auditCliSelfDocs} from '../../foundation/discovery/cli-self-docs.mjs';
import {
  doctor,
  checkAuthoringDocs,
  checkCliDocs,
  checkDocsTree,
  checkDocsProgressiveDisclosure,
  checkImplicitIntegrations,
  checkProviderIdentity,
  checkIntegrationIssues,
  checkVersionAlignment,
  checkPackageManager,
} from './doctor.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

/** Throwaway project dirs, cleaned up after each test. */
const tmpDirs = [];
function mkProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doctor-'));
  tmpDirs.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), {recursive: true});
    fs.writeFileSync(abs, content);
  }
  return dir;
}
afterEach(() => {
  while (tmpDirs.length) {
    fs.rmSync(tmpDirs.pop(), {recursive: true, force: true});
  }
});

describe('doctor leaf', () => {
  it('returns a `doctor` envelope with checks + summary', async () => {
    const r = await doctor({cwd});
    expect(r.type).toBe('doctor');
    expect(Array.isArray(r.data.checks)).toBe(true);
    expect(r.data.checks.length).toBeGreaterThan(0);
    expect(r.data.summary).toBeDefined();
  }, SLOW);

  it('every check has an id, label, and a valid status', async () => {
    const r = await doctor({cwd});
    for (const c of r.data.checks) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.label).toBe('string');
      expect(['pass', 'warn', 'fail', 'info']).toContain(c.status);
    }
  }, SLOW);

  it('summary counts sum to the number of checks (invariant)', async () => {
    const r = await doctor({cwd});
    const {pass, warn, fail, info} = r.data.summary;
    expect(pass + warn + fail + info).toBe(r.data.checks.length);
  }, SLOW);

  it('reports the core node-version and core-installed checks', async () => {
    const r = await doctor({cwd});
    const ids = r.data.checks.map(c => c.id);
    expect(ids).toContain('node-version');
    expect(ids).toContain('core-installed');
  }, SLOW);
});

describe('integration issue check', () => {
  it('surfaces cross-package replacement warnings', () => {
    const check = checkIntegrationIssues({
      integrationIssues: [
        {
          package: '@acme/later',
          code: 'ambiguous_template_replacement',
          severity: 'warning',
          message: 'Later configured replacement wins.',
        },
      ],
    });

    expect(check).toMatchObject({
      id: 'integration-issues',
      status: 'warn',
      message: expect.stringContaining('Later configured replacement wins.'),
    });
  });
});

describe('doctor leaf — degradation & error paths', () => {
  it('does not crash on multiple config files; reports a config FAIL', async () => {
    const dir = mkProject({
      'package.json': '{"name":"x"}',
      'astryx.config.mjs': 'export default {};',
      'astryx.config.js': 'export default {};',
    });
    const r = await doctor({cwd: dir});
    const config = r.data.checks.find(c => c.id === 'config');
    expect(config).toBeDefined();
    expect(config.status).toBe('fail');
    expect(config.message).toMatch(/multiple|exactly one/i);
  }, SLOW);

  it('reports a config FAIL (not a crash) when astryx.config.mjs throws on import', async () => {
    const dir = mkProject({
      'package.json': '{"name":"x"}',
      'astryx.config.mjs': 'throw new Error("boom");\nexport default {};',
    });
    const r = await doctor({cwd: dir});
    const config = r.data.checks.find(c => c.id === 'config');
    expect(config.status).toBe('fail');
    expect(config.message).toMatch(/failed to load/i);
  }, SLOW);

  it('flags a non-object config default export as FAIL', async () => {
    const dir = mkProject({
      'package.json': '{"name":"x"}',
      'astryx.config.mjs': 'export default 42;',
    });
    const r = await doctor({cwd: dir});
    const config = r.data.checks.find(c => c.id === 'config');
    expect(config.status).toBe('fail');
    expect(config.message).toMatch(/not an object/i);
  }, SLOW);

  it('degrades gracefully on invalid package.json', async () => {
    const dir = mkProject({'package.json': '{ not json }'});
    const r = await doctor({cwd: dir});
    const {pass, warn, fail, info} = r.data.summary;
    expect(pass + warn + fail + info).toBe(r.data.checks.length);
  }, SLOW);
});

describe('doctor — checkVersionAlignment', () => {
  it('skips (info) when the core version is not comparable semver', () => {
    const dir = mkProject({
      'node_modules/@astryxdesign/core/package.json': JSON.stringify({
        name: '@astryxdesign/core',
        version: 'workspace:*',
      }),
    });
    const c = checkVersionAlignment({
      cwd: dir,
      coreDir: path.join(dir, 'node_modules/@astryxdesign/core'),
      nodeVersion: '',
      configPath: null,
      configTheme: null,
    });
    expect(c.status).toBe('info');
    expect(c.fix ?? '').not.toMatch(/NaN|undefined/);
  });

  it('does not leak NaN/undefined for a comparable semver core version', () => {
    const dir = mkProject({
      'node_modules/@astryxdesign/core/package.json': JSON.stringify({
        name: '@astryxdesign/core',
        version: '0.0.1',
      }),
    });
    const c = checkVersionAlignment({
      cwd: dir,
      coreDir: path.join(dir, 'node_modules/@astryxdesign/core'),
      nodeVersion: '',
      configPath: null,
      configTheme: null,
    });
    expect(['pass', 'warn']).toContain(c.status);
    expect(c.message).not.toMatch(/NaN|undefined/);
    if (c.fix) expect(c.fix).not.toMatch(/NaN|undefined/);
  });
});

describe('checkPackageManager', () => {
  it('is informational when one lockfile answers', () => {
    const dir = mkProject({'pnpm-lock.yaml': ''});
    const c = checkPackageManager({cwd: dir});
    expect(c).toMatchObject({id: 'package-manager', status: 'info'});
    expect(c.message).toContain('pnpm');
  });

  it('fails when several lockfiles tie and nothing project-owned breaks it', () => {
    // Without this the CLI answers from array order, and every command it
    // prints — including the agent-docs invocation line — names a package
    // manager the project may not use at all. Silence is the bug; say it.
    const dir = mkProject({'pnpm-lock.yaml': '', 'yarn.lock': ''});
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('fail');
    expect(c.message).toContain('yarn');
    expect(c.message).toContain('pnpm');
    expect(c.fix).toContain('packageManager');
  });

  it('is informational when the declaration and the lockfile agree', () => {
    const dir = mkProject({
      'pnpm-lock.yaml': '',
      'package.json': JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    });
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('info');
    expect(c.message).toContain('pnpm');
    expect(c.fix).toBeUndefined();
  });

  it('warns when a lockfile contradicts the declared packageManager', () => {
    // The regression: a stray yarn.lock used to OUTRANK the declaration, and
    // doctor then reported the project as healthy while every command the CLI
    // printed named the wrong package manager. The declaration now decides, and
    // the contradiction is reported instead of hidden.
    const dir = mkProject({
      'yarn.lock': '',
      'package.json': JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    });
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('warn');
    expect(c.message).toContain('yarn.lock');
    expect(c.message).toContain('pnpm');
    expect(c.fix).toContain('yarn.lock');
  });

  it('still warns when the declaration resolved a multi-lockfile tie', () => {
    const dir = mkProject({
      'pnpm-lock.yaml': '',
      'yarn.lock': '',
      'package.json': JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    });
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('warn');
    expect(c.message).toContain('yarn.lock');
  });
});

describe('checkProviderIdentity', () => {
  /** @param {object} [fields] */
  const loaded = (fields = {}) => ({
    name: '@acme/widgets',
    providerId: '@acme/widgets',
    version: '1.0.0',
    __spec: '@acme/widgets',
    __packageDir: '/abs/node_modules/@acme/widgets',
    __manifestFile: '/abs/node_modules/@acme/widgets/astryx.integration.mjs',
    ...fields,
  });

  it('skips when the project could not be read', () => {
    expect(checkProviderIdentity({integrations: null}).status).toBe('info');
  });

  it('reports none when nothing is loaded', () => {
    const c = checkProviderIdentity({integrations: []});
    expect(c.status).toBe('info');
    expect(c.message).toContain('None');
  });

  it('passes when each loaded integration has its own provider ID', () => {
    const c = checkProviderIdentity({
      integrations: [
        loaded(),
        loaded({
          name: '@acme/charts',
          providerId: '@acme/charts',
          __spec: '@acme/charts',
        }),
      ],
    });
    expect(c.status).toBe('pass');
    expect(c.message).toContain('2 loaded integrations');
  });

  it('warns and names both packages when a later claimant is set aside', () => {
    const message =
      '@acme/renamed@2.0.0 and @acme/widgets@1.0.0 both claim provider ID ' +
      '"@acme/widgets". @acme/widgets@1.0.0 loads first and is used; ' +
      '@acme/renamed@2.0.0 contributes nothing until one package changes ' +
      'its providerId.';
    const c = checkProviderIdentity({
      integrations: [
        loaded(),
        loaded({
          name: '@acme/renamed',
          version: '2.0.0',
          __spec: '@acme/renamed',
          __providerConflict: {
            providerId: '@acme/widgets',
            claimedBy: '@acme/widgets',
            message,
          },
        }),
      ],
    });
    expect(c.status).toBe('warn');
    expect(c.message).toBe(message);
    expect(c.fix).toContain('providerId');
  });

  it('is part of the report doctor returns', async () => {
    const r = await doctor({cwd});
    expect(r.data.checks.map(check => check.id)).toContain(
      'provider-identity',
    );
  }, SLOW);
});

describe('checkImplicitIntegrations', () => {
  /** @param {object} [fields] */
  const autolinked = (fields = {}) => ({
    name: '@acme/widgets',
    version: '1.0.0',
    components: '/abs/components',
    __spec: '@acme/widgets',
    __autolinked: true,
    __dependencyField: 'dependencies',
    ...fields,
  });

  it('skips when the project could not be read', () => {
    const c = checkImplicitIntegrations({integrations: null});
    expect(c.status).toBe('info');
    expect(c.message).toContain('Skipped');
  });

  it('reports none when nothing is installed', () => {
    const c = checkImplicitIntegrations({integrations: []});
    expect(c.status).toBe('info');
    expect(c.message).toContain('no installed dependency');
    expect(c.fix).toBeUndefined();
  });

  it('reports none when every loaded integration is configured', () => {
    const c = checkImplicitIntegrations({
      integrations: [autolinked({__autolinked: false})],
    });
    expect(c.status).toBe('info');
    expect(c.message).toContain('named in astryx.config');
  });

  it('names the package, the field, and what it contributes', () => {
    // Roots count only when they exist, so this one gives them real folders.
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-implicit-'));
    try {
      const dir = name => {
        fs.mkdirSync(path.join(root, name));
        return path.join(root, name);
      };
      const c = checkImplicitIntegrations({
        integrations: [
          autolinked({
            components: dir('components'),
            templates: dir('templates'),
            themes: dir('themes'),
          }),
        ],
      });
      expect(c.message).toContain('@acme/widgets@1.0.0');
      expect(c.message).toContain('from dependencies');
      expect(c.message).toContain(
        'contributing components, templates, themes',
      );
      expect(c.message).not.toContain('missing on disk');
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });

  it('names the declared key too when an npm alias makes them differ', () => {
    const c = checkImplicitIntegrations({
      integrations: [
        autolinked({
          name: '@acme/ui',
          version: '0.1.22',
          __spec: '@acme/legacy-ui',
        }),
      ],
    });
    expect(c.message).toContain('@acme/ui@0.1.22');
    expect(c.message).toContain('declared as "@acme/legacy-ui"');
  });

  it('marks the dependency load-bearing for an unused-dependency check', () => {
    const c = checkImplicitIntegrations({integrations: [autolinked()]});
    expect(c.fix).toContain('unused-dependency check');
    expect(c.fix).toContain('astryx.config');
  });

  it('is always informational, so the CI gate stays green', () => {
    for (const integrations of [
      null,
      [],
      [autolinked()],
      [autolinked({components: undefined})],
      [autolinked({__autolinked: false})],
    ]) {
      expect(checkImplicitIntegrations({integrations}).status).toBe('info');
    }
  });

  it('is part of the report doctor returns', async () => {
    const r = await doctor({cwd});
    expect(r.data.checks.map(c => c.id)).toContain('implicit-integrations');
  }, SLOW);
});

describe('checkDocsProgressiveDisclosure', () => {
  it('passes when every topic index and section fits one read', async () => {
    const c = await checkDocsProgressiveDisclosure({
      docsCatalog: DocsCatalog.fromBuiltins(),
      docsCatalogIssues: [],
    });
    expect(c).toMatchObject({id: 'docs-progressive-disclosure', status: 'pass'});
    expect(c.message).toMatch(/^\d+ topics: /);
  }, SLOW);

  it('warns on an invalid doc an integration contributed', async () => {
    const c = await checkDocsProgressiveDisclosure({
      docsCatalogIssues: [
        {
          package: '@acme/widgets',
          code: 'invalid_doc',
          severity: 'error',
          message: 'bad.doc.mjs exports no doc',
        },
      ],
    });
    expect(c.status).toBe('warn');
    expect(c.message).toBe('@acme/widgets: bad.doc.mjs exports no doc');
  });

  it('warns when the docs catalog cannot be built', async () => {
    const c = await checkDocsProgressiveDisclosure({docsCatalogError: 'boom'});
    expect(c.status).toBe('warn');
    expect(c.message).toContain('boom');
  });

  it('names a section over the budget and a topic that fails to load', async () => {
    const dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doctor-docs-'));
    tmpDirs.push(dir);
    const huge = {
      name: 'huge',
      title: 'Huge',
      description: 'Too big for one read.',
      sections: [
        {title: 'Small', content: [{type: 'prose', text: 'Fits.'}]},
        {title: 'Everything', content: [{type: 'prose', text: 'x'.repeat(40 * 1024)}]},
      ],
    };
    fs.writeFileSync(
      path.join(dir, 'huge.doc.mjs'),
      `export const docs = ${JSON.stringify(huge)};\n`,
    );
    fs.writeFileSync(path.join(dir, 'broken.doc.mjs'), 'export const docs = {;\n');
    const c = await checkDocsProgressiveDisclosure({
      docsCatalog: DocsCatalog.fromBuiltins({
        huge: path.join(dir, 'huge.doc.mjs'),
        broken: path.join(dir, 'broken.doc.mjs'),
      }),
      docsCatalogIssues: [],
    });
    expect(c.status).toBe('warn');
    expect(c.message).toMatch(/^2 problems: /);
    expect(c.message).toContain('huge everything: 41 KB, over the 32 KB one read may return');
    expect(c.message).toContain('broken: ');
    expect(c.message).not.toContain('huge small');
  });
});

describe('checkAuthoringDocs', () => {
  it('passes when every authoring self-doc is reachable and fits one read', async () => {
    const c = await checkAuthoringDocs();
    expect(c).toMatchObject({id: 'authoring-docs', status: 'pass'});
    expect(c.message).toContain('astryx docs authoring');
  }, SLOW);
});

describe('checkCliDocs', () => {
  const CLI_DOCS_FIX =
    'Set `namespace` on each CLI doc to the one that reads it: cli/commands for a command, cli/api for an API function or the output schema, error codes, and response types, and authoring for a file an author writes (and list it in AUTHORING_SELF_DOCS).';

  /** A doc tree under the working directory, as the CLI root. */
  function writeRoot(/** @type {Record<string, any>} */ docsByPath) {
    const root = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doctor-cli-docs-'));
    tmpDirs.push(root);
    for (const [rel, doc] of Object.entries(docsByPath)) {
      const file = path.join(root, rel);
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(file, `export const doc = ${JSON.stringify(doc)};\n`);
    }
    return root;
  }

  it(
    'passes on this repo, counting where each CLI doc is read',
    async () => {
      const audit = await auditCliSelfDocs();
      expect(await checkCliDocs()).toEqual({
        id: 'cli-docs',
        label: 'CLI docs',
        status: 'pass',
        message: `All ${audit.docs} CLI docs are readable: ${audit.tree} in the \`astryx docs cli\` tree and ${audit.authoring} in \`astryx docs authoring\`.`,
      });
    },
    SLOW,
  );

  it(
    'fails on a doc with no namespace and one no topic reads, and names the fix',
    async () => {
      const root = writeRoot({
        'api/alpha/alpha.doc.mjs': {
          type: 'function',
          kind: 'api',
          name: 'alpha',
          displayName: 'alpha()',
          summary: 'The alpha function.',
          params: [],
          returns: [{type: 'alpha', description: 'The alpha.'}],
        },
        'clients/cli/commands/beta.doc.mjs': {
          type: 'command',
          name: 'beta',
          displayName: 'astryx beta',
          namespace: 'cli',
          summary: 'Do beta',
        },
      });
      expect(
        await checkCliDocs(undefined, {root, authoringSources: []}),
      ).toEqual({
        id: 'cli-docs',
        label: 'CLI docs',
        status: 'fail',
        message:
          '2 problems: api/alpha/alpha.doc.mjs has no namespace, so no `astryx docs` topic reads it; clients/cli/commands/beta.doc.mjs has namespace "cli", which no `astryx docs` topic reads',
        fix: CLI_DOCS_FIX,
      });
    },
    SLOW,
  );
});

describe('checkDocsTree', () => {
  it(
    'passes on this repo: every CLI doc in a cli group has one route',
    async () => {
      const {loadDocsTree} = await import(
        '../../foundation/doc-compiler/tree.mjs'
      );
      const tree = await loadDocsTree({fresh: true});
      const nodes = [...tree.nodes.values()];
      const namespaces = nodes.filter(node => node.kind === 'namespace').length;
      expect(await checkDocsTree()).toEqual({
        id: 'docs-tree',
        label: 'Docs tree',
        status: 'pass',
        message: expect.stringMatching(
          /^The docs tree has \d+ docs in \d+ sections \(\d+ at the top\), each at one route\.$/,
        ),
      });
    },
    SLOW,
  );

  it('fails on a tree with a broken placement, and names the fix', async () => {
    const {buildDocsTree} = await import(
      '../../foundation/doc-compiler/tree.mjs'
    );
    const tree = buildDocsTree({
      namespaces: [
        {
          provider: '@acme/kit',
          providerId: '@acme/kit',
          source: '@acme/kit/tree/guides.doc.mjs',
          doc: {
            type: 'namespace',
            name: 'guides',
            title: 'Guides',
            summary: 'Every guide.',
            slots: {all: {title: 'All', accepts: {kinds: ['generic']}}},
          },
        },
      ],
      docs: [
        {
          provider: '@acme/kit',
          providerId: '@acme/kit',
          source: '@acme/kit/tree/setup.doc.mjs',
          kind: 'generic',
          name: 'setup',
          title: 'Setup',
          summary: 'Set it up.',
          group: null,
          placement: {parent: 'namespace:guidez'},
        },
      ],
    });
    const c = await checkDocsTree(undefined, {tree});
    // New findings warn (0.6 compatibility): a broken tree is named, not fatal.
    expect(c).toMatchObject({id: 'docs-tree', status: 'warn'});
    expect(c.message).toContain(
      '@acme/kit/tree/setup.doc.mjs: placement.parent "namespace:guidez" names no namespace; @acme/kit declares "guides".',
    );
    expect(c.fix).toMatch(/a placement names a namespace of its own package/);
  });
});

describe('checkAuthoringDocs against the public authoring surface', () => {
  const NAMESPACE = 'doctypes/namespace/namespace.doc.mjs';
  const NAMESPACE_TYPES =
    'NamespaceDoc, NamespaceProviderScope, NamespaceSlotAcceptance, NamespaceSlot, NamespaceAdoptionSource, NamespaceAdoptionRule from doctypes/namespace/type.ts have no doc in `astryx docs authoring`';
  const SURFACE_FIX =
    'Put a self-doc beside each module whose types @astryxdesign/cli/authoring exports and list it in AUTHORING_SELF_DOCS; export what each listed self-doc documents, or remove that self-doc.';

  /** A copy of this repo's authoring tree, to break one piece of at a time. */
  function copyAuthoring() {
    const root = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-doctor-authoring-'),
    );
    tmpDirs.push(root);
    fs.cpSync(AUTHORING_ROOT, root, {
      recursive: true,
      filter: src => !src.endsWith('.test.mjs'),
    });
    return root;
  }

  /** @param {string} source */
  const without = source => AUTHORING_SELF_DOCS.filter(s => s !== source);

  /** @param {string} text */
  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  it(
    'passes on this repo and prints exactly what it printed before',
    async () => {
      expect(await checkAuthoringDocs()).toEqual({
        id: 'authoring-docs',
        label: 'Authoring docs',
        status: 'pass',
        message: `All ${AUTHORING_SELF_DOCS.length} authoring schemas are readable in \`astryx docs authoring\`.`,
      });
    },
    SLOW,
  );

  it(
    'passes on an unchanged copy of the tree, and writes nothing to it',
    async () => {
      const root = copyAuthoring();
      const before = snapshot(root);
      expect(await checkAuthoringDocs(undefined, {root})).toMatchObject({
        status: 'pass',
      });
      expect(snapshot(root)).toEqual(before);
    },
    SLOW,
  );

  it(
    'fails when the NamespaceDoc self-doc is left out of AUTHORING_SELF_DOCS',
    async () => {
      const root = copyAuthoring();
      const c = await checkAuthoringDocs(undefined, {
        root,
        sources: without(NAMESPACE),
      });
      expect(c.status).toBe('fail');
      expect(c.message).toBe(
        `2 problems: ${NAMESPACE} is not in \`astryx docs authoring\`; ${NAMESPACE_TYPES}: ${NAMESPACE} is not listed in AUTHORING_SELF_DOCS`,
      );
    },
    SLOW,
  );

  it(
    "fails when the topic's index no longer exposes the NamespaceDoc section",
    async () => {
      const index = await docs('authoring', undefined, {index: true});
      const topicKeys = new Set(
        index.data.sections
          .map((/** @type {any} */ s) => s.id)
          .filter((/** @type {string} */ id) => id !== 'namespace-doc'),
      );
      const c = await checkAuthoringDocs(undefined, {topicKeys});
      expect(c).toMatchObject({
        status: 'fail',
        message: `${NAMESPACE_TYPES}: ${NAMESPACE} renders section "namespace-doc", which the topic's index does not list`,
        fix: SURFACE_FIX,
      });
    },
    SLOW,
  );

  it(
    'fails when @astryxdesign/cli/authoring stops exporting NamespaceDoc',
    async () => {
      const root = copyAuthoring();
      const index = path.join(root, 'index.d.ts');
      const before = fs.readFileSync(index, 'utf8');
      const after = before.replace(
        /^export type \{NamespaceDoc\} from .*\n/m,
        '',
      );
      expect(after).not.toBe(before);
      fs.writeFileSync(index, after);
      expect(await checkAuthoringDocs(undefined, {root})).toMatchObject({
        status: 'fail',
        message: `${NAMESPACE} documents NamespaceDoc, which @astryxdesign/cli/authoring does not export`,
        fix: SURFACE_FIX,
      });
    },
    SLOW,
  );

  it.each([
    [
      'the graph-fields doc',
      'doctypes/base/graph-fields.doc.mjs',
      'doctypes/base/type.ts',
      [
        'AuthoredDocKind',
        'DocAudience',
        'DocPlacement',
        'AuthoredDocGraphFields',
      ],
    ],
    [
      'the identity doc',
      'identity/identity.doc.mjs',
      'identity/type.ts',
      [
        'ProviderId',
        'ArtifactId',
        'DocId',
        'ProviderInstance',
        'AuthoredDocEntry',
      ],
    ],
    [
      'the semantic-block doc',
      'doctypes/reference/reference.doc.mjs',
      'doctypes/reference/type.ts',
      [
        'WorkflowStep',
        'WorkflowDocBlock',
        'CollectionDocBlock',
        'ReferenceDocBlock',
      ],
    ],
  ])(
    'fails when %s is removed, which the self-doc audit alone passes',
    async (_what, source, module, names) => {
      const root = copyAuthoring();
      fs.rmSync(path.join(root, source));
      const sources = without(source);
      expect(await auditAuthoringSelfDocs({root, sources})).toEqual({
        sections: sources.length,
        unreachable: [],
        failed: [],
        oversized: [],
      });
      const c = await checkAuthoringDocs(undefined, {root, sources});
      expect(c.status).toBe('fail');
      expect(c.fix).toBe(SURFACE_FIX);
      expect(c.message).toMatch(
        new RegExp(
          `^[A-Za-z, ]+ from ${escape(module)} have no doc in \`astryx docs authoring\`: no self-doc sits beside ${escape(module)}$`,
        ),
      );
      for (const name of names) {
        expect(c.message).toMatch(new RegExp(`(^|, )${name}(,| from)`));
      }
    },
    SLOW,
  );

  it(
    'keeps the message and fix of a failure only the self-doc audit reports',
    async () => {
      const root = copyAuthoring();
      fs.writeFileSync(
        path.join(root, 'identity', 'broken.doc.mjs'),
        'export const doc = {;\n',
      );
      const c = await checkAuthoringDocs(undefined, {
        root,
        sources: [...AUTHORING_SELF_DOCS, 'identity/broken.doc.mjs'],
      });
      expect(c.status).toBe('fail');
      expect(c.message).toMatch(/^identity\/broken\.doc\.mjs failed to load: /);
      expect(c.fix).toBe(
        'List every authoring self-doc in AUTHORING_SELF_DOCS, fix the one that fails to load, and split a section that is too large.',
      );
    },
    SLOW,
  );

  it(
    'reports a topic it cannot read rather than skipping the comparison',
    async () => {
      const spy = vi
        .spyOn(DocsCatalog, 'fromBuiltins')
        .mockImplementationOnce(() => {
          throw new Error('no built-in docs');
        });
      try {
        expect(await checkAuthoringDocs()).toMatchObject({
          status: 'fail',
          message:
            '`astryx docs authoring` could not be read: no built-in docs',
          fix: SURFACE_FIX,
        });
      } finally {
        spy.mockRestore();
      }
    },
    SLOW,
  );

  it(
    'fails rather than passes when the surface exports no types at all',
    async () => {
      const root = copyAuthoring();
      fs.writeFileSync(
        path.join(root, 'index.d.ts'),
        "export {parseDoc} from './doctypes/parse.mjs';\n",
      );
      const c = await checkAuthoringDocs(undefined, {root});
      expect(c.status).toBe('fail');
      expect(c.message).toContain(
        '@astryxdesign/cli/authoring exports no types, so nothing was compared with `astryx docs authoring`',
      );
    },
    SLOW,
  );
});

/**
 * Every file under `root` with its contents.
 * @param {string} root
 * @returns {Record<string, string>}
 */
function snapshot(root) {
  /** @type {Record<string, string>} */
  const out = {};
  /** @param {string} dir */
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out[path.relative(root, full)] = fs.readFileSync(full, 'utf8');
    }
  };
  walk(root);
  return out;
}

describe('doctor docs checks', () => {
  it('runs both docs checks and they pass on the repo', async () => {
    const r = await doctor({cwd});
    const byId = Object.fromEntries(r.data.checks.map(c => [c.id, c.status]));
    expect(byId['authoring-docs']).toBe('pass');
    expect(byId['docs-progressive-disclosure']).toBe('pass');
  }, SLOW);
});

describe('checkDocsProgressiveDisclosure languages', () => {
  it('checks every overlay a topic ships, not only English', async () => {
    const dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doctor-lang-'));
    tmpDirs.push(dir);
    const deploying = {
      name: 'deploying',
      title: 'Deploying',
      description: 'Ship it.',
      sections: [{title: 'Overview', content: [{type: 'prose', text: 'Push the button.'}]}],
    };
    fs.writeFileSync(
      path.join(dir, 'deploying.doc.mjs'),
      `export const docs = ${JSON.stringify(deploying)};\n`,
    );
    fs.writeFileSync(
      path.join(dir, 'deploying.doc.zh.mjs'),
      "throw new Error('zh overlay broken');\n",
    );
    fs.writeFileSync(
      path.join(dir, 'deploying.doc.dense.mjs'),
      `export const docsDense = ${JSON.stringify({
        sections: [
          {
            section: 'Overview',
            title: 'Overview',
            content: [{type: 'prose', text: 'x'.repeat(40 * 1024)}],
          },
        ],
      })};\n`,
    );
    const c = await checkDocsProgressiveDisclosure({
      docsCatalog: DocsCatalog.fromBuiltins({deploying: path.join(dir, 'deploying.doc.mjs')}),
      docsCatalogIssues: [],
    });
    expect(c.status).toBe('warn');
    expect(c.message).toContain('deploying [zh]: zh overlay broken');
    expect(c.message).toContain('deploying [dense] overview: 41 KB');
    expect(c.message).not.toMatch(/deploying overview:/);
  });
});

describe('doctor says what it could not check', () => {
  const CORE = {
    'node_modules/@astryxdesign/core/package.json': JSON.stringify({
      name: '@astryxdesign/core',
      version: '0.6.3',
    }),
  };

  /** Installed dependency whose manifest declares roots that do not exist. */
  const dangling = {
    'node_modules/@acme/dangling/package.json': JSON.stringify({
      name: '@acme/dangling',
      version: '2.0.0',
    }),
    'node_modules/@acme/dangling/astryx.integration.mjs':
      "export default {providerId: 'acme-dangling', components: './components', templates: './templates', docs: './docs'};\n",
  };

  /** Installed dependency whose manifest cannot be parsed at all. */
  const broken = {
    'node_modules/@acme/broken/package.json': JSON.stringify({
      name: '@acme/broken',
      version: '1.0.0',
    }),
    'node_modules/@acme/broken/astryx.integration.mjs':
      'export default {  this is not valid javascript ((\n',
  };

  /** @param {Record<string, string>} extra @param {string[]} deps */
  const project = (extra, deps) =>
    mkProject({
      'package.json': JSON.stringify({
        name: 'consumer',
        version: '1.0.0',
        dependencies: Object.fromEntries(
          ['@astryxdesign/core', ...deps].map(d => [d, '1.0.0']),
        ),
      }),
      ...CORE,
      ...extra,
    });

  // An unparseable manifest is kept out of the loaded set on purpose, and
  // doctor used to report that no installed dependency ships a manifest.
  it('names an installed dependency whose manifest cannot be loaded', async () => {
    const report = (await doctor({cwd: project(broken, ['@acme/broken'])})).data;
    const check = report.checks.find(c => c.id === 'implicit-integrations');

    expect(check.status).toBe('info');
    expect(check.message).toContain('@acme/broken');
    expect(check.message).toContain('could not be loaded');
    expect(check.message).not.toContain('no installed dependency ships');
    expect(report.summary.fail).toBe(0);
  }, SLOW);

  it('does not claim contributions from roots that are missing on disk', async () => {
    const report = (await doctor({cwd: project(dangling, ['@acme/dangling'])}))
      .data;
    const implicit = report.checks.find(c => c.id === 'implicit-integrations');
    const issues = report.checks.find(c => c.id === 'integration-issues');

    expect(implicit.message).toContain('contributing nothing');
    expect(implicit.message).toContain('missing on disk');
    expect(implicit.message).not.toContain('contributing components');
    expect(issues.status).toBe('warn');
    expect(issues.message).toContain('@acme/dangling');
  }, SLOW);

  it('still says no dependency ships a manifest when none does', async () => {
    const report = (await doctor({cwd: project({}, [])})).data;
    const check = report.checks.find(c => c.id === 'implicit-integrations');

    expect(check.message).toBe(
      'None — no installed dependency ships an astryx.integration.* manifest.',
    );
  }, SLOW);

  it('says how many integrations could not be read, rather than counting silently', () => {
    /** @type {any} */
    const ctx = {
      cwd: '/x',
      nodeVersion: process.versions.node,
      coreDir: null,
      configPath: null,
      configTheme: null,
      integrations: [
        {name: '@acme/ok', __spec: '@acme/ok', providerId: 'ok'},
        {name: '@acme/bad', __spec: '@acme/bad', __loadError: 'boom'},
      ],
    };
    const check = checkProviderIdentity(ctx);

    expect(check.message).toContain('1 loaded integration has its own provider ID.');
    expect(check.message).toContain('could not be read');
  });
});

describe('doctor says why it skipped and what it checked', () => {
  const CORE_STUB = {
    'node_modules/@astryxdesign/core/package.json': JSON.stringify({
      name: '@astryxdesign/core',
      version: '0.6.3',
    }),
  };

  /** A project under the working directory, so its config can be imported. */
  function cwdProject(files) {
    const dir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-doctor-shape-'),
    );
    tmpDirs.push(dir);
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(dir, rel);
      fs.mkdirSync(path.dirname(abs), {recursive: true});
      fs.writeFileSync(abs, content);
    }
    return dir;
  }

  it(
    'fails, and quotes the reason, when the CLI cannot load the project from a config that imports',
    async () => {
      const dir = cwdProject({
        'package.json': '{"name":"app"}',
        ...CORE_STUB,
        'astryx.config.mjs': "export default { integrations: 'oops' };\n",
      });
      const {checks, summary} = (await doctor({cwd: dir})).data;
      const by = Object.fromEntries(checks.map(c => [c.id, c]));
      expect(by.config.status).toBe('fail');
      expect(by.config.message).toMatch(
        /^astryx\.config\.mjs loads, but the CLI could not load the project from it: .*integrations/,
      );
      expect(by.config.fix).toContain('astryx docs authoring config');
      for (const id of ['implicit-integrations', 'provider-identity']) {
        expect(by[id].message).toMatch(
          /^Skipped — the project configuration could not be read: .*integrations/,
        );
      }
      expect(by['integration-issues'].message).toMatch(
        /^Skipped — the project integration graph could not be loaded: .*integrations/,
      );
      // The config check is the one failure; the skipped checks stay info.
      expect(summary.fail).toBe(1);
    },
    SLOW,
  );

  it(
    'passes the config check when the CLI loads the project from it',
    async () => {
      const dir = cwdProject({
        'package.json': '{"name":"app"}',
        ...CORE_STUB,
        'astryx.config.mjs': 'export default { integrations: [] };\n',
      });
      const by = Object.fromEntries(
        (await doctor({cwd: dir})).data.checks.map(c => [c.id, c]),
      );
      expect(by.config.status).toBe('pass');
      expect(by['implicit-integrations'].message).not.toContain('Skipped');
    },
    SLOW,
  );

  it('says there is nothing to check when no integration is loaded', () => {
    expect(
      checkIntegrationIssues({integrationIssues: [], integrations: []}),
    ).toEqual({
      id: 'integration-issues',
      label: 'Integration contributions',
      status: 'info',
      message:
        'No integration is loaded, so there are no integration contributions to check.',
    });
  });

  it('names what it checked when every loaded integration is clean', () => {
    expect(
      checkIntegrationIssues({
        integrationIssues: [],
        integrations: [{name: '@acme/widgets'}],
      }),
    ).toMatchObject({
      status: 'pass',
      message:
        '1 loaded integration checked (@acme/widgets): contributions and cross-package relationships are valid.',
    });
  });

  it('bounds the names it lists', () => {
    const integrations = Array.from({length: 12}, (_, i) => ({
      name: `@acme/kit-${i}`,
    }));
    const c = checkIntegrationIssues({integrationIssues: [], integrations});
    expect(c.message).toMatch(
      /^12 loaded integrations checked \(.* and 2 more\): /,
    );
  });
});

describe('a configured integration that cannot load fails the gate', () => {
  const CORE_STUB = {
    'node_modules/@astryxdesign/core/package.json': JSON.stringify({
      name: '@astryxdesign/core',
      version: '0.6.3',
    }),
  };
  const WIDGETS = 'node_modules/@acme/widgets';
  /** @param {string} [manifest] */
  const widgets = (
    manifest = "export default {components: './components'};\n",
  ) => ({
    [`${WIDGETS}/package.json`]: JSON.stringify({
      name: '@acme/widgets',
      version: '1.0.0',
    }),
    [`${WIDGETS}/astryx.integration.mjs`]: manifest,
    [`${WIDGETS}/components/AcmeCard.doc.mjs`]:
      "export default {type: 'component', name: 'AcmeCard', displayName: 'AcmeCard', description: 'Fixture.', props: []};\n",
    [`${WIDGETS}/components/AcmeCard.tsx`]:
      'export default function AcmeCard() { return null; }\n',
  });
  const APP = {
    'package.json': '{"name":"app"}',
    ...CORE_STUB,
    'astryx.config.mjs': "export default { integrations: ['@acme/widgets'] };\n",
  };

  /** Run doctor on a project under the working directory. */
  async function report(files) {
    const dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-doctor-gate-'));
    tmpDirs.push(dir);
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(dir, rel);
      fs.mkdirSync(path.dirname(abs), {recursive: true});
      fs.writeFileSync(abs, content);
    }
    const {checks, summary} = (await doctor({cwd: dir})).data;
    return {by: Object.fromEntries(checks.map(c => [c.id, c])), summary};
  }

  it.each([
    ['not installed', {}, /Could not find installed integration package "@acme\/widgets"/],
    [
      'installed without a manifest',
      {[`${WIDGETS}/package.json`]: JSON.stringify({name: '@acme/widgets', version: '1.0.0'})},
      /no conventional root manifest/,
    ],
    ['installed with a manifest that throws', widgets('export default {  not valid ((\n'), /Unexpected/],
  ])(
    'fails when a configured integration is %s, and names it',
    async (_shape, extra, reason) => {
      const {by, summary} = await report({...APP, ...extra});
      const check = by['configured-integrations'];
      expect(check.status).toBe('fail');
      expect(check.message).toMatch(
        /^1 of 1 integration named in astryx\.config could not be loaded, so it contributes nothing: @acme\/widgets \(/,
      );
      expect(check.message).toMatch(reason);
      expect(check.fix).toContain('astryx doctor integration validate <package>');
      expect(summary.fail).toBe(1);
    },
    SLOW,
  );

  it(
    'passes, naming each one, when every configured integration loads',
    async () => {
      const {by, summary} = await report({...APP, ...widgets()});
      expect(by['configured-integrations']).toEqual({
        id: 'configured-integrations',
        label: 'Configured integrations',
        status: 'pass',
        message: '1 integration named in astryx.config loaded: @acme/widgets.',
      });
      expect(summary.fail).toBe(0);
    },
    SLOW,
  );

  it.each([
    [
      'an invalid component doc',
      {[`${WIDGETS}/components/AcmeCard.doc.mjs`]: 'export default {;\n'},
    ],
    [
      'a declared root missing on disk',
      {
        [`${WIDGETS}/astryx.integration.mjs`]:
          "export default {components: './components', templates: './templates'};\n",
      },
    ],
  ])(
    'keeps %s a warning, because the rest of the integration still loads (spec:AST-035 FR9)',
    async (_shape, extra) => {
      const {by, summary} = await report({...APP, ...widgets(), ...extra});
      expect(by['configured-integrations'].status).toBe('pass');
      expect(by['integration-issues'].status).toBe('warn');
      expect(summary.fail).toBe(0);
    },
    SLOW,
  );

  it(
    'leaves an autolinked dependency that cannot load informational',
    async () => {
      const {by, summary} = await report({
        'package.json': JSON.stringify({
          name: 'app',
          dependencies: {'@acme/widgets': '1.0.0'},
        }),
        ...CORE_STUB,
        ...widgets('export default {  not valid ((\n'),
      });
      expect(by['configured-integrations']).toMatchObject({
        status: 'info',
        message: 'No integration is named in astryx.config.',
      });
      expect(by['implicit-integrations'].status).toBe('info');
      expect(summary.fail).toBe(0);
    },
    SLOW,
  );
});
