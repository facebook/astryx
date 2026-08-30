// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {
  parseKnowledgeDocument,
  validateKnowledgeRoot,
  validateSchemaEvolution,
} from './check-knowledge.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');
const roots = [];

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-knowledge-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'docs/schemas/knowledge'), {recursive: true});
  fs.mkdirSync(path.join(root, 'docs/templates'), {recursive: true});
  fs.cpSync(
    path.join(repoRoot, 'docs/templates/knowledge'),
    path.join(root, 'docs/templates/knowledge'),
    {recursive: true},
  );
  fs.copyFileSync(
    path.join(repoRoot, 'docs/schemas/knowledge/v1.json'),
    path.join(root, 'docs/schemas/knowledge/v1.json'),
  );
  for (const relative of [
    'docs/specs',
    'docs/families',
    'docs/architecture',
    'packages/core/src',
    'packages/lab/src',
  ]) {
    fs.mkdirSync(path.join(root, relative), {recursive: true});
  }
  fs.mkdirSync(path.join(root, '.github'), {recursive: true});
  fs.copyFileSync(
    path.join(repoRoot, '.github/DESIGNOWNERS'),
    path.join(root, '.github/DESIGNOWNERS'),
  );
  return root;
}

function addSchemaVersion(root, version) {
  const latest = JSON.parse(
    fs.readFileSync(path.join(root, 'docs/schemas/knowledge/v1.json'), 'utf8'),
  );
  latest.schemaVersion = version;
  fs.writeFileSync(
    path.join(root, `docs/schemas/knowledge/v${version}.json`),
    `${JSON.stringify(latest, null, 2)}\n`,
  );
}

function componentRecord(overrides = {}) {
  const values = {
    schema_version: '1',
    template_version: '1',
    kind: 'component',
    id: 'component:Button',
    authority: 'draft',
    archive_reason: 'null',
    superseded_by: 'null',
    approved_by: 'null',
    approved_at: 'null',
    owners: '[owner]',
    review_triggers: '[behavior]',
    verified_by: '[Button.test.tsx]',
    families: '[family:actions]',
    design_specs: '[design:actions]',
    architecture: '[architecture:components]',
    contributing: '[contributing:api]',
    system_specs: '[]',
    ...overrides,
  };
  const frontmatter = Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const sections = [
    'Intent',
    'Compatibility and migration',
    'Ownership boundary',
    'Public concepts',
    'Behavioral and layout contract',
    'Accessibility contract',
    'Design relationships',
    'Family and system relationships',
    'Verification map',
    'Decision log',
    'Open questions',
    'Content boundary',
  ]
    .map(section => `## ${section}\n\nBody.`)
    .join('\n\n');
  return `---\n${frontmatter}\n---\n\n# Button component contract\n\n${sections}\n`;
}

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

describe('schema evolution', () => {
  it('allows appending a higher schema version', () => {
    expect(
      validateSchemaEvolution(
        new Map([['docs/schemas/knowledge/v1.json', 'one']]),
        new Map([
          ['docs/schemas/knowledge/v1.json', 'one'],
          ['docs/schemas/knowledge/v2.json', 'two'],
        ]),
      ),
    ).toEqual([]);
  });

  it('rejects rewriting or deleting a published schema version', () => {
    expect(
      validateSchemaEvolution(
        new Map([
          ['docs/schemas/knowledge/v1.json', 'one'],
          ['docs/schemas/knowledge/v2.json', 'two'],
        ]),
        new Map([['docs/schemas/knowledge/v1.json', 'changed']]),
      ).join('\n'),
    ).toMatch(/immutable.*append-only/s);
  });
});

describe('knowledge validation', () => {
  it('parses only top-level frontmatter and level-two sections', () => {
    const document = parseKnowledgeDocument(
      '---\nschema_version: 1\nowners:\n  [\n    one,\n    two,\n  ]\n---\n\n## Intent\n',
    );
    expect(document.frontmatter.get('schema_version')).toBe(1);
    expect(document.frontmatter.get('owners')).toEqual(['one', 'two']);
    expect(document.sections).toEqual(['Intent']);
  });

  it('accepts aligned templates with no records', () => {
    expect(validateKnowledgeRoot(fixtureRoot())).toEqual([]);
  });

  it('rejects a structural template change without a schema update', () => {
    const root = fixtureRoot();
    const template = path.join(
      root,
      'docs/templates/knowledge/component-spec.md',
    );
    fs.appendFileSync(template, '\n## Undeclared section\n');
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /template section order must exactly match the schema/,
    );
  });

  it('rejects a schema whose filename and declared version disagree', () => {
    const root = fixtureRoot();
    const schemaPath = path.join(root, 'docs/schemas/knowledge/v1.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    schema.schemaVersion = 2;
    fs.writeFileSync(schemaPath, `${JSON.stringify(schema)}\n`);
    expect(() => validateKnowledgeRoot(root)).toThrow(
      /declares schemaVersion 2/,
    );
  });

  it('accepts a draft component record on the current schema', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'Button.spec.md'), componentRecord());
    expect(validateKnowledgeRoot(root)).toEqual([]);
  });

  it('rejects duplicate authority fields', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord().replace(
        'authority: draft',
        'authority: draft\nauthority: "current"',
      ),
    );
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /duplicate authority fields|duplicate frontmatter field authority/,
    );
  });

  it('requires explicit approval for a current record', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({authority: 'current'}),
    );
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /require approved_by/,
    );
  });

  it('rejects an unauthorized current approval claim', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({
        authority: 'current',
        approved_by: 'someone-else',
        approved_at: '2026-08-30',
      }),
    );
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(/authorized owner/);
  });

  it('accepts a current record with an authorized dated approval', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({
        authority: 'current',
        approved_by: 'cixzhang',
        approved_at: '2026-08-30',
      }),
    );
    expect(validateKnowledgeRoot(root)).toEqual([]);
  });

  it('requires a replacement for a superseded archive', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({authority: 'archived', archive_reason: 'superseded'}),
    );
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /require superseded_by/,
    );
  });

  it('rejects a record claiming a future template version', () => {
    const root = fixtureRoot();
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({template_version: '2'}),
    );
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /template_version 2 is newer than 1/,
    );
  });

  it('rejects active records on an old schema', () => {
    const root = fixtureRoot();
    addSchemaVersion(root, 0);
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({schema_version: '0'}),
    );
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /active records must use latest schema_version 1/,
    );
  });

  it('allows archived records to retain an older available schema', () => {
    const root = fixtureRoot();
    addSchemaVersion(root, 0);
    const directory = path.join(root, 'packages/core/src/Button');
    fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(directory, 'Button.spec.md'),
      componentRecord({
        schema_version: '0',
        authority: 'archived',
        archive_reason: 'historical',
      }),
    );
    expect(validateKnowledgeRoot(root)).toEqual([]);
  });

  it('accepts a DESIGNOWNER approval claim on a current design record', () => {
    const root = fixtureRoot();
    const template = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/design-spec.md'),
      'utf8',
    );
    const record = template
      .replace('id: design:<surface>', 'id: design:button')
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: rubyycheung')
      .replace('approved_at: null', 'approved_at: 2026-08-30');
    fs.mkdirSync(path.join(root, 'docs/design'), {recursive: true});
    fs.writeFileSync(path.join(root, 'docs/design/button.md'), record);
    expect(validateKnowledgeRoot(root).join('\n')).not.toMatch(
      /approved_by to name an authorized owner/,
    );
  });

  it('requires current design records to reference current architecture', () => {
    const root = fixtureRoot();
    const template = fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/design-spec.md'),
      'utf8',
    );
    const record = template
      .replace('id: design:<surface>', 'id: design:button')
      .replace('authority: draft', 'authority: current')
      .replace('approved_by: null', 'approved_by: cixzhang')
      .replace('approved_at: null', 'approved_at: 2026-08-30')
      .replace(
        'architecture: [architecture:<surface>]',
        'architecture: [architecture:missing]',
      );
    fs.mkdirSync(path.join(root, 'docs/design'), {recursive: true});
    fs.writeFileSync(path.join(root, 'docs/design/button.md'), record);
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /architecture reference architecture:missing does not resolve/,
    );
  });

  it('rejects duplicate logical ids', () => {
    const root = fixtureRoot();
    for (const name of ['Button', 'Action']) {
      const directory = path.join(root, `packages/core/src/${name}`);
      fs.mkdirSync(directory);
      fs.writeFileSync(
        path.join(directory, `${name}.spec.md`),
        componentRecord(),
      );
    }
    expect(validateKnowledgeRoot(root).join('\n')).toMatch(
      /duplicate id component:Button/,
    );
  });
});
