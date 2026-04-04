import type {Meta, StoryObj} from '@storybook/react';
import {XDSMarkdown} from '@xds/markdown';

const meta: Meta<typeof XDSMarkdown> = {
  title: 'Components/XDSMarkdown',
  component: XDSMarkdown,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    maxHeadingLevel: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    isStreaming: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSMarkdown>;

const SAMPLE_MD = [
  '# XDSMarkdown Demo',
  '',
  'This component renders **markdown** with *design-system-consistent* styling.',
  '',
  '## Features',
  '',
  '- Headings mapped to XDS type scale',
  '- **Bold**, *italic*, and ~~strikethrough~~ text',
  '- [Links](https://example.com) with external detection',
  '- Inline `code` and fenced code blocks',
  '',
  '### Code Blocks',
  '',
  '```typescript',
  'interface User {',
  '  id: string;',
  '  name: string;',
  '}',
  '',
  'function greet(user: User): string {',
  '  return `Hello, ${user.name}!`;',
  '}',
  '```',
  '',
  '### Blockquote',
  '',
  '> Design systems free teams to focus on problems that matter.',
  '',
  '### Table',
  '',
  '| Component | Status | Tests |',
  '|-----------|--------|-------|',
  '| XDSMarkdown | Active | 18 |',
  '| XDSCodeBlock | Active | 44 |',
  '',
  '---',
  '',
  '1. First ordered item',
  '2. Second ordered item',
  '   - Nested unordered',
].join('\n');

export const Default: Story = {
  args: {
    children: SAMPLE_MD,
  },
};

export const Compact: Story = {
  args: {
    children: SAMPLE_MD,
    density: 'compact',
  },
};

export const Streaming: Story = {
  args: {
    children: SAMPLE_MD,
    isStreaming: true,
  },
};

export const ClampedHeadings: Story = {
  args: {
    children: SAMPLE_MD,
    maxHeadingLevel: 3,
  },
};

const AI_RESPONSE = [
  'Here is how you fetch a user in TypeScript:',
  '',
  '```typescript',
  'const response = await fetch(`/api/users/${id}`);',
  'const user: User = await response.json();',
  '```',
  '',
  'Key points:',
  '',
  '- Always check `response.ok` before parsing',
  '- Use `AbortController` for cancellation',
  '- Consider a `useUser` hook for React apps',
  '',
  'See https://example.com/docs for more details.',
].join('\n');

export const AIResponse: Story = {
  name: 'AI Response',
  args: {
    children: AI_RESPONSE,
    density: 'compact',
  },
};

export const WithLinkify: Story = {
  args: {
    children: 'Check T1234 for the bug report and visit https://example.com for docs.',
    linkifyPatterns: [
      {
        pattern: /\bT(\d+)\b/g,
        href: (m: RegExpMatchArray) => `https://tasks.example.com/${m[1]}`,
      },
    ],
  },
};
