'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {useSearchParams} from 'next/navigation';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSNavMenuItem} from '@xds/core/NavMenu';
import {XDSTable} from '@xds/core/Table';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {
  ExternalLinkIcon,
  ContrastIcon,
  FullscreenIcon,
  SearchIcon,
  ProfileIcon,
  PaletteIcon,
  GridIcon,
  CodeIcon,
  UploadIcon,
  SparklesIcon,
  HeartIcon,
  TerminalIcon,
  ChatIcon,
  ChartsIcon,
  DownloadIcon,
  SendIcon,
} from './docsite-icons';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSChatComposer} from '@xds/core/Chat';
import {XDSLink} from '@xds/core/Link';
import {XDSPopover} from '@xds/core/Popover';
import {COMPONENT_PREVIEWS} from './ComponentPreviews';
import {SEARCH_COMMANDS, basePath} from './constants';
import {
  COMPONENT_CATEGORIES,
  getComponentName,
  getComponentDocs,
} from './docsview-data';

const localStyles = stylex.create({
  previewCard: {
    borderRadius: 12,
    cursor: 'pointer',
  },
  pageContainer: {
    maxWidth: 840,
    marginInline: 'auto',
    paddingBlock: 32,
    paddingInline: 40,
  },
});

// ---------------------------------------------------------------------------
// Library overview data
// ---------------------------------------------------------------------------

const FOUNDATION_ITEMS: {
  key: string;
  title: string;
  description: string;
  image: string;
}[] = [
  {
    key: 'typography',
    title: 'Typography',
    image: `${basePath}/docsite/FoundationsTypogrpahy.png`,
    description:
      'A type scale from display-1 down to supporting text, with weight and color options. Establishes visual hierarchy without guessing font sizes.',
  },
  {
    key: 'colors',
    title: 'Colors',
    image: `${basePath}/docsite/FoundationsColors.png`,
    description:
      'A semantic palette that adapts across themes. Use surface, text, border, and accent tokens instead of raw hex values so your UI stays consistent in light, dark, and custom themes.',
  },
  {
    key: 'shape',
    title: 'Shape',
    image: `${basePath}/docsite/FoundationsShape.png`,
    description:
      'Border radius tokens from sharp (2px) to fully rounded (pill). Controls, cards, and containers each have a designated radius so shapes feel intentional.',
  },
  {
    key: 'spacing',
    title: 'Spacing',
    image: `${basePath}/docsite/FoundationsSpacing.png`,
    description:
      'A 4px-based scale (0–10) used for padding, margins, and gaps. Keeps layouts aligned to a consistent rhythm across every component and page.',
  },
  {
    key: 'icons',
    title: 'Icons',
    image: `${basePath}/docsite/FoundationsIcons.png`,
    description:
      'A consistent icon set built for XDS components. Semantic and non-semantic color options with multiple sizes.',
  },
  {
    key: 'illustrations',
    title: 'Illustrations',
    image: `${basePath}/docsite/FoundationsIllustrations.png`,
    description:
      'Illustration guidelines and assets for empty states, onboarding, and feature highlights.',
  },
];

const LIBRARY_PACKAGES: {
  key: string;
  name: string;
  description: string;
  version?: string;
  status: 'Stable' | 'Published' | 'Experimental' | 'Coming Soon';
  iconType: 'core' | 'charts' | 'chat' | 'cli';
}[] = [
  {
    key: 'pkg-core',
    name: '@xds/core',
    description:
      'Core UI component library with 60+ accessible, themeable React components built on StyleX.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'core',
  },
  {
    key: 'pkg-vega',
    name: '@xds/vega',
    description:
      'Chart and data visualization components. Bar, line, area, pie, and more — built for dashboards and analytics.',
    status: 'Coming Soon',
    iconType: 'charts',
  },
  {
    key: 'pkg-chat',
    name: '@xds/chat',
    description:
      'Conversational UI components for AI assistants, messaging, and chat interfaces with thread support.',
    status: 'Stable',
    iconType: 'chat',
  },
  {
    key: 'pkg-cli',
    name: '@xds/cli',
    description:
      'CLI for scaffolding projects, theming, templates, swizzling components, and agent docs.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'cli',
  },
];

const RESOURCE_ITEMS: {
  key?: string;
  title: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  image?: string;
  iconBg: string;
  iconColor: string;
  isExternal?: boolean;
  href?: string;
}[] = [
  {
    title: 'Figma Library',
    description: 'Design files, tokens, and component specs for designers.',
    image: `${basePath}/docsite/figma-logo.png`,
    iconBg: 'transparent',
    iconColor: '#7C3AED',
    isExternal: true,
    href: 'https://www.figma.com/design/c9CR0F4jJQwhue60Ec7qOz/XDS-Open-Source-Library',
  },
  {
    key: 'res-npm',
    title: 'NPM Packages',
    description: 'Published packages on the npm registry under the @xds scope.',
    icon: DownloadIcon,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    key: 'res-agent-docs',
    title: 'AI / Agent Docs',
    description:
      'AGENTS.md and CLI docs for using XDS with AI coding assistants.',
    icon: SparklesIcon,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    key: 'res-publishing',
    title: 'Publishing',
    description: 'How to publish components, themes, and templates to Craft.',
    icon: HeartIcon,
    iconBg: '#FCE7F3',
    iconColor: '#EC4899',
  },
];

const XDS_OFFERINGS: {
  title: string;
  subtitle: string;
  pkg: string;
  color: string;
  features: string[];
}[] = [
  {
    title: 'XDS OSS (External)',
    subtitle: 'Open source for everyone',
    pkg: '@xds/core',
    color: '#059669',
    features: [
      'TypeScript + StyleX with full type safety',
      'MIT licensed — use anywhere, no restrictions',
      'Source-level distribution with tree-shaking',
      'Themeable via @xds/theme-* packages',
      'CLI tooling and AI agent docs',
      'Fork & swizzle any component',
    ],
  },
  {
    title: 'XDS OSS (Nest)',
    subtitle: 'Same library, internal platform',
    pkg: '@xds/core',
    color: '#2563EB',
    features: [
      'Same @xds/core package as external',
      'Works natively on the Nest platform',
      'Same components, same API, same themes',
      'No separate library or migration needed',
      'Build internal tools with production-grade UI',
      'Access to all CLI tooling and templates',
    ],
  },
  {
    title: 'XDS WWW (Intern)',
    subtitle: 'Legacy internal system',
    pkg: '@xds/www',
    color: '#6B7280',
    features: [
      'Flow types for Meta monorepo',
      'Pre-built dist/ artifacts',
      'Legacy component API patterns',
      'Maintained by the XDS team',
      'internalfb.com only — not available in Nest',
      'Tightly coupled to Intern platform',
    ],
  },
];

// ---------------------------------------------------------------------------
// LibraryOverview component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// What's New changelog data (GitHub Changelog style)
// ---------------------------------------------------------------------------

type ChangelogType = 'Release' | 'Improvement' | 'Fix' | 'Breaking';

const CHANGELOG_ENTRIES: {
  date: string;
  type: ChangelogType;
  title: string;
  tags: string[];
}[] = [
  // April 2026
  {
    date: 'Apr.18',
    type: 'Release',
    title:
      '@xds/chat package with message bubbles, thread view, and AI composer',
    tags: ['chat', '@xds/chat'],
  },
  {
    date: 'Apr.18',
    type: 'Release',
    title:
      '@xds/vega charts: Bar, Line, Area, and Pie components for dashboards',
    tags: ['charts', '@xds/vega'],
  },
  {
    date: 'Apr.18',
    type: 'Release',
    title: 'Calendar component with single date and date range selection',
    tags: ['core', 'form'],
  },
  {
    date: 'Apr.16',
    type: 'Improvement',
    title:
      'Dialog entry animations now use @starting-style instead of JS state',
    tags: ['core', 'animation'],
  },
  {
    date: 'Apr.14',
    type: 'Fix',
    title: 'Popover focus trap no longer breaks with nested popovers',
    tags: ['core', 'accessibility'],
  },
  {
    date: 'Apr.10',
    type: 'Improvement',
    title: 'Button loading state preserves width to prevent layout shift',
    tags: ['core'],
  },
  {
    date: 'Apr.08',
    type: 'Improvement',
    title: 'TextInput now supports startIcon and endIcon slots',
    tags: ['core', 'form'],
  },
  {
    date: 'Apr.04',
    type: 'Release',
    title: 'xds swizzle command for ejecting components into your codebase',
    tags: ['cli', '@xds/cli'],
  },
  {
    date: 'Apr.04',
    type: 'Release',
    title: 'xds template command for scaffolding full page layouts',
    tags: ['cli', '@xds/cli'],
  },
  {
    date: 'Apr.04',
    type: 'Release',
    title: 'Agent docs generation via xds docs for AI coding assistants',
    tags: ['cli', '@xds/cli'],
  },
  {
    date: 'Apr.02',
    type: 'Fix',
    title: 'Table sort indicator alignment on narrow columns',
    tags: ['core'],
  },
  // March 2026
  {
    date: 'Mar.20',
    type: 'Release',
    title:
      'Theme packages: @xds/theme-default, @xds/theme-neutral, @xds/theme-daily',
    tags: ['themes'],
  },
  {
    date: 'Mar.20',
    type: 'Release',
    title: 'CommandPalette with fuzzy search and keyboard navigation',
    tags: ['core'],
  },
  {
    date: 'Mar.20',
    type: 'Release',
    title: 'PowerSearch component for advanced filter-based search interfaces',
    tags: ['core', 'form'],
  },
  {
    date: 'Mar.18',
    type: 'Improvement',
    title: 'SideNav collapse animation is smoother with CSS transitions',
    tags: ['core', 'animation'],
  },
  {
    date: 'Mar.15',
    type: 'Fix',
    title: 'DropdownMenu keyboard navigation skipping disabled items',
    tags: ['core', 'accessibility'],
  },
  {
    date: 'Mar.12',
    type: 'Breaking',
    title:
      'XDSThemeProvider: theme prop now accepts a theme package instead of a config object',
    tags: ['core', 'themes'],
  },
  {
    date: 'Mar.05',
    type: 'Release',
    title: 'MultiSelector component for multi-value tokenized selection',
    tags: ['core', 'form'],
  },
  {
    date: 'Mar.05',
    type: 'Release',
    title: 'Tokenizer component for tag-style multi-value inputs',
    tags: ['core', 'form'],
  },
  {
    date: 'Mar.05',
    type: 'Release',
    title: 'FormLayout component for structured form field arrangement',
    tags: ['core', 'form'],
  },
  {
    date: 'Mar.03',
    type: 'Improvement',
    title:
      'All form components now announce validation errors to screen readers',
    tags: ['core', 'accessibility'],
  },
  {
    date: 'Mar.01',
    type: 'Fix',
    title:
      'CheckboxInput indeterminate state not rendering correctly in Safari',
    tags: ['core', 'form'],
  },
  // February 2026
  {
    date: 'Feb.18',
    type: 'Release',
    title:
      'AppShell component for foundational page layout with header, sidebar, and content',
    tags: ['core', 'layout'],
  },
  {
    date: 'Feb.18',
    type: 'Release',
    title: 'TopNav with mega menu support and responsive mobile drawer',
    tags: ['core', 'navigation'],
  },
  {
    date: 'Feb.18',
    type: 'Release',
    title: 'Breadcrumbs component with overflow truncation',
    tags: ['core', 'navigation'],
  },
  {
    date: 'Feb.14',
    type: 'Improvement',
    title: 'Card hover state uses CSS transitions instead of JS state',
    tags: ['core'],
  },
  {
    date: 'Feb.10',
    type: 'Improvement',
    title: 'Slider supports keyboard step, page-step, and home/end shortcuts',
    tags: ['core', 'accessibility'],
  },
  {
    date: 'Feb.05',
    type: 'Fix',
    title: 'Stack gap prop not applying when direction changes at breakpoints',
    tags: ['core', 'layout'],
  },
];

const CHANGELOG_TYPE_STYLES: Record<
  ChangelogType,
  {bg: string; color: string}
> = {
  Release: {bg: '#D1FAE5', color: '#065F46'},
  Improvement: {bg: '#DBEAFE', color: '#1E40AF'},
  Fix: {bg: '#FEF3C7', color: '#92400E'},
  Breaking: {bg: '#FEE2E2', color: '#991B1B'},
};

const CHANGELOG_FILTERS: ChangelogType[] = [
  'Release',
  'Improvement',
  'Fix',
  'Breaking',
];

function groupByMonth(entries: typeof CHANGELOG_ENTRIES) {
  const months: {label: string; items: typeof CHANGELOG_ENTRIES}[] = [];
  const map = new Map<string, typeof CHANGELOG_ENTRIES>();
  for (const e of entries) {
    const month = e.date.split('.')[0];
    const key =
      month === 'Apr'
        ? 'April 2026'
        : month === 'Mar'
          ? 'March 2026'
          : month === 'Feb'
            ? 'February 2026'
            : month;
    if (!map.has(key)) {
      map.set(key, []);
      months.push({label: key, items: map.get(key)!});
    }
    map.get(key)!.push(e);
  }
  return months;
}

// ---------------------------------------------------------------------------
// WhatsNewPage component
// ---------------------------------------------------------------------------

function WhatsNewPage() {
  const [activeFilter, setActiveFilter] = useState<ChangelogType | 'All'>(
    'All',
  );

  const filtered =
    activeFilter === 'All'
      ? CHANGELOG_ENTRIES
      : CHANGELOG_ENTRIES.filter(e => e.type === activeFilter);

  const months = groupByMonth(filtered);

  return (
    <div style={{maxWidth: 960, margin: '0 auto', padding: '32px 40px'}}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="display-1">What&#39;s New</XDSText>
        <XDSText type="body" color="secondary">
          Latest updates, new components, improvements, and breaking changes.
        </XDSText>
      </XDSStack>

      {/* Filter tabs */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--color-background-surface, #fff)',
          marginTop: 24,
          marginBottom: 40,
          paddingTop: 12,
        }}>
        <XDSTabList
          value={activeFilter}
          onChange={v => setActiveFilter(v as ChangelogType | 'All')}
          size="sm">
          <XDSTab value="All" label="All" />
          {CHANGELOG_FILTERS.map(filter => (
            <XDSTab key={filter} value={filter} label={filter} />
          ))}
        </XDSTabList>
        <XDSDivider style={{marginTop: 12}} />
      </div>

      {/* Entries grouped by month */}
      {months.map(month => (
        <div key={month.label} style={{marginBottom: 48}}>
          {/* Month header */}
          <XDSStack
            direction="horizontal"
            gap={2}
            vAlign="center"
            style={{marginBottom: 20}}>
            <XDSHeading level={2}>{month.label}</XDSHeading>
          </XDSStack>

          {/* Entry list */}
          {month.items.map((entry, i) => {
            const typeStyle = CHANGELOG_TYPE_STYLES[entry.type];
            const MAX_VISIBLE_TAGS = 2;
            const visibleTags = entry.tags.slice(0, MAX_VISIBLE_TAGS);
            const overflowCount = entry.tags.length - MAX_VISIBLE_TAGS;
            return (
              <div key={`${entry.date}-${i}`}>
                <div style={{padding: '20px 0'}}>
                  {/* Line 1: date + badge */}
                  <XDSStack
                    direction="horizontal"
                    gap={3}
                    vAlign="center"
                    style={{marginBottom: 8}}>
                    <XDSText
                      type="supporting"
                      color="secondary"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                      {entry.date}
                    </XDSText>
                    <XDSBadge
                      label={entry.type}
                      variant={
                        entry.type === 'Release'
                          ? 'green'
                          : entry.type === 'Improvement'
                            ? 'blue'
                            : entry.type === 'Fix'
                              ? 'orange'
                              : 'red'
                      }
                    />
                  </XDSStack>

                  {/* Line 2: title (left) + tags (right) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 24,
                    }}>
                    <XDSText
                      type="body"
                      weight="bold"
                      style={{flex: 1, minWidth: 0}}>
                      {entry.title}
                    </XDSText>
                    <XDSStack
                      direction="horizontal"
                      gap={2}
                      vAlign="center"
                      style={{flexShrink: 0}}>
                      {visibleTags.map(tag => (
                        <XDSText
                          key={tag}
                          type="supporting"
                          color="secondary"
                          style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontFamily: 'monospace',
                          }}>
                          {tag}
                        </XDSText>
                      ))}
                      {overflowCount > 0 && (
                        <XDSText
                          type="supporting"
                          color="secondary"
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                          }}>
                          ... +{overflowCount}
                        </XDSText>
                      )}
                    </XDSStack>
                  </div>
                </div>
                {i < month.items.length - 1 && <XDSDivider />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FoundationPage component (placeholder)
// ---------------------------------------------------------------------------

function FoundationPage({foundationKey}: {foundationKey: string}) {
  const item = FOUNDATION_ITEMS.find(f => f.key === foundationKey);
  if (!item) return null;
  return (
    <div style={{maxWidth: 840, margin: '0 auto', padding: '32px 40px'}}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="display-1">{item.title}</XDSText>
        <XDSText type="body" color="secondary">
          {item.description}
        </XDSText>
      </XDSStack>
      <div
        style={{
          marginTop: 48,
          padding: 64,
          borderRadius: 12,
          backgroundColor: 'var(--color-background-muted, #f5f5f5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <XDSText type="body" color="secondary">
          Documentation coming soon
        </XDSText>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LibraryPackagePage components
// ---------------------------------------------------------------------------

const VEGA_COMPONENTS: {label: string; items: {key: string; name: string; desc: string}[]}[] = [
  {
    label: 'Charts',
    items: [
      {key: 'bar-chart', name: 'BarChart', desc: 'Vertical and horizontal bar charts for categorical data comparison.'},
      {key: 'line-chart', name: 'LineChart', desc: 'Line charts for trends over time with multiple series support.'},
      {key: 'area-chart', name: 'AreaChart', desc: 'Filled area charts for volume and cumulative data visualization.'},
      {key: 'pie-chart', name: 'PieChart', desc: 'Pie and donut charts for part-to-whole relationships.'},
    ],
  },
  {
    label: 'Utilities',
    items: [
      {key: 'chart-legend', name: 'ChartLegend', desc: 'Legend component for labeling chart series and categories.'},
      {key: 'chart-tooltip', name: 'ChartTooltip', desc: 'Tooltip overlay for displaying data point details on hover.'},
      {key: 'chart-axis', name: 'ChartAxis', desc: 'Configurable axis component for labels, ticks, and gridlines.'},
    ],
  },
];

const CHAT_COMPONENTS: {label: string; items: {key: string; name: string; desc: string}[]}[] = [
  {
    label: 'Messaging',
    items: [
      {key: 'chat', name: 'Chat', desc: 'Conversational message interface with bubbles, input, and thread support.'},
      {key: 'chat-composer', name: 'ChatComposer', desc: 'Rich text composer with attachments, mentions, and slash commands.'},
      {key: 'chat-composer-input', name: 'ChatComposerInput', desc: 'Controlled input for the chat composer with mention triggers.'},
      {key: 'chat-layout', name: 'ChatLayout', desc: 'Full chat page layout with message list, composer, and empty state.'},
    ],
  },
  {
    label: 'Content',
    items: [
      {key: 'chat-tokenized-text', name: 'ChatTokenizedText', desc: 'Renders text with inline tokens like @mentions and #tags.'},
      {key: 'chat-tool-calls', name: 'ChatToolCalls', desc: 'Displays AI tool call results with status and expandable details.'},
      {key: 'chat-dictation', name: 'ChatDictation', desc: 'Voice dictation input with recording states and waveform.'},
    ],
  },
];

function PackageGridPage({
  packageKey,
  components,
  onSelectComponent,
}: {
  packageKey: string;
  components: {label: string; items: {key: string; name: string; desc: string}[]}[];
  onSelectComponent: (key: string) => void;
}) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const pkg = LIBRARY_PACKAGES.find(p => p.key === packageKey)!;
  const totalComponents = components.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );

  return (
    <div style={{display: 'flex', height: '100%', overflow: 'hidden'}}>
      <div style={{width: '45%', flexShrink: 0, padding: 16}}>
        <XDSCard
          variant="muted"
          padding={6}
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {hoveredComponent && COMPONENT_PREVIEWS[hoveredComponent] ? (
            <XDSStack direction="vertical" gap={3} hAlign="center">
              {COMPONENT_PREVIEWS[hoveredComponent]}
              <XDSText type="supporting" weight="semibold" color="secondary">
                {hoveredComponent}
              </XDSText>
            </XDSStack>
          ) : (
            <XDSStack direction="vertical" gap={2} hAlign="center" style={{textAlign: 'center'}}>
              <XDSText type="display-2">{pkg.name}</XDSText>
              <XDSText type="body" color="secondary">
                {totalComponents} components
              </XDSText>
              {pkg.status === 'Coming Soon' ? (
                <XDSBadge label="Coming Soon" variant="info" />
              ) : (
                <XDSText type="supporting" color="secondary" style={{maxWidth: 300}}>
                  Hover a component on the right to preview it here.
                </XDSText>
              )}
            </XDSStack>
          )}
        </XDSCard>
      </div>

      <div style={{flex: 1, overflowY: 'auto'}}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--color-background-surface, #fff)',
            padding: '24px 32px 16px',
          }}>
          <XDSStack direction="horizontal" gap={3} vAlign="center" style={{marginBottom: 8}}>
            <XDSText type="display-1">{pkg.name}</XDSText>
            {pkg.version && (
              <XDSText type="supporting" color="secondary" style={{fontFamily: 'monospace'}}>
                v{pkg.version}
              </XDSText>
            )}
          </XDSStack>
          <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSText type="body" color="secondary" style={{flex: 1}}>
            {pkg.description}
          </XDSText>
          <XDSPopover
            label="Install"
            placement="below"
            alignment="end"
            width={360}
            content={
              <XDSStack direction="vertical" gap={3}>
                <XDSStack direction="vertical" gap={1}>
                  <XDSText type="label">1. Install the package</XDSText>
                  <XDSCard padding={0}>
                    <XDSCodeBlock
                      code={`npm install ${pkg.name}`}
                      language="bash"
                      hasCopyButton
                      size="sm"
                    />
                  </XDSCard>
                </XDSStack>
                <XDSStack direction="vertical" gap={1}>
                  <XDSText type="label">2. Import a component</XDSText>
                  <XDSCard padding={0}>
                    <XDSCodeBlock
                      code={`import {...} from '${pkg.name}/ComponentName';`}
                      language="typescript"
                      size="sm"
                    />
                  </XDSCard>
                </XDSStack>
                <XDSText type="supporting" color="secondary">
                  See Getting Started for full setup with ThemeProvider.
                </XDSText>
              </XDSStack>
            }>
            <XDSButton label="Install" variant="primary" size="sm" icon={<DownloadIcon />} />
          </XDSPopover>
        </XDSStack>
        </div>
        <div style={{padding: '24px 32px'}}>
        {components.map(cat => (
          <div key={cat.label} style={{marginBottom: 28}}>
            <XDSText type="label" color="secondary" style={{display: 'block', marginBottom: 10}}>
              {cat.label}
            </XDSText>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10}}>
              {cat.items.map(item => (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredComponent(item.key)}
                  onMouseLeave={() => setHoveredComponent(null)}
                  onClick={() => onSelectComponent(item.key)}
                  style={{cursor: 'pointer'}}>
                  <XDSCard padding={3}>
                    <XDSText type="body" weight="bold" style={{display: 'block', marginBottom: 2}}>
                      {item.name}
                    </XDSText>
                    <XDSText type="supporting" color="secondary" maxLines={2}>
                      {item.desc}
                    </XDSText>
                  </XDSCard>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

function LibraryPackagePage({
  packageKey,
  onSelectComponent,
}: {
  packageKey: string;
  onSelectComponent: (key: string) => void;
}) {
  if (packageKey === 'pkg-core') {
    return <PackageGridPage packageKey={packageKey} components={COMPONENT_CATEGORIES} onSelectComponent={onSelectComponent} />;
  }
  if (packageKey === 'pkg-vega') {
    return <PackageGridPage packageKey={packageKey} components={VEGA_COMPONENTS} onSelectComponent={onSelectComponent} />;
  }
  if (packageKey === 'pkg-chat') {
    return <PackageGridPage packageKey={packageKey} components={CHAT_COMPONENTS} onSelectComponent={onSelectComponent} />;
  }
  if (packageKey === 'pkg-cli') {
    return <CliPage />;
  }
  return null;
}

function CliPage() {
  return (
    <div style={{maxWidth: 840, margin: '0 auto', padding: '32px 40px'}}>
      <XDSStack direction="vertical" gap={2}>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSText type="display-1">@xds/cli</XDSText>
          <XDSText type="supporting" color="secondary" style={{fontFamily: 'monospace'}}>
            v0.0.12
          </XDSText>
        </XDSStack>
        <XDSText type="body" color="secondary">
          Command-line tool for scaffolding projects, generating templates, swizzling components, and producing AI agent docs.
        </XDSText>
      </XDSStack>

      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Install</XDSHeading>
        <XDSCard padding={0}>
          <XDSCodeBlock code="npm install -g @xds/cli" title="Terminal" language="bash" hasCopyButton />
        </XDSCard>
      </div>

      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Bootstrap commands</XDSHeading>
        <XDSText type="body" color="secondary" style={{marginBottom: 16}}>
          Run these on every branch to load the latest API context. Takes under 500ms.
        </XDSText>
        <XDSCard padding={0}>
          <XDSCodeBlock
            code={`xds help                        # discover all commands and options\nxds docs                        # list available doc topics\nxds docs principles --dense     # design rules, anti-patterns, tokens\nxds docs tokens --dense         # spacing, color, radius, typography\nxds docs theme --dense          # theme provider, light/dark, overrides\nxds component --list            # all components grouped by category\nxds template --list             # available page templates`}
            title="Terminal"
            language="bash"
            hasCopyButton
          />
        </XDSCard>
      </div>

      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>On-demand commands</XDSHeading>
        <XDSCard padding={0}>
          <XDSCodeBlock
            code={`xds component Button --dense    # props, variants, usage, anatomy\nxds template dashboard          # emit full page source\nxds template dashboard --skeleton  # layout skeleton with annotations\nxds swizzle Button              # eject component source into your project\nxds upgrade --apply             # run version migration codemods`}
            title="Terminal"
            language="bash"
            hasCopyButton
          />
        </XDSCard>
      </div>

      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Options</XDSHeading>
        <XDSTable
          data={[
            {flag: '--dense', description: 'Token-efficient output optimized for AI assistants'},
            {flag: '--detail compact', description: 'Less output, focused on essentials'},
            {flag: '--detail brief', description: 'Minimal output'},
            {flag: '--zh', description: 'Chinese language output'},
            {flag: '--skeleton', description: 'Layout skeleton with spatial annotations (templates only)'},
            {flag: '--gap', description: 'Report missing capabilities when swizzling'},
          ] as {[key: string]: unknown}[]}
          columns={[
            {key: 'flag', header: 'Flag'},
            {key: 'description', header: 'Description'},
          ]}
        />
      </div>

      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Best practices</XDSHeading>
        <XDSList density="spacious" listStyle="disc">
          <XDSListItem label="Always run bootstrap commands on each new branch — docs reflect the branch's actual API" />
          <XDSListItem label="Run xds component <Name> --dense before modifying any component" />
          <XDSListItem label="After an @xds/core version bump, run xds upgrade --apply" />
          <XDSListItem label="When swizzling, use --gap to report missing capabilities" />
        </XDSList>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResourcePage components
// ---------------------------------------------------------------------------

function ResourceHeader({
  icon,
  title,
  description,
  bg,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  bg: string;
}) {
  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 16,
        padding: '32px 36px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
      }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
        <XDSIcon icon={icon} size="md" color="accent" />
      </div>
      <XDSStack direction="vertical" gap={0}>
        <XDSText type="display-2">{title}</XDSText>
        <XDSText type="body" color="secondary">{description}</XDSText>
      </XDSStack>
    </div>
  );
}

function NpmPackagesPage() {
  return (
    <div style={{maxWidth: 840, margin: '0 auto', padding: '32px 40px'}}>
      <ResourceHeader icon={DownloadIcon} title="NPM Packages" description="All packages are published under the @xds scope on npm." bg="#FEE2E2" />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>Install</XDSHeading>
        <XDSCard padding={0}>
          <XDSCodeBlock code={`# Core components\nnpm install @xds/core\n\n# Charts & data visualization\nnpm install @xds/vega\n\n# Chat & conversational UI\nnpm install @xds/chat\n\n# CLI tooling\nnpm install -g @xds/cli`} title="Terminal" language="bash" hasCopyButton />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Packages</XDSHeading>
        <XDSTable
          data={[
            {package: '@xds/core', description: 'Core UI components (60+)', version: '0.0.12', status: 'Stable'},
            {package: '@xds/vega', description: 'Charts & data visualization', version: '—', status: 'Coming Soon'},
            {package: '@xds/chat', description: 'Conversational UI components', version: '0.0.12', status: 'Stable'},
            {package: '@xds/cli', description: 'CLI for scaffolding & tooling', version: '0.0.12', status: 'Stable'},
            {package: '@xds/theme-default', description: 'Default theme (blue accent)', version: '0.0.12', status: 'Stable'},
            {package: '@xds/theme-neutral', description: 'Neutral warm gray theme', version: '0.0.12', status: 'Stable'},
            {package: '@xds/theme-daily', description: 'Soft blues for everyday tools', version: '0.0.12', status: 'Stable'},
          ] as {[key: string]: unknown}[]}
          columns={[
            {key: 'package', header: 'Package'},
            {key: 'description', header: 'Description'},
            {key: 'version', header: 'Version'},
            {key: 'status', header: 'Status'},
          ]}
        />
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Peer dependencies</XDSHeading>
        <XDSText type="body" color="secondary">
          All packages require React 18+ and StyleX 0.17+. Theme packages are optional — if no theme is installed, components use built-in defaults.
        </XDSText>
      </div>
    </div>
  );
}

function AgentDocsPage() {
  return (
    <div style={{maxWidth: 840, margin: '0 auto', padding: '32px 40px'}}>
      <ResourceHeader icon={SparklesIcon} title="AI / Agent Docs" description="Generate context docs so your AI knows every component, prop, and pattern." bg="#FEF3C7" />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>Generate agent docs</XDSHeading>
        <XDSText type="body" color="secondary" style={{marginBottom: 16}}>
          The CLI produces a comprehensive AGENTS.md that AI assistants can use as context when generating XDS code.
        </XDSText>
        <XDSCard padding={0}>
          <XDSCodeBlock code={`# Generate docs for all components\nxds docs\n\n# List available doc topics\nxds docs --list\n\n# Get specific docs (dense format for AI)\nxds docs principles --dense\nxds docs tokens --dense\nxds docs theme --dense\n\n# Get docs for a specific component\nxds component Button --dense\nxds component Table --dense`} title="Terminal" language="bash" hasCopyButton />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>What&#39;s included</XDSHeading>
        <XDSList density="spacious" listStyle="disc">
          <XDSListItem label="Component props, variants, and usage examples for every component" />
          <XDSListItem label="Design token reference — spacing, colors, typography, radius, elevation" />
          <XDSListItem label="Theme provider setup and customization patterns" />
          <XDSListItem label="Anti-patterns and common mistakes to avoid" />
          <XDSListItem label="StyleX conventions and CSS capabilities" />
        </XDSList>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Using with Cursor / AI assistants</XDSHeading>
        <XDSText type="body" color="secondary" style={{marginBottom: 16}}>
          Add the generated AGENTS.md to your project root. AI assistants like Cursor, Copilot, and Claude will automatically use it as context when you ask them to build UI with XDS components.
        </XDSText>
        <XDSCard padding={0}>
          <XDSCodeBlock code={`# Generate and save to project root\nxds docs > AGENTS.md\n\n# Or use the CLI bootstrap commands\nxds help           # discover all commands\nxds component --list  # all components by category\nxds template --list   # available page templates`} title="Terminal" language="bash" hasCopyButton />
        </XDSCard>
      </div>
    </div>
  );
}

function PublishingPage() {
  return (
    <div style={{maxWidth: 840, margin: '0 auto', padding: '32px 40px'}}>
      <ResourceHeader icon={HeartIcon} title="Publishing" description="Publish components, themes, and templates to Craft for others to discover and use." bg="#FCE7F3" />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>What you can publish</XDSHeading>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
          {[
            {icon: CodeIcon, title: 'Components', desc: 'Build and publish custom components to the Craft library for others to use.'},
            {icon: PaletteIcon, title: 'Themes', desc: 'Create and share theme packages with custom colors, typography, and radius.'},
            {icon: GridIcon, title: 'Templates', desc: 'Publish page templates and layouts that others can browse and use in Craft.'},
          ].map(item => (
            <XDSCard key={item.title} padding={4}>
              <XDSStack direction="horizontal" gap={3}>
                <div style={{width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--color-background-accent-muted, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                  <XDSIcon icon={item.icon} size="sm" color="accent" />
                </div>
                <XDSStack direction="vertical" gap={0}>
                  <XDSText type="body" weight="bold">{item.title}</XDSText>
                  <XDSText type="supporting" color="secondary">{item.desc}</XDSText>
                </XDSStack>
              </XDSStack>
            </XDSCard>
          ))}
        </div>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Getting started</XDSHeading>
        <XDSCard padding={0}>
          <XDSCodeBlock code={`# Clone the repo\ngit clone https://github.com/facebookexperimental/xds.git\ncd xds\n\n# Install dependencies\nyarn install\n\n# Start the sandbox\nyarn workspace @xds/sandbox dev\n\n# Run tests\nyarn test\n\n# Run storybook\nyarn storybook`} title="Terminal" language="bash" hasCopyButton />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>Publishing guidelines</XDSHeading>
        <XDSList density="spacious" listStyle="disc">
          <XDSListItem label="Use only XDS components — no raw HTML or inline styles" />
          <XDSListItem label="Include a .doc.mjs file with a description, tags, and preview metadata" />
          <XDSListItem label="Templates should use XDSAppShell for page layout" />
          <XDSListItem label="Themes must define all required tokens (colors, typography, radius, elevation)" />
          <XDSListItem label="Add block examples that demonstrate your component in realistic contexts" />
        </XDSList>
      </div>
    </div>
  );
}

function ResourcePage({resourceKey}: {resourceKey: string}) {
  if (resourceKey === 'res-npm') return <NpmPackagesPage />;
  if (resourceKey === 'res-agent-docs') return <AgentDocsPage />;
  if (resourceKey === 'res-publishing') return <PublishingPage />;
  return null;
}

// ---------------------------------------------------------------------------
// GettingStartedPage component
// ---------------------------------------------------------------------------

const INSTALL_CODE = `# Install the core package
npm install @xds/core

# Or with yarn
yarn add @xds/core`;

const PROVIDER_CODE = `import {XDSThemeProvider} from '@xds/core/ThemeProvider';
import '@xds/theme-default';

export default function App({children}) {
  return (
    <XDSThemeProvider>
      {children}
    </XDSThemeProvider>
  );
}`;

const FIRST_COMPONENT_CODE = `import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export function WelcomeCard() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={1}>Welcome</XDSHeading>
      <XDSText type="body">
        You're ready to build with XDS.
      </XDSText>
      <XDSButton
        label="Get started"
        variant="primary"
        onClick={() => console.log('clicked')}
      />
    </XDSStack>
  );
}`;

const THEME_CODE = `# Install a theme
npm install @xds/theme-neutral

# Available themes:
# @xds/theme-default   — Clean blue accent
# @xds/theme-neutral   — Warm gray palette
# @xds/theme-daily     — Soft blues for everyday tools`;

const CLI_CODE = `# Install the CLI
npm install -g @xds/cli

# Scaffold a new project
xds init my-app

# Generate a page template
xds template dashboard

# Eject a component for customization
xds swizzle Button

# Load agent docs for AI assistants
xds docs`;

const GETTING_STARTED_STEPS: {
  step: string;
  title: string;
  description: string;
  code: string;
  codeLabel?: string;
  language: string;
}[] = [
  {
    step: '01',
    title: 'Install',
    description:
      'Add @xds/core to your project. XDS works with any React framework — Next.js, Vite, Remix, or plain React.',
    code: INSTALL_CODE,
    codeLabel: 'Terminal',
    language: 'bash',
  },
  {
    step: '02',
    title: 'Add the theme provider',
    description:
      'Wrap your app in XDSThemeProvider. This sets up design tokens for colors, typography, spacing, and radius that all components inherit.',
    code: PROVIDER_CODE,
    codeLabel: 'app/layout.tsx',
    language: 'tsx',
  },
  {
    step: '03',
    title: 'Use a component',
    description:
      'Import any component from its subpath. Each component is individually tree-shakeable — you only ship what you use.',
    code: FIRST_COMPONENT_CODE,
    codeLabel: 'app/page.tsx',
    language: 'tsx',
  },
  {
    step: '04',
    title: 'Pick a theme',
    description:
      'Swap the entire look and feel by installing a different theme package. Colors, typography, radius, and elevation all update automatically.',
    code: THEME_CODE,
    codeLabel: 'Terminal',
    language: 'bash',
  },
  {
    step: '05',
    title: 'Use the CLI',
    description:
      'The XDS CLI scaffolds projects, generates page templates, ejects components for customization, and produces agent docs for AI coding assistants.',
    code: CLI_CODE,
    codeLabel: 'Terminal',
    language: 'bash',
  },
];

function GettingStartedPage() {
  return (
    <div {...stylex.props(localStyles.pageContainer)}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="display-1">Getting Started</XDSText>
        <XDSText type="large" weight="normal" color="secondary">
          Go from zero to a working XDS app in five steps.
        </XDSText>
      </XDSStack>

      <XDSStack direction="vertical" gap={10} style={{marginTop: 48}}>
        {GETTING_STARTED_STEPS.map(item => (
          <XDSStack key={item.step} direction="vertical" gap={2}>
            <XDSText
              type="supporting"
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                letterSpacing: '0.06em',
                fontWeight: 600,
                color: 'var(--color-text-accent, #0066FF)',
              }}>
              STEP {item.step}
            </XDSText>
            <XDSHeading level={2}>{item.title}</XDSHeading>
            <XDSText type="body" color="secondary" style={{maxWidth: 600}}>
              {item.description}
            </XDSText>
            <XDSCard padding={0}>
              <XDSCodeBlock
                code={item.code}
                title={item.codeLabel}
                language={item.language}
                hasCopyButton
              />
            </XDSCard>
          </XDSStack>
        ))}
      </XDSStack>

      <div style={{marginTop: 56, marginBottom: 64}}>
        <XDSHeading level={2} style={{marginBottom: 20}}>
          Explore
        </XDSHeading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}>
          {[
            {
              icon: GridIcon,
              title: 'Browse components',
              desc: 'Explore 60+ components in the sidebar.',
            },
            {
              icon: PaletteIcon,
              title: 'Try Craft',
              desc: 'Visually explore templates and themes.',
            },
            {
              icon: SparklesIcon,
              title: 'Agent docs',
              desc: 'Run xds docs to generate AI context.',
            },
            {
              icon: CodeIcon,
              title: 'Swizzle',
              desc: 'Eject and customize any component.',
            },
          ].map(item => (
            <XDSCard key={item.title} padding={4}>
              <XDSStack direction="horizontal" gap={3}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor:
                      'var(--color-background-accent-muted, #DBEAFE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                  <XDSIcon icon={item.icon} size="sm" color="accent" />
                </div>
                <XDSStack direction="vertical" gap={0}>
                  <XDSText type="body" weight="bold">
                    {item.title}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {item.desc}
                  </XDSText>
                </XDSStack>
              </XDSStack>
            </XDSCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LibraryOverview component
// ---------------------------------------------------------------------------

function LibraryOverview({
  onGetStarted,
  onSelectComponent,
  onCraft,
}: {
  onGetStarted: () => void;
  onSelectComponent: (key: string) => void;
  onCraft: () => void;
}) {
  return (
    <div style={{maxWidth: 1200, margin: '0 auto', padding: '32px 40px'}}>
      {/* ── Section 1: Hero ── */}
      <div
        style={{
          marginBottom: 64,
          backgroundImage: `url(${basePath}/docsite/hero-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 24,
          padding: '64px 60px',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          overflow: 'hidden',
          aspectRatio: '1513 / 657',
        }}>
        <XDSStack
          direction="vertical"
          gap={0}
          hAlign="center"
          style={{flex: 1, minWidth: 0, textAlign: 'center'}}>
          <XDSText type="display-1" style={{fontSize: '3.25rem'}}>
            XDS OSS
            <br />
            Build with AI
          </XDSText>
          <XDSStack direction="horizontal" gap={3} style={{marginTop: 28}}>
            <XDSButton
              label="Get started"
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              style={{width: 180}}
            />
            <XDSButton
              label="Find inspiration"
              variant="secondary"
              size="lg"
              onClick={onCraft}
              style={{width: 180}}
            />
          </XDSStack>
        </XDSStack>
      </div>

      {/* ── Section 2: Foundations ── */}
      <XDSStack direction="vertical" gap={0} style={{marginBottom: 64}}>
        <XDSHeading level={2}>Foundations</XDSHeading>
        <XDSText
          type="body"
          color="secondary"
          style={{marginTop: 8, marginBottom: 24}}>
          The design tokens and primitives that every component is built on.
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            columnGap: 16,
            rowGap: 32,
          }}>
          {FOUNDATION_ITEMS.map(item => (
            <div
              key={item.key}
              onClick={() => onSelectComponent(item.key)}
              style={{cursor: 'pointer'}}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  objectFit: 'cover',
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              />
              <XDSText type="body" weight="bold" style={{display: 'block', marginBottom: 4}}>
                {item.title}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {item.description}
              </XDSText>
            </div>
          ))}
        </div>
      </XDSStack>

      {/* ── Section 3: Libraries & Packages ── */}
      <XDSStack direction="vertical" gap={0} style={{marginBottom: 64}}>
        <XDSHeading level={2}>Libraries &amp; Packages</XDSHeading>
        <XDSText
          type="body"
          color="secondary"
          style={{marginTop: 8, marginBottom: 24}}>
          Install what you need. All packages are published to npm under the{' '}
          <XDSText
            type="body"
            color="secondary"
            style={{fontFamily: 'monospace'}}>
            @xds
          </XDSText>{' '}
          scope.
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
          {LIBRARY_PACKAGES.map(pkg => {
            const ICON_MAP: Record<
              string,
              React.ComponentType<React.SVGProps<SVGSVGElement>>
            > = {
              core: CodeIcon,
              charts: ChartsIcon,
              chat: ChatIcon,
              cli: TerminalIcon,
            };
            const IconComp = ICON_MAP[pkg.iconType] ?? CodeIcon;
            return (
              <div
                key={pkg.key}
                onClick={() => onSelectComponent(pkg.key)}
                style={{cursor: 'pointer'}}>
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    backgroundColor:
                      'var(--color-background-accent-muted, #DBEAFE)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: 12,
                  }}>
                  <XDSIcon icon={IconComp} size="lg" color="accent" />
                  {pkg.status === 'Coming Soon' && (
                    <div style={{position: 'absolute', top: 12, right: 12}}>
                      <XDSBadge label="Coming Soon" variant="info" />
                    </div>
                  )}
                </div>
                <XDSText
                  type="body"
                  weight="bold"
                  style={{fontFamily: 'monospace', fontSize: 14, display: 'block', marginBottom: 4}}>
                  {pkg.name}
                  {pkg.version && (
                    <XDSText
                      type="supporting"
                      color="secondary"
                      style={{fontFamily: 'monospace', fontSize: 12, marginLeft: 8}}>
                      v{pkg.version}
                    </XDSText>
                  )}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {pkg.description}
                </XDSText>
              </div>
            );
          })}
        </div>
      </XDSStack>

      {/* ── Section 3: Resources ── */}
      <XDSStack direction="vertical" gap={0} style={{marginBottom: 64}}>
        <XDSHeading level={2}>Resources</XDSHeading>
        <XDSText
          type="body"
          color="secondary"
          style={{marginTop: 8, marginBottom: 24}}>
          Everything you need to design, build, and contribute.
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}>
          {RESOURCE_ITEMS.map(resource => {
            return (
              <div
                key={resource.title}
                onClick={
                  resource.href
                    ? () => window.open(resource.href, '_blank')
                    : resource.key
                      ? () => onSelectComponent(resource.key!)
                      : undefined
                }
                style={{cursor: 'pointer'}}>
              <XDSCard padding={0}>
                <div
                  style={{
                    padding: 24,
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                  }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: resource.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                    {resource.image ? (
                      <img
                        src={resource.image}
                        alt={resource.title}
                        style={{width: 44, height: 44, objectFit: 'contain'}}
                      />
                    ) : resource.icon ? (
                      <XDSIcon icon={resource.icon} size="md" color="accent" />
                    ) : null}
                  </div>
                  <XDSStack
                    direction="vertical"
                    gap={1}
                    style={{flex: 1, minWidth: 0}}>
                    <XDSText type="body" weight="bold">
                      {resource.title}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {resource.description}
                    </XDSText>
                  </XDSStack>
                  <XDSIcon
                    icon={ExternalLinkIcon}
                    size="sm"
                    color="secondary"
                  />
                </div>
              </XDSCard>
              </div>
            );
          })}
        </div>
      </XDSStack>

      {/* ── Section 4: Where to use XDS ── */}
      <XDSStack direction="vertical" gap={0} style={{marginBottom: 64}}>
        <XDSHeading level={2}>Where to use XDS</XDSHeading>
        <XDSText
          type="body"
          color="secondary"
          style={{marginTop: 8, marginBottom: 24, maxWidth: 680}}>
          XDS is available in three contexts. Choose the right one based on
          where you&#39;re building.
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
          {XDS_OFFERINGS.map(offering => (
            <XDSCard key={offering.title} padding={0} style={{height: '100%'}}>
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `3px solid ${offering.color}`,
                }}>
                <XDSStack direction="horizontal" gap={2} vAlign="center" style={{marginBottom: 4}}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: offering.color,
                      flexShrink: 0,
                    }}
                  />
                  <XDSText type="body" weight="bold">
                    {offering.title}
                  </XDSText>
                </XDSStack>
                <XDSText type="supporting" color="secondary">
                  {offering.subtitle}
                </XDSText>
                <XDSText
                  type="supporting"
                  color="secondary"
                  style={{fontFamily: 'monospace', display: 'block', marginTop: 8}}>
                  {offering.pkg}
                </XDSText>
              </div>
              <XDSStack direction="vertical" gap={3} style={{padding: '16px 24px'}}>
                {offering.features.map(feature => (
                  <XDSStack key={feature} direction="horizontal" gap={2}>
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: offering.color,
                        flexShrink: 0,
                        marginTop: 7,
                      }}
                    />
                    <XDSText type="supporting" color="secondary">
                      {feature}
                    </XDSText>
                  </XDSStack>
                ))}
              </XDSStack>
            </XDSCard>
          ))}
        </div>
      </XDSStack>

      {/* ── Section 5: Have a question? ── */}
      <XDSStack
        direction="vertical"
        gap={3}
        hAlign="center"
        style={{marginBottom: 64, textAlign: 'center'}}>
        <XDSText type="display-1">Need help?</XDSText>
        <XDSText type="body" color="secondary">
          Ask our AI assistant first — it knows the docs better than we do.
        </XDSText>
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            marginTop: 16,
            marginBottom: 16,
          }}>
          <XDSChatComposer
            onSubmit={() => {}}
            placeholder="How do I theme a Button?"
            density="compact"
          />
        </div>
        <XDSText type="supporting" color="secondary">
          Prefer a human? Drop us a message in{' '}
          <XDSLink label="#xds-support" color="secondary">
            #xds-support
          </XDSLink>
        </XDSText>
      </XDSStack>
      <div style={{height: 100}} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// XDS wordmark SVG
// ---------------------------------------------------------------------------

const XDS_WORDMARK = (
  <svg
    width="46"
    height="24"
    viewBox="0 0 46 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.4239 15.8011C2.03945 16.3796 1.66972 16.9538 1.3147 17.524C0.707427 18.4992 1.42354 19.7348 2.57241 19.7348C3.13302 19.7348 3.64463 19.4209 3.91525 18.93C4.29391 18.243 4.71274 17.5352 5.17173 16.8066C5.38894 16.4618 5.60743 16.12 5.82721 15.7812C6.25251 15.1254 6.46516 14.7976 6.76252 14.68C6.99255 14.5891 7.27368 14.5899 7.50317 14.6822C7.79984 14.8014 8.00881 15.1278 8.42675 15.7804C8.64287 16.1179 8.85732 16.46 9.07008 16.8066C9.52175 17.534 9.93823 18.2339 10.3195 18.9063C10.6075 19.4141 11.1428 19.7348 11.7266 19.7348C12.9476 19.7348 13.7063 18.4203 13.0547 17.3877C12.7332 16.8781 12.3991 16.3639 12.0525 15.8453C11.3983 14.8527 10.7379 13.8906 10.0714 12.9592C9.81687 12.6036 9.68962 12.4258 9.64377 12.2384C9.60589 12.0836 9.60492 11.9307 9.64085 11.7754C9.68435 11.5874 9.80856 11.4091 10.057 11.0526C10.7093 10.1164 11.3596 9.15781 12.0078 8.1768C12.3869 7.60474 12.7521 7.03681 13.1035 6.47298C13.71 5.49987 12.9962 4.26519 11.8496 4.26519C11.2943 4.26519 10.7868 4.57405 10.5169 5.05923C10.1399 5.73688 9.72461 6.43721 9.27114 7.16022C9.06143 7.49458 8.8505 7.82569 8.63835 8.15358C8.21478 8.80819 8.003 9.1355 7.70554 9.25334C7.47561 9.34442 7.19397 9.34375 6.96448 9.25156C6.66759 9.13229 6.45853 8.80578 6.04043 8.15276C5.83116 7.82591 5.62351 7.49506 5.41747 7.16022C4.97918 6.44793 4.5738 5.76096 4.20132 5.0993C3.9136 4.58821 3.37617 4.26519 2.78967 4.26519C1.56624 4.26519 0.805692 5.58299 1.45419 6.62041C1.76588 7.11903 2.08912 7.6231 2.4239 8.1326C3.0752 9.10994 3.73263 10.059 4.3962 10.9796C4.65373 11.337 4.7825 11.5156 4.82882 11.7042C4.86709 11.86 4.86797 12.0139 4.83149 12.1702C4.78732 12.3593 4.66122 12.5385 4.40903 12.897C3.74526 13.8406 3.08355 14.8086 2.4239 15.8011Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.4734 4.26519C20.4471 4.26519 19.434 4.26519 18.6657 4.67201C18.0456 5.00031 17.5385 5.50739 17.2102 6.12744C16.8034 6.89579 16.8034 7.90892 16.8034 9.9352V14.0648C16.8034 16.0911 16.8034 17.1042 17.2102 17.8726C17.5385 18.4926 18.0456 18.9997 18.6657 19.328C19.434 19.7348 20.4471 19.7348 22.4734 19.7348H23.2039C24.8496 19.7348 26.2644 19.4033 27.4485 18.7403C28.6399 18.07 29.5559 17.1529 30.1963 15.989C30.8367 14.825 31.1569 13.4954 31.1569 12C31.1569 10.5046 30.8367 9.17495 30.1963 8.01105C29.5559 6.84714 28.6399 5.9337 27.4485 5.27072C26.2644 4.60037 24.8496 4.26519 23.2039 4.26519H22.4734ZM20.0092 8.74707C20.0092 8.16814 20.0092 7.87867 20.1255 7.65914C20.2193 7.48198 20.3641 7.33711 20.5413 7.24331C20.7608 7.12707 21.0503 7.12707 21.6292 7.12707H23.1927C24.6522 7.12707 25.7916 7.57274 26.6107 8.46409C27.4299 9.34807 27.8394 10.5267 27.8394 12C27.8394 13.4659 27.4299 14.6446 26.6107 15.5359C25.7916 16.4273 24.6522 16.8729 23.1927 16.8729H21.6292C21.0503 16.8729 20.7608 16.8729 20.5413 16.7567C20.3641 16.6629 20.2193 16.518 20.1255 16.3409C20.0092 16.1213 20.0092 15.8319 20.0092 15.2529V8.74707Z"
      fill="currentColor"
    />
    <path
      d="M35.4666 19.2376C36.6134 19.7459 37.9501 20 39.4767 20H39.8006C41.7144 20 43.2261 19.5801 44.3357 18.7403C45.4452 17.9006 46 16.7403 46 15.2597C46 14.3757 45.8213 13.6501 45.4638 13.0829C45.1064 12.5083 44.6559 12.0589 44.1123 11.7348C43.5761 11.4033 43.0325 11.1565 42.4814 10.9945C41.9304 10.8324 41.4575 10.7145 41.0628 10.6409L38.706 10.1878C38.0283 10.0552 37.4698 9.87477 37.0305 9.64641C36.5985 9.41068 36.3826 9.02762 36.3826 8.49724C36.3826 7.96685 36.6395 7.55064 37.1533 7.24862C37.6671 6.93923 38.3857 6.78453 39.3091 6.78453H39.6219C40.3964 6.78453 41.1224 6.93186 41.8001 7.22652C42.0982 7.35474 42.3899 7.5234 42.6754 7.73251C43.326 8.20923 44.2444 8.27802 44.8243 7.71734C45.34 7.21868 45.4053 6.39786 44.8761 5.91349C44.3498 5.43171 43.7638 5.03698 43.1181 4.72928C42.1054 4.24309 40.9511 4 39.6554 4H39.3315C38.0953 4 37.0156 4.19521 36.0922 4.58564C35.1762 4.97606 34.4613 5.52486 33.9475 6.23204C33.4411 6.93186 33.188 7.76059 33.188 8.71823C33.188 9.49171 33.3406 10.1436 33.6459 10.674C33.9587 11.2044 34.3571 11.6354 34.8411 11.9669C35.3326 12.2983 35.8539 12.5599 36.4049 12.7514C36.956 12.9355 37.4698 13.0718 37.9464 13.1602L40.3033 13.6243C40.6905 13.698 41.074 13.8011 41.4538 13.9337C41.841 14.0589 42.1612 14.2431 42.4144 14.4862C42.6676 14.7293 42.7942 15.0608 42.7942 15.4807C42.7942 16.6151 41.7814 17.1823 39.7559 17.1823H39.4432C38.49 17.1823 37.615 17.0055 36.8182 16.6519C36.4847 16.4994 36.1665 16.3134 35.8635 16.0938C35.17 15.5911 34.1857 15.5241 33.5784 16.1282C33.0651 16.6388 32.9912 17.4631 33.5198 17.9578C34.0797 18.4818 34.7287 18.9083 35.4666 19.2376Z"
      fill="currentColor"
    />
  </svg>
);

export function DocsView({
  activeView: _activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile' | 'theme';
  setActiveView: (
    v: 'craft' | 'explore' | 'docs' | 'profile' | 'theme',
  ) => void;
}) {
  const searchParams = useSearchParams();

  const [activeNav, setActiveNav] = useState(() => {
    const tab = searchParams.get('tab');
    const component = searchParams.get('component');
    if (tab === 'whats-new' || tab === 'getting-started') return tab;
    if (component) return component;
    return 'button';
  });
  const [_showCode, _setShowCode] = useState(true);
  const [_activeRightNav, _setActiveRightNav] = useState('usage');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    () => {
      const tab = searchParams.get('tab');
      const component = searchParams.get('component');
      if (tab === 'whats-new' || tab === 'getting-started') return tab;
      if (component) return component;
      return null;
    },
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', 'docs');

    if (selectedComponent === 'whats-new') {
      params.set('tab', 'whats-new');
    } else if (selectedComponent === 'getting-started') {
      params.set('tab', 'getting-started');
    } else if (selectedComponent !== null) {
      params.set('component', selectedComponent);
    }

    const qs = params.toString();
    if (qs === window.location.search.slice(1)) return;
    const url = `/pages/docsite/?${qs}`;
    window.history.replaceState(window.history.state, '', url);
  }, [selectedComponent]);

  const headingMenu = (
    <>
      <XDSNavMenuItem label="Craft" onClick={() => setActiveView('craft')} />
      <XDSNavMenuItem label="Library" onClick={() => setActiveView('docs')} />
    </>
  );

  return (
    <>
      <XDSAppShell
        variant="surface"
        height="fill"
        mobileNav={{breakpoint: 'none'}}
        topNav={
          <XDSTopNav
            label="XDS navigation"
            style={{paddingLeft: 16, paddingRight: 24}}
            heading={
              <XDSTopNavHeading
                logo={XDS_WORDMARK}
                headingHref={`${basePath}/pages/docsite/`}
                menu={headingMenu}
              />
            }
            endContent={
              <XDSStack direction="horizontal" gap={2}>
                <XDSButton
                  label="Search"
                  variant="ghost"
                  isIconOnly
                  icon={<SearchIcon />}
                  onClick={() => setIsSearchOpen(true)}
                />
                <XDSButton
                  label="Profile"
                  variant="ghost"
                  isIconOnly
                  icon={<ProfileIcon />}
                  onClick={() => setActiveView('profile')}
                />
              </XDSStack>
            }
          />
        }
        sideNav={
          <XDSSideNav style={{paddingLeft: 8}}>
            <XDSSideNavSection title="Home" isHeaderHidden>
              <XDSSideNavItem
                label="Home"
                isSelected={selectedComponent === null}
                onClick={() => setSelectedComponent(null)}
              />
            </XDSSideNavSection>
            <XDSSideNavSection title="Overview" isHeaderHidden>
              <XDSSideNavItem
                label="Guide"
                collapsible>
                <XDSSideNavItem
                  label="Getting Started"
                  isSelected={
                    selectedComponent !== null && activeNav === 'getting-started'
                  }
                  onClick={() => {
                    setSelectedComponent('getting-started');
                    setActiveNav('getting-started');
                  }}
                />
                <XDSSideNavItem
                  label="What's New"
                  isSelected={selectedComponent === 'whats-new'}
                  onClick={() => {
                    setSelectedComponent('whats-new');
                    setActiveNav('whats-new');
                  }}
                />
                <XDSSideNavItem label="Foundations" collapsible>
                  {FOUNDATION_ITEMS.map(item => (
                    <XDSSideNavItem
                      key={item.key}
                      label={item.title}
                      isSelected={
                        selectedComponent !== null && activeNav === item.key
                      }
                      onClick={() => {
                        setSelectedComponent(item.key);
                        setActiveNav(item.key);
                      }}
                    />
                  ))}
                </XDSSideNavItem>
                <XDSSideNavItem label="Libraries" collapsible>
                  {LIBRARY_PACKAGES.map(pkg => (
                    <XDSSideNavItem
                      key={pkg.key}
                      label={pkg.name}
                      isSelected={
                        selectedComponent !== null && activeNav === pkg.key
                      }
                      onClick={() => {
                        setSelectedComponent(pkg.key);
                        setActiveNav(pkg.key);
                      }}
                    />
                  ))}
                </XDSSideNavItem>
                <XDSSideNavItem label="Resources" collapsible>
                  {RESOURCE_ITEMS.filter(r => r.key).map(resource => (
                    <XDSSideNavItem
                      key={resource.key}
                      label={resource.title}
                      isSelected={
                        selectedComponent !== null && activeNav === resource.key
                      }
                      onClick={() => {
                        setSelectedComponent(resource.key!);
                        setActiveNav(resource.key!);
                      }}
                    />
                  ))}
                </XDSSideNavItem>
              </XDSSideNavItem>
            </XDSSideNavSection>

            {COMPONENT_CATEGORIES.map(category => (
              <XDSSideNavSection key={category.label} title={category.label}>
                {category.items.map(item => (
                  <XDSSideNavItem
                    key={item.key}
                    label={item.name}
                    isSelected={
                      selectedComponent !== null && activeNav === item.key
                    }
                    onClick={() => {
                      setSelectedComponent(item.key);
                      setActiveNav(item.key);
                    }}
                  />
                ))}
              </XDSSideNavSection>
            ))}
          </XDSSideNav>
        }>
        {/* MAIN CONTENT */}
        {selectedComponent === null ? (
          <LibraryOverview
            onGetStarted={() => {
              setSelectedComponent('getting-started');
              setActiveNav('getting-started');
            }}
            onSelectComponent={(key: string) => {
              setSelectedComponent(key);
              setActiveNav(key);
            }}
            onCraft={() => setActiveView('craft')}
          />
        ) : selectedComponent === 'whats-new' ? (
          <WhatsNewPage />
        ) : selectedComponent === 'getting-started' ? (
          <GettingStartedPage />
        ) : FOUNDATION_ITEMS.some(f => f.key === selectedComponent) ? (
          <FoundationPage foundationKey={selectedComponent} />
        ) : LIBRARY_PACKAGES.some(p => p.key === selectedComponent) ? (
          <LibraryPackagePage
            packageKey={selectedComponent}
            onSelectComponent={(key: string) => {
              setSelectedComponent(key);
              setActiveNav(key);
            }}
          />
        ) : RESOURCE_ITEMS.some(r => r.key === selectedComponent) ? (
          <ResourcePage resourceKey={selectedComponent} />
        ) : (
          <div style={{maxWidth: 840, margin: '0 auto', padding: '32px 40px'}}>
            {/* Header */}
            <div style={{marginBottom: 8}}>
              <XDSText type="display-1">{getComponentName(activeNav)}</XDSText>
            </div>
            <div style={{marginBottom: 32}}>
              <XDSText type="supporting" color="secondary">
                March 30, 2026 · Updated 5:40 p.m. PST
              </XDSText>
            </div>

            {/* Live Preview Card */}
            <div
              style={{
                border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 48,
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom:
                    '1px solid var(--color-divider, rgba(0,0,0,0.08))',
                  backgroundColor: 'var(--color-background-surface, #ffffff)',
                }}>
                <XDSText type="supporting" weight="semibold" color="secondary">
                  Live preview
                </XDSText>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="Open in Craft"
                    variant="ghost"
                    size="sm"
                    icon={<ExternalLinkIcon />}
                    onClick={() => setActiveView('craft')}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Variants',
                      variant: 'ghost',
                      size: 'sm',
                    }}
                    hasChevron={false}
                    items={[
                      {label: 'Primary', onClick: () => {}},
                      {label: 'Secondary', onClick: () => {}},
                      {label: 'Ghost', onClick: () => {}},
                    ]}
                  />
                  <XDSButton
                    label="Toggle theme"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<ContrastIcon />}
                  />
                  <XDSButton
                    label="Fullscreen"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<FullscreenIcon />}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 280,
                  backgroundColor: 'var(--color-background-muted, #f5f5f5)',
                }}>
                {COMPONENT_PREVIEWS[activeNav] ?? (
                  <XDSText type="supporting" color="secondary">
                    Preview coming soon
                  </XDSText>
                )}
              </div>
            </div>

            {/* Description */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <XDSHeading level={3}>{docs.tagline}</XDSHeading>
                  <div style={{marginTop: 12}}>
                    <XDSText type="body">{docs.description}</XDSText>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSHeading level={4}>When to use</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSList density="compact" listStyle="disc">
                        {docs.whenToUse.map((item, i) => (
                          <XDSListItem key={i} label={item} />
                        ))}
                      </XDSList>
                    </div>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSHeading level={4}>When NOT to use</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSList density="compact" listStyle="disc">
                        {docs.whenNotToUse.map((item, i) => (
                          <XDSListItem key={i} label={item} />
                        ))}
                      </XDSList>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Anatomy */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <XDSHeading level={2}>Anatomy</XDSHeading>
                  <div
                    style={{
                      marginTop: 16,
                      height: 320,
                      backgroundColor: 'var(--color-background-muted, #f5f5f5)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <XDSText type="supporting" color="secondary">
                      Anatomy diagram
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSText type="body">
                      The {getComponentName(activeNav)} is composed of the
                      following elements. Required elements must always be
                      present, while optional elements can be included as
                      needed.
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSTable
                      data={docs.anatomy as {[key: string]: unknown}[]}
                      columns={[
                        {key: 'element', header: 'Element'},
                        {key: 'required', header: 'Required'},
                        {key: 'description', header: 'Description'},
                      ]}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </XDSAppShell>

      <XDSCommandPalette
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchSource={SEARCH_COMMANDS}
        label="Search templates and components"
      />
    </>
  );
}
