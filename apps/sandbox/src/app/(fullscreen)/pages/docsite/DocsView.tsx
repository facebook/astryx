'use client';

import React, {useState, useEffect, useMemo} from 'react';

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
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSSection} from '@xds/core/Section';
import {XDSCenter} from '@xds/core/Center';
import {XDSIconButton} from '@xds/core/IconButton';
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
  ChevronDownIcon,
} from './docsite-icons';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {useXDSCollapsible} from '@xds/core/Collapsible';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSChatComposer} from '@xds/core/Chat';
import {XDSLink} from '@xds/core/Link';
import {
  changelogVersions,
  deprecations,
  GITHUB_REPO,
  type ChangelogVersion,
  type ChangelogItem,
} from '@/generated/changelogRegistry';
import {
  commands as cliCommands,
  globalOptions as cliGlobalOptions,
  CLI_VERSION,
  type CliCommand,
} from '@/generated/cliRegistry';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';

import {XDSPopover} from '@xds/core/Popover';
import {XDSGrid} from '@xds/core/Grid';
import {XDSTheme, expandTypeScale, defineTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default/built';
import {neutralTheme} from '@xds/theme-neutral/built';
import {brutalistTheme} from '@xds/theme-brutalist/built';
import {matchaTheme} from '@xds/theme-matcha/built';
import {dailyTheme} from '@xds/theme-daily/built';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSSelector} from '@xds/core/Selector';
import {defaultIconRegistry} from '@xds/theme-default';
import {COMPONENT_PREVIEWS} from './ComponentPreviews';
import {SEARCH_COMMANDS, basePath} from './constants';
import {
  COMPONENT_CATEGORIES,
  getComponentName,
  getComponentDocs,
  getComponentDesc,
} from './docsview-data';

const localStyles = stylex.create({
  previewCard: {
    borderRadius: 12,
    cursor: 'pointer',
  },
  tabListFlush: {
    marginInlineStart: '-12px',
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

type PackageCategory = 'building' | 'designing';

const PACKAGE_FILTERS: {label: string; value: PackageCategory | 'all'}[] = [
  {label: 'All', value: 'all'},
  {label: 'Building', value: 'building'},
  {label: 'Designing', value: 'designing'},
];

const LIBRARY_PACKAGES: {
  key: string;
  name: string;
  description: string;
  version?: string;
  status: 'Stable' | 'Published' | 'Experimental' | 'Coming Soon';
  iconType: 'core' | 'charts' | 'chat' | 'cli' | 'theme' | 'design';
  image: string;
  category: PackageCategory;
  href?: string;
}[] = [
  {
    key: 'pkg-cli',
    name: '@xds/cli',
    description:
      'CLI for scaffolding projects, theming, templates, swizzling components, and agent docs.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'cli',
    image: `${basePath}/docsite/LibrariesCli.png`,
    category: 'building',
  },
  {
    key: 'pkg-core',
    name: '@xds/core',
    description:
      'Core UI component library with 60+ accessible, themeable React components built on StyleX.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'core',
    image: `${basePath}/docsite/LibrariesCore.png`,
    category: 'building',
  },
  {
    key: 'pkg-vega',
    name: '@xds/vega',
    description:
      'Chart and data visualization components. Bar, line, area, pie, and more — built for dashboards and analytics.',
    status: 'Coming Soon',
    iconType: 'charts',
    image: `${basePath}/docsite/LibrariesVega.png`,
    category: 'building',
  },
  {
    key: 'pkg-theme-default',
    name: '@xds/theme-default',
    description:
      'Clean, professional theme with blue accent and Heroicons. The default look for XDS applications.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'theme',
    image: `${basePath}/docsite/theme-preview-forest.png`,
    category: 'building',
  },
  {
    key: 'pkg-theme-neutral',
    name: '@xds/theme-neutral',
    description:
      'Muted, minimal theme with warm gray tones and Lucide icons. Ideal for productivity tools.',
    version: '0.0.12',
    status: 'Stable',
    iconType: 'theme',
    image: `${basePath}/docsite/theme-preview-daily.png`,
    category: 'building',
  },
  {
    key: 'figma',
    name: 'Figma Library',
    description: 'Design files, tokens, and component specs for designers.',
    status: 'Stable',
    iconType: 'design',
    image: `${basePath}/docsite/figma-logo.png`,
    category: 'designing',
    href: 'https://www.figma.com/design/c9CR0F4jJQwhue60Ec7qOz/XDS-Open-Source-Library',
  },
];

const RESOURCE_NAV_ITEMS: {key: string; title: string}[] = [
  {key: 'res-npm', title: 'NPM Packages'},
  {key: 'res-agent-docs', title: 'AI / Agent Docs'},
  {key: 'res-publishing', title: 'Publishing'},
];

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const VercelIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="12" />
    <path d="M12 7l6.928 10.5H5.072L12 7z" fill="white" />
  </svg>
);

const XDS_OFFERINGS: {
  title: string;
  subtitle: string;
  pkg: string | null;
  description: string;
  label?: string;
  href?: string;
  descriptionLinkText?: string;
  descriptionLinkHref?: string;
  icons?: React.ComponentType<React.SVGProps<SVGSVGElement>>[];
  logos?: string[];
}[] = [
  {
    title: 'GitHub or Vercel',
    subtitle: 'Open source, use anywhere',
    pkg: '@xds/core',
    icons: [GitHubIcon, VercelIcon],
    description:
      'Install @xds/core from npm. Works with Next.js, Vite, or any React framework. Use @xds/theme-default for the default look, or swap in any theme. Follow the quickstart in the @xds/core README to get started.',
    descriptionLinkText: '@xds/core README',
    descriptionLinkHref: 'https://github.com/facebookexperimental/xds',
  },
];

// ---------------------------------------------------------------------------
// LibraryOverview component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// What's New — driven by generated changelogRegistry.ts
// ---------------------------------------------------------------------------

type ChangelogFilter =
  | 'All'
  | 'Breaking'
  | 'Features'
  | 'Fixes'
  | 'Deprecations';

const CHANGELOG_FILTERS: ChangelogFilter[] = [
  'Breaking',
  'Features',
  'Fixes',
  'Deprecations',
];

function versionMatchesFilter(
  v: ChangelogVersion,
  filter: ChangelogFilter,
): boolean {
  switch (filter) {
    case 'All':
      return true;
    case 'Breaking':
      return v.breakingChanges.length > 0;
    case 'Features':
      return v.features.length > 0;
    case 'Fixes':
      return v.fixes.length > 0;
    case 'Deprecations':
      return false;
  }
}

function ItemText({item}: {item: ChangelogItem}) {
  const text = item.text;
  const hasExplicitBold = text.includes('**');

  if (hasExplicitBold) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span>
        {parts.map((part, i) => {
          const boldMatch = part.match(/^\*\*(.+)\*\*$/);
          if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>;
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }

  const delimIdx = Math.min(
    text.includes(' — ') ? text.indexOf(' — ') : Infinity,
    text.includes(': ') ? text.indexOf(': ') : Infinity,
  );
  if (delimIdx !== Infinity) {
    const delim = text[delimIdx + 1] === '—' ? ' — ' : ': ';
    return (
      <span>
        <strong>{text.slice(0, delimIdx)}</strong>
        {delim}
        {text.slice(delimIdx + delim.length)}
      </span>
    );
  }

  return <span>{text}</span>;
}

function ChangelogItemRow({item}: {item: ChangelogItem}) {
  return (
    <XDSStack
      direction="horizontal"
      gap={2}
      vAlign="start"
      style={{padding: '5px 0', lineHeight: 1.55}}>
      <XDSText type="body" style={{flex: 1, minWidth: 0}}>
        <ItemText item={item} />
      </XDSText>
      {item.pr != null && (
        <XDSLink
          href={`https://github.com/${GITHUB_REPO}/pull/${item.pr}`}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          color="secondary"
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            flexShrink: 0,
            opacity: 0.5,
          }}>
          #{item.pr}
        </XDSLink>
      )}
    </XDSStack>
  );
}

function ChangelogSection({
  label,
  items,
  dotVariant,
}: {
  label: string;
  items: ChangelogItem[];
  dotVariant: 'negative' | 'positive' | 'warning' | 'info';
}) {
  if (items.length === 0) return null;
  return (
    <XDSStack direction="vertical" gap={0} style={{marginBottom: 20}}>
      <XDSStack
        direction="horizontal"
        gap={2}
        vAlign="center"
        style={{marginBottom: 10}}>
        <XDSStatusDot variant={dotVariant} label={label} />
        <XDSText
          type="supporting"
          color="secondary"
          weight="bold"
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
          {label}
        </XDSText>
      </XDSStack>
      {items.map((item, i) => (
        <ChangelogItemRow key={`${item.text.slice(0, 30)}-${i}`} item={item} />
      ))}
    </XDSStack>
  );
}

function hasContent(v: ChangelogVersion) {
  return (
    v.breakingChanges.length > 0 ||
    v.features.length > 0 ||
    v.fixes.length > 0 ||
    v.codemods.length > 0 ||
    v.note
  );
}

function VersionCard({
  version,
  defaultIsOpen,
  visibleSection,
}: {
  version: ChangelogVersion;
  defaultIsOpen: boolean;
  visibleSection: 'Breaking' | 'Features' | 'Fixes' | null;
}) {
  const {isOpen, toggle} = useXDSCollapsible({
    isCollapsible: {defaultIsOpen: defaultIsOpen},
  });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const totalChanges =
    version.breakingChanges.length +
    version.features.length +
    version.fixes.length;

  if (!hasContent(version)) {
    return (
      <XDSCard padding={4} style={{marginBottom: 8}}>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSText
            type="body"
            weight="bold"
            style={{fontFamily: 'monospace', fontSize: 14}}>
            v{version.version}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {version.packages.join(', ')}
          </XDSText>
          {version.note && (
            <XDSText
              type="supporting"
              color="secondary"
              style={{fontStyle: 'italic'}}>
              — {version.note.replace(/\*\*/g, '')}
            </XDSText>
          )}
        </XDSStack>
      </XDSCard>
    );
  }

  return (
    <XDSCard padding={0} style={{marginBottom: 12, overflow: 'hidden'}}>
      <XDSStack
        direction="horizontal"
        gap={3}
        vAlign="start"
        onClick={toggle}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        style={{padding: '16px 24px', cursor: 'pointer'}}>
        <XDSStack direction="vertical" gap={0} style={{flex: 1, minWidth: 0}}>
          <XDSHeading level={3} style={{fontFamily: 'monospace', fontSize: 16}}>
            v{version.version}
          </XDSHeading>
          <XDSStack direction="horizontal" gap={2} vAlign="center">
            {totalChanges > 0 && (
              <XDSText
                type="supporting"
                color="secondary"
                style={{fontSize: 12}}>
                {totalChanges} change{totalChanges !== 1 ? 's' : ''}
              </XDSText>
            )}
            {totalChanges > 0 && (
              <XDSText type="supporting" color="secondary">
                ·
              </XDSText>
            )}
            <XDSText type="supporting" color="secondary" style={{fontSize: 12}}>
              {version.packages.join(', ')}
            </XDSText>
          </XDSStack>
        </XDSStack>
        {version.breakingChanges.length > 0 && (
          <XDSBadge label="Breaking" variant="red" />
        )}
        <XDSIcon
          icon={ChevronDownIcon}
          size="sm"
          color="secondary"
          style={{
            flexShrink: 0,
            transition: 'transform 150ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </XDSStack>
      {isOpen && (
        <>
          <XDSDivider />
          <XDSStack direction="vertical" gap={0} style={{padding: '20px 24px'}}>
            {version.note && (
              <>
                <XDSText
                  type="supporting"
                  color="secondary"
                  display="block"
                  style={{fontStyle: 'italic', paddingBottom: 16}}>
                  {version.note.replace(/\*\*/g, '')}
                </XDSText>
                <XDSDivider style={{marginBottom: 16}} />
              </>
            )}

            {(!visibleSection || visibleSection === 'Breaking') && (
              <ChangelogSection
                label="Breaking Changes"
                items={version.breakingChanges}
                dotVariant="negative"
              />
            )}
            {(!visibleSection || visibleSection === 'Features') && (
              <ChangelogSection
                label="New Features"
                items={version.features}
                dotVariant="positive"
              />
            )}
            {(!visibleSection || visibleSection === 'Fixes') && (
              <ChangelogSection
                label="Fixes"
                items={version.fixes}
                dotVariant="warning"
              />
            )}

            {(!visibleSection || visibleSection === 'Breaking') &&
              version.codemods.length > 0 && (
                <XDSStack
                  direction="vertical"
                  gap={0}
                  style={{marginBottom: 20}}>
                  <XDSStack
                    direction="horizontal"
                    gap={2}
                    vAlign="center"
                    style={{marginBottom: 10}}>
                    <XDSStatusDot variant="info" label="Codemods" />
                    <XDSText
                      type="supporting"
                      color="secondary"
                      weight="bold"
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>
                      Codemods
                    </XDSText>
                  </XDSStack>
                  <XDSStack
                    direction="horizontal"
                    gap={1}
                    style={{flexWrap: 'wrap'}}>
                    {version.codemods.map((item, i) => (
                      <XDSBadge
                        key={i}
                        label={
                          item.codemod ||
                          item.text.replace(/^`([\w-]+)`.*/, '$1')
                        }
                        variant="neutral"
                      />
                    ))}
                  </XDSStack>
                </XDSStack>
              )}

            {(!visibleSection || visibleSection === 'Breaking') &&
              (version.upgradeCommand || version.dryRunCommand) && (
                <>
                  {!showUpgrade ? (
                    <XDSButton
                      label="Show upgrade commands"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUpgrade(true)}
                    />
                  ) : (
                    <XDSCard padding={0}>
                      <XDSCodeBlock
                        language="bash"
                        code={[
                          version.upgradeCommand,
                          version.dryRunCommand
                            ? `# Dry run: ${version.dryRunCommand}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join('\n')}
                        hasCopyButton
                      />
                    </XDSCard>
                  )}
                </>
              )}
          </XDSStack>
        </>
      )}
    </XDSCard>
  );
}

function DeprecationsPanel() {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof deprecations>();
    for (const d of deprecations) {
      const key = d.file;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText
        type="body"
        color="secondary"
        display="block"
        style={{marginBottom: 8}}>
        These symbols are deprecated in the current codebase. Migrate away from
        them before they are removed in a future release.
      </XDSText>

      {grouped.map(([file, items]) => (
        <XDSCard key={file} padding={0}>
          <XDSStack
            direction="horizontal"
            gap={2}
            vAlign="center"
            style={{
              padding: '10px 16px',
              background: 'var(--color-background-secondary, #f9fafb)',
            }}>
            <XDSText type="code" style={{fontSize: 12}}>
              {file}
            </XDSText>
          </XDSStack>
          <XDSDivider />
          <XDSStack direction="vertical" gap={0} style={{padding: '4px 16px'}}>
            {items.map((d, i) => (
              <React.Fragment key={i}>
                <XDSStack
                  direction="horizontal"
                  gap={3}
                  vAlign="start"
                  style={{padding: '8px 0'}}>
                  <XDSText
                    type="code"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                      minWidth: 140,
                      color: 'var(--color-error, #e3193b)',
                    }}>
                    {d.symbol}
                  </XDSText>
                  <XDSText type="body" color="secondary" style={{fontSize: 13}}>
                    {d.message}
                  </XDSText>
                </XDSStack>
                {i < items.length - 1 && <XDSDivider />}
              </React.Fragment>
            ))}
          </XDSStack>
        </XDSCard>
      ))}
    </XDSStack>
  );
}

function WhatsNewPage() {
  const [activeFilter, setActiveFilter] = useState<ChangelogFilter>('All');

  const showDeprecations = activeFilter === 'Deprecations';

  const filteredVersions = useMemo(
    () =>
      activeFilter === 'All' || activeFilter === 'Deprecations'
        ? changelogVersions
        : changelogVersions.filter(v => versionMatchesFilter(v, activeFilter)),
    [activeFilter],
  );

  return (
    <XDSSection
      maxWidth={800}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      {/* Header */}
      <XDSStack direction="vertical" gap={2} style={{marginBottom: 32}}>
        <XDSText type="display-1" display="block">
          What&#39;s New
        </XDSText>
        <XDSText
          type="body"
          color="secondary"
          display="block"
          style={{maxWidth: 520}}>
          Release history across all XDS packages — features, breaking changes,
          fixes, and codemods.
        </XDSText>
      </XDSStack>

      {/* Filter tabs */}
      <XDSStack
        direction="vertical"
        gap={0}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--color-background-surface)',
          marginBottom: 24,
          paddingTop: 8,
          paddingBottom: 1,
        }}>
        <XDSTabList
          value={activeFilter}
          onChange={v => setActiveFilter(v as ChangelogFilter)}
          size="sm">
          <XDSTab value="All" label="All" />
          {CHANGELOG_FILTERS.map(filter => (
            <XDSTab key={filter} value={filter} label={filter} />
          ))}
        </XDSTabList>
        <XDSDivider />
      </XDSStack>

      {showDeprecations ? (
        <DeprecationsPanel />
      ) : (
        filteredVersions.map((version, i) => (
          <VersionCard
            key={version.version}
            version={version}
            defaultIsOpen={i === 0 || activeFilter !== 'All'}
            visibleSection={activeFilter === 'All' ? null : activeFilter}
          />
        ))
      )}
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// FoundationPage component (placeholder for non-typography foundations)
// ---------------------------------------------------------------------------

function FoundationPage({foundationKey}: {foundationKey: string}) {
  if (foundationKey === 'typography') {
    return <TypographyFoundationPage />;
  }
  if (foundationKey === 'colors') {
    return <ColorsFoundationPage />;
  }
  if (foundationKey === 'spacing') {
    return <SpacingFoundationPage />;
  }
  if (foundationKey === 'icons') {
    return <IconsFoundationPage />;
  }
  if (foundationKey === 'shape') {
    return <ShapeFoundationPage />;
  }
  if (foundationKey === 'illustrations') {
    return <IllustrationsFoundationPage />;
  }
  return null;
}

// ---------------------------------------------------------------------------
// ColorsFoundationPage
// ---------------------------------------------------------------------------

type ColorRow = Record<string, unknown>;

const SEMANTIC_PALETTE: ColorRow[] = [
  {token: 'accent', light: '#0064E0', dark: '#2694FE'},
  {token: 'success', light: '#0D8626', dark: '#0D8626'},
  {token: 'warning', light: '#E9AF08', dark: '#F2C00B'},
  {token: 'error', light: '#E3193B', dark: '#F5394F'},
];

const TEXT_COLORS: ColorRow[] = [
  {token: 'primary', light: '#0A1317', dark: '#DFE2E5'},
  {token: 'secondary', light: '#4E606F', dark: '#AAAFB5'},
  {token: 'disabled', light: '#A4B0BC', dark: '#6F747C'},
  {token: 'accent', light: '#0064E0', dark: '#3E9EFB'},
];

const SURFACE_COLORS: ColorRow[] = [
  {token: 'surface', light: '#FFFFFF', dark: '#1F1F22'},
  {token: 'body', light: '#F1F4F7', dark: '#111112'},
  {token: 'card', light: '#FFFFFF', dark: '#1F1F22'},
  {token: 'popover', light: '#FFFFFF', dark: '#28292C'},
  {token: 'muted', light: 'rgba(0,0,0,0.04)', dark: 'rgba(255,255,255,0.06)'},
];

const BORDER_COLORS: ColorRow[] = [
  {token: 'border', light: 'rgba(0,0,0,0.08)', dark: 'rgba(255,255,255,0.1)'},
  {
    token: 'border-emphasized',
    light: 'rgba(0,0,0,0.16)',
    dark: 'rgba(255,255,255,0.2)',
  },
];

function ColorSwatch({value}: {value: string}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          backgroundColor: value,
          border: '1px solid rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      />
      <XDSText type="code">{value}</XDSText>
    </div>
  );
}

function colorColumns() {
  return [
    {
      key: 'token',
      header: 'Token',
      width: pixel(180),
      renderCell: (row: ColorRow) => (
        <XDSText type="code">{row.token as string}</XDSText>
      ),
    },
    {
      key: 'light',
      header: 'Light',
      renderCell: (row: ColorRow) => (
        <ColorSwatch value={row.light as string} />
      ),
    },
    {
      key: 'dark',
      header: 'Dark',
      renderCell: (row: ColorRow) => <ColorSwatch value={row.dark as string} />,
    },
  ];
}

function ColorsFoundationPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={2}>
          <XDSText type="display-1">Colors</XDSText>
          <XDSText type="large" weight="normal" color="secondary">
            XDS uses semantic color tokens instead of raw hex values. Tokens
            adapt automatically across light, dark, and custom themes so your UI
            stays consistent without manual overrides.
          </XDSText>
        </XDSStack>

        {/* Semantic palette */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Semantic palette</XDSHeading>
          <XDSText type="body" color="secondary">
            Four intent-based colors that carry meaning across your entire UI.
            Use accent for interactive elements, success/warning/error for
            feedback states.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={SEMANTIC_PALETTE}
              columns={colorColumns()}
              density="spacious"
              dividers="rows"
            />
          </XDSCard>
        </XDSStack>

        {/* Text colors */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Text colors</XDSHeading>
          <XDSText type="body" color="secondary">
            Text tokens control foreground color for headings, body copy, and
            labels. They maintain accessible contrast ratios in every theme.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={TEXT_COLORS}
              columns={colorColumns()}
              density="spacious"
              dividers="rows"
            />
          </XDSCard>
        </XDSStack>

        {/* Surface colors */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Surface colors</XDSHeading>
          <XDSText type="body" color="secondary">
            Surfaces define backgrounds for pages, cards, popovers, and muted
            regions. Layering surfaces creates visual depth without shadows.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={SURFACE_COLORS}
              columns={colorColumns()}
              density="spacious"
              dividers="rows"
            />
          </XDSCard>
        </XDSStack>

        {/* Border */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Border</XDSHeading>
          <XDSText type="body" color="secondary">
            Border tokens use alpha transparency so they blend naturally over
            any surface. Use border-emphasized when you need stronger visual
            separation.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={BORDER_COLORS}
              columns={colorColumns()}
              density="spacious"
              dividers="rows"
            />
          </XDSCard>
        </XDSStack>

        {/* Usage */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Usage</XDSHeading>
          <XDSGrid columns={2} gap={4}>
            <XDSCard padding={4}>
              <XDSStack direction="vertical" gap={2}>
                <XDSBadge label="Do" variant="success" />
                <XDSList>
                  <XDSListItem
                    label="Use semantic tokens (accent, surface, primary) instead of
                    hard-coded hex values"
                  />
                  <XDSListItem
                    label="Pair text tokens with surface tokens to guarantee accessible
                    contrast"
                  />
                  <XDSListItem
                    label="Use the muted surface for secondary content areas and
                    disabled backgrounds"
                  />
                  <XDSListItem
                    label="Let tokens handle light/dark adaptation — avoid manual
                    dark-mode overrides"
                  />
                </XDSList>
              </XDSStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSStack direction="vertical" gap={2}>
                <XDSBadge label="Don't" variant="error" />
                <XDSList>
                  <XDSListItem
                    label="Hard-code hex or rgba values in component styles — they
                    break when themes change"
                  />
                  <XDSListItem
                    label="Use opacity to lighten text — use the secondary or disabled
                    text token instead"
                  />
                  <XDSListItem
                    label="Repurpose semantic colors for decoration (e.g. error-red as
                    a brand color)"
                  />
                  <XDSListItem
                    label="Mix raw CSS custom properties with token imports — use
                    colorVars consistently"
                  />
                </XDSList>
              </XDSStack>
            </XDSCard>
          </XDSGrid>
        </XDSStack>

        {/* Code */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Code</XDSHeading>
          <XDSText type="body" color="secondary">
            Import colorVars from the token module and reference tokens inside
            StyleX styles. Token names map directly to CSS custom properties
            scoped by the active theme.
          </XDSText>
          <XDSCodeBlock
            language="tsx"
            code={`import * as stylex from '@stylexjs/stylex';
import { colorVars } from '@xds/core/tokens';

const styles = stylex.create({
  container: {
    backgroundColor: colorVars.backgroundSurface,
    color: colorVars.textPrimary,
    borderColor: colorVars.border,
  },
  accent: {
    color: colorVars.accent,
  },
  error: {
    color: colorVars.error,
  },
});`}
          />
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// TypographyFoundationPage
// ---------------------------------------------------------------------------

const TYPO_RATIO_OPTIONS = [
  {value: 1.067, label: '1.067 — Minor Second'},
  {value: 1.125, label: '1.125 — Major Second'},
  {value: 1.2, label: '1.200 — Minor Third'},
  {value: 1.25, label: '1.250 — Major Third'},
  {value: 1.333, label: '1.333 — Perfect Fourth'},
  {value: 1.414, label: '1.414 — Augmented Fourth'},
  {value: 1.5, label: '1.500 — Perfect Fifth'},
  {value: 1.618, label: '1.618 — Golden Ratio'},
];

const TYPO_THEME_OPTIONS: {
  key: string;
  label: string;
  theme: XDSDefinedTheme;
  desc: string;
  fonts: {body: string; heading: string; code: string};
}[] = [
  {
    key: 'default',
    label: 'Default',
    theme: defaultTheme,
    desc: 'System fonts · base 14px · ratio 1.2',
    fonts: {body: 'System', heading: 'System', code: 'SF Mono'},
  },
  {
    key: 'neutral',
    label: 'Neutral',
    theme: neutralTheme,
    desc: 'Geist · base 14px · ratio 1.2 · bold h3/h4',
    fonts: {body: 'Geist', heading: 'Geist', code: 'Geist Mono'},
  },
  {
    key: 'brutalist',
    label: 'Brutalist',
    theme: brutalistTheme,
    desc: 'Courier New · monospace everywhere',
    fonts: {body: 'Courier New', heading: 'Courier New', code: 'Courier New'},
  },
  {
    key: 'matcha',
    label: 'Matcha',
    theme: matchaTheme,
    desc: 'Figtree · earthy greens · serif headings',
    fonts: {body: 'Figtree', heading: 'Figtree', code: 'SF Mono'},
  },
  {
    key: 'daily',
    label: 'Daily',
    theme: dailyTheme,
    desc: 'Figtree · warm neutrals · Lucide icons',
    fonts: {body: 'Figtree', heading: 'Figtree', code: 'SF Mono'},
  },
];

const TYPO_SCALE_STEPS: {label: string; step: number}[] = [
  {label: 'Display 1', step: 6},
  {label: 'Display 2', step: 5},
  {label: 'Display 3', step: 4},
  {label: 'Heading 1', step: 3},
  {label: 'Heading 2', step: 2},
  {label: 'Heading 3', step: 1},
  {label: 'H4 / Body', step: 0},
  {label: 'Supporting', step: -1},
  {label: 'Heading 6', step: -2},
];

const TYPE_SCALE_ROWS: {
  label: string;
  step: number;
  weight: string;
  family: string;
  render: (text: string) => React.ReactNode;
}[] = [
  {
    label: 'Display 1',
    step: 6,
    weight: 'Normal',
    family: 'Heading',
    render: t => <XDSText type="display-1">{t}</XDSText>,
  },
  {
    label: 'Display 2',
    step: 5,
    weight: 'Normal',
    family: 'Heading',
    render: t => <XDSText type="display-2">{t}</XDSText>,
  },
  {
    label: 'Display 3',
    step: 4,
    weight: 'Normal',
    family: 'Heading',
    render: t => <XDSText type="display-3">{t}</XDSText>,
  },
  {
    label: 'Heading 1',
    step: 3,
    weight: 'Semibold',
    family: 'Heading',
    render: t => <XDSHeading level={1}>{t}</XDSHeading>,
  },
  {
    label: 'Heading 2',
    step: 2,
    weight: 'Semibold',
    family: 'Heading',
    render: t => <XDSHeading level={2}>{t}</XDSHeading>,
  },
  {
    label: 'Heading 3',
    step: 1,
    weight: 'Semibold',
    family: 'Heading',
    render: t => <XDSHeading level={3}>{t}</XDSHeading>,
  },
  {
    label: 'Heading 4',
    step: 0,
    weight: 'Semibold',
    family: 'Heading',
    render: t => <XDSHeading level={4}>{t}</XDSHeading>,
  },
  {
    label: 'Body',
    step: 0,
    weight: 'Normal',
    family: 'Body',
    render: t => <XDSText type="body">{t}</XDSText>,
  },
  {
    label: 'Label',
    step: 0,
    weight: 'Medium',
    family: 'Body',
    render: t => <XDSText type="label">{t}</XDSText>,
  },
  {
    label: 'Supporting',
    step: -1,
    weight: 'Normal',
    family: 'Body',
    render: t => <XDSText type="supporting">{t}</XDSText>,
  },
  {
    label: 'Code',
    step: 0,
    weight: 'Normal',
    family: 'Code',
    render: t => <XDSText type="code">{t}</XDSText>,
  },
];

function TypographyFoundationPage() {
  const [previewTheme, setPreviewTheme] = useState('default');
  const [scaleTheme, setScaleTheme] = useState('default');
  const [scaleBase, setScaleBase] = useState(14);
  const [scaleRatio, setScaleRatio] = useState(1.2);
  const [refTab, setRefTab] = useState<'usage' | 'api'>('usage');

  const activeThemeOption =
    TYPO_THEME_OPTIONS.find(t => t.key === previewTheme) ??
    TYPO_THEME_OPTIONS[0];

  const scaleSizes = useMemo(
    () =>
      TYPO_SCALE_STEPS.map(s => ({
        ...s,
        px: Math.round(scaleBase * Math.pow(scaleRatio, s.step)),
      })),
    [scaleBase, scaleRatio],
  );
  const scalePreviewTheme = useMemo(
    () =>
      defineTheme({
        name: 'scale-preview',
        typography: {scale: {base: scaleBase, ratio: scaleRatio}},
        tokens: {},
        icons: defaultIconRegistry,
      }),
    [scaleBase, scaleRatio],
  );
  const maxPx = scaleSizes[0]?.px ?? 42;

  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={8}>
        {/* Header */}
        <XDSStack direction="vertical" gap={2}>
          <XDSText type="display-1">Typography</XDSText>
          <XDSText type="large" weight="normal" color="secondary">
            Typography establishes hierarchy, readability, and accessibility
            across your UI. XDS handles it with two components and a
            token-driven type scale.
          </XDSText>
        </XDSStack>

        <XDSStack direction="vertical" gap={0}>
          <XDSTabList
            value={refTab}
            onChange={v => setRefTab(v as 'usage' | 'api')}
            size="sm">
            <XDSTab value="usage" label="Usage" />
            <XDSTab value="api" label="API" />
          </XDSTabList>
          <XDSDivider />
        </XDSStack>

        {refTab === 'usage' && (
          <>
            {/* Type scale preview */}
            {(() => {
              const scaleThemeOption =
                TYPO_THEME_OPTIONS.find(t => t.key === scaleTheme) ??
                TYPO_THEME_OPTIONS[0];
              return (
                <XDSCard variant="muted" padding={0}>
                  <XDSSection padding={3} variant="transparent">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <XDSText type="label" color="secondary">
                        Scale
                      </XDSText>
                      <XDSStack direction="horizontal" gap={1} vAlign="center">
                        {TYPO_THEME_OPTIONS.map(opt => (
                          <XDSButton
                            key={opt.key}
                            label={opt.label}
                            variant={
                              scaleTheme === opt.key ? 'primary' : 'ghost'
                            }
                            size="sm"
                            onClick={() => setScaleTheme(opt.key)}
                          />
                        ))}
                      </XDSStack>
                    </div>
                  </XDSSection>
                  <XDSTheme theme={scaleThemeOption.theme}>
                    <div style={{padding: '8px 24px 24px'}}>
                      <XDSStack direction="vertical" gap={0}>
                        {TYPE_SCALE_ROWS.map(row => {
                          const px = Math.round(
                            scaleBase * Math.pow(scaleRatio, row.step),
                          );
                          const fontName =
                            row.family === 'Code'
                              ? scaleThemeOption.fonts.code
                              : row.family === 'Heading'
                                ? scaleThemeOption.fonts.heading
                                : scaleThemeOption.fonts.body;
                          return (
                            <div
                              key={row.label}
                              style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 16,
                                paddingBlock: 12,
                                borderBottom:
                                  '1px solid var(--color-border, rgba(0,0,0,0.06))',
                              }}>
                              <div style={{flex: 1, minWidth: 0}}>
                                {row.render(row.label)}
                              </div>
                              <XDSText
                                type="supporting"
                                color="secondary"
                                style={{width: 80, flexShrink: 0}}>
                                {fontName}
                              </XDSText>
                              <XDSText
                                type="supporting"
                                color="secondary"
                                style={{width: 70, flexShrink: 0}}>
                                {row.weight}
                              </XDSText>
                              <XDSText
                                type="supporting"
                                color="secondary"
                                style={{
                                  width: 40,
                                  flexShrink: 0,
                                  textAlign: 'right',
                                }}>
                                {px}px
                              </XDSText>
                            </div>
                          );
                        })}
                      </XDSStack>
                    </div>
                  </XDSTheme>
                </XDSCard>
              );
            })()}

            {/* Pick the right type */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>Pick the right type</XDSHeading>
              <XDSText type="body" color="secondary">
                Every piece of text uses one of two components. Pick based on
                semantic purpose, not visual size.
              </XDSText>

              <XDSTable
                data={
                  [
                    {
                      component: 'XDSHeading',
                      when: 'Section titles that define document structure (renders h1–h6)',
                    },
                    {
                      component: 'XDSText type="display-*"',
                      when: 'Large decorative text without heading semantics (hero headlines, splash screens)',
                    },
                    {
                      component: 'XDSText type="large"',
                      when: 'Introductory or emphasized body text (section intros, feature lead-ins)',
                    },
                    {
                      component: 'XDSText type="body"',
                      when: 'General content, paragraphs, and descriptions',
                    },
                    {
                      component: 'XDSText type="label"',
                      when: 'Form labels, column headers, and category names',
                    },
                    {
                      component: 'XDSText type="supporting"',
                      when: 'Secondary metadata, captions, and helper text',
                    },
                    {
                      component: 'XDSText type="code"',
                      when: 'Inline code, variable names, and token references',
                    },
                  ] as Record<string, unknown>[]
                }
                columns={[
                  {
                    key: 'component',
                    header: 'Component',
                    width: pixel(250),
                    renderCell: (row: Record<string, unknown>) => (
                      <XDSText type="code" textWrap="wrap">
                        {row.component as string}
                      </XDSText>
                    ),
                  },
                  {
                    key: 'when',
                    header: 'When to use',
                    renderCell: (row: Record<string, unknown>) => (
                      <XDSText type="body" textWrap="wrap">
                        {row.when as string}
                      </XDSText>
                    ),
                  },
                ]}
                density="spacious"
                dividers="rows"
              />

              <XDSHeading level={3}>Best practices</XDSHeading>
              <XDSTable
                data={
                  [
                    {
                      type: 'do',
                      text: 'Use XDSHeading with sequential levels to create a real document outline that screen readers can navigate',
                    },
                    {
                      type: 'do',
                      text: 'Use XDSText type="display-*" or type="large" for visually large text that is not a section title',
                    },
                    {
                      type: 'do',
                      text: 'Use color="secondary" on supporting text instead of reducing opacity — tokens adapt to light/dark mode',
                    },
                    {
                      type: 'do',
                      text: 'Use maxLines for truncation — the component handles ellipsis and line clamping',
                    },
                    {
                      type: 'dont',
                      text: "Don't use XDSText for section titles — screen readers only build a navigable outline from heading elements (h1–h6). XDSText renders a span, which is invisible to assistive technology",
                    },
                    {
                      type: 'dont',
                      text: "Don't use XDSHeading just for visual size — it creates false document structure that confuses screen reader navigation",
                    },
                    {
                      type: 'dont',
                      text: "Don't skip heading levels (e.g. h1 → h3) — screen readers expose headings as a navigable tree",
                    },
                    {
                      type: 'dont',
                      text: "Don't set font-size or font-family in inline styles — always use component props or design tokens",
                    },
                  ] as Record<string, unknown>[]
                }
                columns={[
                  {
                    key: 'type',
                    header: 'Guidance',
                    width: pixel(100),
                    renderCell: (item: Record<string, unknown>) => (
                      <XDSBadge
                        label={item.type === 'do' ? 'Do' : 'Dont'}
                        variant={item.type === 'do' ? 'success' : 'error'}
                      />
                    ),
                  },
                  {
                    key: 'text',
                    header: '',
                    renderCell: (item: Record<string, unknown>) => (
                      <XDSText type="body" textWrap="wrap">
                        {item.text as string}
                      </XDSText>
                    ),
                  },
                ]}
                density="spacious"
                dividers="rows"
              />
            </XDSStack>

            {/* ================================================================
            SECTION 2 — Preview (theme toggle + scale explorer merged)
            ================================================================ */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>Preview</XDSHeading>
              <XDSText type="body" color="secondary">
                Toggle between themes and adjust the type scale to see how
                typography adapts across the system.
              </XDSText>

              {/* Side-by-side: controls panel + live specimen */}
              <div style={{display: 'flex', gap: 16, alignItems: 'stretch'}}>
                {/* Left panel — controls + scale chart */}
                <div
                  style={{
                    width: 300,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                  {/* Theme */}
                  <XDSCard padding={3}>
                    <XDSText
                      type="label"
                      color="secondary"
                      display="block"
                      style={{marginBottom: 8}}>
                      Theme
                    </XDSText>
                    <XDSStack
                      direction="horizontal"
                      gap={1}
                      vAlign="center"
                      style={{flexWrap: 'wrap'}}>
                      {TYPO_THEME_OPTIONS.map(opt => (
                        <XDSButton
                          key={opt.key}
                          label={opt.label}
                          variant={
                            previewTheme === opt.key ? 'primary' : 'secondary'
                          }
                          size="sm"
                          onClick={() => setPreviewTheme(opt.key)}
                        />
                      ))}
                    </XDSStack>
                    <XDSText
                      type="supporting"
                      color="secondary"
                      style={{marginTop: 6}}>
                      {activeThemeOption.desc}
                    </XDSText>
                  </XDSCard>

                  {/* Scale controls + bar chart */}
                  <XDSCard padding={3} style={{flex: 1}}>
                    <XDSStack direction="vertical" gap={3}>
                      <div>
                        <XDSText
                          type="label"
                          color="secondary"
                          display="block"
                          style={{marginBottom: 6}}>
                          Base size
                        </XDSText>
                        <XDSStack
                          direction="horizontal"
                          gap={1}
                          vAlign="center">
                          {(
                            [
                              {label: 'S', value: 12},
                              {label: 'M', value: 14},
                              {label: 'L', value: 16},
                              {label: 'XL', value: 18},
                            ] as const
                          ).map(p => (
                            <XDSButton
                              key={p.value}
                              label={p.label}
                              variant={
                                scaleBase === p.value ? 'primary' : 'ghost'
                              }
                              size="sm"
                              onClick={() => setScaleBase(p.value)}
                            />
                          ))}
                          <div style={{flex: 1}} />
                          <XDSNumberInput
                            label="Base size"
                            isLabelHidden
                            value={scaleBase}
                            onChange={(v: number) => setScaleBase(v)}
                            min={10}
                            max={24}
                            step={1}
                            units="px"
                            size="sm"
                          />
                        </XDSStack>
                      </div>
                      <div>
                        <XDSText
                          type="label"
                          color="secondary"
                          display="block"
                          style={{marginBottom: 6}}>
                          Scale ratio
                        </XDSText>
                        <XDSSelector
                          label="Scale ratio"
                          isLabelHidden
                          options={[
                            ...TYPO_RATIO_OPTIONS.map(opt => ({
                              value: String(opt.value),
                              label: opt.label,
                            })),
                            {
                              value: 'custom',
                              label: !TYPO_RATIO_OPTIONS.some(
                                o => Math.abs(o.value - scaleRatio) < 0.001,
                              )
                                ? `Custom — ${scaleRatio.toFixed(3)}`
                                : 'Custom...',
                            },
                          ]}
                          value={
                            !TYPO_RATIO_OPTIONS.some(
                              o => Math.abs(o.value - scaleRatio) < 0.001,
                            )
                              ? 'custom'
                              : String(scaleRatio)
                          }
                          onChange={(v: string) => {
                            if (v !== 'custom') setScaleRatio(Number(v));
                          }}
                        />
                      </div>
                      <XDSDivider />
                      <XDSStack direction="vertical" gap={1}>
                        {scaleSizes.map(s => (
                          <div
                            key={s.label}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}>
                            <div style={{width: 72, flexShrink: 0}}>
                              <XDSText type="supporting" color="secondary">
                                {s.label}
                              </XDSText>
                            </div>
                            <div
                              style={{
                                width: 32,
                                flexShrink: 0,
                                textAlign: 'right',
                              }}>
                              <XDSText type="supporting" color="secondary">
                                {s.px}
                              </XDSText>
                            </div>
                            <div style={{flex: 1, minWidth: 0}}>
                              <div
                                style={{
                                  height: Math.max(s.px * 0.45, 3),
                                  width: `${(s.px / maxPx) * 100}%`,
                                  borderRadius: 2,
                                  backgroundColor:
                                    s.step === 0
                                      ? 'var(--color-accent)'
                                      : 'var(--color-accent-muted, rgba(0,100,224,0.25))',
                                  transition:
                                    'width 300ms ease, height 300ms ease',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </XDSStack>
                    </XDSStack>
                  </XDSCard>
                </div>

                {/* Right — live themed specimen */}
                <div style={{flex: 1, minWidth: 0}}>
                  <XDSTheme theme={activeThemeOption.theme}>
                    <XDSTheme theme={scalePreviewTheme}>
                      <div
                        style={{
                          padding: 32,
                          borderRadius: 12,
                          backgroundColor: 'var(--color-background-surface)',
                          color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-border)',
                          height: '100%',
                          boxSizing: 'border-box',
                        }}>
                        <XDSStack direction="vertical" gap={5}>
                          {/* display */}
                          <XDSStack direction="vertical" gap={1}>
                            <XDSText type="display-1">Welcome back</XDSText>
                            <XDSText type="large">
                              Here&apos;s what&apos;s happening with your
                              projects today.
                            </XDSText>
                          </XDSStack>
                          <XDSDivider />
                          {/* h1 + body */}
                          <XDSStack direction="vertical" gap={2}>
                            <XDSHeading level={1}>Project settings</XDSHeading>
                            <XDSText type="body">
                              Manage who has access to this project and what
                              permissions they have. Changes take effect
                              immediately.
                            </XDSText>
                          </XDSStack>
                          {/* h2 + label + supporting */}
                          <XDSStack direction="vertical" gap={2}>
                            <XDSHeading level={2}>Team members</XDSHeading>
                            <XDSStack direction="vertical" gap={1}>
                              <XDSText type="label">Email address</XDSText>
                              <XDSText type="supporting" color="secondary">
                                We&apos;ll send an invite to this address.
                              </XDSText>
                            </XDSStack>
                          </XDSStack>
                          {/* h3 + h4 */}
                          <XDSStack direction="vertical" gap={2}>
                            <XDSHeading level={3}>Notifications</XDSHeading>
                            <XDSHeading level={4}>Email preferences</XDSHeading>
                            <XDSText type="body" color="secondary">
                              Choose which updates you&apos;d like to receive.
                            </XDSText>
                          </XDSStack>
                          <XDSDivider />
                          {/* h5 + h6 + code + supporting */}
                          <XDSStack direction="vertical" gap={2}>
                            <XDSHeading level={5}>Advanced</XDSHeading>
                            <XDSHeading level={6}>API Configuration</XDSHeading>
                            <XDSText type="code">
                              const config = &#123; theme: &apos;default&apos;
                              &#125;;
                            </XDSText>
                            <XDSText type="supporting" color="secondary">
                              Last updated 2 hours ago · 3 members online
                            </XDSText>
                          </XDSStack>
                        </XDSStack>
                      </div>
                    </XDSTheme>
                  </XDSTheme>
                </div>
              </div>
            </XDSStack>

            {/* Why typography matters — context at the bottom */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>Why typography matters</XDSHeading>
              <XDSText type="body" color="secondary">
                In most interfaces, text makes up over 80% of the content users
                interact with. Typography is not decoration — it is the
                interface. When type is inconsistent, users slow down, miss
                actions, and lose trust in the product.
              </XDSText>
              <XDSList density="spacious" listStyle="disc">
                <XDSListItem
                  label={
                    <>
                      <XDSHeading level={4}>
                        Users scan before they read.
                      </XDSHeading>{' '}
                      <XDSText type="body" textWrap="wrap">
                        Size and weight differences create a visual hierarchy
                        that tells people where to look first, what&apos;s
                        actionable, and what&apos;s secondary — without reading
                        a single word.
                      </XDSText>
                    </>
                  }
                />
                <XDSListItem
                  label={
                    <>
                      <XDSHeading level={4}>
                        Inconsistent sizing breaks rhythm.
                      </XDSHeading>{' '}
                      <XDSText type="body" textWrap="wrap">
                        When one screen uses 13px body text and another uses
                        15px, the interface feels stitched together. A shared
                        type scale eliminates this drift across teams.
                      </XDSText>
                    </>
                  }
                />
                <XDSListItem
                  label={
                    <>
                      <XDSHeading level={4}>
                        Screen readers depend on heading elements.
                      </XDSHeading>{' '}
                      <XDSText type="body" textWrap="wrap">
                        If a section title uses XDSText instead of XDSHeading,
                        assistive technology can&apos;t build a page outline.
                        Users who navigate by headings will miss entire
                        sections.
                      </XDSText>
                    </>
                  }
                />
                <XDSListItem
                  label={
                    <>
                      <XDSHeading level={4}>
                        Font loading affects perceived performance.
                      </XDSHeading>{' '}
                      <XDSText type="body" textWrap="wrap">
                        System fonts render instantly; custom fonts can cause
                        layout shift. XDS font declarations include fallback
                        stacks so text is always readable while fonts load.
                      </XDSText>
                    </>
                  }
                />
                <XDSListItem
                  label={
                    <>
                      <XDSHeading level={4}>
                        Line height and measure affect comprehension.
                      </XDSHeading>{' '}
                      <XDSText type="body" textWrap="wrap">
                        Lines that are too tight or too wide make readers lose
                        their place. The XDS type scale snaps line heights to a
                        4px grid and targets proven ratios by size tier.
                      </XDSText>
                    </>
                  }
                />
              </XDSList>
              <XDSText type="body" color="secondary">
                A design system centralizes these decisions so individual
                features don&apos;t reinvent them. Every text element in XDS
                inherits from the same token-driven scale, which means switching
                themes updates every heading, label, and caption system-wide —
                no manual migration required.
              </XDSText>
            </XDSStack>
          </>
        )}

        {refTab === 'api' && (
          <XDSStack direction="vertical" gap={8}>
            {/* How it works */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>How it works</XDSHeading>
              <XDSText type="body" color="secondary">
                Typography is built on three layers: raw size tokens (geometric
                scale in rem), semantic tokens (size + weight + line height
                bundles), and components that consume them. Themes can override
                any layer.
              </XDSText>
              <XDSCard padding={0}>
                <XDSCodeBlock
                  title="Layers 1-2: Design tokens (CSS)"
                  code={`/* Layer 1: Raw size token — set by theme scale */
--font-size-2xl: 1.5rem;   /* 24px */

/* Layer 2: Semantic token — references Layer 1 */
--text-heading-1-size: var(--font-size-2xl);
--text-heading-1-weight: var(--font-weight-semibold);
--text-heading-1-leading: 1.3333;   /* 24px → 32px (4px grid) */`}
                  language="css"
                  hasCopyButton
                />
              </XDSCard>
              <XDSCard padding={0}>
                <XDSCodeBlock
                  title="Layer 3: Component (TSX)"
                  code={`// Component consumes the semantic tokens automatically
<XDSHeading level={1}>Page title</XDSHeading>`}
                  language="tsx"
                  hasCopyButton
                />
              </XDSCard>
            </XDSStack>

            {/* Code */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>Code</XDSHeading>
              <XDSCard padding={0}>
                <XDSCodeBlock
                  title="Basic usage"
                  code={`import { XDSHeading, XDSText } from '@xds/core/Text';

// Section structure — use XDSHeading
<XDSHeading level={1}>Page title</XDSHeading>
<XDSHeading level={2}>Section title</XDSHeading>

// Content — use XDSText with a type
<XDSText type="display-1">Hero headline</XDSText>
<XDSText type="body">Paragraph content.</XDSText>
<XDSText type="body" weight="bold">Emphasized.</XDSText>
<XDSText type="label">Form label</XDSText>
<XDSText type="supporting" color="secondary">Helper text</XDSText>
<XDSText type="code">variableName</XDSText>

// Truncation
<XDSText type="body" maxLines={2}>Long content...</XDSText>
<XDSHeading level={2} textWrap="balance">Balanced heading</XDSHeading>`}
                  language="tsx"
                  hasCopyButton
                />
              </XDSCard>
              <XDSCard padding={0}>
                <XDSCodeBlock
                  title="Theming typography"
                  code={`import { defineTheme } from '@xds/core/theme';

export const myTheme = defineTheme({
  name: 'my-theme',
  typography: {
    scale: { base: 16, ratio: 1.25 },  // Dense: 12/1.125, Default: 14/1.2, Airy: 16/1.25
    body: { family: 'Geist', fallbacks: '-apple-system, sans-serif' },
    heading: { weight: 'semibold', weights: { 3: 'bold', 4: 'bold' } },
    code: { family: 'Geist Mono', fallbacks: '"SF Mono", monospace' },
  },
});`}
                  language="tsx"
                  hasCopyButton
                />
              </XDSCard>
            </XDSStack>

            {/* Props */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>Props</XDSHeading>
              <XDSHeading level={3}>XDSHeading</XDSHeading>
              <XDSTable
                data={
                  [
                    {
                      prop: 'level',
                      type: '1 | 2 | 3 | 4 | 5 | 6',
                      req: 'Yes',
                      desc: 'HTML heading tag and visual size.',
                    },
                    {
                      prop: 'weight',
                      type: "'normal' | 'medium' | 'semibold' | 'bold'",
                      req: 'No',
                      desc: 'Override default weight (semibold).',
                    },
                    {
                      prop: 'color',
                      type: "'primary' | 'secondary' | 'disabled' | 'active' | 'inherit'",
                      req: 'No',
                      desc: 'Semantic text color.',
                    },
                    {
                      prop: 'maxLines',
                      type: 'number',
                      req: 'No',
                      desc: 'Truncate with ellipsis after N lines.',
                    },
                    {
                      prop: 'textWrap',
                      type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
                      req: 'No',
                      desc: 'CSS text-wrap value.',
                    },
                  ] as Record<string, unknown>[]
                }
                columns={[
                  {
                    key: 'prop',
                    header: 'Prop',
                    width: pixel(100),
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code">{r.prop as string}</XDSText>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    width: pixel(220),
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code" maxLines={2}>
                        {r.type as string}
                      </XDSText>
                    ),
                  },
                  {key: 'req', header: 'Req', width: pixel(50)},
                  {
                    key: 'desc',
                    header: 'Description',
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="body" textWrap="wrap">
                        {r.desc as string}
                      </XDSText>
                    ),
                  },
                ]}
                density="spacious"
                dividers="rows"
              />
              <XDSHeading level={3}>XDSText</XDSHeading>
              <XDSTable
                data={
                  [
                    {
                      prop: 'type',
                      type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3'",
                      req: 'Yes',
                      desc: 'Semantic text role. Controls size, weight, font family.',
                    },
                    {
                      prop: 'weight',
                      type: "'normal' | 'medium' | 'semibold' | 'bold'",
                      req: 'No',
                      desc: 'Override default weight for the type.',
                    },
                    {
                      prop: 'color',
                      type: "'primary' | 'secondary' | 'disabled' | 'active' | 'inherit'",
                      req: 'No',
                      desc: 'Semantic text color.',
                    },
                    {
                      prop: 'display',
                      type: "'inline' | 'block'",
                      req: 'No',
                      desc: 'CSS display. Default inline.',
                    },
                    {
                      prop: 'maxLines',
                      type: 'number',
                      req: 'No',
                      desc: 'Truncate with ellipsis after N lines.',
                    },
                    {
                      prop: 'textWrap',
                      type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
                      req: 'No',
                      desc: 'CSS text-wrap value.',
                    },
                  ] as Record<string, unknown>[]
                }
                columns={[
                  {
                    key: 'prop',
                    header: 'Prop',
                    width: pixel(100),
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code">{r.prop as string}</XDSText>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    width: pixel(220),
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code" maxLines={2}>
                        {r.type as string}
                      </XDSText>
                    ),
                  },
                  {key: 'req', header: 'Req', width: pixel(50)},
                  {
                    key: 'desc',
                    header: 'Description',
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="body" textWrap="wrap">
                        {r.desc as string}
                      </XDSText>
                    ),
                  },
                ]}
                density="spacious"
                dividers="rows"
              />
            </XDSStack>

            {/* Tokens */}
            <XDSStack direction="vertical" gap={4}>
              <XDSHeading level={2}>Tokens</XDSHeading>
              <XDSTable
                data={
                  [
                    {
                      type: 'Display 1',
                      sizeToken: '--text-display-1-size',
                      weightToken: '--text-display-1-weight',
                      component: '<XDSText type="display-1">',
                    },
                    {
                      type: 'Display 2',
                      sizeToken: '--text-display-2-size',
                      weightToken: '--text-display-2-weight',
                      component: '<XDSText type="display-2">',
                    },
                    {
                      type: 'Display 3',
                      sizeToken: '--text-display-3-size',
                      weightToken: '--text-display-3-weight',
                      component: '<XDSText type="display-3">',
                    },
                    {
                      type: 'Heading 1',
                      sizeToken: '--text-heading-1-size',
                      weightToken: '--text-heading-1-weight',
                      component: '<XDSHeading level={1}>',
                    },
                    {
                      type: 'Heading 2',
                      sizeToken: '--text-heading-2-size',
                      weightToken: '--text-heading-2-weight',
                      component: '<XDSHeading level={2}>',
                    },
                    {
                      type: 'Heading 3',
                      sizeToken: '--text-heading-3-size',
                      weightToken: '--text-heading-3-weight',
                      component: '<XDSHeading level={3}>',
                    },
                    {
                      type: 'Heading 4',
                      sizeToken: '--text-heading-4-size',
                      weightToken: '--text-heading-4-weight',
                      component: '<XDSHeading level={4}>',
                    },
                    {
                      type: 'Heading 5',
                      sizeToken: '--text-heading-5-size',
                      weightToken: '--text-heading-5-weight',
                      component: '<XDSHeading level={5}>',
                    },
                    {
                      type: 'Heading 6',
                      sizeToken: '--text-heading-6-size',
                      weightToken: '--text-heading-6-weight',
                      component: '<XDSHeading level={6}>',
                    },
                    {
                      type: 'Large',
                      sizeToken: '--text-large-size',
                      weightToken: '--text-large-weight',
                      component: '<XDSText type="large">',
                    },
                    {
                      type: 'Body',
                      sizeToken: '--text-body-size',
                      weightToken: '--text-body-weight',
                      component: '<XDSText type="body">',
                    },
                    {
                      type: 'Label',
                      sizeToken: '--text-label-size',
                      weightToken: '--text-label-weight',
                      component: '<XDSText type="label">',
                    },
                    {
                      type: 'Supporting',
                      sizeToken: '--text-supporting-size',
                      weightToken: '--text-supporting-weight',
                      component: '<XDSText type="supporting">',
                    },
                    {
                      type: 'Code',
                      sizeToken: '--text-code-size',
                      weightToken: '--text-code-weight',
                      component: '<XDSText type="code">',
                    },
                  ] as Record<string, unknown>[]
                }
                columns={[
                  {
                    key: 'type',
                    header: 'Type',
                    width: pixel(100),
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="label">{r.type as string}</XDSText>
                    ),
                  },
                  {
                    key: 'sizeToken',
                    header: 'Size token',
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code">{r.sizeToken as string}</XDSText>
                    ),
                  },
                  {
                    key: 'weightToken',
                    header: 'Weight token',
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code">{r.weightToken as string}</XDSText>
                    ),
                  },
                  {
                    key: 'component',
                    header: 'Component',
                    renderCell: (r: Record<string, unknown>) => (
                      <XDSText type="code">{r.component as string}</XDSText>
                    ),
                  },
                ]}
                density="spacious"
                dividers="rows"
              />
              <XDSGrid columns={2} gap={4}>
                <XDSCard padding={4}>
                  <XDSText
                    type="label"
                    display="block"
                    style={{marginBottom: 8}}>
                    Font families
                  </XDSText>
                  <XDSStack direction="vertical" gap={2}>
                    {[
                      {
                        token: '--font-family-body',
                        note: 'body, large, label, supporting',
                      },
                      {
                        token: '--font-family-heading',
                        note: 'headings, display sizes',
                      },
                      {
                        token: '--font-family-code',
                        note: 'code text, CodeBlock',
                      },
                    ].map(f => (
                      <div key={f.token}>
                        <XDSText type="code" display="block">
                          {f.token}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          {f.note}
                        </XDSText>
                      </div>
                    ))}
                  </XDSStack>
                </XDSCard>
                <XDSCard padding={4}>
                  <XDSText
                    type="label"
                    display="block"
                    style={{marginBottom: 8}}>
                    Weights
                  </XDSText>
                  <XDSStack direction="vertical" gap={2}>
                    {[
                      {
                        token: '--font-weight-normal',
                        val: '400',
                        note: 'body, code, supporting',
                      },
                      {
                        token: '--font-weight-medium',
                        val: '500',
                        note: 'label',
                      },
                      {
                        token: '--font-weight-semibold',
                        val: '600',
                        note: 'headings, large',
                      },
                      {
                        token: '--font-weight-bold',
                        val: '700',
                        note: 'weight="bold" prop',
                      },
                    ].map(w => (
                      <div
                        key={w.token}
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'baseline',
                        }}>
                        <XDSText type="code">{w.val}</XDSText>
                        <XDSText type="supporting" color="secondary">
                          {w.note}
                        </XDSText>
                      </div>
                    ))}
                  </XDSStack>
                </XDSCard>
              </XDSGrid>
              <XDSCard padding={4}>
                <XDSText type="label" display="block" style={{marginBottom: 8}}>
                  Text colors (color prop)
                </XDSText>
                <XDSStack
                  direction="horizontal"
                  gap={6}
                  style={{flexWrap: 'wrap'}}>
                  {[
                    {prop: 'primary', note: 'Default — body, headings'},
                    {prop: 'secondary', note: 'Descriptions, metadata'},
                    {prop: 'disabled', note: 'Inactive content'},
                    {prop: 'active', note: 'Links, accents'},
                    {prop: 'inherit', note: 'Parent color'},
                  ].map(c => (
                    <XDSStack key={c.prop} direction="vertical" gap={0}>
                      <XDSText
                        type="code"
                        display="block">{`"${c.prop}"`}</XDSText>
                      <XDSText type="supporting" color="secondary">
                        {c.note}
                      </XDSText>
                    </XDSStack>
                  ))}
                </XDSStack>
              </XDSCard>
            </XDSStack>
          </XDSStack>
        )}
      </XDSStack>
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// SpacingFoundationPage
// ---------------------------------------------------------------------------

const SPACING_TOKENS: {step: string; token: string; value: string}[] = [
  {step: '0', token: '--spacing-0', value: '0px'},
  {step: '0.5', token: '--spacing-0-5', value: '2px'},
  {step: '1', token: '--spacing-1', value: '4px'},
  {step: '1.5', token: '--spacing-1-5', value: '6px'},
  {step: '2', token: '--spacing-2', value: '8px'},
  {step: '3', token: '--spacing-3', value: '12px'},
  {step: '4', token: '--spacing-4', value: '16px'},
  {step: '5', token: '--spacing-5', value: '20px'},
  {step: '6', token: '--spacing-6', value: '24px'},
  {step: '7', token: '--spacing-7', value: '28px'},
  {step: '8', token: '--spacing-8', value: '32px'},
  {step: '9', token: '--spacing-9', value: '36px'},
  {step: '10', token: '--spacing-10', value: '40px'},
  {step: '11', token: '--spacing-11', value: '44px'},
  {step: '12', token: '--spacing-12', value: '48px'},
];

const SPACING_RANGES: {range: string; pixels: string; usage: string}[] = [
  {
    range: '0–1',
    pixels: '0–4px',
    usage: 'Tight gaps between inline elements, icon-to-label spacing',
  },
  {
    range: '1.5–2',
    pixels: '6–8px',
    usage: 'Component internal spacing, badge padding',
  },
  {
    range: '3–4',
    pixels: '12–16px',
    usage: 'Standard component gaps, card padding, list item spacing',
  },
  {
    range: '5–6',
    pixels: '20–24px',
    usage: 'Section spacing, larger card padding',
  },
  {
    range: '8–10',
    pixels: '32–40px',
    usage: 'Page-level spacing, section separators',
  },
  {
    range: '11–12',
    pixels: '44–48px',
    usage: 'Hero spacing, major section breaks',
  },
];

function SpacingFoundationPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={3}>
          <XDSText type="display-1">Spacing</XDSText>
          <XDSText type="large" weight="normal" color="secondary">
            XDS uses a 4px-based spacing scale to keep layouts consistent and
            aligned. Every gap, padding, and margin maps to a token so your UI
            stays rhythmic across components and pages.
          </XDSText>
        </XDSStack>

        {/* Spacing scale */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Spacing scale</XDSHeading>
          <XDSCard padding={0}>
            <XDSTable
              data={SPACING_TOKENS as Record<string, unknown>[]}
              columns={[
                {key: 'step', header: 'Step', width: pixel(100)},
                {
                  key: 'token',
                  header: 'Token',
                  width: pixel(220),
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="code">{row.token as string}</XDSText>
                  ),
                },
                {key: 'value', header: 'Value', width: pixel(100)},
              ]}
            />
          </XDSCard>
        </XDSStack>

        {/* When to use each range */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>When to use each range</XDSHeading>
          <XDSCard padding={0}>
            <XDSTable
              data={SPACING_RANGES as Record<string, unknown>[]}
              columns={[
                {key: 'range', header: 'Steps', width: pixel(100)},
                {key: 'pixels', header: 'Pixels', width: pixel(100)},
                {key: 'usage', header: 'Usage'},
              ]}
            />
          </XDSCard>
        </XDSStack>

        {/* Usage */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Usage</XDSHeading>
          <XDSList>
            <XDSListItem label="Always use spacing tokens instead of hard-coded pixel values." />
            <XDSListItem
              label={
                <>
                  Prefer the <XDSText type="code">gap</XDSText> prop on{' '}
                  <XDSText type="code">XDSStack</XDSText> over manual margins
                  between siblings.
                </>
              }
            />
            <XDSListItem
              label="Use smaller steps (0–2) inside components and larger steps (4+)
              between sections."
            />
            <XDSListItem
              label={
                <>
                  Keep spacing symmetric — if a card has{' '}
                  <XDSText type="code">padding=&#123;4&#125;</XDSText>, use the
                  same value on all sides unless deliberately asymmetric.
                </>
              }
            />
            <XDSListItem
              label="Avoid mixing spacing scales; stick to the 4px grid for predictable
              alignment."
            />
          </XDSList>
        </XDSStack>

        {/* Code */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Code</XDSHeading>
          <XDSCodeBlock
            code={`// StyleX — reference spacing tokens directly
import { spacingVars } from '@xds/core/theme';

const styles = stylex.create({
  container: {
    padding: spacingVars.spacing4,   // 16px
    gap: spacingVars.spacing3,       // 12px
    marginBlock: spacingVars.spacing6, // 24px
  },
});`}
            language="tsx"
          />
          <XDSCodeBlock
            code={`// XDSStack — use the gap prop with scale steps
<XDSStack direction="vertical" gap={4}>
  <Card />
  <Card />
</XDSStack>

<XDSStack direction="horizontal" gap={2}>
  <Icon />
  <Label />
</XDSStack>`}
            language="tsx"
          />
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// IllustrationsFoundationPage
// ---------------------------------------------------------------------------

const ILLUSTRATION_CONTEXTS: Record<string, unknown>[] = [
  {
    context: 'Empty states',
    examples: 'No data, first-time experience, search with no results',
  },
  {
    context: 'Onboarding',
    examples: 'Welcome screens, feature introduction, setup wizards',
  },
  {
    context: 'Feature highlights',
    examples: 'New feature announcements, upgrade prompts',
  },
  {
    context: 'Error states',
    examples: 'Permission denied, not found, service unavailable',
  },
];

function IllustrationsFoundationPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={3}>
          <XDSText type="display-1">Illustrations</XDSText>
          <XDSText type="large" weight="normal" color="secondary">
            Illustration guidelines for empty states, onboarding flows, and
            feature highlights. Consistent illustration usage reinforces brand
            identity and helps users understand context at a glance.
          </XDSText>
        </XDSStack>

        {/* When to use */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>When to use</XDSHeading>
          <XDSCard padding={0}>
            <XDSTable
              data={ILLUSTRATION_CONTEXTS}
              columns={[
                {key: 'context', header: 'Context', width: pixel(180)},
                {key: 'examples', header: 'Examples'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSCard>
        </XDSStack>

        {/* Guidelines */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Guidelines</XDSHeading>
          <XDSList>
            <XDSListItem label="Keep illustrations consistent in style across the product." />
            <XDSListItem
              label="Use simple, flat illustrations that work in both light and dark
              mode."
            />
            <XDSListItem
              label="Size illustrations proportionally to the container — typically
              120–240px."
            />
            <XDSListItem label="Center illustrations with supporting text below." />
            <XDSListItem label="Don't mix illustration styles from different sources." />
            <XDSListItem label="Don't use illustrations as decoration without purpose." />
          </XDSList>
        </XDSStack>

        {/* Placement */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Placement</XDSHeading>
          <XDSText type="body" color="secondary">
            Center illustrations inside <XDSText type="code">XDSCenter</XDSText>{' '}
            with supporting text stacked below. Typical illustration sizes range
            from 120px for inline empty states to 240px for full-page onboarding
            screens. Always pair the illustration with a heading and optional
            body text to explain what the user should do next.
          </XDSText>
        </XDSStack>

        {/* Code */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Code</XDSHeading>
          <XDSCodeBlock
            code={`<XDSCenter>
  <XDSStack direction="vertical" gap={3} hAlign="center">
    <img
      src="/illustrations/empty-search.svg"
      alt="No results"
      style={{ width: 200, height: 200 }}
    />
    <XDSHeading level={3}>No results found</XDSHeading>
    <XDSText type="body" color="secondary">
      Try adjusting your search or filters to find what you're
      looking for.
    </XDSText>
  </XDSStack>
</XDSCenter>`}
            language="tsx"
          />
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// ShapeFoundationPage
// ---------------------------------------------------------------------------

const SHAPE_TOKENS: {
  token: string;
  value: string;
  usage: string;
  cssVar: string;
}[] = [
  {
    token: '--radius-none',
    value: '0px',
    usage: 'Sharp corners',
    cssVar: 'var(--radius-none)',
  },
  {
    token: '--radius-inner',
    value: '4px',
    usage: 'Grouped corners, chips inside containers',
    cssVar: 'var(--radius-inner)',
  },
  {
    token: '--radius-element',
    value: '8px',
    usage: 'Buttons, inputs, badges',
    cssVar: 'var(--radius-element)',
  },
  {
    token: '--radius-container',
    value: '12px',
    usage: 'Cards, panels, sections',
    cssVar: 'var(--radius-container)',
  },
  {
    token: '--radius-page',
    value: '28px',
    usage: 'Modals, dialogs, chat composer',
    cssVar: 'var(--radius-page)',
  },
  {
    token: '--radius-full',
    value: '9999px',
    usage: 'Pills, avatars, circular buttons',
    cssVar: 'var(--radius-full)',
  },
];

function ShapeFoundationPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={3}>
          <XDSText type="display-1">Shape</XDSText>
          <XDSText type="large" weight="normal" color="secondary">
            Border radius tokens define the curvature of UI surfaces. XDS
            provides a six-step scale from sharp corners to fully rounded pills,
            giving every element an intentional shape that adapts across themes.
          </XDSText>
        </XDSStack>

        {/* Radius scale */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Radius scale</XDSHeading>
          <XDSText type="body" color="secondary">
            Six tokens cover every corner radius in the system. Each maps to a
            semantic role so components pick the right curvature automatically.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={SHAPE_TOKENS as Record<string, unknown>[]}
              columns={[
                {
                  key: 'token',
                  header: 'Token',
                  width: pixel(220),
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="code">{row.token as string}</XDSText>
                  ),
                },
                {
                  key: 'value',
                  header: 'Value',
                  width: pixel(100),
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="body">{row.value as string}</XDSText>
                  ),
                },
                {
                  key: 'usage',
                  header: 'Usage',
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="body" color="secondary" textWrap="wrap">
                      {row.usage as string}
                    </XDSText>
                  ),
                },
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSCard>
        </XDSStack>

        {/* Visual reference */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Visual reference</XDSHeading>
          <XDSText type="body" color="secondary">
            Each square below uses the corresponding radius token via CSS custom
            property, so it responds to theme changes automatically.
          </XDSText>
          <XDSGrid columns={3} gap={4}>
            {SHAPE_TOKENS.map(t => (
              <XDSStack
                key={t.token}
                direction="vertical"
                gap={1}
                hAlign="center">
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: t.cssVar,
                    backgroundColor:
                      'var(--color-accent-muted, rgba(0,100,224,0.15))',
                    border: '2px solid var(--color-accent, #0064E0)',
                  }}
                />
                <XDSText type="code" color="secondary">
                  {t.token}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {t.value}
                </XDSText>
              </XDSStack>
            ))}
          </XDSGrid>
        </XDSStack>

        {/* Concentric radius */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Concentric radius</XDSHeading>
          <XDSText type="body" color="secondary">
            When an element is nested inside a rounded container, its corner
            radius should equal the outer radius minus the padding between them.
            This keeps the inner and outer curves concentric so the whitespace
            between them stays visually even.
          </XDSText>
          <XDSText type="body" color="secondary">
            <strong>inner radius = outer radius &minus; padding</strong>
          </XDSText>
          <XDSCard padding={0}>
            <XDSCodeBlock
              language="tsx"
              hasCopyButton
              code={`// A card (container radius) with a nested button (element radius).
// outer = 12px, padding = 4px → inner should be 8px.

<div style={{ borderRadius: 'var(--radius-container)', padding: 4 }}>
  <button style={{ borderRadius: 'var(--radius-element)' }}>
    Save
  </button>
</div>`}
            />
          </XDSCard>
          <XDSText type="supporting" color="secondary">
            If the padding is larger than the outer radius, use radius-none
            (0px) for the inner element instead of going negative.
          </XDSText>
        </XDSStack>

        {/* Usage best practices */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Usage</XDSHeading>
          <XDSList density="balanced" listStyle="disc">
            <XDSListItem label="Use semantic tokens (--radius-element, --radius-container) instead of hard-coded pixel values so shapes adapt when the theme changes." />
            <XDSListItem label="Match the token to the element's role: buttons and inputs get --radius-element, cards and panels get --radius-container." />
            <XDSListItem label="Apply the concentric radius rule whenever nesting rounded surfaces to keep curves optically smooth." />
            <XDSListItem label="Reserve --radius-full for elements that should always appear circular regardless of size (avatars, status dots, pill badges)." />
            <XDSListItem label="Use --radius-none intentionally for elements that need a sharp, authoritative edge (data tables, toolbars)." />
            <XDSListItem label="Never mix token levels on the same surface — e.g. don't combine --radius-page on one corner and --radius-element on another." />
          </XDSList>
        </XDSStack>

        {/* Code */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Code</XDSHeading>
          <XDSText type="body" color="secondary">
            Import radius tokens from the XDS theme package and apply them with
            StyleX.
          </XDSText>
          <XDSCard padding={0}>
            <XDSCodeBlock
              language="typescript"
              hasCopyButton
              code={`import * as stylex from '@stylexjs/stylex';
import { radiusVars } from '@xds/core/theme';

const styles = stylex.create({
  card: {
    borderRadius: radiusVars.container,
  },
  button: {
    borderRadius: radiusVars.element,
  },
  avatar: {
    borderRadius: radiusVars.full,
  },
  modal: {
    borderRadius: radiusVars.page,
  },
});`}
            />
          </XDSCard>
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// IconsFoundationPage
// ---------------------------------------------------------------------------

const ICON_SLOTS: {name: string; purpose: string}[] = [
  {name: 'close', purpose: 'Dismiss dialogs, remove items'},
  {name: 'chevronDown', purpose: 'Expand menus, dropdowns'},
  {name: 'chevronLeft', purpose: 'Navigate back'},
  {name: 'chevronRight', purpose: 'Navigate forward'},
  {name: 'check', purpose: 'Confirm, success indicator'},
  {name: 'success', purpose: 'Success state'},
  {name: 'error', purpose: 'Error state'},
  {name: 'warning', purpose: 'Warning state'},
  {name: 'info', purpose: 'Information callouts'},
  {name: 'calendar', purpose: 'Date pickers'},
  {name: 'clock', purpose: 'Time, scheduling'},
  {name: 'externalLink', purpose: 'External navigation'},
  {name: 'menu', purpose: 'Mobile nav toggle'},
  {name: 'moreHorizontal', purpose: 'Overflow actions'},
  {name: 'search', purpose: 'Search triggers'},
  {name: 'arrowUp', purpose: 'Sort ascending'},
  {name: 'arrowDown', purpose: 'Sort descending'},
  {name: 'arrowsUpDown', purpose: 'Bidirectional sort'},
  {name: 'funnel', purpose: 'Filter controls'},
  {name: 'eyeSlash', purpose: 'Hide/reveal toggle'},
  {name: 'viewColumns', purpose: 'Column visibility'},
  {name: 'copy', purpose: 'Copy to clipboard'},
  {name: 'checkDouble', purpose: 'Delivered/read status'},
  {name: 'wrench', purpose: 'Tool calls, settings'},
  {name: 'stop', purpose: 'Stop streaming'},
  {name: 'microphone', purpose: 'Voice input'},
];

const ICON_SIZES: {size: string; pixels: string}[] = [
  {size: 'xsm', pixels: '12px'},
  {size: 'sm', pixels: '16px'},
  {size: 'md', pixels: '20px'},
  {size: 'lg', pixels: '24px'},
];

const ICON_COLORS: {color: string}[] = [
  {color: 'primary'},
  {color: 'secondary'},
  {color: 'disabled'},
  {color: 'accent'},
  {color: 'negative'},
  {color: 'warning'},
  {color: 'success'},
  {color: 'inherit'},
];

function IconsFoundationPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={3}>
          <XDSText type="display-1">Icons</XDSText>
          <XDSText type="large" weight="normal" color="secondary">
            XDS uses semantic icon slots so components always get the right icon
            regardless of which icon library your theme provides. Instead of
            importing SVGs directly, you reference a slot name and the active
            theme resolves it at render time.
          </XDSText>
        </XDSStack>

        {/* Semantic icon slots */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Semantic icon slots</XDSHeading>
          <XDSText type="body" color="secondary">
            Every XDS theme must provide an SVG for each slot. Components like{' '}
            <XDSText type="code">XDSIcon</XDSText>,{' '}
            <XDSText type="code">XDSIconButton</XDSText>, and status indicators
            resolve icons through these names.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={ICON_SLOTS as Record<string, unknown>[]}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  width: pixel(200),
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="code">{row.name as string}</XDSText>
                  ),
                },
                {key: 'purpose', header: 'Purpose'},
              ]}
            />
          </XDSCard>
        </XDSStack>

        {/* Sizes */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Sizes</XDSHeading>
          <XDSText type="body" color="secondary">
            Pass a <XDSText type="code">size</XDSText> prop to control the
            rendered dimensions. All sizes align to the 4px grid.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={ICON_SIZES as Record<string, unknown>[]}
              columns={[
                {
                  key: 'size',
                  header: 'Size',
                  width: pixel(120),
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="code">{row.size as string}</XDSText>
                  ),
                },
                {key: 'pixels', header: 'Pixels', width: pixel(120)},
              ]}
            />
          </XDSCard>
        </XDSStack>

        {/* Colors */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Colors</XDSHeading>
          <XDSText type="body" color="secondary">
            The <XDSText type="code">color</XDSText> prop maps to semantic
            tokens from the active theme. Use{' '}
            <XDSText type="code">inherit</XDSText> to pick up the parent's text
            color.
          </XDSText>
          <XDSCard padding={0}>
            <XDSTable
              data={ICON_COLORS as Record<string, unknown>[]}
              columns={[
                {
                  key: 'color',
                  header: 'Color',
                  width: pixel(200),
                  renderCell: (row: Record<string, unknown>) => (
                    <XDSText type="code">{row.color as string}</XDSText>
                  ),
                },
              ]}
            />
          </XDSCard>
        </XDSStack>

        {/* Theme icon sets */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Theme icon sets</XDSHeading>
          <XDSText type="body" color="secondary">
            Each XDS theme ships its own icon set that fulfills every semantic
            slot. Switching themes automatically swaps the underlying SVGs.
          </XDSText>
          <XDSList>
            <XDSListItem
              label={
                <>
                  <XDSText type="body">
                    <XDSText type="code" weight="bold">
                      Heroicons
                    </XDSText>{' '}
                    — the default icon set, used by the Default and Meta themes.
                    Outlined style with rounded caps.
                  </XDSText>
                </>
              }
            />
            <XDSListItem
              label={
                <>
                  <XDSText type="body">
                    <XDSText type="code" weight="bold">
                      Lucide
                    </XDSText>{' '}
                    — used by the Neutral theme. Slightly thinner stroke with a
                    geometric feel.
                  </XDSText>
                </>
              }
            />
            <XDSListItem
              label={
                <>
                  <XDSText type="body">
                    <XDSText type="code" weight="bold">
                      registerIcons()
                    </XDSText>{' '}
                    — supply your own SVG components for any or all slots when
                    defining a custom theme.
                  </XDSText>
                </>
              }
            />
          </XDSList>
        </XDSStack>

        {/* Code */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Code</XDSHeading>
          <XDSCodeBlock
            code={`import { XDSIcon } from '@xds/core/Icon';

// Basic usage — reference a semantic slot by name
<XDSIcon icon="check" size="md" color="success" />
<XDSIcon icon="close" size="sm" color="secondary" />
<XDSIcon icon="warning" size="lg" color="warning" />`}
            language="tsx"
          />
          <XDSCodeBlock
            code={`import { registerIcons } from '@xds/core/Icon';
import { defineTheme } from '@xds/core/theme';

// Custom theme with your own icon set
const myIcons = registerIcons({
  close: MyCloseIcon,
  check: MyCheckIcon,
  chevronDown: MyChevronDownIcon,
  // ... provide all 26 slots
});

const myTheme = defineTheme({
  name: 'my-brand',
  icons: myIcons,
  tokens: { /* ... */ },
});`}
            language="tsx"
          />
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

// ---------------------------------------------------------------------------
// LibraryPackagePage components
// ---------------------------------------------------------------------------

const VEGA_COMPONENTS: {
  label: string;
  items: {key: string; name: string; desc: string}[];
}[] = [
  {
    label: 'Charts',
    items: [
      {
        key: 'bar-chart',
        name: 'BarChart',
        desc: 'Vertical and horizontal bar charts for categorical data comparison.',
      },
      {
        key: 'line-chart',
        name: 'LineChart',
        desc: 'Line charts for trends over time with multiple series support.',
      },
      {
        key: 'area-chart',
        name: 'AreaChart',
        desc: 'Filled area charts for volume and cumulative data visualization.',
      },
      {
        key: 'pie-chart',
        name: 'PieChart',
        desc: 'Pie and donut charts for part-to-whole relationships.',
      },
    ],
  },
  {
    label: 'Utilities',
    items: [
      {
        key: 'chart-legend',
        name: 'ChartLegend',
        desc: 'Legend component for labeling chart series and categories.',
      },
      {
        key: 'chart-tooltip',
        name: 'ChartTooltip',
        desc: 'Tooltip overlay for displaying data point details on hover.',
      },
      {
        key: 'chart-axis',
        name: 'ChartAxis',
        desc: 'Configurable axis component for labels, ticks, and gridlines.',
      },
    ],
  },
];

const CHAT_COMPONENTS: {
  label: string;
  items: {key: string; name: string; desc: string}[];
}[] = [
  {
    label: 'Messaging',
    items: [
      {
        key: 'chat',
        name: 'Chat',
        desc: 'Conversational message interface with bubbles, input, and thread support.',
      },
      {
        key: 'chat-composer',
        name: 'ChatComposer',
        desc: 'Rich text composer with attachments, mentions, and slash commands.',
      },
      {
        key: 'chat-composer-input',
        name: 'ChatComposerInput',
        desc: 'Controlled input for the chat composer with mention triggers.',
      },
      {
        key: 'chat-layout',
        name: 'ChatLayout',
        desc: 'Full chat page layout with message list, composer, and empty state.',
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        key: 'chat-tokenized-text',
        name: 'ChatTokenizedText',
        desc: 'Renders text with inline tokens like @mentions and #tags.',
      },
      {
        key: 'chat-tool-calls',
        name: 'ChatToolCalls',
        desc: 'Displays AI tool call results with status and expandable details.',
      },
      {
        key: 'chat-dictation',
        name: 'ChatDictation',
        desc: 'Voice dictation input with recording states and waveform.',
      },
    ],
  },
];

function PackageGridPage({
  packageKey,
  components,
  onSelectComponent,
}: {
  packageKey: string;
  components: {
    label: string;
    items: {key: string; name: string; desc: string}[];
  }[];
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
            <XDSStack
              direction="vertical"
              gap={2}
              hAlign="center"
              style={{textAlign: 'center'}}>
              <XDSText type="display-2">{pkg.name}</XDSText>
              <XDSText type="body" color="secondary">
                {totalComponents} components
              </XDSText>
              {pkg.status === 'Coming Soon' ? (
                <XDSBadge label="Coming Soon" variant="blue" />
              ) : (
                <XDSText
                  type="supporting"
                  color="secondary"
                  style={{maxWidth: 300}}>
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
          <XDSStack
            direction="horizontal"
            gap={3}
            vAlign="center"
            style={{marginBottom: 8}}>
            <XDSText type="display-1">{pkg.name}</XDSText>
            {pkg.version && (
              <XDSText
                type="supporting"
                color="secondary"
                style={{fontFamily: 'monospace'}}>
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
              <XDSButton
                label="Install"
                variant="primary"
                size="sm"
                icon={<DownloadIcon />}
              />
            </XDSPopover>
          </XDSStack>
        </div>
        <div style={{padding: '24px 32px'}}>
          {components.map(cat => (
            <div key={cat.label} style={{marginBottom: 28}}>
              <XDSText
                type="label"
                color="secondary"
                style={{display: 'block', marginBottom: 10}}>
                {cat.label}
              </XDSText>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 10,
                }}>
                {cat.items.map(item => (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredComponent(item.key)}
                    onMouseLeave={() => setHoveredComponent(null)}
                    onClick={() => onSelectComponent(item.key)}
                    style={{cursor: 'pointer'}}>
                    <XDSCard padding={3}>
                      <XDSText
                        type="body"
                        weight="bold"
                        style={{display: 'block', marginBottom: 2}}>
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

// ---------------------------------------------------------------------------
// Theme package detail data
// ---------------------------------------------------------------------------

type ThemeCharacteristic = {
  label: string;
  value: string;
  detail?: string;
};

type ThemeTokenOverride = {
  token: string;
  default: string;
  override: string;
};

type ThemeDetail = {
  name: string;
  npmName: string;
  version: string;
  description: string;
  characteristics: ThemeCharacteristic[];
  setupCode: string;
  tokenOverrides: ThemeTokenOverride[];
};

const THEME_DETAILS: Record<string, ThemeDetail> = {
  'pkg-theme-default': {
    name: 'Default',
    npmName: '@xds/theme-default',
    version: '0.0.12',
    description:
      'The reference theme for XDS. Clean and professional with a blue accent, system fonts, and Heroicons. Designed to work out of the box with zero configuration.',
    characteristics: [
      {
        label: 'Typography',
        value: 'System fonts',
        detail: 'Scale base 14px, ratio 1.2',
      },
      {label: 'Icons', value: 'Heroicons', detail: 'Outline + solid variants'},
      {
        label: 'Accent',
        value: 'Blue (#0066FF)',
        detail: 'Semantic color palette',
      },
      {
        label: 'Radius',
        value: 'Standard',
        detail: 'element 8px, container 12px',
      },
      {
        label: 'Motion',
        value: 'Balanced',
        detail: 'fast 175ms, medium 410ms, slow 975ms',
      },
      {label: 'Syntax', value: 'GitHub theme', detail: 'Light + dark variants'},
    ],
    setupCode: `// app/globals.css
@import "@xds/core/reset.css";
@import "@xds/theme-default/theme.css";

// app/providers.tsx
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <XDSTheme theme={defaultTheme}>
      {children}
    </XDSTheme>
  );
}`,
    tokenOverrides: [
      {token: '--radius-element', default: '—', override: '0.5rem (8px)'},
      {token: '--radius-container', default: '—', override: '0.625rem (10px)'},
      {token: '--radius-page', default: '—', override: '0.75rem (12px)'},
      {
        token: '--font-family-body',
        default: '—',
        override: 'system-ui, sans-serif',
      },
      {
        token: '--font-family-heading',
        default: '—',
        override: 'system-ui, sans-serif',
      },
      {token: '--font-family-code', default: '—', override: 'monospace'},
      {token: '--color-accent', default: '—', override: '#0064E0 / #2694FE'},
      {token: '--duration-fast', default: '—', override: '175ms'},
      {token: '--duration-medium', default: '—', override: '410ms'},
      {token: '--duration-slow', default: '—', override: '975ms'},
    ],
  },
  'pkg-theme-neutral': {
    name: 'Neutral',
    npmName: '@xds/theme-neutral',
    version: '0.0.12',
    description:
      'A muted, minimal theme with warm gray tones and desaturated colors. Uses Geist font for body and headings, Geist Mono for code, and Lucide icons. Ideal for productivity tools and developer-facing interfaces.',
    characteristics: [
      {
        label: 'Typography',
        value: 'Geist / Geist Mono',
        detail: 'Scale base 14px, ratio 1.2, h3/h4 bold',
      },
      {label: 'Icons', value: 'Lucide', detail: 'Outline style'},
      {label: 'Accent', value: 'Desaturated', detail: 'Full oklch color space'},
      {
        label: 'Radius',
        value: 'Larger',
        detail: 'element 10px, container 12px',
      },
      {
        label: 'Motion',
        value: 'Snappy',
        detail: 'fast 125ms, medium 300ms, slow 700ms',
      },
      {
        label: 'Syntax',
        value: 'Desaturated',
        detail: 'Matches grayscale palette',
      },
    ],
    setupCode: `// app/globals.css
@import "@xds/core/reset.css";
@import "@xds/theme-neutral/theme.css";

// app/providers.tsx
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <XDSTheme theme={neutralTheme}>
      {children}
    </XDSTheme>
  );
}`,
    tokenOverrides: [
      {token: '--radius-element', default: '0.5rem', override: '0.625rem'},
      {token: '--radius-container', default: '0.625rem', override: '0.75rem'},
      {token: '--radius-page', default: '0.75rem', override: '1rem'},
      {
        token: '--font-family-body',
        default: 'system-ui',
        override: 'Geist, sans-serif',
      },
      {
        token: '--font-family-heading',
        default: 'system-ui',
        override: 'Geist, sans-serif',
      },
      {
        token: '--font-family-code',
        default: 'monospace',
        override: 'Geist Mono, monospace',
      },
      {token: '--duration-fast', default: '175ms', override: '125ms'},
      {token: '--duration-medium', default: '410ms', override: '300ms'},
      {token: '--duration-slow', default: '975ms', override: '700ms'},
    ],
  },
};

const THEME_OBJECTS: Record<string, XDSDefinedTheme> = {
  'pkg-theme-default': defaultTheme,
  'pkg-theme-neutral': neutralTheme,
};

const PALETTE_SWATCHES = [
  {label: 'Accent', var: '--color-accent'},
  {label: 'Success', var: '--color-success'},
  {label: 'Warning', var: '--color-warning'},
  {label: 'Error', var: '--color-error'},
  {label: 'Surface', var: '--color-background-surface'},
  {label: 'Body', var: '--color-background-body'},
  {label: 'Neutral', var: '--color-neutral'},
];

function ThemePreview() {
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSGrid columns={7} gap={2}>
        {PALETTE_SWATCHES.map(swatch => (
          <XDSStack
            key={swatch.label}
            direction="vertical"
            gap={1}
            vAlign="center">
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--radius-element, 8px)',
                backgroundColor: `var(${swatch.var})`,
                border: '1px solid var(--color-border, rgba(0,0,0,0.1))',
              }}
            />
            <XDSText type="supporting" color="secondary">
              {swatch.label}
            </XDSText>
          </XDSStack>
        ))}
      </XDSGrid>

      <XDSDivider />

      <XDSGrid columns={2} gap={4}>
        <XDSStack direction="horizontal" gap={2}>
          <XDSButton label="Primary" variant="primary" />
          <XDSButton label="Secondary" variant="secondary" />
          <XDSButton
            label="Ghost"
            variant="ghost"
            icon={<XDSIcon icon={HeartIcon} size="sm" />}
          />
        </XDSStack>

        <XDSStack direction="horizontal" gap={2}>
          <XDSBadge label="Default" />
          <XDSBadge label="Info" variant="info" />
          <XDSBadge label="Success" variant="success" />
          <XDSBadge label="Warning" variant="warning" />
        </XDSStack>

        <XDSTextInput
          label="Example"
          placeholder="Type something..."
          value=""
          onChange={() => {}}
        />

        <XDSStack direction="horizontal" gap={4} vAlign="center">
          <XDSSwitch label="Toggle" value={true} onChange={() => {}} />
          <XDSProgressBar value={65} label="Progress" />
        </XDSStack>
      </XDSGrid>

      <XDSGrid columns={2} gap={4}>
        <XDSCard padding={4}>
          <XDSStack direction="vertical" gap={2}>
            <XDSHeading level={4}>Card Title</XDSHeading>
            <XDSText type="body" color="secondary">
              A flexible surface for grouping related content and actions.
            </XDSText>
            <XDSButton label="Action" variant="secondary" size="sm" />
          </XDSStack>
        </XDSCard>

        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSAvatar name="Alice" size="small" />
          <XDSAvatar name="Bob" size="medium" />
          <XDSAvatar name="Charlie" size="large" />
        </XDSStack>
      </XDSGrid>

      <XDSTable
        data={
          [
            {name: 'Alice', role: 'Engineer', status: 'Active'},
            {name: 'Bob', role: 'Designer', status: 'Away'},
            {name: 'Charlie', role: 'PM', status: 'Active'},
          ] as {[key: string]: unknown}[]
        }
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'role', header: 'Role'},
          {key: 'status', header: 'Status'},
        ]}
      />
    </XDSStack>
  );
}

// ---------------------------------------------------------------------------
// ThemePackagePage component
// ---------------------------------------------------------------------------

function ThemePackagePage({
  packageKey,
  onCraft,
}: {
  packageKey: string;
  onCraft?: () => void;
}) {
  const theme = THEME_DETAILS[packageKey];
  if (!theme) return null;
  const isDefault = packageKey === 'pkg-theme-default';
  const themeObject = THEME_OBJECTS[packageKey];

  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={3}>
          <XDSStack direction="horizontal" gap={3} vAlign="center">
            <XDSText type="display-1">{theme.npmName}</XDSText>
            <XDSText type="code" color="secondary" size="xsm">
              v{theme.version}
            </XDSText>
          </XDSStack>
          <XDSText type="body" color="secondary">
            {theme.description}
          </XDSText>
          {onCraft && (
            <XDSStack direction="horizontal" gap={2}>
              <XDSButton
                label="Try in Craft"
                variant="secondary"
                icon={<XDSIcon icon={PaletteIcon} size="sm" />}
                onClick={onCraft}
              />
            </XDSStack>
          )}
        </XDSStack>

        {/* Live preview */}
        {themeObject && (
          <XDSStack direction="vertical" gap={3}>
            <XDSHeading level={2}>Preview</XDSHeading>
            <XDSTheme theme={themeObject}>
              <XDSCard variant="muted" padding={6}>
                <ThemePreview />
              </XDSCard>
            </XDSTheme>
          </XDSStack>
        )}

        {/* Characteristics grid */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Characteristics</XDSHeading>
          <XDSGrid columns={3} gap={3}>
            {theme.characteristics.map(char => (
              <XDSCard key={char.label} padding={4}>
                <XDSStack direction="vertical" gap={1}>
                  <XDSText
                    type="code"
                    color="secondary"
                    size="xsm"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                    {char.label}
                  </XDSText>
                  <XDSText type="body" weight="bold">
                    {char.value}
                  </XDSText>
                  {char.detail && (
                    <XDSText type="supporting" color="secondary">
                      {char.detail}
                    </XDSText>
                  )}
                </XDSStack>
              </XDSCard>
            ))}
          </XDSGrid>
        </XDSStack>

        {/* Install */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Install</XDSHeading>
          <XDSCard padding={0}>
            <XDSCodeBlock
              code={`npm install ${theme.npmName}`}
              title="Terminal"
              language="bash"
              hasCopyButton
            />
          </XDSCard>
        </XDSStack>

        {/* Setup */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Setup</XDSHeading>
          <XDSText type="body" color="secondary">
            Import the theme CSS and wrap your app in XDSTheme. All components
            will inherit the theme&#39;s tokens for colors, typography, spacing,
            and radius.
          </XDSText>
          <XDSCard padding={0}>
            <XDSCodeBlock
              code={theme.setupCode}
              title={`Using ${theme.npmName}`}
              language="tsx"
              hasCopyButton
            />
          </XDSCard>
        </XDSStack>

        {/* Token values / overrides */}
        {theme.tokenOverrides.length > 0 && (
          <XDSStack direction="vertical" gap={3}>
            <XDSHeading level={2}>
              {isDefault ? 'Token values' : 'Token overrides'}
            </XDSHeading>
            <XDSText type="body" color="secondary">
              {isDefault
                ? 'Reference values for the default theme. Other themes override these.'
                : 'These tokens differ from the default theme. All other tokens use built-in defaults.'}
            </XDSText>
            <XDSCard padding={0}>
              <XDSTable
                data={theme.tokenOverrides as {[key: string]: unknown}[]}
                columns={
                  isDefault
                    ? [
                        {key: 'token', header: 'Token'},
                        {key: 'override', header: 'Value'},
                      ]
                    : [
                        {key: 'token', header: 'Token'},
                        {key: 'default', header: 'Default'},
                        {key: 'override', header: theme.name},
                      ]
                }
              />
            </XDSCard>
          </XDSStack>
        )}

        {/* What's included */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>What&#39;s included</XDSHeading>
          <XDSList density="balanced" listStyle="disc">
            <XDSListItem label="Full color palette with light and dark mode support" />
            <XDSListItem label="Typography scale with heading, body, label, code, and supporting sizes" />
            <XDSListItem label="Radius, spacing, shadow, and motion tokens" />
            <XDSListItem label="Icon registry with 26 semantic icon slots" />
            <XDSListItem label="Syntax highlighting theme for CodeBlock" />
            <XDSListItem label="Component-level style overrides (e.g. Button secondary)" />
          </XDSList>
        </XDSStack>

        {/* Switching themes */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Switching themes</XDSHeading>
          <XDSText type="body" color="secondary">
            Swap themes by changing the CSS import and theme object. No
            component code changes required.
          </XDSText>
          <XDSCard padding={0}>
            <XDSCodeBlock
              code={`# Available themes:\nnpm install @xds/theme-default   # Clean blue, Heroicons\nnpm install @xds/theme-neutral   # Muted gray, Lucide`}
              title="Terminal"
              language="bash"
              hasCopyButton
            />
          </XDSCard>
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

function LibraryPackagePage({
  packageKey,
  onSelectComponent,
  onCraft,
}: {
  packageKey: string;
  onSelectComponent: (key: string) => void;
  onCraft?: () => void;
}) {
  if (packageKey === 'pkg-core') {
    return (
      <PackageGridPage
        packageKey={packageKey}
        components={COMPONENT_CATEGORIES}
        onSelectComponent={onSelectComponent}
      />
    );
  }
  if (packageKey === 'pkg-vega') {
    return (
      <PackageGridPage
        packageKey={packageKey}
        components={VEGA_COMPONENTS}
        onSelectComponent={onSelectComponent}
      />
    );
  }
  if (packageKey === 'pkg-cli') {
    return <CliPage />;
  }
  if (THEME_DETAILS[packageKey]) {
    return <ThemePackagePage packageKey={packageKey} onCraft={onCraft} />;
  }
  return null;
}

function CliCommandView({cmd}: {cmd: CliCommand}) {
  const allOptions = [
    ...cmd.arguments.map(a => ({
      flags: a.required
        ? `<${a.name}${a.variadic ? '...' : ''}>`
        : `[${a.name}]`,
      description: a.description || 'Positional argument',
    })),
    ...cmd.options.map(o => ({flags: o.flags, description: o.description})),
    ...cmd.subcommands.flatMap(sub => [
      {flags: sub.name, description: `Subcommand: ${sub.description}`},
      ...sub.options.map(o => ({
        flags: `${sub.name} ${o.flags}`,
        description: o.description,
      })),
    ]),
  ];

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSHeading level={2}>xds {cmd.name}</XDSHeading>
      <XDSText type="body" color="secondary">
        {cmd.description}
      </XDSText>
      {allOptions.length > 0 && (
        <XDSCard padding={0} style={{overflow: 'auto'}}>
          <XDSTable
            data={allOptions as {[key: string]: unknown}[]}
            columns={[
              {key: 'flags', header: 'Flag / Argument'},
              {key: 'description', header: 'Description'},
            ]}
          />
        </XDSCard>
      )}
    </XDSStack>
  );
}

function CliPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={10}>
        {/* Header */}
        <XDSStack direction="vertical" gap={2}>
          <XDSStack direction="horizontal" gap={3} vAlign="center">
            <XDSText type="display-1">@xds/cli</XDSText>
            <XDSBadge label={`v${CLI_VERSION}`} variant="neutral" />
          </XDSStack>
          <XDSText type="body" color="secondary">
            Command-line interface for project setup, component docs, page
            templates, theming, component ejection, upgrade codemods, and AI
            agent context generation.
          </XDSText>
        </XDSStack>

        {/* Install */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Install</XDSHeading>
          <XDSCard padding={0}>
            <XDSCodeBlock
              code={`# Run without installing\nnpx xds <command>\n\n# Or install globally\nnpm install -g @xds/cli`}
              title="Terminal"
              language="bash"
              hasCopyButton
            />
          </XDSCard>
        </XDSStack>

        {/* Global options */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Global options</XDSHeading>
          <XDSText type="body" color="secondary">
            These flags work with any command.
          </XDSText>
          <XDSCard padding={0} style={{overflow: 'auto'}}>
            <XDSTable
              data={
                [
                  {flags: '--version, -V', description: 'Print CLI version'},
                  ...cliGlobalOptions.map(o => ({
                    flags: o.flags,
                    description: o.description,
                  })),
                  {flags: '--help', description: 'Show help for any command'},
                ] as {[key: string]: unknown}[]
              }
              columns={[
                {key: 'flags', header: 'Flag'},
                {key: 'description', header: 'Description'},
              ]}
            />
          </XDSCard>
        </XDSStack>

        {/* Commands */}
        {cliCommands.map(cmd => (
          <CliCommandView key={cmd.name} cmd={cmd} />
        ))}

        {/* Configuration */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Configuration</XDSHeading>
          <XDSText type="body" color="secondary">
            Create an xds.config.mjs in your project root to configure package
            discovery paths, gap report delivery, and theme settings.
          </XDSText>
          <XDSCard padding={0}>
            <XDSCodeBlock
              code={`// xds.config.mjs\nexport default {\n  packageDirs: ['./packages'],\n  gapReport: { target: 'github' },\n};`}
              language="javascript"
              hasCopyButton
            />
          </XDSCard>
        </XDSStack>

        {/* Programmatic API */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Programmatic API</XDSHeading>
          <XDSText type="body" color="secondary">
            Use the CLI programmatically via @xds/cli/api for build scripts, CI
            pipelines, and custom tooling.
          </XDSText>
          <XDSCard padding={0}>
            <XDSCodeBlock
              code={`import { component, docs, discover, template } from '@xds/cli/api';\n\nconst buttonDocs = await component('Button', { dense: true });\nconst tokenDocs = await docs('tokens', { json: true });\nconst templates = await template({ list: true });\nconst packages = await discover();`}
              language="typescript"
              hasCopyButton
            />
          </XDSCard>
        </XDSStack>

        {/* Best practices */}
        <XDSStack direction="vertical" gap={3}>
          <XDSHeading level={2}>Best practices</XDSHeading>
          <XDSList density="balanced" listStyle="disc">
            <XDSListItem label="Run xds init when setting up a new project to generate AI agent docs and a starter theme" />
            <XDSListItem label="Use xds component <Name> --dense before modifying or building with any component" />
            <XDSListItem label="After upgrading @xds/core, run xds upgrade --apply --to <version> to auto-migrate breaking changes" />
            <XDSListItem label="When swizzling, use --gap to report why you needed to eject" />
            <XDSListItem label="Use xds gap-report to request missing components or features" />
            <XDSListItem label="Use xds theme build to compile custom themes for production" />
          </XDSList>
        </XDSStack>
      </XDSStack>
    </XDSSection>
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
        <XDSText type="body" color="secondary">
          {description}
        </XDSText>
      </XDSStack>
    </div>
  );
}

function NpmPackagesPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <ResourceHeader
        icon={DownloadIcon}
        title="NPM Packages"
        description="All packages are published under the @xds scope on npm."
        bg="#FEE2E2"
      />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Install
        </XDSHeading>
        <XDSCard padding={0}>
          <XDSCodeBlock
            code={`# Core components\nnpm install @xds/core\n\n# Charts & data visualization\nnpm install @xds/vega\n\n# CLI tooling\nnpm install -g @xds/cli`}
            title="Terminal"
            language="bash"
            hasCopyButton
          />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Packages
        </XDSHeading>
        <XDSCard padding={0} style={{overflow: 'auto'}}>
          <XDSTable
            data={
              [
                {
                  package: '@xds/core',
                  description: 'Core UI components (60+)',
                  version: '0.0.12',
                  status: 'Stable',
                },
                {
                  package: '@xds/vega',
                  description: 'Charts & data visualization',
                  version: '—',
                  status: 'Coming Soon',
                },
                {
                  package: '@xds/cli',
                  description: 'CLI for scaffolding & tooling',
                  version: '0.0.12',
                  status: 'Stable',
                },
                {
                  package: '@xds/theme-default',
                  description: 'Default theme (blue accent)',
                  version: '0.0.12',
                  status: 'Stable',
                },
                {
                  package: '@xds/theme-neutral',
                  description: 'Neutral warm gray theme',
                  version: '0.0.12',
                  status: 'Stable',
                },
              ] as {[key: string]: unknown}[]
            }
            columns={[
              {key: 'package', header: 'Package'},
              {key: 'description', header: 'Description'},
              {key: 'version', header: 'Version'},
              {key: 'status', header: 'Status'},
            ]}
          />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Peer dependencies
        </XDSHeading>
        <XDSText type="body" color="secondary">
          All packages require React 19+ and StyleX 0.10+. Theme packages are
          optional — if no theme is installed, components use built-in defaults.
        </XDSText>
      </div>
    </XDSSection>
  );
}

function AgentDocsPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <ResourceHeader
        icon={SparklesIcon}
        title="AI / Agent Docs"
        description="Generate context docs so your AI knows every component, prop, and pattern."
        bg="#FEF3C7"
      />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Generate agent docs
        </XDSHeading>
        <XDSText type="body" color="secondary" style={{marginBottom: 16}}>
          The CLI produces a comprehensive AGENTS.md that AI assistants can use
          as context when generating XDS code.
        </XDSText>
        <XDSCard padding={0}>
          <XDSCodeBlock
            code={`# Generate docs for all components\nxds docs\n\n# List available doc topics\nxds docs --list\n\n# Get specific docs (dense format for AI)\nxds docs principles --dense\nxds docs tokens --dense\nxds docs theme --dense\n\n# Get docs for a specific component\nxds component Button --dense\nxds component Table --dense`}
            title="Terminal"
            language="bash"
            hasCopyButton
          />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          What&#39;s included
        </XDSHeading>
        <XDSList density="spacious" listStyle="disc">
          <XDSListItem label="Component props, variants, and usage examples for every component" />
          <XDSListItem label="Design token reference — spacing, colors, typography, radius, elevation" />
          <XDSListItem label="Theme provider setup and customization patterns" />
          <XDSListItem label="Anti-patterns and common mistakes to avoid" />
          <XDSListItem label="StyleX conventions and CSS capabilities" />
        </XDSList>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Using with Cursor / AI assistants
        </XDSHeading>
        <XDSText type="body" color="secondary" style={{marginBottom: 16}}>
          Add the generated AGENTS.md to your project root. AI assistants like
          Cursor, Copilot, and Claude will automatically use it as context when
          you ask them to build UI with XDS components.
        </XDSText>
        <XDSCard padding={0}>
          <XDSCodeBlock
            code={`# Generate and save to project root\nxds docs > AGENTS.md\n\n# Or use the CLI bootstrap commands\nxds help           # discover all commands\nxds component --list  # all components by category\nxds template --list   # available page templates`}
            title="Terminal"
            language="bash"
            hasCopyButton
          />
        </XDSCard>
      </div>
    </XDSSection>
  );
}

function PublishingPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <ResourceHeader
        icon={HeartIcon}
        title="Publishing"
        description="Publish components, themes, and templates to Craft for others to discover and use."
        bg="#FCE7F3"
      />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          What you can publish
        </XDSHeading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}>
          {[
            {
              icon: CodeIcon,
              title: 'Components',
              desc: 'Build and publish custom components to the Craft library for others to use.',
            },
            {
              icon: PaletteIcon,
              title: 'Themes',
              desc: 'Create and share theme packages with custom colors, typography, and radius.',
            },
            {
              icon: GridIcon,
              title: 'Templates',
              desc: 'Publish page templates and layouts that others can browse and use in Craft.',
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
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Getting started
        </XDSHeading>
        <XDSCard padding={0}>
          <XDSCodeBlock
            code={`# Clone the repo\ngit clone https://github.com/facebookexperimental/xds.git\ncd xds\n\n# Install dependencies\nyarn install\n\n# Start the sandbox\nyarn workspace @xds/sandbox dev\n\n# Run tests\nyarn test\n\n# Run storybook\nyarn storybook`}
            title="Terminal"
            language="bash"
            hasCopyButton
          />
        </XDSCard>
      </div>
      <div style={{marginTop: 40}}>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Publishing guidelines
        </XDSHeading>
        <XDSList density="spacious" listStyle="disc">
          <XDSListItem label="Use only XDS components — no raw HTML or inline styles" />
          <XDSListItem label="Include a .doc.mjs file with a description, tags, and preview metadata" />
          <XDSListItem label="Templates should use XDSAppShell for page layout" />
          <XDSListItem label="Themes must define all required tokens (colors, typography, radius, elevation)" />
          <XDSListItem label="Add block examples that demonstrate your component in realistic contexts" />
        </XDSList>
      </div>
    </XDSSection>
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

const INSTALL_CODE = `# Install XDS and a theme
npm install @xds/core @xds/theme-default`;

const PROVIDER_CODE = `// app/globals.css
@import "@xds/core/reset.css";
@import "@xds/theme-default/theme.css";

// app/providers.tsx
import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <XDSTheme theme={defaultTheme}>
      <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
    </XDSTheme>
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

const THEME_CODE = `# Install a different theme
npm install @xds/theme-neutral

# Available themes:
# @xds/theme-default  — Clean, professional (Heroicons)
# @xds/theme-neutral  — Muted, minimal (Lucide)
`;

const CLI_CODE = `# Install the CLI as a dev dependency
npm install -D @xds/cli

# Initialize XDS in your project
npx xds init

# Look up component docs
npx xds component Button

# Generate a page template
npx xds template dashboard

# Eject a component for customization
npx xds swizzle Button

# Load agent docs for AI assistants
npx xds docs`;

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
    title: 'Install XDS',
    description:
      'Add @xds/core and a theme to your project. XDS works with Next.js, Vite, or any React framework.',
    code: INSTALL_CODE,
    codeLabel: 'Terminal',
    language: 'bash',
  },
  {
    step: '02',
    title: 'Set up styles and theme',
    description:
      'Import the CSS reset, component styles, and theme, then wrap your app in XDSTheme with a link provider. This provides design tokens — colors, typography, spacing, and radius — that all components inherit.',
    code: PROVIDER_CODE,
    codeLabel: 'app/globals.css + app/providers.tsx',
    language: 'tsx',
  },
  {
    step: '03',
    title: 'Use a component',
    description:
      'Import any component from its subpath. Only the components you use are included in your bundle.',
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
      'The XDS CLI generates page templates, ejects components for customization, and produces structured docs that AI coding assistants can use as context.',
    code: CLI_CODE,
    codeLabel: 'Terminal',
    language: 'bash',
  },
];

function GettingStartedPage() {
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
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
              type="code"
              color="secondary"
              weight="semibold"
              size="xsm"
              style={{letterSpacing: '0.06em'}}>
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
    </XDSSection>
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
  const [packageFilter, setPackageFilter] = useState<PackageCategory | 'all'>(
    'all',
  );
  const filteredPackages =
    packageFilter === 'all'
      ? LIBRARY_PACKAGES
      : LIBRARY_PACKAGES.filter(pkg => pkg.category === packageFilter);
  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
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
          <XDSText
            type="body"
            color="secondary"
            style={{marginTop: 12, maxWidth: 480}}>
            An open-source design system
            <br />
            for building Nest products and external apps.
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
        <XDSGrid columns={3} gap={4} style={{rowGap: 32}}>
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
              <XDSText
                type="body"
                weight="bold"
                style={{display: 'block', marginBottom: 4}}>
                {item.title}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {item.description}
              </XDSText>
            </div>
          ))}
        </XDSGrid>
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

        <XDSTabList
          value={packageFilter}
          onChange={v => setPackageFilter(v as PackageCategory | 'all')}
          size="sm"
          style={{marginBottom: 24}}>
          {PACKAGE_FILTERS.map(filter => (
            <XDSTab
              key={filter.value}
              value={filter.value}
              label={filter.label}
            />
          ))}
        </XDSTabList>
        <XDSGrid columns={4} gap={4}>
          {filteredPackages.map(pkg => {
            const ICON_MAP: Record<
              string,
              React.ComponentType<React.SVGProps<SVGSVGElement>>
            > = {
              core: CodeIcon,
              charts: ChartsIcon,
              chat: ChatIcon,
              cli: TerminalIcon,
            };
            const IconComp = ICON_MAP[pkg.iconType];
            const isDesign = pkg.category === 'designing';
            return (
              <div
                key={pkg.key}
                onClick={
                  pkg.href
                    ? () => window.open(pkg.href, '_blank')
                    : () => onSelectComponent(pkg.key)
                }
                style={{cursor: 'pointer'}}>
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    backgroundImage: `url(${pkg.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: 12,
                  }}>
                  {IconComp && (
                    <XDSIcon
                      icon={IconComp}
                      size="lg"
                      style={{
                        width: 48,
                        height: 48,
                        color: '#484233',
                        strokeWidth: 1.8,
                      }}
                    />
                  )}
                  {pkg.status === 'Coming Soon' && (
                    <div style={{position: 'absolute', top: 12, right: 12}}>
                      <XDSBadge label="Coming Soon" variant="blue" />
                    </div>
                  )}
                </div>
                <XDSText
                  type="body"
                  weight="bold"
                  style={{
                    fontFamily:
                      pkg.category !== 'designing' ? 'monospace' : undefined,
                    fontSize: 14,
                    display: 'block',
                    marginBottom: 4,
                  }}>
                  {pkg.name}
                  {pkg.version && (
                    <XDSText
                      type="supporting"
                      color="secondary"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 12,
                        marginLeft: 8,
                      }}>
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
        </XDSGrid>
      </XDSStack>

      {/* ── Section 4: Where to use XDS ── */}
      <XDSStack direction="vertical" gap={0} style={{marginBottom: 64}}>
        <XDSHeading level={2}>Where to use XDS</XDSHeading>
        <XDSText
          type="body"
          color="secondary"
          style={{marginTop: 8, marginBottom: 24, maxWidth: 680}}>
          XDS is available in three contexts. Choose the right one based on
          where you're building.
        </XDSText>
        <XDSGrid columns={3} gap={4}>
          {XDS_OFFERINGS.map(offering => (
            <XDSCard key={offering.title} padding={6} style={{height: '100%'}}>
              <XDSStack direction="vertical" gap={0} style={{height: '100%'}}>
                {offering.icons?.length || offering.logos?.length ? (
                  <XDSStack
                    direction="horizontal"
                    gap={2}
                    vAlign="center"
                    style={{marginBottom: 24}}>
                    {offering.icons?.map((IconComp, idx) => (
                      <IconComp key={idx} width={28} height={28} />
                    ))}
                    {offering.logos?.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt=""
                        width={28}
                        height={28}
                        style={{objectFit: 'contain'}}
                      />
                    ))}
                  </XDSStack>
                ) : null}
                {(offering.pkg || offering.label) && (
                  <XDSText
                    type="supporting"
                    color="secondary"
                    style={{
                      fontFamily: offering.pkg ? 'monospace' : 'inherit',
                      fontStyle:
                        offering.label && !offering.pkg ? 'italic' : undefined,
                      marginBottom: 8,
                    }}>
                    {offering.pkg ?? offering.label}
                  </XDSText>
                )}
                <XDSText type="display-2" style={{marginBottom: 4}}>
                  {offering.title}
                </XDSText>
                <XDSText
                  type="supporting"
                  color="secondary"
                  style={{marginBottom: 16}}>
                  {offering.subtitle}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {offering.descriptionLinkText && offering.descriptionLinkHref
                    ? (() => {
                        const idx = offering.description.lastIndexOf(
                          offering.descriptionLinkText,
                        );
                        if (idx === -1) return offering.description;
                        return (
                          <>
                            {offering.description.slice(0, idx)}
                            <XDSLink
                              href={offering.descriptionLinkHref}
                              type="supporting"
                              color="secondary"
                              hasUnderline>
                              {offering.descriptionLinkText}
                            </XDSLink>
                            {offering.description.slice(
                              idx + offering.descriptionLinkText.length,
                            )}
                          </>
                        );
                      })()
                    : offering.description}
                </XDSText>
              </XDSStack>
            </XDSCard>
          ))}
        </XDSGrid>
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
            textAlign: 'left',
          }}>
          <XDSChatComposer
            onSubmit={() => {}}
            placeholder="Ask a question about XDS..."
            density="compact"
          />
        </div>
        <XDSText type="supporting" color="secondary">
          Prefer a human? Open an issue on{' '}
          <XDSLink
            href="https://github.com/facebookexperimental/xds/issues"
            color="secondary"
            type="supporting">
            GitHub
          </XDSLink>
        </XDSText>
      </XDSStack>
      <div style={{height: 100}} />
    </XDSSection>
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

// ---------------------------------------------------------------------------
// ComponentDetailPage — documentation-design template style
// ---------------------------------------------------------------------------

function ComponentDetailPage({
  activeNav,
  onCraft,
}: {
  activeNav: string;
  onCraft: () => void;
}) {
  const [exampleTabs, setExampleTabs] = useState<Record<string, string>>({});
  const docs = useMemo(() => getComponentDocs(activeNav), [activeNav]);
  const componentName = getComponentName(activeNav);
  const desc = getComponentDesc(activeNav);

  const bestPractices = [
    {
      type: 'do' as const,
      text: `Use ${componentName} in the appropriate context to provide the functionality described above.`,
    },
    {
      type: 'do' as const,
      text: `Pair ${componentName} with related components to create cohesive, accessible interfaces.`,
    },
    {
      type: 'dont' as const,
      text: `Use ${componentName} when a simpler alternative achieves the same goal with less complexity.`,
    },
  ];

  const examples = [
    {
      title: `Basic ${componentName}`,
      description: `A simple example of the ${componentName} component with default settings.`,
      code: `<XDS${componentName} />`,
    },
  ];

  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSStack direction="vertical" gap={8}>
        {/* Header */}
        <XDSStack direction="vertical" gap={2}>
          <XDSText type="display-1">{componentName}</XDSText>
          <XDSText type="supporting" color="secondary">
            March 30, 2026 · Updated 5:40 p.m. PST
          </XDSText>
        </XDSStack>

        <XDSDivider />

        {/* Preview */}
        <XDSCard variant="muted" padding={0}>
          <XDSCenter height={360}>
            {COMPONENT_PREVIEWS[activeNav] ?? (
              <XDSText type="supporting" color="secondary">
                Preview coming soon
              </XDSText>
            )}
          </XDSCenter>
        </XDSCard>

        {/* Usage + Best Practices */}
        <XDSStack direction="vertical" gap={4}>
          <XDSHeading level={2}>Usage</XDSHeading>
          <XDSText type="large" weight="normal">
            {desc}
          </XDSText>
          <XDSHeading level={3}>Best practices</XDSHeading>
          <XDSTable
            data={bestPractices as Record<string, unknown>[]}
            columns={[
              {
                key: 'type',
                header: 'Guidance',
                width: pixel(125),
                renderCell: (item: Record<string, unknown>) => (
                  <XDSBadge
                    label={item.type === 'do' ? 'Do' : 'Dont'}
                    variant={item.type === 'do' ? 'success' : 'error'}
                  />
                ),
              },
              {
                key: 'text',
                header: 'Practices',
                renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="body" textWrap="wrap">
                    {item.text as string}
                  </XDSText>
                ),
              },
            ]}
            density="spacious"
            dividers="rows"
          />
        </XDSStack>

        <XDSDivider />

        {/* Examples */}
        <XDSStack direction="vertical" gap={4}>
          <XDSHeading level={2}>Examples</XDSHeading>
          <XDSText type="large" weight="normal">
            Explore common configurations, variations, and states for this
            component.
          </XDSText>
        </XDSStack>
        <XDSStack direction="vertical" gap={8}>
          {examples.map((example, i) => {
            const tabKey = `${activeNav}-${i}`;
            const activeTab = exampleTabs[tabKey] ?? 'description';
            return (
              <XDSCard key={i} padding={0}>
                <XDSSection padding={3} variant="transparent">
                  <XDSStack direction="horizontal" gap={3} vAlign="center">
                    <div style={{flex: 1}}>
                      <XDSText type="body" weight="medium">
                        {example.title}
                      </XDSText>
                    </div>
                    <XDSStack direction="horizontal" gap={1} vAlign="center">
                      <XDSButton
                        label="Open in Craft"
                        variant="ghost"
                        size="sm"
                        icon={<ExternalLinkIcon />}
                        onClick={onCraft}
                      />
                      <XDSIconButton
                        label="Fullscreen"
                        variant="ghost"
                        size="sm"
                        icon={<XDSIcon icon={FullscreenIcon} />}
                      />
                    </XDSStack>
                  </XDSStack>
                </XDSSection>
                <XDSCenter height={280}>
                  {COMPONENT_PREVIEWS[activeNav] ?? (
                    <XDSText type="supporting" color="secondary">
                      Preview coming soon
                    </XDSText>
                  )}
                </XDSCenter>
                <XDSSection variant="muted" padding={3} dividers={['top']}>
                  <XDSStack direction="vertical" gap={3}>
                    <XDSTabList
                      value={activeTab}
                      onChange={value =>
                        setExampleTabs(prev => ({
                          ...prev,
                          [tabKey]: value,
                        }))
                      }
                      size="sm"
                      xstyle={localStyles.tabListFlush}>
                      <XDSTab value="description" label="Description" />
                      <XDSTab value="code" label="Code" />
                    </XDSTabList>
                    {activeTab === 'description' ? (
                      <XDSText type="body">{example.description}</XDSText>
                    ) : (
                      <XDSCodeBlock code={example.code} language="tsx" />
                    )}
                  </XDSStack>
                </XDSSection>
              </XDSCard>
            );
          })}
        </XDSStack>
      </XDSStack>
    </XDSSection>
  );
}

export function DocsView({
  setActiveView,
  selectedComponent,
  onComponentChange,
}: {
  setActiveView: (
    v: 'craft' | 'explore' | 'docs' | 'profile' | 'theme',
  ) => void;
  selectedComponent: string | null;
  onComponentChange: (key: string | null) => void;
}) {
  const [activeNav, setActiveNav] = useState(selectedComponent ?? 'button');
  const [_showCode, _setShowCode] = useState(true);
  const [_activeRightNav, _setActiveRightNav] = useState('usage');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (selectedComponent !== null) {
      setActiveNav(selectedComponent);
    }
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
                onClick={() => onComponentChange(null)}
              />
            </XDSSideNavSection>
            <XDSSideNavSection title="Overview" isHeaderHidden>
              <XDSSideNavItem label="Guide" collapsible>
                <XDSSideNavItem
                  label="Getting Started"
                  isSelected={
                    selectedComponent !== null &&
                    activeNav === 'getting-started'
                  }
                  onClick={() => {
                    onComponentChange('getting-started');
                    setActiveNav('getting-started');
                  }}
                />
                <XDSSideNavItem
                  label="What's New"
                  isSelected={selectedComponent === 'whats-new'}
                  onClick={() => {
                    onComponentChange('whats-new');
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
                        onComponentChange(item.key);
                        setActiveNav(item.key);
                      }}
                    />
                  ))}
                </XDSSideNavItem>
                <XDSSideNavItem label="Libraries" collapsible>
                  {LIBRARY_PACKAGES.filter(pkg => !pkg.href).map(pkg => (
                    <XDSSideNavItem
                      key={pkg.key}
                      label={pkg.name}
                      isSelected={
                        selectedComponent !== null && activeNav === pkg.key
                      }
                      onClick={() => {
                        onComponentChange(pkg.key);
                        setActiveNav(pkg.key);
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
                      onComponentChange(item.key);
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
              onComponentChange('getting-started');
              setActiveNav('getting-started');
            }}
            onSelectComponent={(key: string) => {
              onComponentChange(key);
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
              onComponentChange(key);
              setActiveNav(key);
            }}
            onCraft={() => setActiveView('craft')}
          />
        ) : RESOURCE_NAV_ITEMS.some(r => r.key === selectedComponent) ? (
          <ResourcePage resourceKey={selectedComponent} />
        ) : (
          <ComponentDetailPage
            activeNav={activeNav}
            onCraft={() => setActiveView('craft')}
          />
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
