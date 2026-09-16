// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file disclosure.ts
 * @input Uses the shared accessibility contract vocabulary
 * @output DISCLOSURE_PATTERN and DisclosureStateFacts
 * @position Disclosure state and controlled-content contract; not Accordion policy.
 */

import {definePattern} from '../contract';

export interface DisclosureStateFacts {
  readonly expanded: boolean;
}

export const DISCLOSURE_PATTERN = definePattern<DisclosureStateFacts>({
  pattern: 'disclosure',
  url: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
  scope: 'One disclosure trigger and the content it reveals or hides.',
  expectations: [
    {
      id: 'disclosure.state.expanded',
      outcome: 'The trigger identifies whether its content is expanded.',
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
        condition: 'the disclosure trigger is rendered',
        test: () => true,
      },
      evidenceLayer: 'dom',
      enforcement: 'required',
      run: async ({subject, facts}) => {
        const expanded = await subject.attribute('aria-expanded');
        if (expanded !== String(facts.expanded)) {
          throw new Error(
            `the disclosure is ${facts.expanded ? 'expanded' : 'collapsed'} but aria-expanded is ${expanded ?? 'absent'}`,
          );
        }
      },
    },
  ],
  exemptions: {},
});
