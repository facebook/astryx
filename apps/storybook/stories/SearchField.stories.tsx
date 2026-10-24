// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {SearchField, type SearchFieldHandle} from '@astryxdesign/lab';

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

// The bottom placement's bar: kept at the bottom of the viewport, the field's
// bottom 33 px above it, as iOS 26's toolbar holds its search field.
const bottomBar: React.CSSProperties = {
  position: 'fixed',
  insetInline: 0,
  bottom: 33,
};

function BottomScreen({dir}: {dir?: 'rtl'}) {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const results = FRUITS.filter(fruit =>
    fruit.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div style={{...page, paddingBottom: 104}} dir={dir}>
      <h1 style={largeTitle(false)}>Search</h1>
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
      </p>
      <div style={bottomBar}>
        <SearchField
          label="Search"
          placeholder="Fruits"
          placement="bottom"
          value={query}
          onChange={setQuery}
          isActive={isActive}
          onActiveChange={setIsActive}
        />
      </div>
    </div>
  );
}

/**
 * iOS 26's toolbar field at the bottom of the screen. A tap activates it: it
 * rides the keyboard up (its centre 36 px above the keyboard's top), swells,
 * narrows past its place and grows a 38 px glass close button in beside it;
 * cancelling springs it back out to rest as the keyboard goes down.
 */
export const Bottom: Story = {
  render: () => <BottomScreen />,
};

/** The bottom field right to left: it narrows from the left. */
export const BottomRightToLeft: Story = {
  render: () => <BottomScreen dir="rtl" />,
};

// A tab bar's search tab draws the field's glass and its cancel button (its
// search circle); here a plain box and button stand in for them.
const tabGlass: React.CSSProperties = {
  position: 'fixed',
  insetInlineStart: 8,
  bottom: 33,
  width: 330,
  height: 48,
  borderRadius: 24,
  background: 'rgba(127, 127, 127, 0.14)',
};
const tabCircle: React.CSSProperties = {
  position: 'fixed',
  insetInlineEnd: 8,
  bottom: 33,
  width: 48,
  height: 48,
  borderRadius: 24,
  border: 0,
  background: 'rgba(127, 127, 127, 0.14)',
  fontSize: 20,
};

function TabScreen() {
  const handle = useRef<SearchFieldHandle>(null);
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  return (
    <div style={{...page, paddingBottom: 104}}>
      <h1 style={largeTitle(false)}>Search</h1>
      <p
        data-testid="search-state"
        style={{padding: '0 16px', fontSize: 13, opacity: 0.6}}>
        {isActive ? 'active' : 'inactive'}
      </p>
      <div style={tabGlass}>
        <SearchField
          label="Search"
          placeholder="Fruits"
          placement="tab"
          handleRef={handle}
          value={query}
          onChange={setQuery}
          isActive={isActive}
          onActiveChange={setIsActive}
        />
      </div>
      <button
        type="button"
        aria-label="Cancel"
        style={tabCircle}
        onClick={() => handle.current?.cancel()}>
        ×
      </button>
    </div>
  );
}

/**
 * The field as a tab bar's search tab holds it: content only, in the box the
 * tab bar gives it; the tab bar's own cancel button calls `cancel()`. TabBar's
 * search story shows the real thing.
 */
export const InTabBar: Story = {
  render: () => <TabScreen />,
};
