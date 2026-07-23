// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {defineTheme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const midnightTheme = defineTheme({
  name: 'midnight',
  tokens: {
    '--color-accent': '#8b5cf6',
    '--color-background': '#1e1b2e',
    '--color-background-surface': '#2d2844',
    '--color-foreground': '#f0eaff',
    '--color-foreground-secondary': '#a78bfa',
  },
});

const forestTheme = defineTheme({
  name: 'forest',
  tokens: {
    '--color-accent': '#22c55e',
    '--color-background': '#0f1f13',
    '--color-background-surface': '#1a3320',
    '--color-foreground': '#e8f5e9',
    '--color-foreground-secondary': '#86efac',
  },
});

const defaultTheme = defineTheme({
  name: 'default',
  tokens: {
    '--color-accent': '#0066cc',
    '--color-background': '#ffffff',
    '--color-background-surface': '#f9fafb',
    '--color-foreground': '#111827',
    '--color-foreground-secondary': '#6b7280',
  },
});

const themes = [{name: 'Default', theme: defaultTheme}, {name: 'Midnight', theme: midnightTheme}, {name: 'Forest', theme: forestTheme}];

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(themes[0]);

  return (
    <Theme theme={activeTheme.theme}>
      <Card width={400}>
        <div className="flex flex-col gap-4">
          <Heading level={3}>Theme Switcher</Heading>
          <Text type="supporting">Select a theme to preview.</Text>
          <div className="flex gap-2">
            {themes.map(t => (
              <Button key={t.name} label={t.name} variant={activeTheme.name === t.name ? 'primary' : 'secondary'} onClick={() => setActiveTheme(t)} />
            ))}
          </div>
          <Card>
            <div className="flex flex-col gap-2">
              <Heading level={4}>Preview</Heading>
              <Text>Content rendered in the selected theme.</Text>
              <Button label="Sample Action" variant="primary" />
            </div>
          </Card>
        </div>
      </Card>
    </Theme>
  );
}
