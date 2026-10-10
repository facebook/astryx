// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Explicit Selector states bound to the reusable Combobox contract. */

import type {ComboboxStateFacts} from '@astryxdesign/a11y-spec';

export interface SelectorComboboxScenario {
  readonly id: 'closed' | 'open' | 'read-only' | 'busy';
  readonly storyId: string;
  readonly open: boolean;
  readonly props: {
    readonly isReadOnly?: boolean;
    readonly isLoading?: boolean;
    readonly value?: string;
  };
  readonly facts: ComboboxStateFacts;
}

const baseFacts: ComboboxStateFacts = {
  name: 'Fruit',
  expanded: false,
  popupRole: 'listbox',
  popupVisible: false,
  activeDescendant: false,
  readOnly: false,
  busy: false,
};

export const SELECTOR_COMBOBOX_SCENARIOS: ReadonlyArray<SelectorComboboxScenario> =
  [
    {
      id: 'closed',
      storyId: 'a11y-combobox-pattern--selector-closed',
      open: false,
      props: {},
      facts: baseFacts,
    },
    {
      id: 'open',
      storyId: 'a11y-combobox-pattern--selector-open',
      open: true,
      props: {},
      facts: {
        ...baseFacts,
        expanded: true,
        popupVisible: true,
        activeDescendant: true,
      },
    },
    {
      id: 'read-only',
      storyId: 'a11y-combobox-pattern--selector-read-only',
      open: false,
      props: {isReadOnly: true, value: 'apple'},
      facts: {...baseFacts, readOnly: true},
    },
    {
      id: 'busy',
      storyId: 'a11y-combobox-pattern--selector-busy',
      open: false,
      props: {isLoading: true},
      facts: {...baseFacts, busy: true},
    },
  ];
