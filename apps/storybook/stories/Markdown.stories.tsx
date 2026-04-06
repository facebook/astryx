import {useState, useEffect, useCallback} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSButton} from '@xds/core/Button';

const meta: Meta<typeof XDSMarkdown> = {
  title: 'Components/XDSMarkdown',
  component: XDSMarkdown,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    headingLevelStart: {
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
  'Renders **markdown** with *design-system-consistent* styling.',
  '',
  '## Features',
  '',
  '- Headings mapped to XDS type scale',
  '- **Bold**, *italic*, and ~~strikethrough~~ text',
  '- [Links](https://example.com) with external detection',
  '- Inline `code` and fenced code blocks',
  '',
  '### Code Block',
  '',
  '```typescript',
  'interface User {',
  '  id: string;',
  '  name: string;',
  '}',
  '',
  'function greet(user: User) {',
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
  '|:----------|:------:|------:|',
  '| XDSMarkdown | Active | 73 |',
  '| XDSCodeBlock | Active | 44 |',
  '',
  '### Task List',
  '',
  '- [x] Parser',
  '- [x] Renderer',
  '- [ ] Storybook stories',
  '',
  '---',
  '',
  '1. First ordered item',
  '2. Second ordered item',
].join('\n');

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
  '| Method | Status | Use Case |',
  '|--------|--------|----------|',
  '| GET | 200 | Fetch resource |',
  '| POST | 201 | Create resource |',
  '| PUT | 200 | Update resource |',
  '',
  '> **Tip**: Wrap fetch calls in a try/catch for error handling.',
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

export const AIResponse: Story = {
  name: 'AI Response',
  args: {
    children: AI_RESPONSE,
    density: 'compact',
    headingLevelStart: 3,
  },
};

export const ShiftedHeadings: Story = {
  name: 'Shifted Headings (start at h3)',
  args: {
    children: SAMPLE_MD,
    headingLevelStart: 3,
  },
};

export const TableFocused: Story = {
  name: 'Table',
  args: {
    children: [
      '## Comparison Table',
      '',
      '| Feature | React | Vue | Svelte |',
      '|:--------|:-----:|:---:|-------:|',
      '| Virtual DOM | Yes | Yes | No |',
      '| Bundle Size | ~40KB | ~30KB | ~2KB |',
      '| TypeScript | Native | Plugin | Native |',
      '| Learning Curve | Medium | Easy | Easy |',
    ].join('\n'),
  },
};

export const Streaming: Story = {
  render: () => {
    const text = AI_RESPONSE;
    const [charIndex, setCharIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(true);
    const [key, setKey] = useState(0);

    useEffect(() => {
      if (!isStreaming) return;
      if (charIndex >= text.length) {
        setIsStreaming(false);
        return;
      }
      const chunkSize = Math.floor(Math.random() * 8) + 2;
      const delay = 30 + Math.random() * 60;
      const timer = setTimeout(() => {
        setCharIndex(prev => Math.min(prev + chunkSize, text.length));
      }, delay);
      return () => clearTimeout(timer);
    }, [charIndex, isStreaming, text]);

    const replay = useCallback(() => {
      setCharIndex(0);
      setIsStreaming(true);
      setKey(k => k + 1);
    }, []);

    return (
      <div>
        <div style={{marginBlockEnd: 12, display: 'flex', gap: 8, alignItems: 'center'}}>
          <XDSButton
            label="Replay"
            variant="secondary"
            size="sm"
            onClick={replay}
            isDisabled={isStreaming}
          />
          <span style={{fontSize: 12, color: '#666'}}>
            {isStreaming ? `Streaming... ${charIndex}/${text.length}` : 'Complete'}
          </span>
        </div>
        <XDSMarkdown key={key} isStreaming={isStreaming} density="compact" headingLevelStart={3}>
          {text.slice(0, charIndex)}
        </XDSMarkdown>
      </div>
    );
  },
};
