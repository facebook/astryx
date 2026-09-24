// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TokenizerSelectionA11y.stories.tsx
 * @input Uses controlled Tokenizer, BaseTypeahead, and Typeahead fixtures with deterministic SearchSource values
 * @output Real-browser fixtures for Tokenizer selection and direct disabled-transition compatibility
 * @position Reproduction surfaces for TokenizerSelection.a11y.chromium.spec.ts
 *
 * SYNC: The Chromium spec navigates to these story ids by export name.
 */

import {useMemo, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import {BaseTypeahead, Typeahead} from '@astryxdesign/core/Typeahead';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';

const choices: SearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
];

const source: SearchSource = {
  search: query =>
    choices.filter(choice =>
      choice.label.toLowerCase().includes(query.toLowerCase()),
    ),
  bootstrap: () => choices,
};

const framework: SearchableItem = {id: 'react', label: 'React'};
const frameworkSource: SearchSource = {
  search: query =>
    framework.label.toLowerCase().includes(query.toLowerCase())
      ? [framework]
      : [],
  bootstrap: () => [framework],
};

type DisabledMode = 'native' | 'focusable';

function Fixture({
  maxEntries,
  maxMenuItems = 2,
  disabledMode,
}: {
  maxEntries?: number;
  maxMenuItems?: number;
  disabledMode?: DisabledMode;
}) {
  const [value, setValue] = useState<SearchableItem[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div>
      <Tokenizer
        label="Team members"
        searchSource={source}
        value={value}
        onChange={setValue}
        hasEntriesOnFocus
        maxEntries={maxEntries}
        maxMenuItems={maxMenuItems}
        debounceMs={0}
        isDisabled={isDisabled}
        disabledMessage={
          disabledMode === 'focusable'
            ? 'Member selection is unavailable'
            : undefined
        }
      />
      {disabledMode != null && (
        <button type="button" onClick={() => setIsDisabled(true)}>
          Disable tokenizer
        </button>
      )}
      <output data-selected-ids>{value.map(item => item.id).join(',')}</output>
    </div>
  );
}

function DelayedSearchFixture() {
  const [value, setValue] = useState<SearchableItem[]>([]);
  const [hasSettled, setHasSettled] = useState(false);
  const delayedSource = useMemo<SearchSource>(
    () => ({
      search: () =>
        new Promise(resolve => {
          setTimeout(() => {
            setHasSettled(true);
            resolve(choices);
          }, 800);
        }),
      bootstrap: () => choices,
    }),
    [],
  );

  return (
    <div>
      <Tokenizer
        label="Team members"
        searchSource={delayedSource}
        value={value}
        onChange={setValue}
        hasEntriesOnFocus
        debounceMs={0}
      />
      <output data-search-settled>{String(hasSettled)}</output>
    </div>
  );
}

function DirectBaseTypeaheadFixture() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <label id="direct-base-typeahead-label" htmlFor="direct-base-typeahead">
        Framework
      </label>
      <div ref={anchorRef}>
        <BaseTypeahead
          inputId="direct-base-typeahead"
          ariaLabelledBy="direct-base-typeahead-label"
          anchorRef={anchorRef}
          searchSource={frameworkSource}
          value={value}
          onChange={setValue}
          debounceMs={0}
          isDisabled={isDisabled}
          isFocusableDisabled={isDisabled}
        />
      </div>
      <button type="button" onClick={() => setIsDisabled(true)}>
        Disable direct BaseTypeahead
      </button>
      <output data-selected-id>{value?.id ?? ''}</output>
    </div>
  );
}

function DirectTypeaheadFixture() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div>
      <Typeahead
        label="Framework"
        searchSource={frameworkSource}
        value={value}
        onChange={setValue}
        debounceMs={0}
        isDisabled={isDisabled}
        disabledMessage="Framework selection is unavailable"
      />
      <button type="button" onClick={() => setIsDisabled(true)}>
        Disable public Typeahead
      </button>
      <output data-selected-id>{value?.id ?? ''}</output>
    </div>
  );
}

const meta: Meta = {
  title: 'a11y/Tokenizer consecutive selection',
  tags: ['no-visual'],
  parameters: {
    docs: {
      description: {
        component:
          'Real-browser fixtures for Tokenizer focus-bootstrap selection, terminal states, and stale async work.',
      },
    },
  },
};

export default meta;

export const CappedCohort: StoryObj = {
  render: () => <Fixture maxMenuItems={1} />,
};

export const FullCohort: StoryObj = {
  render: () => <Fixture />,
};

export const MaximumEntry: StoryObj = {
  render: () => <Fixture maxEntries={1} maxMenuItems={1} />,
};

export const NativeDisableWhileOpen: StoryObj = {
  render: () => <Fixture disabledMode="native" />,
};

export const FocusableDisableWhileOpen: StoryObj = {
  render: () => <Fixture disabledMode="focusable" />,
};

export const DelayedSearchDismissal: StoryObj = {
  render: () => <DelayedSearchFixture />,
};

export const DirectBaseTypeahead: StoryObj = {
  render: () => <DirectBaseTypeaheadFixture />,
};

export const DirectTypeahead: StoryObj = {
  render: () => <DirectTypeaheadFixture />,
};
