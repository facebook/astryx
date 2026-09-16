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
  readonly controls?: boolean;
  readonly operable?: boolean;
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
    {
      id: 'disclosure.relationship.controls',
      outcome:
        'A declared control relationship identifies the content being disclosed.',
      sources: [
        {
          standard: 'wcag',
          id: '1.3.1',
          name: 'Info and Relationships',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
        },
      ],
      covers: ['1.3.1-info-and-relationships'],
      appliesWhen: {
        condition: 'the binding declares a controlled-content relationship',
        test: facts => facts.controls === true,
      },
      evidenceLayer: 'dom',
      enforcement: 'required',
      run: async ({harness, subject}) => {
        const content = await harness.related('content');
        if (!(await harness.references(subject, 'aria-controls', content))) {
          throw new Error(
            'aria-controls does not identify the disclosed content',
          );
        }
        if (
          (await subject.idReferences('aria-controls')).some(
            target => target === null,
          )
        ) {
          throw new Error('aria-controls includes a missing content target');
        }
      },
    },
    {
      id: 'disclosure.interaction.round-trip',
      outcome:
        'Pointer, Enter, and Space reveal the content and hide it again.',
      sources: [
        {
          standard: 'wcag',
          id: '2.1.1',
          name: 'Keyboard',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
        },
        {
          standard: 'astryx',
          id: 'component:Collapsible',
          clause: 'AR1',
          requirement:
            'The trigger MUST expose its expanded state and controlled-region relationship independently of the chevron artwork.',
          url: 'https://github.com/facebook/astryx/blob/2b2113d7f95a066a2e21a4b0a27acb819d103601/packages/core/src/Collapsible/Collapsible.spec.md',
        },
      ],
      covers: ['2.1.1-keyboard'],
      appliesWhen: {
        condition: 'the disclosure can be operated',
        test: facts => facts.operable === true,
      },
      evidenceLayer: 'real-browser',
      alsoNeeds: ['dom'],
      enforcement: 'required',
      run: async () => undefined,
    },
  ],
  exemptions: {},
});
