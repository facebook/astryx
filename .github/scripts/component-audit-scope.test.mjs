// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Mutation-sensitive tests for trusted component-audit scope routing.
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {COMPONENT_PACKAGES} = require('../../scripts/component-packages.cjs');
const {
  changedPathsFromNameStatus,
  classifyComponentAuditScope,
} = require('./component-audit-scope.cjs');

const FULL_AUDIT_SCOPE = {
  has_components: true,
  has_rtl_components: true,
  has_rtl_harness: true,
  force_full_component_audits: true,
};

describe('component audit scope', () => {
  it('loads the classifier and registry from the trusted base ref', () => {
    const workflow = fs.readFileSync(
      new URL('../workflows/ci.yml', import.meta.url),
      'utf8',
    );
    expect(workflow).toContain(
      'origin/${{ github.base_ref }}:.github/scripts/component-audit-scope.cjs',
    );
    expect(workflow).toContain(
      'origin/${{ github.base_ref }}:scripts/component-packages.cjs',
    );
    expect(workflow).toContain('force_full_component_audits=true');
  });

  it.each([
    ['packages/core/src/Button/Button.tsx', 'core'],
    ['packages/lab/src/Drawer/Drawer.tsx', 'lab'],
    ['packages/charts/src/Chart.tsx', 'charts'],
    ['packages/richtext/src/RichTextEditor.tsx', 'richtext'],
    ['packages/vega/src/VegaChart.tsx', 'vega'],
  ])('routes a source-only %s change through component and RTL audits', file => {
    expect(classifyComponentAuditScope([file], COMPONENT_PACKAGES)).toMatchObject({
      has_components: true,
      has_rtl_components: true,
      force_full_component_audits: false,
    });
  });

  it('fails closed when a PR mutates the registry while changing a removed package', () => {
    const changedPaths = [
      'scripts/component-packages.cjs',
      'packages/vega/src/VegaChart.tsx',
    ];
    const prControlledPackages = COMPONENT_PACKAGES.filter(
      pkg => pkg.name !== 'vega',
    );
    expect(
      classifyComponentAuditScope(
        ['packages/vega/src/VegaChart.tsx'],
        prControlledPackages,
      ),
    ).toMatchObject(FULL_AUDIT_SCOPE);

    expect(
      classifyComponentAuditScope(changedPaths, prControlledPackages),
    ).toMatchObject(FULL_AUDIT_SCOPE);
  });

  it.each([
    [
      'routing-test-only',
      ['.github/scripts/component-audit-scope.test.mjs'],
    ],
    ['trusted classifier dependency', ['.github/scripts/change-scope.cjs']],
    ['accessibility harness', ['.github/scripts/accessibility-audit.js']],
    ['target-only route policy', ['apps/storybook/rtl-audit/targets.json']],
    [
      'route policy with component source',
      [
        'apps/storybook/rtl-audit/rtl-audit-coverage.mjs',
        'packages/vega/src/VegaChart.tsx',
      ],
    ],
    [
      'verified-N/A policy with unrelated component source',
      [
        'apps/storybook/rtl-audit/verified-not-applicable.json',
        'packages/core/src/Button/Button.tsx',
      ],
    ],
    ['unknown path', ['new/unclassified/path.xyz']],
    ['empty input', []],
  ])('fails closed for %s', (_name, paths) => {
    expect(
      classifyComponentAuditScope(paths, COMPONENT_PACKAGES),
    ).toMatchObject(FULL_AUDIT_SCOPE);
  });

  it('keeps rename source and destination paths in scope', () => {
    expect(
      changedPathsFromNameStatus(
        'R100\tpackages/vega/src/OldChart.tsx\tpackages/vega/src/VegaChart.tsx\n',
      ),
    ).toEqual([
      'packages/vega/src/OldChart.tsx',
      'packages/vega/src/VegaChart.tsx',
    ]);
  });
});
