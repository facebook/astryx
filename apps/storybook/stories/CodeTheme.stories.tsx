// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {
  XDSSyntaxTheme as SyntaxThemeProvider,
  defineSyntaxTheme,
} from '@xds/core/theme/syntax';
import {defineTheme, XDSTheme} from '@xds/core/theme';
import {
  oneDarkPro,
  dracula,
  monokai,
  nord,
  tokyoNight,
  catppuccinMocha,
  githubDark,
  githubLight,
  solarizedLight,
  oneLight,
  catppuccinLatte,
  tokyoNightLight,
  allSyntaxPresets,
} from '@xds/core/theme/syntax';

const sampleCode = [
  "import {useState, useEffect} from 'react';",
  '',
  'interface User {',
  '  id: string;',
  '  name: string;',
  '  roles: string[];',
  '}',
  '',
  'const API_URL = "https://api.example.com";',
  'const MAX_RETRIES = 3;',
  '',
  '// Fetch user data with retry logic',
  'async function fetchUser(id: string): Promise<User> {',
  '  const response = await fetch(`${API_URL}/users/${id}`);',
  '  if (!response.ok) {',
  '    throw new Error(`HTTP ${response.status}`);',
  '  }',
  '  return response.json();',
  '}',
  '',
  'export function UserCard({id}: {id: string}) {',
  '  const [user, setUser] = useState<User | null>(null);',
  '',
  '  useEffect(() => {',
  '    fetchUser(id).then(setUser);',
  '  }, [id]);',
  '',
  '  if (!user) return <div>Loading...</div>;',
  '',
  '  return (',
  '    <div className="card">',
  '      <h2>{user.name}</h2>',
  '      <span>{user.roles.length} roles</span>',
  '    </div>',
  '  );',
  '}',
].join('\n');

const meta: Meta = {
  title: 'Core/Theme/SyntaxTheme',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Syntax theme provider for code components. Wraps XDSCodeBlock and XDSCodeEditor ' +
          'to apply community syntax color themes. 12 presets ship in @xds/core/theme/syntax.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Individual theme stories
// ---------------------------------------------------------------------------

export const OneDarkPro: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={oneDarkPro}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const Dracula: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={dracula}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const Monokai: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={monokai}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const Nord: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={nord}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const TokyoNight: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={tokyoNight}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const CatppuccinMocha: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={catppuccinMocha}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const GitHubLight: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={githubLight}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const GitHubDark: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={githubDark}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const SolarizedLight: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={solarizedLight}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const OneLight: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={oneLight}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const CatppuccinLatte: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={catppuccinLatte}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

export const TokyoNightLight: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={tokyoNightLight}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="UserCard.tsx"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

// ---------------------------------------------------------------------------
// Gallery — all themes side by side
// ---------------------------------------------------------------------------

const shortCode = [
  'const greet = (name: string) => {',
  '  // Say hello',
  '  return `Hello, ${name}!`;',
  '};',
  '',
  'const result = greet("World");',
  'console.log(result); // Hello, World!',
].join('\n');

export const AllThemesGallery: StoryObj = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
      {allSyntaxPresets.map(theme => (
        <SyntaxThemeProvider key={theme.name} theme={theme}>
          <XDSCodeBlock
            code={shortCode}
            language="typescript"
            title={theme.name}
            hasLineNumbers
          />
        </SyntaxThemeProvider>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ---------------------------------------------------------------------------
// Nested override — provider sets base, inner provider overrides
// ---------------------------------------------------------------------------

export const NestedOverride: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={nord}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <XDSCodeBlock
          code="// Inherits Nord from provider"
          language="typescript"
          title="nord (from provider)"
        />
        <SyntaxThemeProvider theme={dracula}>
          <XDSCodeBlock
            code="// Inner provider overrides to Dracula"
            language="typescript"
            title="dracula (inner override)"
          />
        </SyntaxThemeProvider>
      </div>
    </SyntaxThemeProvider>
  ),
};

// ---------------------------------------------------------------------------
// Custom syntax theme — defineSyntaxTheme() with your own colors
// ---------------------------------------------------------------------------

const cyberpunk = defineSyntaxTheme({
  name: 'cyberpunk',
  tokens: {
    keyword: '#ff2a6d',
    string: '#05d9e8',
    comment: '#4a5568',
    number: '#d1f7ff',
    function: '#ff6ac1',
    type: '#7efff5',
    variable: '#e2e8f0',
    operator: '#ff9e64',
    constant: '#d1f7ff',
    tag: '#ff2a6d',
    attribute: '#7efff5',
    property: '#05d9e8',
    punctuation: '#718096',
    background: '#0d0221',
  },
});

export const CustomTheme: StoryObj = {
  render: () => (
    <SyntaxThemeProvider theme={cyberpunk}>
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="Custom: Cyberpunk"
        hasLineNumbers
      />
    </SyntaxThemeProvider>
  ),
};

// ---------------------------------------------------------------------------
// Theme with syntax defaults — defineTheme({ syntax: ... })
// ---------------------------------------------------------------------------

const darkDevTheme = defineTheme({
  name: 'dark-dev',
  syntax: dracula,
  tokens: {
    '--color-background-surface': '#282a36',
    '--color-text-primary': '#f8f8f2',
  },
});

export const ThemeWithSyntaxDefaults: StoryObj = {
  render: () => (
    <XDSTheme theme={darkDevTheme} mode="dark">
      <XDSCodeBlock
        code={sampleCode}
        language="typescript"
        title="defineTheme with syntax: dracula"
        hasLineNumbers
      />
    </XDSTheme>
  ),
};
