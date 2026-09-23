// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Markdown} from '@astryxdesign/core/Markdown';
import type {MarkdownComponents} from '@astryxdesign/core/Markdown';
import {
  markdownCalloutsPlugin,
  markdownSoftBreaksPlugin,
} from '@astryxdesign/core/Markdown/plugins';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {expect, userEvent, within} from 'storybook/test';
import {
  createDelayedMarkdownDemoPlugin,
  createSourceDecorationDemo,
  markdownDemoPlugins,
  markdownFrontmatterDemo,
  markdownSemanticFenceDemoPlugin,
} from './Markdown.demoPlugins';
import {
  remarkBreaksPlugin,
  remarkRawHtmlPlugin,
  remarkSpecLinkPlugin,
  remarkUnsafeLinkPlugin,
  specBadgePlugin,
} from './Markdown.remarkPlugins';

const meta: Meta<typeof Markdown> = {
  title: 'Core/Markdown',
  component: Markdown,
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
type Story = StoryObj<typeof Markdown>;

const SAMPLE_MD = [
  '# Markdown Demo',
  '',
  'Renders **markdown** with *design-system-consistent* styling.',
  '',
  '## Features',
  '',
  '- Headings mapped to Astryx type scale',
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
  '| Markdown | Active | 73 |',
  '| CodeBlock | Active | 44 |',
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
      <Text type="large" display="block">
        <Markdown display="inline">
          {
            'Use `value` with **controlled state** and [read the docs](https://example.com) without creating block wrappers.'
          }
        </Markdown>
      </Text>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 12,
          display: 'grid',
          gap: 6,
        }}>
        <Text type="body" weight="bold" display="block">
          Prop description
        </Text>
        <Text type="body" color="secondary" display="block">
          <Markdown display="inline">
            {
              'Accepts an action item `{label, onClick?, icon?}`, a divider `{type: "divider"}`, or a section `{type: "section", items: [...]}`.'
            }
          </Markdown>
        </Text>
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
          <Button
            label="Replay"
            variant="secondary"
            size="sm"
            onClick={replay}
            isDisabled={isStreaming}
          />
          <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>
            {isStreaming
              ? `Streaming... ${charIndex}/${text.length}`
              : 'Complete'}
          </span>
        </div>
        <Markdown
          key={key}
          isStreaming={isStreaming}
          density="compact"
          headingLevelStart={3}>
          {text.slice(0, charIndex)}
        </Markdown>
      </div>
    );
  },
};

export const WithImages: Story = {
  name: 'With Images',
  render: () => (
    <div style={{maxWidth: 800}}>
      <Markdown>{`
Here is some text before the image.

![A landscape photo](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=680&h=400&fit=crop&auto=format)

Text between two images.

![A tall portrait photo](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop&auto=format)

And here's a really wide one:

![Wide panoramic shot](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=300&fit=crop&auto=format)

Final paragraph after all images.
`}</Markdown>
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
      <Markdown contentWidth={580} contentAlign="start">
        {CONTENT_ALIGN_TEXT}
      </Markdown>
    </div>
  ),
};

export const ContentAlignCenter: Story = {
  name: 'Content Align: Center',
  render: () => (
    <div style={{maxWidth: 900, border: '1px dashed #ccc', padding: 16}}>
      <Markdown contentWidth={580} contentAlign="center">
        {CONTENT_ALIGN_TEXT}
      </Markdown>
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
          <Link
            key={key}
            href={`https://issues.example.com/browse/${match[1]}`}
            isExternalLink
            weight="semibold">
            {match[0]}
          </Link>
        ),
      },
      {
        // GitHub-style issue references: #123, #456, etc.
        pattern: /#(\d+)/g,
        render: (match: RegExpMatchArray, key: string) => (
          <Link
            key={key}
            href={`https://github.com/org/repo/issues/${match[1]}`}
            isExternalLink
            weight="semibold">
            {match[0]}
          </Link>
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
        <Markdown
          inlinePlugins={inlinePlugins}
          density="compact"
          headingLevelStart={2}>
          {markdown}
        </Markdown>
      </div>
    );
  },
};

const StoryMath: NonNullable<MarkdownComponents['math']> = ({
  value,
  display,
}) => {
  const Tag = display === 'block' ? 'div' : 'span';
  return (
    <Tag
      role="math"
      aria-label={`Formula: ${value}`}
      style={{
        display: display === 'block' ? 'block' : 'inline',
        padding: display === 'block' ? '12px 16px' : '1px 4px',
        marginBlock: display === 'block' ? 12 : undefined,
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        fontFamily: 'serif',
        fontStyle: 'italic',
        textAlign: display === 'block' ? 'center' : undefined,
      }}>
      {value}
    </Tag>
  );
};

export const CustomMath: Story = {
  name: 'Custom Math Renderer',
  render: () => (
    <div style={{maxWidth: 680}}>
      <Markdown components={{math: StoryMath}}>
        {
          'A renderer can typeset inline math such as $E = mc^2$ without preprocessing the source.\n\n$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$\n\nCode remains opaque: `$not_math$`.'
        }
      </Markdown>
    </div>
  ),
};

const softBreaksSource = [
  'First line',
  'Second **emphasized** line',
  '',
  '[Linked',
  'label](/docs) stays one protected link.',
  '',
  '```text',
  'fenced',
  'code',
  '```',
].join('\n');

export const SoftBreaks: Story = {
  name: 'First-party soft breaks',
  parameters: {
    docs: {
      description: {
        story:
          'The first-party native plugin matches adapted remark-breaks output for supported prose. Links and code remain protected in both paths.',
      },
    },
  },
  render: () => (
    <div style={{display: 'grid', gap: 24, maxWidth: 680}}>
      <section data-soft-breaks="native">
        <Text>Native first-party plugin</Text>
        <Markdown plugins={[markdownSoftBreaksPlugin]}>
          {softBreaksSource}
        </Markdown>
      </section>
      <section data-soft-breaks="remark">
        <Text>Adapted remark-breaks</Text>
        <Markdown plugins={[remarkBreaksPlugin]}>{softBreaksSource}</Markdown>
      </section>
    </div>
  ),
  play: async ({canvasElement}) => {
    const pane = (kind: string): HTMLElement => {
      const element = canvasElement.querySelector<HTMLElement>(
        `[data-soft-breaks="${kind}"]`,
      );
      if (element == null) {
        throw new Error(`missing soft-breaks pane: ${kind}`);
      }
      return element;
    };
    const nativePane = pane('native');
    const remarkPane = pane('remark');

    await expect(nativePane.querySelectorAll('br')).toHaveLength(2);
    await expect(remarkPane.querySelectorAll('br')).toHaveLength(2);
    await expect(nativePane.querySelector('p')?.innerHTML).toBe(
      remarkPane.querySelector('p')?.innerHTML,
    );
    await expect(
      within(nativePane).getByRole('link', {name: 'Linked label'}),
    ).toHaveAttribute('href', '/docs');
    await expect(
      within(remarkPane).getByRole('link', {name: 'Linked label'}),
    ).toHaveAttribute('href', '/docs');
    await expect(nativePane.querySelector('code')?.textContent).toBe(
      'fenced\ncode',
    );
    await expect(remarkPane.querySelector('code')?.textContent).toBe(
      'fenced\ncode',
    );
  },
};

const calloutsSource = [
  ':::note Read this',
  'Callouts keep **rich Markdown**, [safe links](/docs), and lists.',
  '',
  '- First item',
  '- Second item',
  ':::',
  '',
  ':::tip',
  'Use an optional title after the variant.',
  ':::',
  '',
  ':::warning Check before continuing',
  'Warnings are static document content, not live alerts.',
  ':::',
  '',
  ':::danger',
  'Danger content stays readable and theme-aware.',
  ':::',
].join('\n');

export const Callouts: Story = {
  name: 'First-party callouts',
  parameters: {
    docs: {
      description: {
        story:
          'The first-party plugin parses note, tip, warning, and danger containers with optional titles and real Markdown children. Static authored content does not create alert or status live regions.',
      },
    },
  },
  render: () => (
    <div style={{maxWidth: 680}}>
      <Markdown plugins={[markdownCalloutsPlugin]}>{calloutsSource}</Markdown>
    </div>
  ),
  play: async ({canvasElement}) => {
    const callouts = canvasElement.querySelectorAll('[data-markdown-callout]');
    await expect(callouts).toHaveLength(4);
    await expect(
      within(canvasElement).getByRole('complementary', {
        name: 'Note: Read this',
      }),
    ).toHaveAttribute('data-markdown-callout', 'note');
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(
      2,
    );
    await expect(canvasElement.querySelector('[role="alert"]')).toBeNull();
  },
};

export const SyntaxPlugins: Story = {
  name: 'Syntax Plugins',
  render: () => (
    <div style={{maxWidth: 680}}>
      <Markdown plugins={markdownDemoPlugins}>
        {
          '# Plugin composition\n\nHello @{Ada}. Ordinary **Markdown** keeps its behavior, while TODO becomes a transform-owned node.\n\n:::note\nThis callout and mention are typed extension nodes.\n:::\n\nProtected contexts stay literal: `TODO @{Linus}` and [TODO @{Grace}](/people).'
        }
      </Markdown>
    </div>
  ),
};

export const SuspenseRenderer: Story = {
  name: 'Plugin renderer with Suspense',
  render: () => {
    const [run, setRun] = useState(0);
    const delayedPlugin = useMemo(
      () => createDelayedMarkdownDemoPlugin(),
      [run],
    );

    return (
      <div style={{maxWidth: 680}}>
        <div style={{marginBlockEnd: 12}}>
          <Button
            label="Replay delayed renderer"
            variant="secondary"
            size="sm"
            onClick={() => setRun(value => value + 1)}
          />
        </div>
        <Markdown key={run} plugins={[delayedPlugin]}>
          {
            'Before the async node.\n\nHello @{Ada}. This sibling Markdown renders immediately.\n\nAfter the async node.'
          }
        </Markdown>
      </div>
    );
  },
};

export const SemanticFence: Story = {
  name: 'Semantic Fence',
  render: () => (
    <div style={{maxWidth: 680}}>
      <Markdown plugins={[markdownSemanticFenceDemoPlugin]}>
        {
          '# Build flow\n\n```diagram Checkout to deploy\nCheckout --> Test --> Deploy\n```\n\nThe plugin renderer presents typed data only for declared languages. Other fences keep the ordinary copyable code fallback:\n\n```text\npnpm test\n```'
        }
      </Markdown>
    </div>
  ),
};

const decorationSource =
  '# Release notes\n\nThe parser now streams incrementally.\n\nEverything else is unchanged.';

export const SourceDecoration: Story = {
  name: 'Source Decoration Metadata',
  render: () => {
    const {plugins, readout} = createSourceDecorationDemo(
      decorationSource,
      'The parser now streams incrementally.',
    );
    return (
      <div style={{maxWidth: 680}}>
        <Markdown plugins={plugins}>{decorationSource}</Markdown>
        <Text>
          Decorations recorded while rendering: {readout.join(', ') || 'none'}.
          The document above is identical with and without them because the
          helper records metadata rather than visual presentation.
        </Text>
      </div>
    );
  },
};

const nativeAndRemarkSource = [
  '# Plugin composition',
  '',
  'Hello @{Ada}. TODO becomes a transform-owned node, and SPEC-4821 is claimed',
  'by whichever plugin runs first, next to an [Authored link](/people).',
  '',
  ':::note',
  'Native syntax and an adapted Remark transform share one ordered list.',
  ':::',
  '',
  'Protected contexts stay literal: `TODO @{Linus} SPEC-9999`.',
  '',
  '```txt',
  'SPEC-9999 stays copyable',
  '```',
].join('\n');

/**
 * Both plugins claim `SPEC-4821`, so whichever runs first consumes it and the
 * second sees output it must leave alone: a badge is an owned extension node,
 * and link children are a protected context.
 */
const nativeFirst = [
  ...markdownDemoPlugins,
  specBadgePlugin,
  remarkSpecLinkPlugin,
];
const remarkFirst = [
  ...markdownDemoPlugins,
  remarkSpecLinkPlugin,
  specBadgePlugin,
];

export const NativeAndRemarkPlugins: Story = {
  name: 'Native and Remark plugins',
  parameters: {
    docs: {
      description: {
        story:
          'Native syntax plugins and one adapted synchronous Remark transform run in the same ordered list, and the order decides the outcome. Both claim SPEC-4821: running the native badge first leaves the Remark transform nothing to link, and running the Remark transform first puts the text inside a link, which the native helper treats as a protected context. Astryx keeps ownership of the transformed destination, and code stays copyable either way.',
      },
    },
  },
  render: () => (
    <div style={{display: 'grid', gap: 24, maxWidth: 680}}>
      <section data-order="native-first">
        <Text>Native badge plugin first</Text>
        <Markdown plugins={nativeFirst}>{nativeAndRemarkSource}</Markdown>
      </section>
      <section data-order="remark-first">
        <Text>Adapted Remark plugin first</Text>
        <Markdown plugins={remarkFirst}>{nativeAndRemarkSource}</Markdown>
      </section>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const pane = (order: string): HTMLElement => {
      const element = canvasElement.querySelector<HTMLElement>(
        `[data-order="${order}"]`,
      );
      if (element == null) {
        throw new Error(`missing pane: ${order}`);
      }
      return element;
    };
    const nativeFirstPane = within(pane('native-first'));
    const remarkFirstPane = within(pane('remark-first'));

    // Native syntax and transform plugins still own their own nodes.
    await expect(nativeFirstPane.getByText('@Ada')).toBeInTheDocument();
    await expect(nativeFirstPane.getByLabelText('Note')).toBeInTheDocument();
    await expect(nativeFirstPane.getByText('TODO')).toBeInTheDocument();

    // Native first: the badge consumed the prose, so no link was produced.
    const badge = nativeFirstPane.getByText('SPEC-4821');
    await expect(badge).toHaveAttribute('data-spec-badge');
    await expect(
      nativeFirstPane.queryByRole('link', {name: 'SPEC-4821'}),
    ).not.toBeInTheDocument();

    // Reversed: the Remark transform consumed it, and the native helper left
    // the link's children alone — so the same source renders differently.
    const specLink = remarkFirstPane.getByRole('link', {name: 'SPEC-4821'});
    await expect(specLink).toHaveAttribute('href', '/specs/4821');
    await expect(remarkFirstPane.getByText('SPEC-4821')).not.toHaveAttribute(
      'data-spec-badge',
    );

    // Protected contexts and copyable code are untouched in both orders.
    await expect(canvas.getAllByText('TODO @{Linus} SPEC-9999')).toHaveLength(
      2,
    );
    await expect(canvas.getAllByText('SPEC-9999 stays copyable')).toHaveLength(
      2,
    );

    // Keyboard order follows document order: the transformed link is an
    // ordinary tab stop that hands focus on to the authored link.
    await expect(
      remarkFirstPane.getAllByRole('link').map(link => link.textContent),
    ).toEqual(['SPEC-4821', 'Authored link']);
    specLink.focus();
    await expect(specLink).toHaveFocus();
    await userEvent.tab();
    await expect(
      remarkFirstPane.getByRole('link', {name: 'Authored link'}),
    ).toHaveFocus();
  },
};

const fullStackFrontmatterSource = [
  '---',
  'title: Plugin rollout',
  'status: ready',
  '---',
  '# Plugin rollout',
  '',
  'Hello @{Ada}. TODO tracks SPEC-4821.',
  '',
  '```diagram Release path',
  'Author --> Review --> Publish',
  '```',
].join('\n');

export const NativeFrontmatterWithFullStack: Story = {
  name: 'Native frontmatter with full plugin stack',
  render: () => {
    const metadata = markdownFrontmatterDemo.parse(fullStackFrontmatterSource);
    const {plugins: decorationPlugins} = createSourceDecorationDemo(
      fullStackFrontmatterSource,
      'Plugin rollout',
    );
    const plugins = [
      markdownFrontmatterDemo.plugin,
      ...markdownDemoPlugins,
      markdownSemanticFenceDemoPlugin,
      remarkSpecLinkPlugin,
      ...decorationPlugins,
    ];
    const label =
      metadata.status === 'match'
        ? `${metadata.metadata.title} — ${metadata.metadata.status}`
        : 'No document metadata';

    return (
      <div style={{maxWidth: 680}}>
        <Text>Document metadata: {label}</Text>
        <Markdown plugins={plugins}>{fullStackFrontmatterSource}</Markdown>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Document metadata: Plugin rollout — ready'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', {name: 'Plugin rollout'}),
    ).toBeInTheDocument();
    await expect(canvas.getByText('@Ada')).toBeInTheDocument();
    await expect(canvas.getByText('TODO')).toBeInTheDocument();
    await expect(canvas.getByRole('link', {name: 'SPEC-4821'})).toHaveAttribute(
      'href',
      '/specs/4821',
    );
    await expect(
      canvas.getByRole('figure', {name: 'Release path'}),
    ).toBeVisible();
    await expect(
      canvas.queryByText('title: Plugin rollout'),
    ).not.toBeInTheDocument();
  },
};

export const RemarkOutsideTheProfile: Story = {
  name: 'Remark outside the profile',
  parameters: {
    docs: {
      description: {
        story:
          'A plugin that emits raw HTML or a rejected destination falls closed: the last valid document stays readable, no markup is injected, and the authored destination survives.',
      },
    },
  },
  render: () => (
    <div style={{maxWidth: 680}}>
      <Markdown plugins={[remarkRawHtmlPlugin, remarkUnsafeLinkPlugin]}>
        {
          '# Still readable\n\nProse survives with its [authored link](/people).'
        }
      </Markdown>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {name: 'Still readable'}),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', {name: 'authored link'}),
    ).toHaveAttribute('href', '/people');
    await expect(canvas.queryByText('Injected')).not.toBeInTheDocument();
  },
};

export const PluginsOmittedBaseline: Story = {
  name: 'Plugins omitted baseline',
  parameters: {
    docs: {
      description: {
        story:
          'The same source without plugins. Extension syntax stays literal, no badge or transformed link exists, so opting in is the only thing that changes behavior.',
      },
    },
  },
  render: () => (
    <div style={{maxWidth: 680}}>
      <Markdown>{nativeAndRemarkSource}</Markdown>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('link', {name: 'SPEC-4821'}),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText('Note')).not.toBeInTheDocument();
    await expect(canvas.getByText(/Hello @\{Ada\}/)).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', {name: 'Authored link'}),
    ).toBeInTheDocument();
  },
};
