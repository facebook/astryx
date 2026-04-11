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

const STREAMING_RESPONSE = [
  '## Setting Up a Design System',
  '',
  "A design system is more than a component library — it's a **shared language** between design and engineering. Here's how to build one that scales.",
  '',
  '### 1. Start with Tokens',
  '',
  'Design tokens are the atomic values that define your visual language:',
  '',
  '```typescript',
  'const tokens = {',
  '  color: {',
  "    primary: '#0066FF',",
  "    secondary: '#6B7280',",
  "    success: '#10B981',",
  "    danger: '#EF4444',",
  '  },',
  '  spacing: {',
  "    xs: '4px',",
  "    sm: '8px',",
  "    md: '16px',",
  "    lg: '24px',",
  "    xl: '32px',",
  '  },',
  '  radius: {',
  "    sm: '4px',",
  "    md: '8px',",
  "    lg: '16px',",
  "    full: '9999px',",
  '  },',
  '};',
  '```',
  '',
  'These tokens should be the *single source of truth* for every component.',
  '',
  '### 2. Component Architecture',
  '',
  'Good components follow these principles:',
  '',
  '- **Composable** — small pieces that combine into complex UIs',
  '- **Accessible** — keyboard navigation and screen reader support built-in',
  '- **Themeable** — visual customization without forking',
  "- **Documented** — usage examples, props tables, and do/don't guidelines",
  '',
  '> The best design systems are *opinionated enough* to ensure consistency, but *flexible enough* to handle edge cases gracefully.',
  '',
  '### 3. Adoption Strategy',
  '',
  'Rolling out a design system requires planning:',
  '',
  '| Phase | Duration | Goal |',
  '|:------|:--------:|:-----|',
  '| Alpha | 4 weeks | Core components, internal dogfooding |',
  '| Beta | 8 weeks | Expanded component set, 2-3 pilot teams |',
  '| GA | Ongoing | Full adoption, migration support |',
  '',
  'Key metrics to track:',
  '',
  '1. **Component coverage** — what percentage of UI patterns are served',
  '2. **Adoption rate** — teams actively using the system',
  '3. **Contribution rate** — external PRs and feature requests',
  '4. **Consistency score** — visual audits across products',
  '',
  '### 4. Maintenance',
  '',
  'A design system is a *living product*. Plan for:',
  '',
  '- [x] Automated visual regression testing',
  '- [x] Semantic versioning with changelogs',
  '- [ ] Breaking change codemods',
  '- [ ] Cross-platform support (web, mobile, native)',
  '',
  '---',
  '',
  "The most important thing? **Ship early, iterate often.** A design system that exists and is used beats a perfect one that's still in planning.",
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
    children: STREAMING_RESPONSE,
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
    const text = STREAMING_RESPONSE;
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
        <div
          style={{
            marginBlockEnd: 12,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
          <XDSButton
            label="Replay"
            variant="secondary"
            size="sm"
            onClick={replay}
            isDisabled={isStreaming}
          />
          <span style={{fontSize: 12, color: '#666'}}>
            {isStreaming
              ? `Streaming... ${charIndex}/${text.length}`
              : 'Complete'}
          </span>
        </div>
        <XDSMarkdown
          key={key}
          isStreaming={isStreaming}
          density="compact"
          headingLevelStart={3}>
          {text.slice(0, charIndex)}
        </XDSMarkdown>
      </div>
    );
  },
};
