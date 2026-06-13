// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useEffect, useCallback} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSMarkdown> = {
  title: 'Core/Markdown',
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
    display: {
      control: 'select',
      options: ['block', 'inline'],
    },
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

export const InlineDisplay: Story = {
  name: 'Inline Display',
  render: () => (
    <div style={{maxWidth: 680, display: 'grid', gap: 16}}>
      <XDSText type="large" display="block">
        <XDSMarkdown display="inline">
          {
            'Use `value` with **controlled state** and [read the docs](https://example.com) without creating block wrappers.'
          }
        </XDSMarkdown>
      </XDSText>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 12,
          display: 'grid',
          gap: 6,
        }}>
        <XDSText type="body" weight="bold" display="block">
          Prop description
        </XDSText>
        <XDSText type="body" color="secondary" display="block">
          <XDSMarkdown display="inline">
            {
              'Accepts an action item `{label, onClick?, icon?}`, a divider `{type: "divider"}`, or a section `{type: "section", items: [...]}`.'
            }
          </XDSMarkdown>
        </XDSText>
      </div>
    </div>
  ),
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
      if (!isStreaming) {
        return;
      }
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

export const WithImages: Story = {
  name: 'With Images',
  render: () => (
    <div style={{maxWidth: 800}}>
      <XDSMarkdown>{`
Here is some text before the image.

![A landscape photo](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=680&h=400&fit=crop&auto=format)

Text between two images.

![A tall portrait photo](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop&auto=format)

And here's a really wide one:

![Wide panoramic shot](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=300&fit=crop&auto=format)

Final paragraph after all images.
`}</XDSMarkdown>
    </div>
  ),
};

const CONTENT_ALIGN_TEXT = `
# Content Alignment

This paragraph is constrained by \`contentWidth\`. Notice how it's narrower than the code block and table below. The alignment prop controls where this narrow prose sits within the wider container.

Here's a bullet list that also respects prose width:
- First item with some explanation text
- Second item that wraps to show the width constraint
- Third item for good measure

\`\`\`typescript
// Code blocks break out to full container width regardless of contentAlign
export function calculateLayout(items: Item[], containerWidth: number): Layout {
  const columns = Math.floor(containerWidth / COLUMN_MIN_WIDTH);
  return { columns, gap: GRID_GAP, items: distributeItems(items, columns) };
}
\`\`\`

Back to prose — this paragraph is aligned according to the \`contentAlign\` prop while the code block above spans the full width.

| Component | Status | Notes |
|-----------|--------|-------|
| Button | Stable | Full API |
| CodeBlock | Stable | With collapsible |
| Markdown | In progress | Adding alignment |

Final paragraph after the table.
`;

export const ContentAlignStart: Story = {
  name: 'Content Align: Start',
  render: () => (
    <div style={{maxWidth: 900, border: '1px dashed #ccc', padding: 16}}>
      <XDSMarkdown contentWidth={580} contentAlign="start">
        {CONTENT_ALIGN_TEXT}
      </XDSMarkdown>
    </div>
  ),
};

export const ContentAlignCenter: Story = {
  name: 'Content Align: Center',
  render: () => (
    <div style={{maxWidth: 900, border: '1px dashed #ccc', padding: 16}}>
      <XDSMarkdown contentWidth={580} contentAlign="center">
        {CONTENT_ALIGN_TEXT}
      </XDSMarkdown>
    </div>
  ),
};

export const InlinePlugins: Story = {
  name: 'Inline Plugins',
  render: () => {
    const inlinePlugins = [
      {
        // JIRA-style ticket references: PROJ-123, BUG-456, etc.
        pattern: /\b([A-Z][A-Z0-9]+-\d+)\b/g,
        render: (match: RegExpMatchArray, key: string) => (
          <XDSLink
            key={key}
            href={`https://issues.example.com/browse/${match[1]}`}
            isExternalLink
            weight="semibold">
            {match[0]}
          </XDSLink>
        ),
      },
      {
        // GitHub-style issue references: #123, #456, etc.
        pattern: /#(\d+)/g,
        render: (match: RegExpMatchArray, key: string) => (
          <XDSLink
            key={key}
            href={`https://github.com/org/repo/issues/${match[1]}`}
            isExternalLink
            weight="semibold">
            {match[0]}
          </XDSLink>
        ),
      },
    ];

    const markdown = [
      '## Release Notes — v2.1.0',
      '',
      'This release fixes several issues reported in PROJ-42 and introduces',
      'the inline plugins feature requested in #1873.',
      '',
      '### Bug Fixes',
      '',
      '- Fixed crash in streaming mode (BUG-789)',
      '- Resolved memory leak in chat components (PROJ-101)',
      '- **Bold context**: Plugin works inside **PROJ-55 formatting**',
      '',
      '### Code Example (not linkified)',
      '',
      '```typescript',
      '// PROJ-999 and BUG-888 should NOT become links inside code blocks',
      'const ticketId = "PROJ-999";',
      '```',
      '',
      'Inline code is also safe: `PROJ-999` stays as plain text.',
      '',
      '### Migration Guide',
      '',
      'See PROJ-200 for the full pattern. Also check [the docs](/docs/markdown)',
      'for usage alongside regular markdown links.',
    ].join('\n');

    return (
      <div style={{maxWidth: 680}}>
        <XDSMarkdown
          inlinePlugins={inlinePlugins}
          density="compact"
          headingLevelStart={2}>
          {markdown}
        </XDSMarkdown>
      </div>
    );
  },
};
