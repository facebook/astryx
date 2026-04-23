'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSBadge} from '@xds/core/Badge';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';
import {XDSGrid} from '@xds/core/Grid';
import {radiusVars} from '@xds/core/theme/tokens.stylex';
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const styles = stylex.create({
  previewCard: {
    borderRadius: radiusVars['--radius-container'],
    cursor: 'pointer',
  },
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const OVERVIEW_SECTIONS = [
  {
    label: 'Core',
    items: [
      {key: 'appshell', name: 'AppShell', desc: 'Foundational page layout with header, sidebar, and content regions.'},
      {key: 'button', name: 'Button', desc: 'Buttons let people take action. Used in forms, dialogs, and toolbars.'},
      {key: 'card', name: 'Card', desc: 'Cards group related content and actions in a contained surface.'},
      {key: 'dialog', name: 'Dialog', desc: 'Modal overlays that require user attention or action before continuing.'},
      {key: 'badge', name: 'Badge', desc: 'Small counts or status labels attached to icons, buttons, or list items.'},
      {key: 'banner', name: 'Banner', desc: 'Important, non-modal messages at the top of a page or section.'},
      {key: 'avatar', name: 'Avatar', desc: 'Represents a person or entity with an image, initials, or icon.'},
      {key: 'table', name: 'Table', desc: 'Structured data in rows and columns with sorting and selection.'},
    ],
  },
  {
    label: 'Layout',
    items: [
      {key: 'stack', name: 'Stack', desc: 'Arranges child elements in a row or column with consistent gap spacing.'},
      {key: 'grid', name: 'Grid', desc: 'CSS grid-based layout container with configurable columns and gap.'},
      {key: 'divider', name: 'Divider', desc: 'Separates content into distinct sections with a subtle line.'},
      {key: 'section', name: 'Section', desc: 'Wraps a block of content with consistent vertical spacing.'},
    ],
  },
  {
    label: 'Navigation',
    items: [
      {key: 'sidenav', name: 'SideNav', desc: 'Vertical navigation panel with links, sections, and collapsible groups.'},
      {key: 'topnav', name: 'TopNav', desc: 'App-level navigation bar with branding, links, search, and user actions.'},
      {key: 'tablist', name: 'TabList', desc: 'Switches between content views using a horizontal row of tabs.'},
      {key: 'breadcrumbs', name: 'Breadcrumbs', desc: "Shows the user's current location within a navigation hierarchy."},
    ],
  },
  {
    label: 'Form',
    items: [
      {key: 'textinput', name: 'TextInput', desc: 'Single-line text field for names, emails, and search queries.'},
      {key: 'selector', name: 'Selector', desc: 'Pick a single item from a dropdown list with search and grouping.'},
      {key: 'switch', name: 'Switch', desc: 'Toggles a setting between on and off states with immediate effect.'},
      {key: 'checkboxinput', name: 'CheckboxInput', desc: 'Single checkbox with a label for boolean opt-in choices.'},
    ],
  },
];

const QUICK_LINKS = [
  {title: 'Getting Started', desc: 'Install, configure theming, and build your first component.', key: 'getting-started'},
  {title: 'What\'s New', desc: 'Latest updates, new components, and breaking changes.', key: 'whats-new'},
  {title: 'Principles', desc: 'Design rules, anti-patterns, and best practices.', key: 'principles'},
  {title: 'Accessibility', desc: 'Built-in a11y features and ARIA patterns.', key: 'accessibility'},
];

const CHANGELOG_ENTRIES = [
  {date: 'Apr.18', type: 'Release' as const, title: '@xds/chat package with message bubbles, thread view, and AI composer'},
  {date: 'Apr.18', type: 'Release' as const, title: 'Calendar component with single date and date range selection'},
  {date: 'Apr.16', type: 'Improvement' as const, title: 'Dialog entry animations now use @starting-style instead of JS state'},
  {date: 'Apr.14', type: 'Fix' as const, title: 'Popover focus trap no longer breaks with nested popovers'},
  {date: 'Apr.10', type: 'Improvement' as const, title: 'Button loading state preserves width to prevent layout shift'},
];

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function OverviewView({
  onSelectPage,
}: {
  onSelectPage: (key: string) => void;
}) {
  return (
    <XDSLayout contentWidth={1200} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={10}>
          {/* Hero banner */}
          <XDSCard variant="cyan" padding={10}>
            <XDSHStack gap={8} vAlign="center">
              <XDSStackItem size="fill">
                <XDSVStack gap={4}>
                  <XDSText type="display-1">Documentation</XDSText>
                  <XDSText type="large" weight="normal" color="secondary">
                    Everything you need to build beautiful, accessible products
                    with our component library.
                  </XDSText>
                  <XDSHStack gap={3}>
                    <XDSButton
                      label="Get started"
                      variant="primary"
                      size="lg"
                      onClick={() => onSelectPage('getting-started')}
                    />
                    <XDSButton
                      label="What's new"
                      variant="secondary"
                      size="lg"
                      onClick={() => onSelectPage('whats-new')}
                    />
                  </XDSHStack>
                </XDSVStack>
              </XDSStackItem>
              <XDSStackItem size="fill" />
            </XDSHStack>
          </XDSCard>

          {/* Quick links */}
          <XDSVStack gap={4}>
            <XDSText type="display-2">Quick Links</XDSText>
            <XDSGrid columns={{minWidth: 260}} gap={4}>
              {QUICK_LINKS.map(link => (
                <XDSCard
                  key={link.key}
                  padding={5}
                  onClick={() => onSelectPage(link.key)}
                  xstyle={styles.previewCard}>
                  <XDSVStack gap={1}>
                    <XDSText type="body" weight="bold">{link.title}</XDSText>
                    <XDSText type="body" color="secondary">{link.desc}</XDSText>
                  </XDSVStack>
                </XDSCard>
              ))}
            </XDSGrid>
          </XDSVStack>

          {/* Component categories */}
          {OVERVIEW_SECTIONS.map(category => (
            <XDSVStack key={category.label} gap={4}>
              <XDSText type="display-2">{category.label}</XDSText>
              <XDSGrid columns={{minWidth: 260}} gap={8}>
                {category.items.map(item => (
                  <XDSVStack key={item.key} gap={3}>
                    <XDSCard
                      variant="muted"
                      padding={0}
                      minHeight={160}
                      xstyle={styles.previewCard}
                      onClick={() => onSelectPage(item.key)}
                    />
                    <XDSVStack gap={0.5}>
                      <XDSText type="body" weight="bold">{item.name}</XDSText>
                      <XDSText type="body" color="secondary">{item.desc}</XDSText>
                    </XDSVStack>
                  </XDSVStack>
                ))}
              </XDSGrid>
            </XDSVStack>
          ))}

          {/* What's new */}
          <XDSVStack gap={4}>
            <XDSHStack vAlign="center">
              <XDSStackItem size="fill">
                <XDSText type="display-2">What&#39;s New</XDSText>
              </XDSStackItem>
              <XDSButton
                label="View all"
                variant="ghost"
                onClick={() => onSelectPage('whats-new')}
              />
            </XDSHStack>
            {CHANGELOG_ENTRIES.map((entry, i) => (
              <div key={i}>
                <XDSHStack gap={3} vAlign="center">
                  <XDSText
                    type="supporting"
                    color="secondary"
                    style={{fontFamily: 'monospace', fontSize: 12, width: 50, flexShrink: 0}}>
                    {entry.date}
                  </XDSText>
                  <XDSBadge
                    label={entry.type}
                    variant={entry.type === 'Release' ? 'green' : entry.type === 'Improvement' ? 'blue' : 'orange'}
                  />
                  <XDSText type="body" style={{flex: 1}}>{entry.title}</XDSText>
                </XDSHStack>
                {i < CHANGELOG_ENTRIES.length - 1 && <XDSDivider style={{marginTop: 12}} />}
              </div>
            ))}
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function GettingStartedView() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Getting started</XDSText>
            <XDSText type="supporting" color="secondary">
              Last updated March 30, 2026
            </XDSText>
            <XDSText type="body">
              Install the package, configure your theme, and build your first
              component in three steps.
            </XDSText>
          </XDSVStack>

          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHStack gap={2} vAlign="center">
                <XDSStackItem size="fill">
                  <XDSHStack gap={2} vAlign="center">
                    <XDSIcon icon={SparklesIcon} size="sm" color="secondary" />
                    <XDSText type="body" weight="semibold">AI Assistance</XDSText>
                  </XDSHStack>
                </XDSStackItem>
                <XDSButton
                  label="Copy prompt"
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={ClipboardDocumentIcon} />}
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      'Help me get set up with Product Name. Install @xds/core and the StyleX compiler, wrap my app in XDSThemeProvider, and replace one existing component with an XDS equivalent.',
                    );
                  }}
                />
                <XDSDropdownMenu
                  button={{
                    label: 'More options',
                    variant: 'ghost',
                    size: 'sm',
                    isIconOnly: true,
                    icon: <XDSIcon icon={ChevronDownIcon} />,
                  }}
                  items={[
                    {label: 'Open in Cursor', onClick: () => {}},
                    {label: 'Open in Claude', onClick: () => {}},
                  ]}
                />
              </XDSHStack>
              <XDSText type="body" color="secondary">
                Help me get set up with Product Name. Install @xds/core and the
                StyleX compiler, wrap my app in XDSThemeProvider, and replace
                one existing component with an XDS equivalent.
              </XDSText>
            </XDSVStack>
          </XDSCard>

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Prerequisites</XDSHeading>
            <XDSList density="compact" listStyle="disc">
              <XDSListItem label="Node.js 18+" />
              <XDSListItem label="React 18 or 19" />
              <XDSListItem label="A package manager (npm, yarn, or pnpm)" />
            </XDSList>
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Install the package</XDSHeading>
            <XDSText type="body">
              Every project starts with installing the core package. This gives
              you access to all components, tokens, and utilities.
            </XDSText>
            <XDSVStack gap={2}>
              <XDSText type="body" weight="bold">Step 1: Install the core package</XDSText>
              <XDSCard padding={0}>
                <XDSCodeBlock code="npm install @xds/core" language="bash" />
              </XDSCard>
            </XDSVStack>
            <XDSVStack gap={2}>
              <XDSText type="body" weight="bold">Step 2: Add the StyleX compiler</XDSText>
              <XDSCard padding={0}>
                <XDSCodeBlock code="npm install @stylexjs/babel-plugin" language="bash" />
              </XDSCard>
            </XDSVStack>
            <XDSVStack gap={2}>
              <XDSText type="body" weight="bold">Step 3: Import your first component</XDSText>
              <XDSCard padding={0}>
                <XDSCodeBlock
                  code={`import { XDSButton } from '@xds/core/Button';

export default function App() {
  return <XDSButton label="Hello XDS" variant="primary" />;
}`}
                  language="tsx"
                />
              </XDSCard>
            </XDSVStack>
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Configure theming</XDSHeading>
            <XDSText type="body">
              XDS ships with a default theme that works out of the box. To
              customize colors, typography, and spacing, wrap your app in a theme provider.
            </XDSText>
            <XDSCard padding={0}>
              <XDSCodeBlock
                code={`import { XDSThemeProvider } from '@xds/core/Theme';

export default function App({ children }) {
  return (
    <XDSThemeProvider theme="default">
      {children}
    </XDSThemeProvider>
  );
}`}
                language="tsx"
              />
            </XDSCard>
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Next steps</XDSHeading>
            <XDSList density="compact" listStyle="disc">
              <XDSListItem label="Fundamental concepts — How theming, layout, and composition work" />
              <XDSListItem label="Component API reference — Props, variants, and examples for every component" />
              <XDSListItem label="Accessibility — Built-in a11y features and ARIA patterns" />
              <XDSListItem label="CLI tools — Scaffold projects and manage templates" />
              <XDSListItem label="Design tokens — Colors, spacing, typography, and sizing" />
            </XDSList>
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function WhatsNewView() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">What&#39;s New</XDSText>
            <XDSText type="body" color="secondary">
              Latest updates, new components, improvements, and breaking changes.
            </XDSText>
          </XDSVStack>

          <XDSBanner status="info" title="Latest Release">
            <XDSText type="body">
              @xds/chat v0.0.12 is now available with message bubbles, thread view, and AI composer.
            </XDSText>
          </XDSBanner>

          {CHANGELOG_ENTRIES.map((entry, i) => (
            <div key={i}>
              <XDSHStack gap={3} vAlign="center" style={{padding: '12px 0'}}>
                <XDSText
                  type="supporting"
                  color="secondary"
                  style={{fontFamily: 'monospace', fontSize: 12, width: 50, flexShrink: 0}}>
                  {entry.date}
                </XDSText>
                <XDSBadge
                  label={entry.type}
                  variant={entry.type === 'Release' ? 'green' : entry.type === 'Improvement' ? 'blue' : 'orange'}
                />
                <XDSText type="body" weight="bold" style={{flex: 1}}>{entry.title}</XDSText>
              </XDSHStack>
              {i < CHANGELOG_ENTRIES.length - 1 && <XDSDivider />}
            </div>
          ))}
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DocumentationOverviewPage() {
  const [activePage, setActivePage] = useState<string>('home');

  return (
    <XDSAppShell
      variant="section"
      height="fill"
      sideNav={
        <XDSSideNav
          header={<XDSSideNavHeading heading="Product Name" />}>
          <XDSSideNavSection title="Navigation" isHeaderHidden>
            <XDSSideNavItem
              label="Home"
              isSelected={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
            <XDSSideNavItem
              label="Getting Started"
              isSelected={activePage === 'getting-started'}
              onClick={() => setActivePage('getting-started')}
            />
            <XDSSideNavItem
              label="What's New"
              isSelected={activePage === 'whats-new'}
              onClick={() => setActivePage('whats-new')}
            />
          </XDSSideNavSection>

          <XDSSideNavSection title="Guides">
            <XDSSideNavItem label="Principles" />
            <XDSSideNavItem label="Accessibility" />
            <XDSSideNavItem label="Theming" />
            <XDSSideNavItem label="CLI Tools" />
          </XDSSideNavSection>

          {OVERVIEW_SECTIONS.map(category => (
            <XDSSideNavSection key={category.label} title={category.label}>
              {category.items.map(item => (
                <XDSSideNavItem
                  key={item.key}
                  label={item.name}
                />
              ))}
            </XDSSideNavSection>
          ))}
        </XDSSideNav>
      }>
      {activePage === 'home' ? (
        <OverviewView onSelectPage={setActivePage} />
      ) : activePage === 'getting-started' ? (
        <GettingStartedView />
      ) : activePage === 'whats-new' ? (
        <WhatsNewView />
      ) : (
        <OverviewView onSelectPage={setActivePage} />
      )}
    </XDSAppShell>
  );
}
