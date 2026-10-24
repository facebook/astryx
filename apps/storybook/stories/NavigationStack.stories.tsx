// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  NavigationScreen,
  NavigationStack,
  SearchField,
  useNavigationStack,
} from '@astryxdesign/lab';
import {List, ListItem} from '@astryxdesign/core/List';
import {Icon} from '@astryxdesign/core/Icon';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof NavigationStack> = {
  title: 'Lab/NavigationStack',
  component: NavigationStack,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NavigationStack>;

// =============================================================================
// Settings — the drill-down UIKit's own captures were taken on
// =============================================================================

const SECTIONS: Record<string, string[]> = {
  Settings: ['General', 'Accessibility', 'Privacy & Security', 'Display'],
  General: ['About', 'Software Update', 'Storage', 'Language & Region'],
  Accessibility: ['Motion', 'Display & Text Size', 'Touch', 'Spoken Content'],
  'Privacy & Security': ['Location Services', 'Tracking', 'Camera', 'Photos'],
  Display: ['Brightness', 'Text Size', 'Night Shift'],
};

function Rows({title}: {title: string}) {
  const nav = useNavigationStack<string>();
  const rows = SECTIONS[title] ?? [];
  return (
    <List>
      {rows.map(row => (
        <ListItem
          key={row}
          label={row}
          endContent={<Icon icon="chevronRight" color="secondary" />}
          onClick={() => nav.push(row)}
        />
      ))}
      {rows.length === 0 ? (
        <ListItem label={`${title} has nothing deeper.`} />
      ) : null}
      {rows.length === 0 ? (
        <ListItem label="Done" onClick={() => nav.popToRoot()} />
      ) : null}
    </List>
  );
}

function SettingsStack() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <div style={{height: '100vh'}}>
      <NavigationStack
        label="Settings"
        root={
          <NavigationScreen title="Settings">
            <Rows title="Settings" />
          </NavigationScreen>
        }
        path={path}
        onPathChange={setPath}
        getKey={entry => entry}
        renderScreen={entry => (
          <NavigationScreen title={entry}>
            <Rows title={entry} />
          </NavigationScreen>
        )}
        data-testid="navigation-stack"
      />
    </div>
  );
}

export const Settings: Story = {
  render: () => <SettingsStack />,
};

/**
 * Opens two levels deep, so the back swipe has somewhere to go; Done on the
 * top screen pops back to the root in one transition.
 */
function DeepStack() {
  const [path, setPath] = useState<string[]>(['General', 'About']);
  return (
    <div style={{height: '100vh'}}>
      <NavigationStack
        label="Settings"
        root={
          <NavigationScreen title="Settings">
            <Rows title="Settings" />
          </NavigationScreen>
        }
        path={path}
        onPathChange={setPath}
        getKey={entry => entry}
        renderScreen={entry => (
          <NavigationScreen title={entry}>
            <Rows title={entry} />
          </NavigationScreen>
        )}
        data-testid="navigation-stack"
      />
    </div>
  );
}

export const Pushed: Story = {
  name: 'Pushed two levels',
  render: () => <DeepStack />,
};

/** The root with a large title (as in Settings): it scrolls with the rows and hands over to the bar. */
function LargeTitleStack() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <div style={{height: '100vh'}}>
      <NavigationStack
        label="Settings"
        root={
          <NavigationScreen title="Settings" titleDisplayMode="large">
            <Rows title="Settings" />
            <List>
              {Array.from({length: 24}, (_, i) => (
                <ListItem key={i} label={`Setting ${i + 1}`} />
              ))}
            </List>
          </NavigationScreen>
        }
        path={path}
        onPathChange={setPath}
        getKey={entry => entry}
        renderScreen={entry => (
          <NavigationScreen title={entry}>
            <Rows title={entry} />
          </NavigationScreen>
        )}
        data-testid="navigation-stack"
      />
    </div>
  );
}

export const LargeTitle: Story = {
  name: 'Large title',
  render: () => <LargeTitleStack />,
};

/**
 * Search in the bar (UISearchController in a navigation item): every screen
 * has a large title and a SearchField under it. Focusing the field hands
 * the bar to it; Cancel hands it back. The root scrolls, and its field
 * scrolls away under the bar with the content.
 */
function SearchStack() {
  const [path, setPath] = useState<string[]>([]);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [queries, setQueries] = useState<Record<string, string>>({});
  const screenFor = (title: string) => (
    <NavigationScreen
      title={title}
      titleDisplayMode="large"
      search={{
        field: (
          <SearchField
            label="Search"
            value={queries[title] ?? ''}
            onChange={query => setQueries(all => ({...all, [title]: query}))}
            isActive={active[title] === true}
            onActiveChange={isActive =>
              setActive(all => ({...all, [title]: isActive}))
            }
          />
        ),
        isActive: active[title] === true,
      }}>
      <Rows title={title} />
      {title === 'Settings' ? (
        <List>
          {Array.from({length: 16}, (_, i) => (
            <ListItem key={i} label={`Setting ${i + 1}`} />
          ))}
        </List>
      ) : null}
    </NavigationScreen>
  );
  return (
    <div style={{height: '100vh'}}>
      <NavigationStack
        label="Settings"
        root={screenFor('Settings')}
        path={path}
        onPathChange={setPath}
        getKey={entry => entry}
        renderScreen={entry => screenFor(entry)}
        data-testid="navigation-stack"
      />
    </div>
  );
}

export const Search: Story = {
  render: () => <SearchStack />,
};
