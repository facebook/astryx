// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {classifyChanges, parseNameStatus} = require('./change-scope.cjs');

describe('spec-only change scope', () => {
  it('accepts system, family, design, theme, component, and plan records', () => {
    const result = classifyChanges([
      {filename: 'docs/specs/AST-001-overlay-policy/spec.md'},
      {filename: 'docs/specs/AST-001-overlay-policy/plan.md'},
      {filename: 'docs/families/input-fields.md'},
      {filename: 'docs/design/selection-inputs.md'},
      {filename: 'packages/themes/neutral/neutral.spec.md'},
      {filename: 'packages/core/src/Selector/Selector.spec.md'},
      {filename: 'packages/lab/src/FutureInput/FutureInput.spec.md'},
    ]);
    expect(result.specOnly).toBe(true);
  });

  it('owner-gates architecture records without granting the spec-only fast path', () => {
    const result = classifyChanges([
      {filename: 'docs/architecture/knowledge-contracts.md'},
    ]);
    expect(result.touchesKnowledgeRecords).toBe(true);
    expect(result.specOnly).toBe(false);
  });

  it('owner-gates normative design assets without granting the spec-only fast path', () => {
    const result = classifyChanges([
      {filename: 'docs/design/assets/selector/alignment.png'},
    ]);
    expect(result.touchesDesignAssets).toBe(true);
    expect(result.touchesKnowledgeRecords).toBe(true);
    expect(result.specOnly).toBe(false);
  });

  it('rejects Changesets attached only to spec records', () => {
    const result = classifyChanges([
      {filename: 'docs/families/input-fields.md'},
      {filename: '.changeset/input-fields-docs.md'},
    ]);
    expect(result.specOnly).toBe(false);
    expect(result.specChangesetConflict).toBe(true);
  });

  it('does not let an unrelated file hide a spec-only Changeset', () => {
    const result = classifyChanges([
      {filename: 'docs/families/input-fields.md'},
      {filename: '.changeset/input-fields-docs.md'},
      {filename: 'docs/README.md'},
    ]);
    expect(result.specChangesetConflict).toBe(true);
  });

  it.each([
    'packages/core/src/Selector/Selector.test.tsx',
    'packages/core/src/Selector/Selector.audit.json',
    'packages/core/test/selector-fixture.ts',
    'packages/core/src/Selector/__fixtures__/options.ts',
    'packages/core/src/__tests__/TestIcon.tsx',
  ])(
    'does not let non-release package file %s hide a spec-only Changeset',
    filename => {
      const result = classifyChanges([
        {filename: 'docs/families/input-fields.md'},
        {filename: '.changeset/input-fields-docs.md'},
        {filename},
      ]);
      expect(result.specChangesetConflict).toBe(true);
    },
  );

  it('allows a Changeset when a package release surface also changes', () => {
    const result = classifyChanges([
      {filename: 'docs/families/input-fields.md'},
      {filename: 'packages/core/src/Selector/Selector.tsx'},
      {filename: '.changeset/selector-behavior.md'},
    ]);
    expect(result.specChangesetConflict).toBe(false);
  });

  it.each([
    'packages/core/src/Selector/Selector.tsx',
    'packages/core/src/Selector/Selector.audit.json',
    'docs/architecture/layers.md',
    'docs/templates/knowledge/component-spec.md',
    'docs/templates/knowledge/theme-spec.md',
    'docs/schemas/knowledge/v2.json',
    'docs/themes/neutral.md',
    'packages/themes/neutral/Theme.spec.md',
    'docs/themes/README.md',
    'docs/README.md',
    'docs/specs/README.md',
    '.github/workflows/ci.yml',
  ])('rejects %s', filename => {
    expect(classifyChanges([{filename}]).specOnly).toBe(false);
  });

  it.each([
    'docs/themes/neutral.md',
    'packages/themes/neutral/Theme.spec.md',
    'packages/themes/neutral/subdir/neutral.spec.md',
  ])('treats misplaced theme candidate %s as unsafe knowledge', filename => {
    const result = classifyChanges([{filename}]);
    expect(result.touchesKnowledgeRecords).toBe(true);
    expect(result.specOnly).toBe(false);
  });

  it('fails closed for an empty change set', () => {
    expect(classifyChanges([]).specOnly).toBe(false);
  });

  it('fails closed when the API file list is incomplete', () => {
    const result = classifyChanges(
      [{filename: 'docs/specs/AST-001-x/spec.md'}],
      {expectedCount: 3001},
    );
    expect(result.complete).toBe(false);
    expect(result.specOnly).toBe(false);
    expect(result.touchesKnowledgeRecords).toBe(true);
  });

  it('fails closed when an expected API file list is empty', () => {
    const result = classifyChanges([], {expectedCount: 1});
    expect(result.complete).toBe(false);
    expect(result.specOnly).toBe(false);
    expect(result.touchesKnowledgeRecords).toBe(true);
  });

  it('checks both sides of a rename', () => {
    expect(
      classifyChanges([
        {
          filename: 'packages/core/src/Selector/Selector.spec.md',
          previous_filename: 'packages/core/src/Selector/Selector.tsx',
        },
      ]).specOnly,
    ).toBe(false);
  });

  it('parses name-status renames without losing the previous path', () => {
    expect(
      parseNameStatus(
        'A\tdocs/specs/AST-001-x/spec.md\nR100\told.ts\tpackages/core/src/X/X.spec.md\n',
      ),
    ).toEqual([
      {filename: 'docs/specs/AST-001-x/spec.md'},
      {filename: 'packages/core/src/X/X.spec.md', previous_filename: 'old.ts'},
    ]);
  });
});
