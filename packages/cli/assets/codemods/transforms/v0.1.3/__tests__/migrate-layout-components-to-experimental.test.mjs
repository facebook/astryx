// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Invoke the transform directly with a configured jscodeshift api, mirroring
 * how other transform tests (and `runConfigCodemod`) drive transforms via the
 * unified `(file, api) => string | null | undefined` contract.
 *
 * @param {string} source
 * @param {string} [filePath]
 * @returns {Promise<string|null>} the rewritten source, or null for no-op
 */
async function applyTransform(source, filePath = 'astryx.config.mjs') {
  const {default: transform} = await import(
    '../migrate-layout-components-to-experimental.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('babel');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: filePath}, api);
}

describe('migrate-layout-components-to-experimental — meta', () => {
  it('declares itself as a config codemod', async () => {
    const {meta} = await import(
      '../migrate-layout-components-to-experimental.mjs'
    );
    expect(meta.codemodType).toBe('config');
    expect(meta.title).toMatch(/layout\.components/);
    expect(typeof meta.description).toBe('string');
  });
});

describe('migrate-layout-components-to-experimental — string → {from}', () => {
  it('normalizes a string entry to { from } (named import semantics)', async () => {
    const input = `export default {
  layout: {
    components: {
      KpiCard: '@/components/KpiCard',
    },
  },
};
`;
    const output = await applyTransform(input);
    expect(output).not.toBeNull();
    // No longer under layout.
    expect(output).not.toMatch(/layout\s*:/);
    // Relocated under experimental.xle.components as { from }.
    expect(output).toContain('experimental');
    expect(output).toContain('xle');
    expect(output).toMatch(/KpiCard:\s*\{\s*from:\s*['"]@\/components\/KpiCard['"]/);
  });

  it('normalizes multiple string entries', async () => {
    const input = `export default {
  layout: {
    components: {
      KpiCard: '@/components/KpiCard',
      Banner: '@/components/Banner',
    },
  },
};
`;
    const output = await applyTransform(input);
    expect(output).toMatch(/KpiCard:\s*\{\s*from:\s*['"]@\/components\/KpiCard['"]/);
    expect(output).toMatch(/Banner:\s*\{\s*from:\s*['"]@\/components\/Banner['"]/);
  });
});

describe('migrate-layout-components-to-experimental — object entries carried unchanged', () => {
  it('preserves default: true (default import semantics)', async () => {
    const input = `export default {
  layout: {
    components: {
      Chart: { from: '@/c/Chart', default: true },
    },
  },
};
`;
    const output = await applyTransform(input);
    expect(output).toContain("from: '@/c/Chart'");
    expect(output).toContain('default: true');
    expect(output).toContain('experimental');
    expect(output).toContain('xle');
  });

  it('preserves description', async () => {
    const input = `export default {
  layout: {
    components: {
      Chart: { from: '@/c/Chart', description: 'A chart' },
    },
  },
};
`;
    const output = await applyTransform(input);
    expect(output).toContain("from: '@/c/Chart'");
    expect(output).toContain("description: 'A chart'");
  });

  it('preserves from/description/default and key order', async () => {
    const input = `export default {
  layout: {
    components: {
      Chart: { from: '@/c/Chart', description: 'A chart', default: true },
    },
  },
};
`;
    const output = await applyTransform(input);
    // Order: from, then description, then default.
    expect(output).toMatch(
      /from:\s*'@\/c\/Chart',\s*description:\s*'A chart',\s*default:\s*true/,
    );
  });

  it('migrates a mix of string and object entries', async () => {
    const input = `export default {
  layout: {
    components: {
      KpiCard: '@/components/KpiCard',
      Chart: { from: '@/c/Chart', default: true },
    },
  },
};
`;
    const output = await applyTransform(input);
    expect(output).toMatch(/KpiCard:\s*\{\s*from:\s*['"]@\/components\/KpiCard['"]/);
    expect(output).toContain("from: '@/c/Chart'");
    expect(output).toContain('default: true');
  });
});

describe('migrate-layout-components-to-experimental — wrapper forms', () => {
  it('handles bare object literal default export', async () => {
    const input = `export default {
  layout: { components: { KpiCard: '@/components/KpiCard' } },
};
`;
    const output = await applyTransform(input);
    expect(output).toContain('experimental');
    expect(output).toContain('xle');
  });

  it('handles createConfig({ ... }) wrapper', async () => {
    const input = `import { createConfig } from '@astryxdesign/cli';

export default createConfig({
  layout: { components: { KpiCard: '@/components/KpiCard' } },
});
`;
    const output = await applyTransform(input);
    expect(output).not.toBeNull();
    expect(output).toContain('createConfig(');
    expect(output).toContain('experimental');
    expect(output).toContain('xle');
    expect(output).toMatch(/KpiCard:\s*\{\s*from:\s*['"]@\/components\/KpiCard['"]/);
    expect(output).not.toMatch(/layout\s*:/);
  });
});

describe('migrate-layout-components-to-experimental — placement', () => {
  it('adds xle to a pre-existing experimental (no xle)', async () => {
    const input = `export default {
  experimental: { foo: true },
  layout: { components: { KpiCard: '@/components/KpiCard' } },
};
`;
    const output = await applyTransform(input);
    expect(output).toContain('foo: true');
    expect(output).toContain('xle');
    expect(output).toMatch(/KpiCard:\s*\{\s*from:/);
  });
});

describe('migrate-layout-components-to-experimental — no-op cases', () => {
  it('returns null when there is no layout', async () => {
    const input = `export default { theme: 'dark' };\n`;
    const output = await applyTransform(input);
    expect(output).toBeNull();
  });

  it('returns null when layout has no components', async () => {
    const input = `export default { layout: { foo: 1 } };\n`;
    // layout exists but has no components → no-op (return null) BEFORE the
    // "extra key" check, because there is nothing to migrate.
    const output = await applyTransform(input);
    expect(output).toBeNull();
  });

  it('returns null on an already-migrated config (idempotence-ish)', async () => {
    const input = `export default {
  experimental: { xle: { components: { KpiCard: { from: '@/components/KpiCard' } } } },
};
`;
    const output = await applyTransform(input);
    expect(output).toBeNull();
  });
});

describe('migrate-layout-components-to-experimental — bail (throw) cases', () => {
  it('throws when experimental.xle already exists', async () => {
    const input = `export default {
  experimental: { xle: { components: {} } },
  layout: { components: { KpiCard: '@/components/KpiCard' } },
};
`;
    await expect(applyTransform(input)).rejects.toThrow(/experimental\.xle/);
  });

  it('throws when layout has an extra key besides components', async () => {
    const input = `export default {
  layout: {
    components: { KpiCard: '@/components/KpiCard' },
    spacing: 8,
  },
};
`;
    await expect(applyTransform(input)).rejects.toThrow(/other than/);
  });

  it('throws when an entry value is an identifier', async () => {
    const input = `const Kpi = '@/components/KpiCard';
export default {
  layout: { components: { KpiCard: Kpi } },
};
`;
    await expect(applyTransform(input)).rejects.toThrow(/cannot be safely migrated/);
  });

  it('throws when an entry value is a call expression', async () => {
    const input = `export default {
  layout: { components: { KpiCard: resolve('@/components/KpiCard') } },
};
`;
    await expect(applyTransform(input)).rejects.toThrow(/cannot be safely migrated/);
  });

  it('throws on a non-object default export (variable reference)', async () => {
    const input = `const config = { layout: { components: {} } };
export default config;
`;
    await expect(applyTransform(input)).rejects.toThrow(/statically analyze/);
  });
});

describe('migrate-layout-components-to-experimental — end-to-end via runConfigCodemod', () => {
  it('rewrites astryx.config.mjs on disk through the unified runner', async () => {
    const {runConfigCodemod} = await import('../../../run-codemod.mjs');
    const {default: transform, meta} = await import(
      '../migrate-layout-components-to-experimental.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;

    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-v013-codemod-test-'),
    );
    try {
      process.chdir(tmpDir);
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: 'consumer'}),
      );
      fs.writeFileSync(
        path.join(tmpDir, 'astryx.config.mjs'),
        `export default {
  layout: { components: { KpiCard: '@/components/KpiCard' } },
};
`,
      );

      const entry = {
        id: 'migrate-layout-components-to-experimental',
        type: 'config',
        codemod: {title: meta.title, transform},
        package: 'core',
        version: '0.1.3',
      };
      const log = {
        step() {},
        info() {},
        success() {},
        warn() {},
        error() {},
        message() {},
      };
      const result = runConfigCodemod(entry, {apply: true, log, jscodeshift});

      expect(result.errors).toHaveLength(0);
      expect(result.filesChanged).toBe(1);
      const rewritten = fs.readFileSync(
        path.join(tmpDir, 'astryx.config.mjs'),
        'utf-8',
      );
      expect(rewritten).toContain('experimental');
      expect(rewritten).toContain('xle');
      expect(rewritten).toMatch(/KpiCard:\s*\{\s*from:/);
      expect(rewritten).not.toMatch(/layout\s*:/);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('surfaces a thrown bail as a structured error through runConfigCodemod', async () => {
    const {runConfigCodemod} = await import('../../../run-codemod.mjs');
    const {default: transform, meta} = await import(
      '../migrate-layout-components-to-experimental.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;

    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-v013-codemod-test-'),
    );
    try {
      process.chdir(tmpDir);
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: 'consumer'}),
      );
      fs.writeFileSync(
        path.join(tmpDir, 'astryx.config.mjs'),
        `export default {
  experimental: { xle: { components: {} } },
  layout: { components: { KpiCard: '@/components/KpiCard' } },
};
`,
      );

      const entry = {
        id: 'migrate-layout-components-to-experimental',
        type: 'config',
        codemod: {title: meta.title, transform},
        package: 'core',
        version: '0.1.3',
      };
      const log = {
        step() {},
        info() {},
        success() {},
        warn() {},
        error() {},
        message() {},
      };
      const result = runConfigCodemod(entry, {apply: true, log, jscodeshift});

      expect(result.filesChanged).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toMatch(/experimental\.xle/);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });
});
