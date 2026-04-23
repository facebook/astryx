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
import {XDSList, XDSListItem} from '@xds/core/List';
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

const COMPONENT_CATEGORIES = [
  {
    label: 'Core',
    items: [
      {key: 'appshell', name: 'AppShell', desc: 'AppShell provides a foundational page layout with header, sidebar, and content regions. Use it to establish consistent structure across your application.'},
      {key: 'avatar', name: 'Avatar', desc: 'Avatars represent a person or entity with an image, initials, or icon. They are commonly used in user profiles, comments, and contact lists.'},
      {key: 'badge', name: 'Badge', desc: 'Badges display small counts or status labels. They can be attached to icons, buttons, or list items to surface key information at a glance.'},
      {key: 'banner', name: 'Banner', desc: 'Banners show important, non-modal messages at the top of a page or section. They communicate status, warnings, or promotional information.'},
      {key: 'button', name: 'Button', desc: 'Buttons let people take action. They can be used in forms, dialogs, and toolbars, or as standalone links.'},
      {key: 'calendar', name: 'Calendar', desc: 'Calendar provides a date-picking grid for selecting single dates or date ranges. It integrates with form fields for date input.'},
      {key: 'dialog', name: 'Dialog', desc: 'Dialogs are modal overlays that require user attention or action before continuing. They are used for confirmations, forms, and critical decisions.'},
      {key: 'dropdownmenu', name: 'DropdownMenu', desc: 'DropdownMenu presents a list of actions or options in a floating overlay. It is triggered by a button and supports nested submenus.'},
      {key: 'emptystate', name: 'EmptyState', desc: 'EmptyState provides a placeholder when there is no content to display. It guides users with a message, illustration, and optional call-to-action.'},
      {key: 'hovercard', name: 'HoverCard', desc: 'HoverCard shows a rich preview of content when users hover over a trigger element. It is ideal for previewing profiles, links, or details.'},
      {key: 'icon', name: 'Icon', desc: 'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text.'},
      {key: 'kbd', name: 'Kbd', desc: 'Kbd renders keyboard shortcut hints in a styled inline element. Use it to show users which key combinations perform specific actions.'},
      {key: 'link', name: 'Link', desc: 'Links provide navigation between pages or to external resources. They follow accessible anchor semantics with visual affordance.'},
      {key: 'list', name: 'List', desc: 'List displays a vertical set of related items. It supports selection, icons, and metadata for building menus, nav lists, and more.'},
      {key: 'popover', name: 'Popover', desc: 'Popover displays rich content in a floating panel anchored to a trigger element. It is used for forms, filters, and contextual tools.'},
      {key: 'table', name: 'Table', desc: 'Table displays structured data in rows and columns with support for sorting, selection, and custom cell rendering.'},
      {key: 'token', name: 'Token', desc: 'Tokens display compact metadata labels such as tags, categories, or filters. They can be dismissible and support selection state.'},
      {key: 'tooltip', name: 'Tooltip', desc: 'Tooltips show concise helper text when users hover over or focus an element. They clarify icons, truncated labels, and controls.'},
    ],
  },
  {
    label: 'Layout',
    items: [
      {key: 'card', name: 'Card', desc: 'Cards group related content and actions in a contained surface. They can include headers, media, body text, and action bars.'},
      {key: 'divider', name: 'Divider', desc: 'Dividers separate content into distinct sections with a subtle or strong horizontal line. They can optionally include a label.'},
      {key: 'grid', name: 'Grid', desc: 'Grid provides a CSS grid-based layout container with configurable columns, rows, and gap. It simplifies responsive multi-column designs.'},
      {key: 'stack', name: 'Stack', desc: 'Stack arranges child elements in a row or column with consistent gap spacing. It is the primary tool for one-dimensional layout composition.'},
    ],
  },
  {
    label: 'Navigation',
    items: [
      {key: 'breadcrumbs', name: 'Breadcrumbs', desc: "Breadcrumbs show the user's current location within a navigation hierarchy. They provide quick links back to parent pages."},
      {key: 'sidenav', name: 'SideNav', desc: 'SideNav renders a vertical navigation panel with links, sections, and collapsible groups. It is used as the primary nav in dashboard layouts.'},
      {key: 'tablist', name: 'TabList', desc: 'TabList switches between content views using a horizontal row of tabs. Only one tab is active at a time, and content changes without a page reload.'},
      {key: 'topnav', name: 'TopNav', desc: 'TopNav provides an app-level navigation bar across the top of the page. It holds branding, primary links, search, and user actions.'},
    ],
  },
  {
    label: 'Form',
    items: [
      {key: 'checkboxinput', name: 'CheckboxInput', desc: 'CheckboxInput renders a single checkbox with a label. It is used for boolean opt-in choices like terms acceptance or feature toggles.'},
      {key: 'selector', name: 'Selector', desc: 'Selector lets users pick a single item from a dropdown list. It supports search, grouping, and custom option rendering.'},
      {key: 'switch', name: 'Switch', desc: 'Switch toggles a setting between on and off states with immediate effect. It is used for preferences, feature flags, and real-time controls.'},
      {key: 'textinput', name: 'TextInput', desc: 'TextInput is a single-line text field for short user input like names, emails, and search queries. It supports icons, prefixes, and validation.'},
      {key: 'typeahead', name: 'Typeahead', desc: 'Typeahead provides an autocomplete search input that suggests results as the user types. It supports async data sources and custom rendering.'},
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function OverviewView({
  onSelectComponent,
}: {
  onSelectComponent: (key: string) => void;
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
                  <XDSText type="display-1">Web overview</XDSText>
                  <XDSText type="large" weight="normal" color="secondary">
                    An open-source UI library to help developers quickly build
                    beautiful, accessible products.
                  </XDSText>
                  <XDSHStack>
                    <XDSButton
                      label="Get started"
                      variant="primary"
                      size="lg"
                      onClick={() => onSelectComponent('getting-started')}
                    />
                  </XDSHStack>
                </XDSVStack>
              </XDSStackItem>
              <XDSStackItem size="fill" />
            </XDSHStack>
          </XDSCard>

          {/* Category sections */}
          {COMPONENT_CATEGORIES.map(category => (
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
                      onClick={() => onSelectComponent(item.key)}
                    />
                    <XDSVStack gap={0.5}>
                      <XDSText type="body" weight="bold">
                        {item.name}
                      </XDSText>
                      <XDSText type="body" color="secondary">
                        {item.desc}
                      </XDSText>
                    </XDSVStack>
                  </XDSVStack>
                ))}
              </XDSGrid>
            </XDSVStack>
          ))}
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
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSText type="display-1">
            Getting started with Product Name
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Last updated March 30, 2026
          </XDSText>
          <XDSText type="body">
            Install the package, configure your theme, and build your first
            component in three steps.
          </XDSText>
        </XDSVStack>

        {/* AI Assistance prompt card */}
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSHStack gap={2} vAlign="center">
              <XDSStackItem size="fill">
                <XDSHStack gap={2} vAlign="center">
                  <XDSIcon icon={SparklesIcon} size="sm" color="secondary" />
                  <XDSText type="body" weight="semibold">
                    AI Assistance
                  </XDSText>
                </XDSHStack>
              </XDSStackItem>
              <XDSButton
                label="Copy prompt"
                variant="ghost"
                size="sm"
                icon={<XDSIcon icon={ClipboardDocumentIcon} />}
                onClick={() => {
                  void navigator.clipboard.writeText(
                    'Help me get set up with Product Name. Based on my project, do the following: 1. Install @xds/core and the StyleX compiler. 2. Wrap my app in XDSThemeProvider. 3. Replace one existing component with an XDS equivalent. After setup, suggest relevant next steps based on my project.',
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
                  {label: 'Open in v0', onClick: () => {}},
                  {label: 'Open in Claude', onClick: () => {}},
                  {label: 'Open in ChatGPT', onClick: () => {}},
                  {label: 'Open in Cursor', onClick: () => {}},
                ]}
              />
            </XDSHStack>
            <XDSText type="body" color="secondary">
              Help me get set up with Product Name. Based on my project, do the
              following: 1. Install @xds/core and the StyleX compiler. 2. Wrap
              my app in XDSThemeProvider. 3. Replace one existing component with
              an XDS equivalent.
            </XDSText>
          </XDSVStack>
        </XDSCard>

        {/* Prerequisites */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>Prerequisites</XDSHeading>
          <XDSList density="compact" listStyle="disc">
            <XDSListItem label="Node.js 18+" />
            <XDSListItem label="React 18 or 19" />
            <XDSListItem label="A package manager (npm, yarn, or pnpm)" />
          </XDSList>
        </XDSVStack>

        <XDSDivider />

        {/* Install the package */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>Install the package</XDSHeading>
          <XDSText type="body">
            Every project starts with installing the core package. This gives
            you access to all components, tokens, and utilities.
          </XDSText>

          <XDSVStack gap={2}>
            <XDSText type="body" weight="bold">
              Step 1: Install the core package
            </XDSText>
            <XDSCard padding={0}>
              <XDSCodeBlock code="npm install @xds/core" language="bash" />
            </XDSCard>
          </XDSVStack>

          <XDSVStack gap={2}>
            <XDSText type="body" weight="bold">
              Step 2: Add the StyleX compiler
            </XDSText>
            <XDSText type="body" color="secondary">
              XDS uses StyleX for styling. Add the compiler plugin to your build
              configuration.
            </XDSText>
            <XDSCard padding={0}>
              <XDSCodeBlock
                code="npm install @stylexjs/babel-plugin"
                language="bash"
              />
            </XDSCard>
          </XDSVStack>

          <XDSVStack gap={2}>
            <XDSText type="body" weight="bold">
              Step 3: Import your first component
            </XDSText>
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

        {/* Configure theming */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>Configure theming</XDSHeading>
          <XDSText type="body">
            XDS ships with a default theme that works out of the box. To
            customize colors, typography, and spacing, wrap your app in a theme
            provider.
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
          <XDSText type="body" color="secondary">
            See the theming guide for the full list of customizable tokens.
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Next steps */}
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
          header={
            <XDSSideNavHeading heading="Product Name" />
          }>
          <XDSSideNavSection title="Navigation" isHeaderHidden>
            <XDSSideNavItem
              label="Home"
              isSelected={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
            <XDSSideNavItem
              label="Getting started"
              isSelected={activePage === 'getting-started'}
              onClick={() => setActivePage('getting-started')}
            />
          </XDSSideNavSection>

          {COMPONENT_CATEGORIES.map(category => (
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
        <OverviewView onSelectComponent={setActivePage} />
      ) : (
        <GettingStartedView />
      )}
    </XDSAppShell>
  );
}
