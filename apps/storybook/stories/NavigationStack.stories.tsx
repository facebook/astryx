// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  NavigationScreen,
  NavigationStack,
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

/** Opens two levels deep, so the back swipe has somewhere to go. */
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
