// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {parseExecutionProvenanceV1} from '../src/provenance';
import {
  createSetupProvenance,
  expandSetupMatrix,
  fixtureManifestSha256,
  setupCellKey,
  sha256Text,
  taskContractText,
  validatePromptContracts,
  validateSetupMatrixConfig,
} from './setup-matrix.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const matrix = JSON.parse(
  fs.readFileSync(path.join(HERE, 'matrix.json'), 'utf8'),
);
const prompts = JSON.parse(
  fs.readFileSync(path.join(HERE, 'prompts.json'), 'utf8'),
).prompts;
const probes = JSON.parse(
  fs.readFileSync(path.join(HERE, 'probes.json'), 'utf8'),
);

function recipe(fixture) {
  return JSON.parse(
    fs.readFileSync(
      path.join(HERE, '..', 'fixture-recipes', `${fixture}.json`),
      'utf8',
    ),
  );
}

describe('setup execution matrix', () => {
  it('uses three fixtures, four paired bundles, and K=2 in every stage', () => {
    expect(() => validateSetupMatrixConfig(matrix)).not.toThrow();
    expect(matrix.fixtures).toHaveLength(3);
    expect(matrix.bundles).toHaveLength(4);
    expect(matrix.bundles.map(bundle => bundle.effort)).toEqual([
      'high',
      'high',
      'high',
      'high',
    ]);
    expect(new Set(matrix.bundles.map(bundle => bundle.model))).toEqual(
      new Set(['claude-family', 'gpt-family']),
    );
    expect(matrix.stages.map(stage => stage.reps)).toEqual([2, 2, 2]);
  });

  it('keeps the Codex bundle configured and explicitly blocked', () => {
    expect(
      matrix.bundles.find(bundle => bundle.id === 'codex-gpt'),
    ).toMatchObject({harness: 'codex', blocked: true});
    const entries = expandSetupMatrix(matrix, {
      stage: 'confirmation',
      fixtures: ['tailwind-v4-control'],
      prompts: ['s0'],
      bundles: ['codex-gpt'],
      reps: 1,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({blocked: true});
  });

  it('validates every field-granular intended change against supported fixture probes', () => {
    expect(() =>
      validatePromptContracts(prompts, probes, matrix),
    ).not.toThrow();
    const allFields = prompts.flatMap(prompt =>
      prompt.contract.allowedHostChanges.flatMap(allowed => allowed.fields),
    );
    // Position offsets, plus block-axis growth where a task mandates inserting
    // something into a host container. Nothing else is exemptible.
    expect(
      allFields.every(
        field => field.startsWith('geometry.') || field === 'height',
      ),
    ).toBe(true);
    expect(allFields).not.toContain('geometry.width');
    expect(allFields).not.toContain('width');
    expect(allFields).not.toContain('color');
    // Container text is never exempted outright, only ever insertion-only.
    expect(allFields).not.toContain('text');

    // One per protected class: a computed style, an inline-axis dimension,
    // and container text, which is only ever insertion-only.
    for (const field of ['color', 'width', 'text']) {
      const invalid = structuredClone(prompts);
      invalid
        .find(prompt => prompt.id === 's1')
        .contract.allowedHostChanges.push({
          fixture: 'tailwind-v4-control',
          probe: 'primary-action',
          fields: [field],
        });
      expect(() => validatePromptContracts(invalid, probes, matrix)).toThrow(
        new RegExp(`cannot allow protected host field ${field}`),
      );
    }
  });

  it('accepts the s5 insertion allowance and nothing broader', () => {
    const s5 = prompts.find(prompt => prompt.id === 's5');
    expect(s5.contract.allowedHostChanges).toEqual([
      expect.objectContaining({
        fixture: 'enterprise-scoped-synthetic',
        probe: 'host-shell',
        fields: ['height', 'geometry.height', 'geometry.bottom'],
        textInsertionOnly: true,
      }),
    ]);

    const badFlag = structuredClone(prompts);
    badFlag.find(
      prompt => prompt.id === 's5',
    ).contract.allowedHostChanges[0].textInsertionOnly = 'yes';
    expect(() => validatePromptContracts(badFlag, probes, matrix)).toThrow(
      /textInsertionOnly must be a boolean/,
    );
  });

  it('rejects an intended change for a nonexistent probe or unsupported fixture', () => {
    const missingProbe = structuredClone(prompts);
    missingProbe.find(
      prompt => prompt.id === 's1',
    ).contract.allowedHostChanges[0].probe = 'missing';
    expect(() => validatePromptContracts(missingProbe, probes, matrix)).toThrow(
      /allows unknown probe/,
    );

    const wrongFixture = structuredClone(prompts);
    wrongFixture
      .find(prompt => prompt.id === 's4')
      .contract.allowedHostChanges.push({
        fixture: 'tailwind-v4-control',
        probe: 'primary-action',
        fields: ['geometry.x'],
      });
    expect(() => validatePromptContracts(wrongFixture, probes, matrix)).toThrow(
      /unsupported fixture/,
    );
  });

  it('requires s2 to replace one validated host probe in every fixture', () => {
    const s2 = prompts.find(prompt => prompt.id === 's2');
    expect(
      new Set(
        s2.contract.replacedHostProbes.map(
          replaced =>
            `${replaced.fixture}:${replaced.probe}:${replaced.result}`,
        ),
      ),
    ).toEqual(
      new Set([
        'tailwind-v4-control:status:astryx-status',
        'shadcn-tailwind-v4-established:status:astryx-status',
        'enterprise-scoped-synthetic:status:astryx-status',
      ]),
    );

    const incomplete = structuredClone(prompts);
    incomplete
      .find(prompt => prompt.id === 's2')
      .contract.replacedHostProbes.pop();
    expect(() => validatePromptContracts(incomplete, probes, matrix)).toThrow(
      /must replace exactly one host probe/,
    );

    const mismatchedText = structuredClone(prompts);
    mismatchedText
      .find(prompt => prompt.id === 's2')
      .contract.replacedHostProbes.push({
        fixture: 'tailwind-v4-control',
        probe: 'page-title',
        result: 'astryx-status',
      });
    expect(() =>
      validatePromptContracts(mismatchedText, probes, matrix),
    ).toThrow(/must preserve its host text/);

    const duplicateFixture = structuredClone(prompts);
    const duplicateS2 = duplicateFixture.find(prompt => prompt.id === 's2');
    duplicateS2.contract.results.push({
      name: 'astryx-title',
      exact: 1,
      preserveTextFromHostProbe: 'page-title',
    });
    duplicateS2.contract.replacedHostProbes.push({
      fixture: 'tailwind-v4-control',
      probe: 'page-title',
      result: 'astryx-title',
    });
    expect(() =>
      validatePromptContracts(duplicateFixture, probes, matrix),
    ).toThrow(/must replace exactly one host probe/);

    const unknownResult = structuredClone(prompts);
    unknownResult.find(
      prompt => prompt.id === 's2',
    ).contract.replacedHostProbes[0].result = 'missing-result';
    expect(() =>
      validatePromptContracts(unknownResult, probes, matrix),
    ).toThrow(/references unknown result/);
  });

  it('allows only validated overlay bounds and rejects style exemptions', () => {
    const overlayFields = prompts.flatMap(prompt =>
      prompt.contract.allowedOverlayChanges.flatMap(allowed => allowed.fields),
    );
    expect(overlayFields.length).toBeGreaterThan(0);
    expect(overlayFields.every(field => field.startsWith('geometry.'))).toBe(
      true,
    );

    const backdropStyle = structuredClone(prompts);
    backdropStyle
      .find(prompt => prompt.id === 's4')
      .contract.allowedOverlayChanges.push({
        fixture: 'shadcn-tailwind-v4-established',
        surface: 'dialog-backdrop',
        fields: ['backgroundColor'],
      });
    expect(() =>
      validatePromptContracts(backdropStyle, probes, matrix),
    ).toThrow(/cannot allow protected overlay field backgroundColor/);

    const missingSurface = structuredClone(prompts);
    missingSurface.find(
      prompt => prompt.id === 's5',
    ).contract.allowedOverlayChanges[0].surface = 'missing';
    expect(() =>
      validatePromptContracts(missingSurface, probes, matrix),
    ).toThrow(/allows unknown overlay/);
  });

  it.each([
    'tailwind-v4-control',
    'shadcn-tailwind-v4-established',
    'enterprise-scoped-synthetic',
  ])('renders an explicit s2 replacement contract for %s', fixture => {
    const text = taskContractText(
      prompts.find(prompt => prompt.id === 's2'),
      fixture,
    );
    expect(text).toContain(
      'The following host probes are intentional replacements for this fixture. Keep every other existing `data-vibe-probe` attribute:',
    );
    expect(text).toContain(
      '- Replace `data-vibe-probe="status"`: remove that probe attribute from the original host treatment so it no longer exists as a host probe, and put `data-vibe-result="astryx-status"` on its replacement. Preserve the original probe text exactly.',
    );
    expect(text).not.toContain(
      'Keep every existing `data-vibe-probe` attribute on pre-existing host UI.',
    );
    expect(text.match(/data-vibe-result="astryx-status"/g)).toHaveLength(1);
  });

  it('renders aliased surface roles on one unambiguous marker instruction', () => {
    const text = taskContractText(
      prompts.find(prompt => prompt.id === 's5'),
      'enterprise-scoped-synthetic',
    );
    const markerLines = text
      .split('\n')
      .filter(line => line.includes('data-vibe-result'));
    const dialogLines = markerLines.filter(line =>
      line.includes('data-vibe-result="astryx-dialog-surface"'),
    );
    expect(dialogLines).toHaveLength(1);
    expect(dialogLines[0]).toContain(
      'the astryx dialog surface (dialog surface)',
    );
    expect(dialogLines[0]).toContain(
      'the astryx dialog backdrop (the `::backdrop` of this element)',
    );
    expect(dialogLines[0].indexOf('dialog surface')).toBeLessThan(
      dialogLines[0].indexOf('dialog backdrop'),
    );
    expect(dialogLines[0]).not.toMatch(/on the astryx dialog backdrop/);
  });

  it('prepares 48 separation cells, then 400 new guidance cells', () => {
    const separation = expandSetupMatrix(matrix, {stage: 'separation'});
    const guidance = expandSetupMatrix(matrix, {stage: 'guidance'});
    expect(separation).toHaveLength(48);
    expect(guidance).toHaveLength(400);

    const reused = new Set(separation.map(setupCellKey));
    expect(guidance.some(entry => reused.has(setupCellKey(entry)))).toBe(false);
    expect(
      new Set([...separation, ...guidance].map(setupCellKey)),
    ).toHaveLength(448);
  });

  it('requires 112 fresh candidate confirmation cells', () => {
    const confirmation = expandSetupMatrix(matrix, {stage: 'confirmation'});
    expect(confirmation).toHaveLength(112);
    expect(new Set(confirmation.map(entry => entry.fixture))).toEqual(
      new Set(matrix.fixtures),
    );
    expect(new Set(confirmation.map(entry => entry.prompt))).toEqual(
      new Set(['s0', 's1', 's2', 's3', 's4', 's5']),
    );
    expect(new Set(confirmation.map(entry => entry.condition))).toEqual(
      new Set(['candidate']),
    );
    expect(
      confirmation.every(entry => entry.id.startsWith('confirmation__')),
    ).toBe(true);
  });

  it('applies each cross-system prompt only to its supported established fixture', () => {
    const confirmation = expandSetupMatrix(matrix, {
      stage: 'confirmation',
      prompts: ['s4', 's5'],
      reps: 1,
    });
    expect(
      new Set(confirmation.map(entry => `${entry.prompt}:${entry.fixture}`)),
    ).toEqual(
      new Set([
        's4:shadcn-tailwind-v4-established',
        's5:enterprise-scoped-synthetic',
      ]),
    );
    expect(confirmation).toHaveLength(2 * 4);
  });

  it('keeps harness/model bundles paired instead of taking their cross-product', () => {
    const entries = expandSetupMatrix(matrix, {stage: 'separation'});
    expect(new Set(entries.map(entry => entry.bundle))).toEqual(
      new Set([
        'native-claude',
        'claude-code-claude',
        'native-gpt',
        'codex-gpt',
      ]),
    );
  });

  it('emits a sidecar accepted by the shared provenance parser', () => {
    const entry = expandSetupMatrix(matrix, {
      stage: 'separation',
      fixtures: [matrix.fixtures[0]],
      conditions: ['floor'],
      prompts: ['s1'],
      bundles: [matrix.bundles[0].id],
      reps: 1,
    })[0];
    const fixtureSha256 = fixtureManifestSha256(recipe(entry.fixture));
    const sidecar = createSetupProvenance({
      entry,
      taskSha256: sha256Text('stable task'),
      fixtureSha256,
      environmentHash: sha256Text(`${fixtureSha256}:${entry.condition}`),
    });
    expect(parseExecutionProvenanceV1(sidecar)).toMatchObject({
      task: {id: 's1'},
      fixture: {id: entry.fixture},
      condition: 'floor',
      executor: {harness: entry.harness, model: entry.model},
      execution: {status: 'prepared'},
      matrix: {stage: 'separation', bundle: entry.bundle},
      rep: 1,
    });
  });

  it('rejects invalid or empty selections', () => {
    expect(() =>
      expandSetupMatrix(matrix, {stage: 'separation', reps: 0}),
    ).toThrow(/positive integer/);
    expect(() =>
      expandSetupMatrix(matrix, {
        stage: 'separation',
        fixtures: ['missing-fixture'],
      }),
    ).toThrow(/unknown fixture/);
    expect(() =>
      expandSetupMatrix(matrix, {
        stage: 'confirmation',
        fixtures: ['tailwind-v4-control'],
        prompts: ['s4'],
      }),
    ).toThrow(/no supported fixture-prompt cells/);
  });

  it('rejects duplicate bundle labels and invalid reuse references', () => {
    const duplicate = structuredClone(matrix);
    duplicate.bundles[1].id = duplicate.bundles[0].id;
    expect(() => validateSetupMatrixConfig(duplicate)).toThrow(
      /bundle ids must not contain duplicates/,
    );

    const forwardReuse = structuredClone(matrix);
    forwardReuse.stages[0].reuseFromStages = ['confirmation'];
    expect(() => validateSetupMatrixConfig(forwardReuse)).toThrow(
      /only an earlier stage/,
    );
  });
});
