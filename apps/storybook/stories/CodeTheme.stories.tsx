import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSSyntaxTheme as SyntaxThemeProvider} from '@xds/core/theme/syntax';
import {
  oneDarkPro,
  dracula,
  monokai,
  nord,
  tokyoNight,
  catppuccinMocha,
  githubLight,
  solarizedLight,
  oneLight,
  catppuccinLatte,
  tokyoNightLight,
  allSyntaxPresets,
} from '@xds/theme-syntax';

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
  title: 'Theme/XDSSyntaxTheme',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Syntax theme provider for code components. Wraps XDSCodeBlock and XDSCodeEditor ' +
          'to apply community syntax color themes. 11 presets ship in @xds/theme-syntax.',
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
      {allSyntaxPresets.map((theme) => (
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
