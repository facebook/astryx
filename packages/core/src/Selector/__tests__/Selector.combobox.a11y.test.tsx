// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Selector's first binding to the reusable Combobox semantic contract. */

import {cleanup, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {
  COMBOBOX_PATTERN,
  expectAccessibilitySpec,
} from '@astryxdesign/a11y-spec';
import {Selector} from '../Selector';
import {installListboxDialogStubs} from './Listbox.a11y.dom';
import {SELECTOR_COMBOBOX_SCENARIOS} from './Combobox.a11y.states';

installListboxDialogStubs();

describe('Selector Combobox semantic binding', () => {
  it.each(SELECTOR_COMBOBOX_SCENARIOS)('$id', async scenario => {
    await expectAccessibilitySpec({
      spec: COMBOBOX_PATTERN,
      binding: 'Selector.trigger',
      state: scenario.id,
      facts: scenario.facts,
      render: async () => {
        render(
          <Selector
            label="Fruit"
            options={[
              {value: 'apple', label: 'Apple'},
              {value: 'banana', label: 'Banana'},
            ]}
            onChange={() => {}}
            {...scenario.props}
          />,
        );
        if (scenario.open) {
          await userEvent.setup().click(screen.getByRole('combobox'));
          await screen.findByRole('listbox', {hidden: true});
        }
      },
      subject: () => screen.getByRole('combobox'),
      related: () => {
        const related: Record<string, Element> = {};
        if (!scenario.facts.popupVisible) {
          return related;
        }
        const popup = screen.getByRole('listbox', {hidden: true});
        const activeId = screen
          .getByRole('combobox')
          .getAttribute('aria-activedescendant');
        expect(activeId).not.toBeNull();
        related.popup = popup;
        related['active-descendant'] = within(popup).getByRole('option', {
          name: 'Apple',
          hidden: true,
        });
        return related;
      },
      cleanup,
    });
  });

  it('keeps the bounded first-adopter state matrix explicit', () => {
    expect(SELECTOR_COMBOBOX_SCENARIOS.map(scenario => scenario.id)).toEqual([
      'closed',
      'open',
      'read-only',
      'busy',
    ]);
  });
});
