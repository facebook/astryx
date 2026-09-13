// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the `doctor` leaf (api/doctor/doctor.mjs). `doctor`
 * had no api-level tests; this locks the envelope shape and the summary
 * invariant (the counts must always add up to the number of checks).
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  doctor,
  checkImplicitIntegrations,
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

  it('surfaces cross-package replacement precedence in root Doctor', async () => {
    const dir = mkProject({
      'package.json': JSON.stringify({name: 'consumer'}),
      'astryx.config.mjs':
        "export default {integrations: ['@acme/one', '@acme/two']};\n",
      'node_modules/@acme/one/package.json': JSON.stringify({
        name: '@acme/one',
        version: '1.0.0',
      }),
      'node_modules/@acme/one/astryx.integration.mjs':
        "export default {components: './components', docs: './docs'};\n",
      'node_modules/@acme/one/components/FirstNav.doc.mjs':
        "export const docs = {name: 'FirstNav', displayName: 'First Nav', replaces: 'SideNav', usage: {description: 'First.'}, props: []};\n",
      'node_modules/@acme/one/components/FirstNav.tsx':
        'export function FirstNav() { return null; }\n',
      'node_modules/@acme/one/docs/FirstGuide.doc.mjs':
        "export default {type: 'generic', name: 'first-guide', replaces: 'getting-started', title: 'First', description: 'First.', sections: [{title: 'Overview', content: [{type: 'prose', text: 'First.'}]}]};\n",
      'node_modules/@acme/two/package.json': JSON.stringify({
        name: '@acme/two',
        version: '1.0.0',
      }),
      'node_modules/@acme/two/astryx.integration.mjs':
        "export default {components: './components', docs: './docs'};\n",
      'node_modules/@acme/two/components/SecondNav.doc.mjs':
        "export const docs = {name: 'SecondNav', displayName: 'Second Nav', replaces: 'SideNav', usage: {description: 'Second.'}, props: []};\n",
      'node_modules/@acme/two/components/SecondNav.tsx':
        'export function SecondNav() { return null; }\n',
      'node_modules/@acme/two/docs/SecondGuide.doc.mjs':
        "export default {type: 'generic', name: 'second-guide', replaces: 'getting-started', title: 'Second', description: 'Second.', sections: [{title: 'Overview', content: [{type: 'prose', text: 'Second.'}]}]};\n",
    });
    fs.mkdirSync(path.join(dir, 'packages'), {recursive: true});
    fs.symlinkSync(path.join(REPO, 'packages', 'core'), path.join(dir, 'packages', 'core'));

    const r = await doctor({cwd: dir});
    const integration = r.data.checks.find(
      check => check.id === 'integration-issues',
    );
    expect(integration).toMatchObject({status: 'warn'});
    expect(integration.message).toContain('replaced by both');
    expect(integration.message).toContain('Topic "getting-started"');
    expect(integration.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({code: 'duplicate_doc'}),
      ]),
    );
    expect(integration.fix).toContain('astryx.config');
  }, SLOW);

  it('reports the core node-version and core-installed checks', async () => {
    const r = await doctor({cwd});
    const ids = r.data.checks.map(c => c.id);
    expect(ids).toContain('node-version');
    expect(ids).toContain('core-installed');
  }, SLOW);
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

describe('checkIntegrationIssues', () => {
  it('surfaces cross-package catalog warnings through root Doctor', () => {
    const c = checkIntegrationIssues({
      integrationIssues: [
        {
          package: '@acme/second',
          code: 'ambiguous_component_replacement',
          severity: 'warning',
          message:
            'Core component "SideNav" is replaced by both @acme/first and @acme/second.',
        },
      ],
    });

    expect(c).toMatchObject({id: 'integration-issues', status: 'warn'});
    expect(c.message).toContain('@acme/second');
    expect(c.message).toContain('replaced by both');
    expect(c.fix).toContain('astryx.config');
  });

  it('does not truncate project-wide issue details', () => {
    const issues = Array.from({length: 5}, (_, index) => ({
      package: `@acme/pkg-${index + 1}`,
      code: 'ambiguous_component_replacement',
      severity: /** @type {const} */ ('warning'),
      message: `replacement warning ${index + 1}`,
    }));

    const c = checkIntegrationIssues({integrationIssues: issues});

    expect(c.issues).toHaveLength(5);
    expect(c.message).toContain('replacement warning 5');
  });

  it('passes when the project has no integration issues', () => {
    expect(checkIntegrationIssues({integrationIssues: []})).toMatchObject({
      id: 'integration-issues',
      status: 'pass',
    });
  });
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
    const c = checkImplicitIntegrations({
      integrations: [
        autolinked({templates: '/abs/templates', themes: '/abs/themes'}),
      ],
    });
    expect(c.message).toContain('@acme/widgets@1.0.0');
    expect(c.message).toContain('from dependencies');
    expect(c.message).toContain(
      'contributing components, templates, themes',
    );
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
