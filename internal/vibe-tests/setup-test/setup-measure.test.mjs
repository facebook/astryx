// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  classifyCssAssets,
  measurementPrivateValues,
  normalizeSubpixel,
  parseLayerOrder,
  publicMeasurement,
} from './setup-measure.mjs';
import {
  assertPublicArtifactSafe,
  publicProvenance,
} from '../src/public-artifact.mjs';

describe('setup browser measurement helpers', () => {
  it('normalizes Chromium geometry to its 1/64 CSS pixel grid without tolerance', () => {
    expect(normalizeSubpixel(10.015625)).toBe(10.015625);
    expect(normalizeSubpixel(10.01)).toBe(10.015625);
    expect(normalizeSubpixel(10.02)).toBe(10.015625);
    expect(normalizeSubpixel(10.03125)).toBe(10.03125);
  });

  it('classifies missing and multiple emitted stylesheets as measurement errors', () => {
    expect(classifyCssAssets([])).toEqual(['missing-css-asset']);
    expect(classifyCssAssets(['a.css', 'b.css'])).toEqual([
      'multiple-css-assets:a.css,b.css',
    ]);
    expect(classifyCssAssets(['app.css'])).toEqual([]);
  });

  it('reads both ordering statements and block declarations from emitted CSS', () => {
    expect(
      parseLayerOrder(`
        @layer reset, theme, base, astryx-base, astryx-theme, components, utilities;
        @layer components { .button { display: flex } }
      `),
    ).toEqual([
      'reset',
      'theme',
      'base',
      'astryx-base',
      'astryx-theme',
      'components',
      'utilities',
    ]);
  });

  it('preserves first registration order instead of letting repeats reorder layers', () => {
    expect(
      parseLayerOrder(
        '@layer utilities {} @layer reset, utilities; @layer theme {}',
      ),
    ).toEqual(['utilities', 'reset', 'theme']);
  });

  it('emits a stable fixture id and redacts private paths and hosts', () => {
    const privateRoot = '/home/example/checkouts/secret project';
    const exported = publicMeasurement(
      {
        app: privateRoot,
        build: {
          stdout: `built ${privateRoot}/dist/app.js`,
          stderr: [
            'fetch failed at https://builder.internal.example/private/token runner-reported rebuild',
            'email mailto:user@worker.internal.example',
            'mirror ftp://private-host/files/package',
            'checkout ssh://private-host/repository',
            'fetch git://private-host/repository',
            'mount smb://private-host/share',
            'load file://private-host/share/file.json',
            'spaced file file:///Users/alice/Secret Project/src/App.tsx runner-reported rebuild',
            'quoted "file:///Users/alice/Secret Project/src/App.tsx?mode=test#result" after',
            'punctuation (file:///home/example/secret.log?mode=test#result), after',
            'probe http://10.20.30.40:8080/status',
            'path error:/home/other/private project/src/App.tsx',
            'dash path error:/-secret/file',
            String.raw`windows error:C:\Users\person\private project\App.tsx`,
            String.raw`unc error:\\build-host\share\artifact`,
            'host=::1 host=fd00::1',
          ].join('\n'),
        },
        schemes: {
          light: {
            consoleErrors: [`file://${privateRoot}/src/App.tsx`],
          },
        },
        extra: {
          [`${privateRoot}/key`]: 'value',
          'worker9257.region.facebook.com': 'host-key',
          'service.internal': 'private-key',
        },
      },
      {
        fixtureId: 'tailwind-v4-control',
        privateValues: [privateRoot, 'example'],
      },
    );
    const serialized = JSON.stringify(exported);
    expect(exported.app).toBe('tailwind-v4-control');
    expect(serialized).not.toContain(privateRoot);
    expect(serialized).not.toContain('secret project');
    expect(serialized).not.toContain('example');
    expect(serialized).not.toContain('10.20.30.40');
    expect(serialized).not.toContain('::1');
    expect(serialized).not.toContain('fd00::1');
    expect(serialized).not.toContain('/-secret/file');
    expect(serialized).not.toContain('service.internal');
    expect(serialized).not.toContain('builder.internal.example');
    expect(exported.build.stderr).toContain(
      'spaced file <external-uri> runner-reported rebuild',
    );
    expect(exported.build.stderr).toContain('quoted "<external-uri>" after');
    expect(exported.build.stderr).toContain(
      'punctuation (<external-uri>), after',
    );
    expect(serialized).toContain('runner-reported rebuild');
    expect(serialized).not.toMatch(/(?:https?|ftp|ssh|git|smb|file|mailto):/);
    expect(serialized).not.toContain('/home/other');
    expect(serialized).not.toContain('C:\\\\Users');
    expect(serialized).not.toContain('person');
    expect(serialized).not.toContain('build-host');
    expect(serialized).not.toContain('worker9257');
    expect(serialized).not.toMatch(/file:\/\/\/[a-z]/i);
    expect(serialized).not.toMatch(/\binternal\b/i);
    expect(() => assertPublicArtifactSafe(exported)).not.toThrow();
  });

  it('exports a generic provenance usage source without private paths', () => {
    const privateRoot = '/Users/example/work/setup-fixture';
    const exported = publicProvenance(
      {
        schemaVersion: 1,
        fixture: {id: 'tailwind-v4-control'},
        usage: {
          complete: true,
          inputTokens: 10,
          outputTokens: 5,
          source: `${privateRoot}/usage.json`,
        },
      },
      {privateValues: [privateRoot, 'example']},
    );
    expect(exported.usage.source).toBe('runner-reported');
    expect(JSON.stringify(exported)).not.toContain(privateRoot);
    expect(() => assertPublicArtifactSafe(exported)).not.toThrow();
  });

  it.each(['runner', 'build', 'missing', undefined])(
    'does not corrupt normal words when USER is %s',
    user => {
      const privateValues = measurementPrivateValues({
        appDir: '/tmp/setup-fixture',
        outFile: '/tmp/results/measurement.json',
        cwd: '/workspace/project',
        repoRoot: '/workspace/project',
        environment: {
          ...(user === undefined ? {} : {USER: user}),
          HOSTNAME: user,
        },
      });
      const exported = publicMeasurement(
        {
          message:
            'runner-reported rebuild buildable <private-host> <private-path> <private-value>',
        },
        {fixtureId: 'fixture', privateValues},
      );
      expect(exported.message).toBe(
        'runner-reported rebuild buildable <private-host> <private-path> <private-value>',
      );
      expect(() => assertPublicArtifactSafe(exported)).not.toThrow();
    },
  );

  it('preserves evaluator diagnostics and CSS selectors verbatim', () => {
    const labels = [
      'light:status:not-replaced',
      'multiple-css-assets:app.css,theme.css',
      'overlay:dialog-surface',
      'a:hover',
    ];
    const exported = publicMeasurement(
      {labels},
      {
        fixtureId: 'fixture',
        privateValues: ['runner', 'build', 'missing'],
      },
    );
    expect(exported.labels).toEqual(labels);
  });

  it('redacts a specific bare username atomically without changing larger words', () => {
    const exported = publicMeasurement(
      {owner: 'owner-42', message: 'owner-420 can rebuild'},
      {fixtureId: 'fixture', privateValues: ['owner-42']},
    );
    expect(exported.owner).toBe('<private-value>');
    expect(exported.message).toBe('owner-420 can rebuild');
  });
});
