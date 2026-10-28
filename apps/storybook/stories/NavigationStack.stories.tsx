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

// =============================================================================
// Edge cases the stack must handle
// =============================================================================

/**
 * A pushed screen with a horizontal strip: a sideways drag on the strip
 * scrolls it while it can still scroll that way; elsewhere it pops.
 */
function CarouselStack() {
  const [path, setPath] = useState<string[]>(['General']);
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
            <div
              data-testid="carousel"
              style={{
                display: 'flex',
                gap: 12,
                padding: 16,
                overflowX: 'auto',
              }}>
              {SECTIONS.Settings.concat(SECTIONS.General).map(label => (
                <div
                  key={label}
                  style={{
                    flex: '0 0 140px',
                    height: 96,
                    borderRadius: 12,
                    border: '1px solid currentColor',
                    padding: 8,
                  }}>
                  {label}
                </div>
              ))}
            </div>
            <Rows title={entry} />
          </NavigationScreen>
        )}
        data-testid="navigation-stack"
      />
    </div>
  );
}

export const Carousel: Story = {
  name: 'Pushed screen with a carousel',
  render: () => <CarouselStack />,
};

/**
 * An app that declines pops (it keeps its path, as one guarding unsaved
 * edits would): a released back swipe springs back.
 */
function DeclinesPopsStack() {
  const [path, setPath] = useState<string[]>(['General']);
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
        onPathChange={next => {
          if (next.length >= path.length) {
            setPath(next);
          }
        }}
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

export const DeclinesPops: Story = {
  name: 'Declines pops',
  render: () => <DeclinesPopsStack />,
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
        renderScreen={entry =>
          entry === 'Display' ? (
            <NavigationScreen title={entry} titleDisplayMode="large">
              <Rows title={entry} />
              <List>
                {Array.from({length: 24}, (_, i) => (
                  <ListItem key={i} label={`Display option ${i + 1}`} />
                ))}
              </List>
            </NavigationScreen>
          ) : (
            <NavigationScreen title={entry}>
              <Rows title={entry} />
            </NavigationScreen>
          )
        }
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
function SearchStack({
  keepsSearchOnLeave = false,
}: {
  /** Whether a screen's search stays active after the screen leaves. */
  keepsSearchOnLeave?: boolean;
}) {
  const [path, setPath] = useState<string[]>([]);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [queries, setQueries] = useState<Record<string, string>>({});
  const screenFor = (title: string) => (
    <NavigationScreen
      title={title}
      titleDisplayMode="large"
      search={
        <SearchField
          label="Search"
          value={queries[title] ?? ''}
          onChange={query => setQueries(all => ({...all, [title]: query}))}
          isActive={active[title] === true}
          onActiveChange={isActive =>
            setActive(all => ({...all, [title]: isActive}))
          }
        />
      }>
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
        onPathChange={next => {
          setPath(next);
          // Leaving a screen ends its search, unless this app keeps it.
          if (!keepsSearchOnLeave) {
            setActive(all =>
              Object.fromEntries(
                Object.entries(all).filter(
                  ([title]) => title === 'Settings' || next.includes(title),
                ),
              ),
            );
          }
        }}
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

/** The same, in an app whose screens keep their search when they leave. */
export const SearchKeepsActive: Story = {
  name: 'Search that stays active',
  render: () => <SearchStack keepsSearchOnLeave />,
};
