// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radio-group.fixtures.ts
 * @input Uses ./radio-group (RadioGroupStateFacts)
 * @output Plain-HTML conforming and deliberately violating radio-group fixtures
 * @position Mutation proof for the reusable contract; no Astryx component code.
 */

import type {RadioGroupStateFacts} from './radio-group';

const SUBJECT_ATTRIBUTE = 'data-a11y-subject';
export const RADIO_GROUP_SUBJECT_SELECTOR = `[${SUBJECT_ATTRIBUTE}]`;

export interface RadioGroupFixture {
  readonly id: string;
  readonly summary: string;
  readonly facts: RadioGroupStateFacts;
  readonly html: string;
}

function groupFacts(
  overrides: Partial<RadioGroupStateFacts> = {},
): RadioGroupStateFacts {
  return {
    part: 'group',
    role: 'radiogroup',
    checked: null,
    selection: 'one',
    disabled: false,
    description: null,
    required: false,
    invalid: false,
    operable: true,
    focusable: true,
    visibleLabel: true,
    movement: 'horizontal-ltr',
    ...overrides,
  };
}

export const RADIO_GROUP_FIXTURES: readonly RadioGroupFixture[] = [
  {
    id: 'conforming-group',
    summary: 'a named direct radio group',
    facts: groupFacts(),
    html: `<div ${SUBJECT_ATTRIBUTE} role="radiogroup" aria-label="Delivery"><div role="radio" aria-checked="true">Standard</div><div role="radio" aria-checked="false">Express</div></div>`,
  },
  {
    id: 'conforming-menu-group',
    summary: 'a named group of radio menu items',
    facts: groupFacts({role: 'group', movement: 'none'}),
    html: `<div role="menu"><div ${SUBJECT_ATTRIBUTE} role="group" aria-label="Sort by"><div role="menuitemradio" aria-checked="true">Newest</div><div role="menuitemradio" aria-checked="false">Oldest</div></div></div>`,
  },
  {
    id: 'violating-group-role',
    summary:
      'a single-choice set exposed as a toolbar instead of its adopted group role',
    facts: groupFacts(),
    html: `<div ${SUBJECT_ATTRIBUTE} role="toolbar" aria-label="Delivery"><div role="radio" aria-checked="true">Standard</div><div role="radio" aria-checked="false">Express</div></div>`,
  },
];

export function radioGroupFixture(id: string): RadioGroupFixture {
  const found = RADIO_GROUP_FIXTURES.find(candidate => candidate.id === id);
  if (found == null) {
    throw new Error(`unknown radio-group fixture "${id}"`);
  }
  return found;
}

export const RADIO_GROUP_MUTATIONS: Readonly<
  Record<string, readonly string[]>
> = {
  'radio-group.group.role-exposed': ['violating-group-role'],
};

const MUTATION_FAILURES: Readonly<Record<string, string>> = {
  'radio-group.group.role-exposed:violating-group-role':
    'this binding adopts the radiogroup role for its group, but the browser reports "toolbar"',
};

export function expectedRadioGroupMutationFailure(
  expectation: string,
  target: string,
): string {
  const detail = MUTATION_FAILURES[`${expectation}:${target}`];
  if (detail == null) {
    throw new Error(
      `no expected radio-group failure detail for ${expectation} against ${target}`,
    );
  }
  return detail;
}
