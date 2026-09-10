// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radio-group.ts
 * @input Uses ../contract (definePattern and the expectation vocabulary)
 * @output RADIO_GROUP_PATTERN and RadioGroupStateFacts
 * @position Reusable accessibility contract for a radio group and its options.
 *
 * The contract covers direct radio groups and the role/state portion of radio
 * choices inside menus. Menu-owned movement, focus, activation, and dismissal
 * stay with the Menu pattern. Component callbacks, form participation,
 * composition, and styling stay in component-local tests.
 */

import {
  definePattern,
  type PatternContract,
  type WcagCriterion,
} from '../contract';

const UNDERSTANDING = 'https://www.w3.org/WAI/WCAG22/Understanding';

const WCAG_4_1_2: WcagCriterion = {
  standard: 'wcag',
  id: '4.1.2',
  name: 'Name, Role, Value',
  level: 'A',
  url: `${UNDERSTANDING}/name-role-value.html`,
};

export type RadioGroupRole = 'radiogroup' | 'group' | 'radio' | 'menuitemradio';

export interface RadioGroupStateFacts {
  readonly part: 'group' | 'option';
  readonly role: RadioGroupRole;
  readonly checked: boolean | null;
  readonly selection: 'none' | 'one' | null;
  readonly disabled: boolean;
  readonly description: string | null;
  readonly required: boolean;
  readonly invalid: boolean;
  readonly operable: boolean;
  readonly focusable: boolean;
  readonly visibleLabel: boolean;
  readonly movement: 'none' | 'horizontal-ltr' | 'horizontal-rtl' | 'vertical';
}

export const RADIO_GROUP_PATTERN: PatternContract<RadioGroupStateFacts> =
  definePattern<RadioGroupStateFacts>({
    pattern: 'radio-group',
    url: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
    scope:
      'A named single-choice group and its radio-bearing options expose their adopted roles, selection, availability, and supporting relationships; direct radio groups preserve one-stop keyboard entry and selection movement while menu movement stays with Menu.',
    expectations: [
      {
        id: 'radio-group.group.role-exposed',
        outcome:
          'The browser exposes the group role this single-choice composition adopts, so its options are presented as one related set.',
        sources: [WCAG_4_1_2],
        covers: ['1.3.1-info-and-relationships', '4.1.2-name-role-value'],
        appliesWhen: {
          condition: 'the binding designates the group container',
          test: facts => facts.part === 'group',
        },
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject, facts}) => {
          const {role} = await subject.computed();
          if (role !== facts.role) {
            throw new Error(
              role == null
                ? `the browser exposes no role for this ${facts.role} group`
                : `this binding adopts the ${facts.role} role for its group, but the browser reports "${role}"`,
            );
          }
        },
      },
    ],
    exemptions: {},
  });
