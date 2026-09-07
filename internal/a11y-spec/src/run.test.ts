// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run.test.ts
 * @input Uses ./contract, ./run, ./report and a stub harness
 * @output Proof that a known failure changes only its own exact result, that an
 *   unobservable layer is reported rather than passed, and that the report
 *   keeps its facts apart.
 * @position Runner self-test. These are the rules a migration depends on, so
 *   they are tested directly rather than through a component.
 *
 * `docs/specs/AST-021/spec.md` FR9 is the rule under test: "A different error,
 * another state, a new expectation, or a wider failure MUST fail. When the
 * expectation starts passing, CI MUST report an unexpected pass."
 */

import {describe, expect, it, vi} from 'vitest';
import {definePattern, type PatternContract} from './contract';
import type {EvidenceLayer, Harness, Subject} from './harness';
import {blockingResults, formatReport, summarize} from './report';
import {runBinding, type KnownFailure} from './run';

interface Facts {
  readonly applicable: boolean;
}

const subject = {} as Subject;

function harness(observes: readonly EvidenceLayer[]): Harness {
  return {
    name: 'stub',
    observes,
    subject: async () => subject,
    click: async () => {},
    press: async () => {},
    resetFocus: async () => {},
  };
}

function contractThat(
  behaviour: () => void,
  overrides: {
    layer?: EvidenceLayer;
    alsoNeeds?: readonly EvidenceLayer[];
    enforcement?: 'required' | 'advisory';
  } = {},
): PatternContract<Facts> {
  return definePattern<Facts>({
    pattern: 'probe',
    url: 'https://example.invalid/probe',
    scope: 'A stub pattern used to test the runner.',
    exemptions: {},
    expectations: [
      {
        id: 'probe.outcome.observed',
        outcome: 'The stub outcome happens.',
        sources: [
          {
            standard: 'wcag',
            id: '4.1.2',
            name: 'Name, Role, Value',
            level: 'A',
            url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
          },
        ],
        covers: ['4.1.2-name-role-value'],
        appliesWhen: {
          condition: 'the state is applicable',
          test: facts => facts.applicable,
        },
        evidenceLayer: overrides.layer ?? 'dom',
        alsoNeeds: overrides.alsoNeeds,
        enforcement: overrides.enforcement ?? 'required',
        advisoryBecause:
          overrides.enforcement === 'advisory'
            ? 'Nothing adopts the stub outcome.'
            : undefined,
        run: async () => behaviour(),
      },
    ],
  });
}

function knownFailure(overrides: Partial<KnownFailure> = {}): KnownFailure {
  return {
    expectation: 'probe.outcome.observed',
    binding: 'Stub',
    state: 'default',
    evidenceLayer: 'dom',
    failureIncludes: 'the stub outcome is missing',
    userImpact: 'The stub does nothing for the user.',
    issue: 'https://github.com/facebook/astryx/issues/1',
    reason: 'Recorded by the migration; the fix is its own change.',
    ...overrides,
  };
}

async function run(
  contract: PatternContract<Facts>,
  options: {
    facts?: Facts;
    knownFailures?: readonly KnownFailure[];
    observes?: readonly EvidenceLayer[];
    state?: string;
  } = {},
) {
  return runBinding({
    contract,
    binding: 'Stub',
    state: options.state ?? 'default',
    facts: options.facts ?? {applicable: true},
    mount: async () => harness(options.observes ?? ['unit', 'dom']),
    knownFailures: options.knownFailures,
  });
}

const missing = () => {
  throw new Error('the stub outcome is missing entirely');
};

describe('runBinding', () => {
  it('passes when the outcome happens', async () => {
    const result = await run(contractThat(() => {}));
    expect(result.results[0]?.status).toBe('pass');
    expect(blockingResults([result])).toEqual([]);
  });

  it('fails when the outcome is absent, and that blocks', async () => {
    const result = await run(contractThat(missing));
    expect(result.results[0]?.status).toBe('fail');
    expect(result.results[0]?.detail).toContain('the stub outcome is missing');
    expect(blockingResults([result])).toHaveLength(1);
  });

  it('does not run an expectation this state cannot change', async () => {
    const behaviour = vi.fn();
    const result = await run(contractThat(behaviour), {
      facts: {applicable: false},
    });
    expect(behaviour).not.toHaveBeenCalled();
    expect(result.results[0]?.status).toBe('not-applicable');
    expect(result.results[0]?.detail).toContain('applies when');
  });

  it('reports an unobservable evidence layer instead of passing or skipping it', async () => {
    const behaviour = vi.fn();
    const result = await run(
      contractThat(behaviour, {layer: 'accessibility-tree'}),
      {observes: ['unit', 'dom']},
    );
    expect(behaviour).not.toHaveBeenCalled();
    expect(result.results[0]?.status).toBe('unrun');
    expect(result.results[0]?.detail).toContain('cannot observe');
    expect(blockingResults([result])).toEqual([]);
  });

  it('reports unrun when a FURTHER layer the expectation reads is out of reach', async () => {
    const behaviour = vi.fn();
    // The shape of every interaction expectation: the claim is a real-browser
    // one, but the answer is read out of the accessibility tree. A harness with
    // the browser and no tree cannot run it, and must not fail it either.
    const result = await run(
      contractThat(behaviour, {
        layer: 'real-browser',
        alsoNeeds: ['accessibility-tree'],
      }),
      {observes: ['unit', 'dom', 'real-browser']},
    );
    expect(behaviour).not.toHaveBeenCalled();
    expect(result.results[0]?.status).toBe('unrun');
    expect(result.results[0]?.missingLayers).toEqual(['accessibility-tree']);
    expect(result.results[0]?.detail).toContain('accessibility-tree');
    expect(blockingResults([result])).toEqual([]);
  });

  it('runs once every layer it reads is observable', async () => {
    const behaviour = vi.fn();
    const result = await run(
      contractThat(behaviour, {
        layer: 'real-browser',
        alsoNeeds: ['accessibility-tree'],
      }),
      {observes: ['unit', 'dom', 'accessibility-tree', 'real-browser']},
    );
    expect(behaviour).toHaveBeenCalled();
    expect(result.results[0]?.status).toBe('pass');
  });

  it('reports an advisory failure without blocking', async () => {
    const result = await run(contractThat(missing, {enforcement: 'advisory'}));
    expect(result.results[0]?.status).toBe('fail');
    expect(blockingResults([result])).toEqual([]);
  });

  describe('known failures', () => {
    it('records the exact recorded failure as debt, never as a pass', async () => {
      const result = await run(contractThat(missing), {
        knownFailures: [knownFailure()],
      });
      expect(result.results[0]?.status).toBe('known-failure');
      expect(result.results[0]?.knownFailure?.issue).toContain('issues/1');
      expect(blockingResults([result])).toEqual([]);
    });

    it('fails on a different failure, rather than widening to cover it', async () => {
      const result = await run(
        contractThat(() => {
          throw new Error('the stub outcome happened twice');
        }),
        {knownFailures: [knownFailure()]},
      );
      expect(result.results[0]?.status).toBe('fail');
      expect(result.results[0]?.detail).toContain(
        'it covers a different failure',
      );
      expect(blockingResults([result])).toHaveLength(1);
    });

    it('fails in a state the record does not name', async () => {
      const result = await run(contractThat(missing), {
        state: 'another-state',
        knownFailures: [knownFailure()],
      });
      expect(result.results[0]?.status).toBe('fail');
    });

    it('fails at an evidence layer the record does not name', async () => {
      const result = await run(contractThat(missing), {
        knownFailures: [knownFailure({evidenceLayer: 'real-browser'})],
      });
      expect(result.results[0]?.status).toBe('fail');
    });

    it('reports an unexpected pass when the recorded failure stops happening', async () => {
      const result = await run(
        contractThat(() => {}),
        {
          knownFailures: [knownFailure()],
        },
      );
      expect(result.results[0]?.status).toBe('unexpected-pass');
      expect(result.results[0]?.detail).toContain('remove the known-failure');
      expect(blockingResults([result])).toHaveLength(1);
    });
  });

  it('lets a broken mount surface instead of absorbing it as a result', async () => {
    await expect(
      runBinding({
        contract: contractThat(() => {}),
        binding: 'Stub',
        state: 'default',
        facts: {applicable: true},
        mount: async () => {
          throw new Error('the fixture never mounted');
        },
        knownFailures: [knownFailure()],
      }),
    ).rejects.toThrow('the fixture never mounted');
  });
});

describe('the report keeps its facts apart', () => {
  it('counts each status separately and quotes no score', async () => {
    const contract = contractThat(missing);
    const failing = await run(contract);
    const known = await run(contract, {
      state: 'known',
      knownFailures: [knownFailure({state: 'known'})],
    });
    const skipped = await run(contract, {facts: {applicable: false}});

    const report = summarize(contract, [failing, known, skipped]);
    expect(report.counts).toEqual({
      pass: 0,
      fail: 1,
      knownFailure: 1,
      unexpectedPass: 0,
      notApplicable: 1,
      unrun: 0,
    });

    const text = formatReport(report);
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/score/i);
    expect(text).toContain('known-failure 1');
  });

  it('names the layers that were not run, so a green run is not read as full coverage', async () => {
    const contract = contractThat(() => {}, {layer: 'real-browser'});
    const report = summarize(contract, [await run(contract)]);
    expect(report.unrunLayers).toEqual(['real-browser']);
    expect(formatReport(report)).toContain(
      'unrun evidence layers: real-browser',
    );
  });

  it('names every layer that was out of reach, not just the one the expectation is filed under', async () => {
    const contract = contractThat(() => {}, {
      layer: 'real-browser',
      alsoNeeds: ['accessibility-tree'],
    });
    const report = summarize(contract, [await run(contract)]);
    expect(report.unrunLayers).toEqual(['accessibility-tree', 'real-browser']);
  });
});
