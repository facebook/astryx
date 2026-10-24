// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verifies the schema v5 component-record migration.
 * @input Record texts in each starting state.
 * @output Confirms the rewrite adds platform_of after id, bumps the schema,
 *   leaves everything else byte-identical, and is idempotent.
 * @position Regression coverage for scripts/migrate-knowledge-v5.mjs.
 */

import {describe, expect, it} from 'vitest';
import {migrateComponentRecord} from './migrate-knowledge-v5.mjs';

const record = (fields, body = '\n# Button component contract\n\nBody.\n') =>
  `---\n${fields.join('\n')}\n---\n${body}`;

describe('schema v5 component-record migration', () => {
  it('bumps the schema and adds platform_of after id, changing nothing else', () => {
    const before = record([
      'schema_version: 3',
      'template_version: 7',
      'kind: component',
      'id: component:Button',
      'authority: current',
    ]);
    expect(migrateComponentRecord(before)).toBe(
      record([
        'schema_version: 5',
        'template_version: 7',
        'kind: component',
        'id: component:Button',
        'platform_of: null',
        'authority: current',
      ]),
    );
  });

  it('is idempotent and leaves other kinds alone', () => {
    const migrated = migrateComponentRecord(
      record(['schema_version: 3', 'kind: component', 'id: component:Button']),
    );
    expect(migrateComponentRecord(migrated)).toBeNull();
    expect(
      migrateComponentRecord(
        record(['schema_version: 3', 'kind: module', 'id: module:Button/x']),
      ),
    ).toBeNull();
    expect(migrateComponentRecord('# No frontmatter\n')).toBeNull();
  });

  it('keeps an existing platform_of', () => {
    expect(
      migrateComponentRecord(
        record([
          'schema_version: 3',
          'kind: component',
          'id: component:swift/Button',
          'platform_of: component:Button',
        ]),
      ),
    ).toBe(
      record([
        'schema_version: 5',
        'kind: component',
        'id: component:swift/Button',
        'platform_of: component:Button',
      ]),
    );
  });
});
