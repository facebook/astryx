// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @vitest-environment jsdom */

/** Contract self-tests for Table DOM expectations and completeness. */

import {afterEach, describe, expect, it} from 'vitest';
import {
  citeSource,
  describeExpectation,
  requiredLayers,
  unansweredDimensions,
} from '../contract';
import {checkAccessibilitySpec, type ExpectationResult} from '../check';
import {JSDOM_OBSERVES, createJsdomHarness} from '../harness/jsdom';
import {TABLE_PATTERN} from './table';
import {
  CONFORMING_TABLE_FIXTURES,
  TABLE_CELL_SELECTOR,
  TABLE_COLUMN_HEADER_SELECTOR,
  TABLE_MUTATIONS,
  TABLE_ROW_HEADER_SELECTOR,
  TABLE_ROW_SELECTOR,
  TABLE_FIXTURES,
  TABLE_SUBJECT_SELECTOR,
  tableFixture,
  type TableFixture,
} from './table.fixtures';

afterEach(() => document.body.replaceChildren());

async function resultsFor(target: TableFixture) {
  const container = document.createElement('div');
  document.body.append(container);
  const run = await checkAccessibilitySpec({
    spec: TABLE_PATTERN,
    binding: 'fixture',
    state: target.id,
    facts: target.facts,
    mount: async () => {
      container.innerHTML = target.html;
      const subject = container.querySelector(TABLE_SUBJECT_SELECTOR);
      if (subject == null) {
        throw new Error(`fixture "${target.id}" is missing its table`);
      }
      const related: Record<string, Element> = {};
      const designate = (selector: string, prefix: string) =>
        container.querySelectorAll(selector).forEach((element, index) => {
          related[`${prefix}-${index}`] = element;
        });
      designate(TABLE_ROW_SELECTOR, 'row');
      designate(TABLE_COLUMN_HEADER_SELECTOR, 'column-header');
      designate(TABLE_ROW_HEADER_SELECTOR, 'row-header');
      designate(TABLE_CELL_SELECTOR, 'cell');
      return createJsdomHarness({subject, related});
    },
    unmount: () => {
      container.innerHTML = '';
    },
  });
  return run.results;
}

function resultFor(
  results: readonly ExpectationResult[],
  id: string,
): ExpectationResult {
  const found = results.find(result => result.expectation === id);
  if (found == null) {
    throw new Error(`no result for ${id}`);
  }
  return found;
}

const observableHere = TABLE_PATTERN.expectations.filter(expectation =>
  requiredLayers(expectation).every(layer => JSDOM_OBSERVES.includes(layer)),
);

describe('Table contract — completeness', () => {
  it('answers every completeness dimension', () => {
    expect(unansweredDimensions(TABLE_PATTERN)).toEqual([]);
  });

  it('gives every expectation at least one deliberately violating fixture', () => {
    expect(
      TABLE_PATTERN.expectations
        .filter(
          expectation => (TABLE_MUTATIONS[expectation.id] ?? []).length === 0,
        )
        .map(expectation => expectation.id),
    ).toEqual([]);
  });

  it('has an expectation for every mutation it records', () => {
    const ids = new Set(
      TABLE_PATTERN.expectations.map(expectation => expectation.id),
    );
    expect(Object.keys(TABLE_MUTATIONS).filter(id => !ids.has(id))).toEqual([]);
  });

  it('makes every expectation required under AST-020 FR15 or WCAG 2.2', () => {
    expect(
      TABLE_PATTERN.expectations
        .filter(expectation => expectation.enforcement !== 'required')
        .map(expectation => expectation.id),
    ).toEqual([]);
  });

  it('adds no keyboard expectation to a static table', () => {
    expect(
      TABLE_PATTERN.expectations
        .filter(expectation => expectation.covers.includes('2.1.1-keyboard'))
        .map(expectation => expectation.id),
    ).toEqual([]);
  });
});

describe('Table contract — sorted fixtures are truthful tables', () => {
  // A sort claim is only a positive proof when the rows follow it; the
  // violating twins keep the same rows so only the exposed state is wrong.
  const sorted = TABLE_FIXTURES.filter(target => target.facts.sort.length > 0);

  it.each(sorted.map(target => [target.id, target] as const))(
    '%s renders its rows in the declared order',
    (_id, target) => {
      const container = document.createElement('div');
      container.innerHTML = target.html;
      const table = container.querySelector(TABLE_SUBJECT_SELECTOR)!;
      for (const {column, direction} of target.facts.sort) {
        const values = [...table.querySelectorAll(':scope > tbody > tr')].map(
          row => row.children[column]?.textContent ?? '',
        );
        const ordered = [...values].sort();
        if (direction === 'descending') {
          ordered.reverse();
        }
        expect(values.length).toBeGreaterThan(1);
        expect(values).toEqual(ordered);
      }
    },
  );
});

describe('Table contract — the jsdom harness stays within its evidence boundary', () => {
  it('runs DOM expectations and reports accessibility-tree expectations as unrun', async () => {
    const results = await resultsFor(tableFixture('conforming-labelled'));
    expect(results.some(result => result.status === 'pass')).toBe(true);
    const unrun = results.filter(result => result.status === 'unrun');
    expect(unrun.length).toBeGreaterThan(0);
    for (const result of unrun) {
      expect(result.missingLayers).toContain('accessibility-tree');
    }
  });
});

describe.each(observableHere.map(expectation => [expectation.id] as const))(
  '%s',
  id => {
    const expectation = TABLE_PATTERN.expectations.find(
      candidate => candidate.id === id,
    )!;

    it.each(CONFORMING_TABLE_FIXTURES.map(name => [name] as const))(
      'passes against %s (or does not apply to it)',
      async name => {
        const result = resultFor(await resultsFor(tableFixture(name)), id);
        expect(
          ['pass', 'not-applicable'],
          `${id} against ${name}: ${result.detail ?? ''}`,
        ).toContain(result.status);
      },
    );

    it.each((TABLE_MUTATIONS[id] ?? []).map(name => [name] as const))(
      'fails against %s, which removes its outcome',
      async name => {
        const result = resultFor(await resultsFor(tableFixture(name)), id);
        expect(result.status, `${id} against ${name}`).toBe('fail');
        expect(result.detail ?? '').not.toBe('');
      },
    );

    it('carries its id and primary source into every result description', async () => {
      const target = tableFixture(
        TABLE_MUTATIONS[id]?.[0] ?? CONFORMING_TABLE_FIXTURES[0]!,
      );
      const result = resultFor(await resultsFor(target), id);
      expect(result.description).toContain(id);
      expect(result.description).toContain(citeSource(expectation.sources[0]));
      expect(describeExpectation(expectation)).toBe(result.description);
    });
  },
);
