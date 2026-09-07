// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contract.test.ts
 * @input Uses ./contract and ./checklist
 * @output Proof that `definePattern` refuses a contract nobody could audit.
 * @position Schema self-test. Each case here is a way an expectation could look
 *   finished and prove nothing.
 *
 * `docs/specs/AST-020/spec.md` FR4, FR5, FR6, and FR9. The record's own failure
 * expectation is "a check lacks a source or layer, passes from an unsupported
 * harness, depends on private markup, or one-way behavior hides a reverse-path
 * failure" — the first two are refused here at construction.
 */

import {describe, expect, it} from 'vitest';
import {
  definePattern,
  unansweredDimensions,
  type Expectation,
  type PatternContract,
} from './contract';
import {CHECKLIST_DIMENSIONS} from './checklist';

const WCAG_4_1_2 = {
  standard: 'wcag',
  id: '4.1.2',
  name: 'Name, Role, Value',
  level: 'A',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
} as const;

const APG_SOMETHING = {
  standard: 'apg',
  pattern: 'probe',
  requirement: 'The probe does the probe thing.',
  url: 'https://example.invalid/probe',
} as const;

function expectation(
  overrides: Partial<Expectation<unknown>> = {},
): Expectation<unknown> {
  return {
    id: 'probe.outcome.observed',
    outcome: 'The probe outcome happens.',
    sources: [WCAG_4_1_2],
    covers: ['4.1.2-name-role-value'],
    appliesWhen: {condition: 'always', test: () => true},
    evidenceLayer: 'dom',
    enforcement: 'required',
    run: async () => {},
    ...overrides,
  };
}

function pattern(
  overrides: Partial<PatternContract<unknown>> = {},
): () => PatternContract<unknown> {
  return () =>
    definePattern<unknown>({
      pattern: 'probe',
      url: 'https://example.invalid/probe',
      scope: 'A stub pattern.',
      expectations: [expectation()],
      exemptions: {},
      ...overrides,
    });
}

describe('definePattern', () => {
  it('accepts a traceable, applicable, layered, enforceable expectation', () => {
    expect(pattern()).not.toThrow();
  });

  it('refuses an expectation with no user outcome', () => {
    expect(pattern({expectations: [expectation({outcome: '  '})]})).toThrow(
      /states no user outcome/,
    );
  });

  it('refuses an expectation that cites nothing', () => {
    expect(
      pattern({
        expectations: [
          expectation({
            sources: [] as unknown as Expectation<unknown>['sources'],
          }),
        ],
      }),
    ).toThrow(/cites no normative source/);
  });

  it('refuses an APG-primary expectation that names no WCAG outcome', () => {
    expect(
      pattern({expectations: [expectation({sources: [APG_SOMETHING]})]}),
    ).toThrow(/must name the WCAG 2.2 outcome it supports/);
  });

  it('accepts an APG-primary expectation once it names the WCAG outcome', () => {
    expect(
      pattern({
        expectations: [
          expectation({
            sources: [APG_SOMETHING, WCAG_4_1_2],
            wcagOutcome: 'The probe state is programmatically available.',
          }),
        ],
      }),
    ).not.toThrow();
  });

  it('refuses an expectation with no applicability condition', () => {
    expect(
      pattern({
        expectations: [
          expectation({appliesWhen: {condition: '', test: () => true}}),
        ],
      }),
    ).toThrow(/states no applicability condition/);
  });

  it('refuses an unknown evidence layer', () => {
    expect(
      pattern({
        expectations: [
          expectation({
            evidenceLayer: 'vibes' as Expectation<unknown>['evidenceLayer'],
          }),
        ],
      }),
    ).toThrow(/unknown evidence layer/);
  });

  it('refuses a required expectation nothing has adopted', () => {
    expect(
      pattern({
        expectations: [
          expectation({
            sources: [APG_SOMETHING],
            wcagOutcome: 'The probe state is programmatically available.',
            enforcement: 'required',
          }),
        ],
      }),
    ).toThrow(/cites no WCAG 2.2 A\/AA criterion and no current Astryx record/);
  });

  it('refuses an advisory expectation that does not say why it is advisory', () => {
    expect(
      pattern({expectations: [expectation({enforcement: 'advisory'})]}),
    ).toThrow(/does not say why the outcome is not adopted as a gate/);
  });

  it('refuses an expectation that carries no completeness dimension', () => {
    expect(pattern({expectations: [expectation({covers: []})]})).toThrow(
      /carries no completeness dimension/,
    );
  });

  it('refuses a dimension that is claimed twice', () => {
    expect(
      pattern({
        exemptions: {
          '4.1.2-name-role-value': {
            owner: 'someone else',
            verifiedBy: 'a different suite',
            reason: 'Because the other suite already reads it.',
          },
        },
      }),
    ).toThrow(/both encoded by probe.outcome.observed and exempted/);
  });

  it('refuses an exemption with no owner', () => {
    expect(
      pattern({
        expectations: [expectation({covers: ['2.1.1-keyboard']})],
        exemptions: {
          '4.1.2-name-role-value': {
            owner: '',
            verifiedBy: 'a different suite',
            reason: 'Because the other suite already reads it.',
          },
        },
      }),
    ).toThrow(/names no owner/);
  });

  it('refuses "not applicable" as an exemption reason', () => {
    expect(
      pattern({
        expectations: [expectation({covers: ['2.1.1-keyboard']})],
        exemptions: {
          '4.1.2-name-role-value': {
            owner: 'someone else',
            verifiedBy: 'a different suite',
            reason: 'N/A',
          },
        },
      }),
    ).toThrow(/FR5 forbids a generic escape hatch/);
  });

  it('refuses a duplicate expectation id', () => {
    expect(pattern({expectations: [expectation(), expectation()]})).toThrow(
      /duplicate expectation id/,
    );
  });

  it('refuses an id that does not belong to the pattern', () => {
    expect(
      pattern({expectations: [expectation({id: 'other.outcome.observed'})]}),
    ).toThrow(/does not belong to pattern probe/);
  });
});

describe('unansweredDimensions', () => {
  it('lists every dimension the pattern has neither encoded nor exempted', () => {
    const contract = pattern()();
    const unanswered = unansweredDimensions(contract);
    expect(unanswered).not.toContain('4.1.2-name-role-value');
    expect(unanswered).toHaveLength(CHECKLIST_DIMENSIONS.length - 1);
  });
});
