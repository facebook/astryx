// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Admission and agreement tests for the trusted tooling-path registry.
 * @input The registry and both trusted classifiers.
 * @output Mutation-sensitive assertions that every admitted group routes
 *   identically through the CI lane and the component-audit gate, and that
 *   neighboring unadmitted paths still fail closed.
 * @position Routing contract for spec:AST-030 FR2, FR5, FR6, and FR9.
 */

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {COMPONENT_PACKAGES} = require('../../scripts/component-packages.cjs');
const {NODE_TOOLING_GROUPS} = require('./tooling-paths.cjs');
const {SURFACES, classifyChanges} = require('./change-scope.cjs');
const {classifyComponentAuditScope} = require('./component-audit-scope.cjs');

const CROWDIN_GROUP = [
  '.github/workflows/crowdin-upload.yml',
  'internal/scripts/README.md',
  'internal/scripts/lib/crowdin-strategies.mjs',
  'internal/scripts/upload-crowdin-screenshots.mjs',
];

describe('admitted tooling registry', () => {
  it('admits the Crowdin screenshot group exactly', () => {
    expect(NODE_TOOLING_GROUPS['crowdin-screenshots']).toEqual(CROWDIN_GROUP);
  });

  it.each(Object.entries(NODE_TOOLING_GROUPS))(
    'routes the complete %s group through the tooling lane in both classifiers',
    (_group, paths) => {
      const scope = classifyChanges(paths.map(filename => ({filename})));
      expect(scope.toolingOnly).toBe(true);
      expect(scope.surfaces).toEqual([SURFACES.NODE_TOOLING]);
      expect(
        classifyComponentAuditScope(paths, COMPONENT_PACKAGES),
      ).toMatchObject({
        has_components: false,
        has_rtl_components: false,
        has_rtl_harness: false,
        force_full_component_audits: false,
      });
    },
  );

  it.each([
    // Neither directory nor workflow prefix is admitted — only listed files.
    'internal/scripts/lib/other-strategies.mjs',
    'internal/scripts/upload-something-else.mjs',
    '.github/workflows/crowdin-download.yml',
    '.github/workflows/ci.yml',
    'scripts/check-sync.js',
    // The registry is policy, not tooling.
    '.github/scripts/tooling-paths.cjs',
    // The catalog the uploader reads is public package source.
    'packages/core/locales/en.json',
  ])('keeps unadmitted neighbor %s on broad CI in both classifiers', file => {
    expect(classifyChanges([{filename: file}]).toolingOnly).toBe(false);
    expect(
      classifyComponentAuditScope([file], COMPONENT_PACKAGES)
        .force_full_component_audits,
    ).toBe(true);
  });
});
