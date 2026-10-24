// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {SearchField} from '@astryxdesign/lab';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof SearchField> = {
  title: 'Lab/SearchField',
  component: SearchField,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SearchField>;

// =============================================================================
// A screen like the one UIKit's captures were taken on: a large title, the
// field under it, results below
// =============================================================================

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blueberry',
  'Cherry',
  'Grapefruit',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Plum',
  'Raspberry',
  'Strawberry',
  'Watermelon',
];

const page: React.CSSProperties = {
  minHeight: '100vh',
  boxSizing: 'border-box',
  paddingTop: 8,
  fontFamily: 'system-ui, sans-serif',
};
const largeTitle = (hidden: boolean): React.CSSProperties => ({
  margin: 0,
  padding: '4px 16px 8px',
  fontSize: 34,
  fontWeight: 700,
  lineHeight: '41px',
  opacity: hidden ? 0 : 1,
  transition: 'opacity 100ms linear',
});
const list: React.CSSProperties = {
  listStyle: 'none',
  margin: '8px 0 0',
  padding: 0,
};
const row: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid rgba(127, 127, 127, 0.2)',
  fontSize: 17,
};

function Screen({
  lift = 0,
  initialQuery = '',
  initiallyActive = false,
  dir,
}: {
  lift?: number;
  initialQuery?: string;
  initiallyActive?: boolean;
  dir?: 'rtl';
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isActive, setIsActive] = useState(initiallyActive);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const results = FRUITS.filter(fruit =>
    fruit.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div style={page} dir={dir}>
      <h1 style={largeTitle(lift > 0 && isActive)}>Search</h1>
      <SearchField
        label="Search"
        placeholder="Fruits"
        value={query}
        onChange={setQuery}
        isActive={isActive}
        onActiveChange={setIsActive}
        onSubmit={setSubmitted}
        lift={lift}
      />
      <ul style={list} aria-label="Results">
        {results.map(fruit => (
          <li key={fruit} style={row}>
            {fruit}
          </li>
        ))}
      </ul>
      <p
        data-testid="search-state"
        style={{padding: '0 16px', fontSize: 13, opacity: 0.6}}>
        {isActive ? 'active' : 'inactive'}
        {submitted != null ? ` · submitted "${submitted}"` : ''}
      </p>
    </div>
  );
}

/**
 * The stacked field under a large title. A tap activates it: the field
 * narrows and the glass close button slides in, on UIKit's 383 ms curve.
 */
export const Default: Story = {
  render: () => <Screen />,
};

/**
 * Active from the start, with a query: the clear button inside the field and
 * the close button beside it.
 */
export const ActiveWithQuery: Story = {
  render: () => <Screen initiallyActive initialQuery="ap" />,
};

/**
 * Lifted as a navigation bar lifts it: the active field rises over the large
 * title (its 53 px here; 99 px from under the title to the bar's row on an
 * iPhone 17 Pro) while the title fades. Here the screen fades its own title;
 * NavigationStack's bar will run the measured fade.
 */
export const Lifted: Story = {
  render: () => <Screen lift={53} />,
};

/** Right to left: the field narrows from the left; the close button slides in from there. */
export const RightToLeft: Story = {
  render: () => <Screen dir="rtl" />,
};
