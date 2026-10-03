// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorEmptyStateA11y.stories.tsx
 * @input Uses Selector with caller-supplied ReactNode empty-state content
 * @output Browser fixtures for the empty-state live-region announcement
 * @position Stable fixtures for EmptyStateAnnouncement.a11y.chromium.spec.ts
 *
 * The panel's empty message is `role="presentation"` — `role="listbox"`
 * permits only `option` and `group` children — so it reaches assistive
 * technology only through the shared polite live region. These stories cover
 * the cases a DOM emulator cannot settle: whether the region actually carries
 * the rendered words in a shipping engine, and whether it stays silent while
 * the panel is loading.
 */

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {Selector} from '../../../packages/core/src/Selector/Selector';

const OPTIONS = [
  {value: 'apple', label: 'Apple'},
  {value: 'banana', label: 'Banana'},
];

const meta: Meta = {
  title: 'a11y/Selector empty state',
  tags: ['no-visual'],
};
export default meta;

/** An element in the dead end: the region must speak its text, not a default. */
export const ElementEmptySearchText: StoryObj = {
  name: 'element emptySearchText',
  render: () => (
    <div data-empty-scenario="element">
      <Selector
        label="Fruit"
        options={OPTIONS}
        value="apple"
        onChange={() => {}}
        hasSearch
        emptySearchText={
          <span>
            Nothing like that here. <a href="#new">Add a fruit</a>
            <span aria-hidden="true"> →</span>
          </span>
        }
      />
    </div>
  ),
};

/** A load that lands with nothing matching a query typed while it was in flight. */
export const DeferredEmptyResult: StoryObj = {
  name: 'deferred empty result',
  render: function DeferredEmptyResult() {
    const [loaded, setLoaded] = useState(false);
    return (
      <div data-empty-scenario="deferred">
        <button type="button" onClick={() => setLoaded(true)}>
          land
        </button>
        <Selector
          label="Fruit"
          options={loaded ? OPTIONS : []}
          onChange={() => {}}
          hasSearch
          isLoading={!loaded}
          emptySearchText="Nothing like that here"
        />
      </div>
    );
  },
};
