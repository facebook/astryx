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
} from './docsite-icons';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
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
});

// ---------------------------------------------------------------------------
// Library overview data
// ---------------------------------------------------------------------------

const FOUNDATION_ITEMS: {
  title: string;
  description: string;
  visual: React.ReactNode;
}[] = [
  {
    title: 'Colors',
    description:
      'Semantic color tokens for surfaces, text, borders, and accents.',
    visual: (
      <div style={{display: 'flex', gap: 6}}>
        {['#0066FF', '#111111', '#6B7280', '#DC2626', '#059669', '#D97706'].map(
          c => (
            <div
              key={c}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: c,
              }}
            />
          ),
        )}
      </div>
    ),
  },
  {
    title: 'Typography',
    description:
      'Type scale from display headings down to captions and labels.',
    visual: (
      <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
        <span style={{fontSize: 32, fontWeight: 700, lineHeight: 1}}>Ag</span>
        <span
          style={{fontSize: 18, fontWeight: 600, lineHeight: 1, opacity: 0.6}}>
          Ag
        </span>
        <span
          style={{fontSize: 13, fontWeight: 400, lineHeight: 1, opacity: 0.4}}>
          Ag
        </span>
      </div>
    ),
  },
  {
    title: 'Spacing',
    description:
      'Consistent 4px-based spacing scale for padding, margins, and gaps.',
    visual: (
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 4}}>
        {[4, 8, 12, 16, 24, 32].map(s => (
          <div
            key={s}
            style={{
              width: 16,
              height: s,
              borderRadius: 3,
              backgroundColor: 'var(--color-icon-accent, #0066FF)',
              opacity: 0.15 + (s / 32) * 0.85,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    title: 'Radius',
    description: 'Border radius tokens from sharp corners to fully rounded.',
    visual: (
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        {[2, 6, 10, 16, 999].map(r => (
          <div
            key={r}
            style={{
              width: 32,
              height: 32,
              borderRadius: r,
              border: '2px solid var(--color-border-default, #d0d0d0)',
              backgroundColor: 'var(--color-background-muted, #f5f5f5)',
            }}
          />
        ))}
      </div>
    ),
  },
  {
    title: 'Motion',
    description: 'Duration and easing curves for transitions and animations.',
    visual: (
      <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
        {['150ms', '250ms', '400ms'].map((d, i) => (
          <div key={d} style={{textAlign: 'center'}}>
            <div
              style={{
                width: 24 + i * 6,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'var(--color-icon-accent, #0066FF)',
                opacity: 0.4 + i * 0.25,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: 'var(--color-text-secondary)',
                marginTop: 4,
                display: 'block',
                fontFamily: 'monospace',
              }}>
              {d}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Elevation',
    description:
      'Shadow tokens for layered surfaces, cards, popovers, and dialogs.',
    visual: (
      <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
        {[
          '0 1px 2px rgba(0,0,0,0.06)',
          '0 2px 8px rgba(0,0,0,0.1)',
          '0 8px 24px rgba(0,0,0,0.14)',
        ].map((shadow, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: 24,
              borderRadius: 6,
              backgroundColor: '#fff',
              boxShadow: shadow,
            }}
          />
        ))}
      </div>
    ),
  },
];

const LIBRARY_PACKAGES: {
  name: string;
  description: string;
  version?: string;
  status: 'Stable' | 'Published' | 'Experimental';
  iconType: 'core' | 'charts' | 'chat' | 'cli';
}[] = [
  {
    name: '@xds/core',
    description:
      'Core UI component library with 60+ accessible, themeable React components built on StyleX.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'core',
  },
  {
    name: '@xds/vega',
    description:
      'Chart and data visualization components. Bar, line, area, pie, and more — built for dashboards and analytics.',
    status: 'Stable',
    iconType: 'charts',
  },
  {
    name: '@xds/chat',
    description:
      'Conversational UI components for AI assistants, messaging, and chat interfaces with thread support.',
    status: 'Stable',
    iconType: 'chat',
  },
  {
    name: '@xds/cli',
    description:
      'CLI for scaffolding projects, theming, templates, swizzling components, and agent docs.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'cli',
  },
];

const RESOURCE_ITEMS: {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    title: 'Figma Library',
    description: 'Design files, tokens, and component specs for designers.',
    icon: PaletteIcon,
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
  },
  {
    title: 'NPM Packages',
    description: 'Published packages on the npm registry under the @xds scope.',
    icon: DownloadIcon,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    title: 'AI / Agent Docs',
    description:
      'AGENTS.md and CLI docs for using XDS with AI coding assistants.',
    icon: SparklesIcon,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    title: 'Contributing',
    description: 'How to contribute components, themes, and templates to XDS.',
    icon: HeartIcon,
    iconBg: '#FCE7F3',
    iconColor: '#EC4899',
  },
];

const OSS_FEATURES: {title: string; desc: string}[] = [
  {
    title: 'TypeScript + StyleX',
    desc: 'Full type safety and atomic CSS — catch errors at build time, ship zero-runtime styles.',
  },
  {
    title: 'Open source (MIT)',
    desc: 'Use it anywhere, commercial or personal. No licensing concerns.',
  },
  {
    title: 'Modern component architecture',
    desc: 'Composable APIs with slots, render props, and controlled/uncontrolled patterns.',
  },
  {
    title: 'Source-level distribution',
    desc: 'Import source directly — tree-shake, customize, and debug without fighting bundled dist.',
  },
  {
    title: 'Themeable via @xds/theme-*',
    desc: 'Swap entire visual identities with a single theme package. Colors, typography, radius, icons — all configurable.',
  },
  {
    title: 'CLI tooling & agent docs',
    desc: 'Scaffold projects, generate templates, and feed component docs to AI coding assistants.',
  },
  {
    title: 'Fork & swizzle any component',
    desc: 'Run xds swizzle to eject any component into your codebase. You own the code, no lock-in.',
  },
];

const WWW_FEATURES: {title: string; desc: string}[] = [
  {
    title: 'Flow types',
    desc: "Type system used across Meta's internal codebase.",
  },
  {
    title: 'Internal to Meta monorepo',
    desc: "Lives inside Meta's monorepo, not available externally.",
  },
  {
    title: 'Pre-built dist/ artifacts',
    desc: 'Ships compiled bundles rather than source code.',
  },
  {
    title: 'Legacy component patterns',
    desc: 'Older API conventions carried forward for backward compatibility.',
  },
  {
    title: 'Maintained by XDS www team',
    desc: 'Separate team handles updates and internal integrations.',
  },
  {
    title: 'Tight Nest platform integration',
    desc: "Deep hooks into Meta's internal Nest platform and toolchain.",
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
      <div style={{marginTop: 24, marginBottom: 40}}>
        <XDSTabList
          value={activeFilter}
          onChange={v => setActiveFilter(v as ChangelogType | 'All')}
          size="sm">
          <XDSTab value="All" label="All" />
          {CHANGELOG_FILTERS.map(filter => (
            <XDSTab key={filter} value={filter} label={filter} />
          ))}
        </XDSTabList>
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
                          ? 'success'
                          : entry.type === 'Improvement'
                            ? 'info'
                            : entry.type === 'Fix'
                              ? 'warning'
                              : 'error'
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
// LibraryOverview component
// ---------------------------------------------------------------------------

function LibraryOverview({
  onGetStarted,
  onSelectComponent,
}: {
  onGetStarted: () => void;
  onSelectComponent: (key: string) => void;
}) {
  const totalComponents = COMPONENT_CATEGORIES.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );

  return (
    <div style={{maxWidth: 1200, margin: '0 auto', padding: '32px 40px'}}>
      {/* ── Section 1: Hero ── */}
      <div
        style={{
          marginBottom: 64,
          backgroundColor: 'var(--color-background-accent-muted, #e3f2fd)',
          borderRadius: 24,
          padding: '64px 60px',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          overflow: 'hidden',
          minHeight: 340,
        }}>
        <div style={{flex: 1, minWidth: 0}}>
          <XDSText type="supporting" color="secondary">
            XDS Design System
          </XDSText>
          <div style={{marginTop: 8}}>
            <XDSText type="display-1">Build products faster with XDS.</XDSText>
          </div>
          <div style={{marginTop: 16, maxWidth: 540}}>
            <XDSText type="large" color="secondary">
              XDS is an open-source React component library born from years of
              building internal tools at Meta. Built with TypeScript and StyleX,
              it provides 60+ accessible, themeable components for shipping
              polished UIs fast.
            </XDSText>
          </div>
          <div style={{marginTop: 28, display: 'flex', gap: 12}}>
            <XDSButton
              label="Get started"
              variant="primary"
              size="lg"
              onClick={onGetStarted}
            />
            <XDSButton
              label="Find inspiration"
              variant="secondary"
              size="lg"
              onClick={() => onSelectComponent('button')}
            />
          </div>
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 32,
            }}>
            {[
              {value: `${totalComponents}+`, label: 'Components'},
              {value: '6', label: 'Themes'},
              {value: 'MIT', label: 'License'},
            ].map(stat => (
              <div key={stat.label}>
                <XDSText
                  type="body"
                  style={{fontWeight: 700, display: 'block'}}>
                  {stat.value}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {stat.label}
                </XDSText>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: '0 0 320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.08,
          }}>
          <svg width="280" height="148" viewBox="0 0 46 24" fill="currentColor">
            <path d="M2.4239 15.8011C2.03945 16.3796 1.66972 16.9538 1.3147 17.524C0.707427 18.4992 1.42354 19.7348 2.57241 19.7348C3.13302 19.7348 3.64463 19.4209 3.91525 18.93C4.29391 18.243 4.71274 17.5352 5.17173 16.8066C5.38894 16.4618 5.60743 16.12 5.82721 15.7812C6.25251 15.1254 6.46516 14.7976 6.76252 14.68C6.99255 14.5891 7.27368 14.5899 7.50317 14.6822C7.79984 14.8014 8.00881 15.1278 8.42675 15.7804C8.64287 16.1179 8.85732 16.46 9.07008 16.8066C9.52175 17.534 9.93823 18.2339 10.3195 18.9063C10.6075 19.4141 11.1428 19.7348 11.7266 19.7348C12.9476 19.7348 13.7063 18.4203 13.0547 17.3877C12.7332 16.8781 12.3991 16.3639 12.0525 15.8453C11.3983 14.8527 10.7379 13.8906 10.0714 12.9592C9.81687 12.6036 9.68962 12.4258 9.64377 12.2384C9.60589 12.0836 9.60492 11.9307 9.64085 11.7754C9.68435 11.5874 9.80856 11.4091 10.057 11.0526C10.7093 10.1164 11.3596 9.15781 12.0078 8.1768C12.3869 7.60474 12.7521 7.03681 13.1035 6.47298C13.71 5.49987 12.9962 4.26519 11.8496 4.26519C11.2943 4.26519 10.7868 4.57405 10.5169 5.05923C10.1399 5.73688 9.72461 6.43721 9.27114 7.16022C9.06143 7.49458 8.8505 7.82569 8.63835 8.15358C8.21478 8.80819 8.003 9.1355 7.70554 9.25334C7.47561 9.34442 7.19397 9.34375 6.96448 9.25156C6.66759 9.13229 6.45853 8.80578 6.04043 8.15276C5.83116 7.82591 5.62351 7.49506 5.41747 7.16022C4.97918 6.44793 4.5738 5.76096 4.20132 5.0993C3.9136 4.58821 3.37617 4.26519 2.78967 4.26519C1.56624 4.26519 0.805692 5.58299 1.45419 6.62041C1.76588 7.11903 2.08912 7.6231 2.4239 8.1326C3.0752 9.10994 3.73263 10.059 4.3962 10.9796C4.65373 11.337 4.7825 11.5156 4.82882 11.7042C4.86709 11.86 4.86797 12.0139 4.83149 12.1702C4.78732 12.3593 4.66122 12.5385 4.40903 12.897C3.74526 13.8406 3.08355 14.8086 2.4239 15.8011Z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.4734 4.26519C20.4471 4.26519 19.434 4.26519 18.6657 4.67201C18.0456 5.00031 17.5385 5.50739 17.2102 6.12744C16.8034 6.89579 16.8034 7.90892 16.8034 9.9352V14.0648C16.8034 16.0911 16.8034 17.1042 17.2102 17.8726C17.5385 18.4926 18.0456 18.9997 18.6657 19.328C19.434 19.7348 20.4471 19.7348 22.4734 19.7348H23.2039C24.8496 19.7348 26.2644 19.4033 27.4485 18.7403C28.6399 18.07 29.5559 17.1529 30.1963 15.989C30.8367 14.825 31.1569 13.4954 31.1569 12C31.1569 10.5046 30.8367 9.17495 30.1963 8.01105C29.5559 6.84714 28.6399 5.9337 27.4485 5.27072C26.2644 4.60037 24.8496 4.26519 23.2039 4.26519H22.4734ZM20.0092 8.74707C20.0092 8.16814 20.0092 7.87867 20.1255 7.65914C20.2193 7.48198 20.3641 7.33711 20.5413 7.24331C20.7608 7.12707 21.0503 7.12707 21.6292 7.12707H23.1927C24.6522 7.12707 25.7916 7.57274 26.6107 8.46409C27.4299 9.34807 27.8394 10.5267 27.8394 12C27.8394 13.4659 27.4299 14.6446 26.6107 15.5359C25.7916 16.4273 24.6522 16.8729 23.1927 16.8729H21.6292C21.0503 16.8729 20.7608 16.8729 20.5413 16.7567C20.3641 16.6629 20.2193 16.518 20.1255 16.3409C20.0092 16.1213 20.0092 15.8319 20.0092 15.2529V8.74707Z"
            />
            <path d="M35.4666 19.2376C36.6134 19.7459 37.9501 20 39.4767 20H39.8006C41.7144 20 43.2261 19.5801 44.3357 18.7403C45.4452 17.9006 46 16.7403 46 15.2597C46 14.3757 45.8213 13.6501 45.4638 13.0829C45.1064 12.5083 44.6559 12.0589 44.1123 11.7348C43.5761 11.4033 43.0325 11.1565 42.4814 10.9945C41.9304 10.8324 41.4575 10.7145 41.0628 10.6409L38.706 10.1878C38.0283 10.0552 37.4698 9.87477 37.0305 9.64641C36.5985 9.41068 36.3826 9.02762 36.3826 8.49724C36.3826 7.96685 36.6395 7.55064 37.1533 7.24862C37.6671 6.93923 38.3857 6.78453 39.3091 6.78453H39.6219C40.3964 6.78453 41.1224 6.93186 41.8001 7.22652C42.0982 7.35474 42.3899 7.5234 42.6754 7.73251C43.326 8.20923 44.2444 8.27802 44.8243 7.71734C45.34 7.21868 45.4053 6.39786 44.8761 5.91349C44.3498 5.43171 43.7638 5.03698 43.1181 4.72928C42.1054 4.24309 40.9511 4 39.6554 4H39.3315C38.0953 4 37.0156 4.19521 36.0922 4.58564C35.1762 4.97606 34.4613 5.52486 33.9475 6.23204C33.4411 6.93186 33.188 7.76059 33.188 8.71823C33.188 9.49171 33.3406 10.1436 33.6459 10.674C33.9587 11.2044 34.3571 11.6354 34.8411 11.9669C35.3326 12.2983 35.8539 12.5599 36.4049 12.7514C36.956 12.9355 37.4698 13.0718 37.9464 13.1602L40.3033 13.6243C40.6905 13.698 41.074 13.8011 41.4538 13.9337C41.841 14.0589 42.1612 14.2431 42.4144 14.4862C42.6676 14.7293 42.7942 15.0608 42.7942 15.4807C42.7942 16.6151 41.7814 17.1823 39.7559 17.1823H39.4432C38.49 17.1823 37.615 17.0055 36.8182 16.6519C36.4847 16.4994 36.1665 16.3134 35.8635 16.0938C35.17 15.5911 34.1857 15.5241 33.5784 16.1282C33.0651 16.6388 32.9912 17.4631 33.5198 17.9578C34.0797 18.4818 34.7287 18.9083 35.4666 19.2376Z" />
          </svg>
        </div>
      </div>

      {/* ── Section 2: Foundations ── */}
      <div style={{marginBottom: 64}}>
        <XDSText type="display-2">Foundations</XDSText>
        <div style={{marginTop: 8, marginBottom: 24}}>
          <XDSText type="body" color="secondary">
            The design tokens and primitives that every component is built on.
          </XDSText>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
          {FOUNDATION_ITEMS.map(item => (
            <XDSCard key={item.title} padding={0}>
              <div style={{padding: '24px 24px 20px'}}>
                <div
                  style={{
                    height: 52,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                  {item.visual}
                </div>
                <XDSText
                  type="body"
                  style={{fontWeight: 700, display: 'block'}}>
                  {item.title}
                </XDSText>
                <div style={{marginTop: 4}}>
                  <XDSText type="supporting" color="secondary">
                    {item.description}
                  </XDSText>
                </div>
              </div>
            </XDSCard>
          ))}
        </div>
      </div>

      {/* ── Section 3: Libraries & Packages ── */}
      <div style={{marginBottom: 64}}>
        <XDSText type="display-2">Libraries &amp; Packages</XDSText>
        <div style={{marginTop: 8, marginBottom: 24}}>
          <XDSText type="body" color="secondary">
            Install what you need. All packages are published to npm under the{' '}
            <span style={{fontFamily: 'monospace'}}>@xds</span> scope.
          </XDSText>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
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
              <XDSCard key={pkg.name} padding={0}>
                <div
                  style={{
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    height: '100%',
                  }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor:
                          'var(--color-background-accent-muted, #DBEAFE)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <XDSIcon icon={IconComp} size="md" color="accent" />
                    </div>
                    <XDSBadge
                      label={pkg.status}
                      variant={
                        pkg.status === 'Stable'
                          ? 'success'
                          : pkg.status === 'Experimental'
                            ? 'warning'
                            : 'info'
                      }
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 8,
                      }}>
                      <XDSText
                        type="body"
                        style={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          fontSize: 14,
                        }}>
                        {pkg.name}
                      </XDSText>
                      {pkg.version && (
                        <XDSText
                          type="supporting"
                          color="secondary"
                          style={{fontFamily: 'monospace', fontSize: 12}}>
                          v{pkg.version}
                        </XDSText>
                      )}
                    </div>
                    <div style={{marginTop: 6}}>
                      <XDSText type="supporting" color="secondary">
                        {pkg.description}
                      </XDSText>
                    </div>
                  </div>
                </div>
              </XDSCard>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Resources ── */}
      <div style={{marginBottom: 64}}>
        <XDSText type="display-2">Resources</XDSText>
        <div style={{marginTop: 8, marginBottom: 24}}>
          <XDSText type="body" color="secondary">
            Everything you need to design, build, and contribute.
          </XDSText>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}>
          {RESOURCE_ITEMS.map(resource => {
            const IconComp = resource.icon;
            return (
              <XDSCard key={resource.title} padding={0}>
                <div
                  style={{
                    padding: 24,
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
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
                    }}>
                    <XDSIcon icon={IconComp} size="md" color="accent" />
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <XDSText
                      type="body"
                      style={{fontWeight: 700, display: 'block'}}>
                      {resource.title}
                    </XDSText>
                    <div style={{marginTop: 4}}>
                      <XDSText type="supporting" color="secondary">
                        {resource.description}
                      </XDSText>
                    </div>
                  </div>
                  <XDSIcon
                    icon={ExternalLinkIcon}
                    size="sm"
                    color="secondary"
                  />
                </div>
              </XDSCard>
            );
          })}
        </div>
      </div>

      {/* ── Section 4: XDS OSS vs XDS WWW ── */}
      <div style={{marginBottom: 64}}>
        <XDSText type="display-2">XDS Open Source vs XDS WWW</XDSText>
        <div style={{marginTop: 8, marginBottom: 24, maxWidth: 680}}>
          <XDSText type="body" color="secondary">
            XDS exists in two forms. This library is the open-source version,
            which ports the design value from Meta&#39;s internal system with a
            modern, open architecture. Every component can be forked or swizzled
            — you own the code.
          </XDSText>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 16,
          }}>
          {/* OSS card */}
          <XDSCard padding={0}>
            <div style={{padding: 28}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    flexShrink: 0,
                  }}
                />
                <XDSHeading level={3}>XDS Open Source</XDSHeading>
              </div>
              <XDSText
                type="supporting"
                color="secondary"
                style={{
                  fontFamily: 'monospace',
                  display: 'block',
                  marginBottom: 16,
                }}>
                @xds/core
              </XDSText>
              <XDSDivider />
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}>
                {OSS_FEATURES.map(feature => (
                  <div
                    key={feature.title}
                    style={{
                      display: 'flex',
                      gap: 12,
                    }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#059669',
                        flexShrink: 0,
                        marginTop: 7,
                      }}
                    />
                    <div>
                      <XDSText
                        type="body"
                        style={{fontWeight: 600, display: 'block'}}>
                        {feature.title}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {feature.desc}
                      </XDSText>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </XDSCard>
          {/* WWW card */}
          <XDSCard padding={0}>
            <div style={{padding: 28}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#6B7280',
                    flexShrink: 0,
                  }}
                />
                <XDSHeading level={3}>XDS WWW (Internal)</XDSHeading>
              </div>
              <XDSText
                type="supporting"
                color="secondary"
                style={{
                  fontFamily: 'monospace',
                  display: 'block',
                  marginBottom: 16,
                }}>
                @nest/xds
              </XDSText>
              <XDSDivider />
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}>
                {WWW_FEATURES.map(feature => (
                  <div
                    key={feature.title}
                    style={{
                      display: 'flex',
                      gap: 12,
                    }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#6B7280',
                        flexShrink: 0,
                        marginTop: 7,
                      }}
                    />
                    <div>
                      <XDSText
                        type="body"
                        style={{fontWeight: 600, display: 'block'}}>
                        {feature.title}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {feature.desc}
                      </XDSText>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </XDSCard>
        </div>
      </div>
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
            centerContent={
              <div style={{display: 'flex', gap: 4}}>
                {[
                  {
                    label: 'Home',
                    isActive: selectedComponent === null,
                    onClick: () => {
                      setSelectedComponent(null);
                    },
                  },
                  {
                    label: 'Getting Started',
                    isActive:
                      selectedComponent !== null &&
                      activeNav === 'getting-started',
                    onClick: () => {
                      setSelectedComponent('getting-started');
                      setActiveNav('getting-started');
                    },
                  },
                  {
                    label: "What's New",
                    isActive: selectedComponent === 'whats-new',
                    onClick: () => {
                      setSelectedComponent('whats-new');
                      setActiveNav('whats-new');
                    },
                  },
                ].map(item => (
                  <XDSButton
                    key={item.label}
                    label={item.label}
                    variant="ghost"
                    size="sm"
                    onClick={item.onClick}
                    style={{
                      fontWeight: item.isActive ? 700 : 400,
                    }}
                  />
                ))}
              </div>
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
            <XDSSideNavSection title="Navigation" isHeaderHidden>
              <XDSSideNavItem
                label="Overview"
                isSelected={selectedComponent === null}
                onClick={() => setSelectedComponent(null)}
              />
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
          />
        ) : selectedComponent === 'whats-new' ? (
          <WhatsNewPage />
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
