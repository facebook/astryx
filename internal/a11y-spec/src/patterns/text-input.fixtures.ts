// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file text-input.fixtures.ts
 * @input Uses ./text-input (TextInputStateFacts)
 * @output TEXT_INPUT_FIXTURES — native conforming and deliberately violating
 *   fixtures — plus TEXT_INPUT_MUTATIONS, which maps each expectation to proof
 * @position Contract self-test fixtures; no Astryx component is used here.
 */

import type {TextInputStateFacts} from './text-input';

export const SUBJECT_ATTRIBUTE = 'data-a11y-subject';
export const SUBJECT_SELECTOR = `[${SUBJECT_ATTRIBUTE}]`;

export interface TextInputFixture {
  readonly id: string;
  readonly summary: string;
  readonly facts: TextInputStateFacts;
  readonly html: string;
}

const DEFAULT_FACTS: TextInputStateFacts = {
  multiline: false,
  value: '',
  editable: true,
  focusable: true,
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  description: null,
  errorMessage: null,
};

function facts(
  overrides: Partial<TextInputStateFacts> = {},
): TextInputStateFacts {
  return {...DEFAULT_FACTS, ...overrides};
}

export const TEXT_INPUT_FIXTURES: readonly TextInputFixture[] = [
  {
    id: 'conforming-single-line',
    summary: 'a named native single-line text input',
    facts: facts(),
    html: `<label for="fx">Name</label><input id="fx" ${SUBJECT_ATTRIBUTE} type="text">`,
  },
  {
    id: 'conforming-multi-line',
    summary: 'a named native multi-line text area',
    facts: facts({multiline: true, value: 'Existing note'}),
    html: `<label for="fx">Notes</label><textarea id="fx" ${SUBJECT_ATTRIBUTE}>Existing note</textarea>`,
  },
  {
    id: 'violating-generic-role',
    summary: 'an editable generic element that never exposes the textbox role',
    facts: facts(),
    html: `<div ${SUBJECT_ATTRIBUTE} contenteditable="true">Name</div>`,
  },
];

export const CONFORMING_FIXTURES = [
  'conforming-single-line',
  'conforming-multi-line',
] as const;

export const TEXT_INPUT_MUTATIONS: Readonly<Record<string, readonly string[]>> =
  {
    'text-input.role.exposed': ['violating-generic-role'],
  };

export function fixture(id: string): TextInputFixture {
  const found = TEXT_INPUT_FIXTURES.find(candidate => candidate.id === id);
  if (found == null) {
    throw new Error(`unknown text-input fixture "${id}"`);
  }
  return found;
}
