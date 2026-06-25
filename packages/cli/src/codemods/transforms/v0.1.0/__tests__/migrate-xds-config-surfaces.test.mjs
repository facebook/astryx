// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyConfigCodemod(files) {
  const {default: transform} =
    await import('../migrate-xds-config-surfaces.mjs');
  const config = {
    packageJson: files['package.json']
      ? {path: 'package.json', source: files['package.json']}
      : null,
    astryxConfig: files['astryx.config.mjs']
      ? {path: 'astryx.config.mjs', source: files['astryx.config.mjs']}
      : null,
    xdsConfig: files['xds.config.mjs']
      ? {path: 'xds.config.mjs', source: files['xds.config.mjs']}
      : null,
  };
  return transform({path: process.cwd(), source: ''}, {config});
}

describe('migrate-xds-config-surfaces', () => {
  it('extracts package.json xds config into astryx.config.mjs and removes the package key in place', async () => {
    const input = `{
    "dependencies": {"@xds/core":"^0.0.15"},
    "xds"  : {"theme":"neutral","docs":"./src"}
}
`;

    const result = await applyConfigCodemod({'package.json': input});
    expect(result.errors ?? []).toEqual([]);
    expect(result.changes).toEqual([
      {
        path: 'package.json',
        source: `{
    "dependencies": {"@xds/core":"^0.0.15"}
}
`,
      },
      {
        path: 'astryx.config.mjs',
        source: `export default {
  "theme": "neutral",
  "docs": "./src"
};
`,
      },
    ]);
  });

  it('extracts package.json astryx config into astryx.config.mjs too', async () => {
    const result = await applyConfigCodemod({
      'package.json': `{"astryx":{"theme":"neutral"}}\n`,
    });
    expect(result.changes).toEqual([
      {path: 'package.json', source: `{}\n`},
      {
        path: 'astryx.config.mjs',
        source: `export default {
  "theme": "neutral"
};
`,
      },
    ]);
  });

  it('bails when package.json contains both xds and astryx config keys', async () => {
    const result = await applyConfigCodemod({
      'package.json': `{"xds":{"theme":"default"},"astryx":{"theme":"neutral"}}\n`,
    });
    expect(result.errors?.[0]?.error).toMatch(/both xds and astryx/);
  });

  it('does not rewrite dependency keys in package.json', async () => {
    const input = `{"dependencies":{"@xds/core":"^0.0.15"}}\n`;
    const result = await applyConfigCodemod({'package.json': input});
    expect(result.changes).toEqual([]);
  });

  it('bails when package config and astryx.config.mjs both exist', async () => {
    const result = await applyConfigCodemod({
      'package.json': `{"xds":{"theme":"neutral"}}\n`,
      'astryx.config.mjs': `export default {};\n`,
    });
    expect(result.errors?.[0]?.error).toMatch(/migrate the config manually/);
  });

  it('bails when package config and xds.config.mjs both exist', async () => {
    const result = await applyConfigCodemod({
      'package.json': `{"xds":{"theme":"neutral"}}\n`,
      'xds.config.mjs': `export default {};\n`,
    });
    expect(result.errors?.[0]?.error).toMatch(/migrate the config manually/);
  });

  it('renames xds.config.mjs to astryx.config.mjs when no package config exists', async () => {
    const result = await applyConfigCodemod({
      'xds.config.mjs': "export default { theme: 'neutral' };\n",
    });
    expect(result.changes).toEqual([
      {
        path: 'astryx.config.mjs',
        source: "export default { theme: 'neutral' };\n",
      },
      {path: 'xds.config.mjs', delete: true},
    ]);
  });

  it('bails when xds.config.mjs and astryx.config.mjs both exist', async () => {
    const result = await applyConfigCodemod({
      'xds.config.mjs': `export default {};\n`,
      'astryx.config.mjs': `export default {};\n`,
    });
    expect(result.errors?.[0]?.error).toMatch(/migrate the config manually/);
  });
});
