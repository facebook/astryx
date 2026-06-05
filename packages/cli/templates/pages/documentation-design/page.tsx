// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSToken} from '@xds/core/Token';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@xds/core/Layout';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSIcon} from '@xds/core/Icon';
import {XDSSection} from '@xds/core/Section';
import {XDSCenter} from '@xds/core/Center';
import {
  ArrowTopRightOnSquareIcon,
  ArrowsPointingOutIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const styles = stylex.create({
  tabListFlush: {marginInlineStart: '-12px'},
});

// ---------------------------------------------------------------------------
// DialogPreview — stateful dialog preview for component previews
// ---------------------------------------------------------------------------

function DialogPreview() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <XDSVStack gap={3}>
      <XDSHeading level={3}>Dialog</XDSHeading>
      <XDSButton
        label="Open Dialog"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSDialogHeader title="Example Dialog" onOpenChange={setIsOpen} />
        <XDSSection padding={4}>
          <XDSText type="body">
            This is an example dialog. Dialogs are used to require user action
            or display important information that needs acknowledgment.
          </XDSText>
        </XDSSection>
      </XDSDialog>
    </XDSVStack>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const COMPONENT_CATEGORIES = [
  {
    label: 'Core',
    items: [
      {
        key: 'appshell',
        name: 'AppShell',
        desc: 'AppShell provides a foundational page layout with header, sidebar, and content regions. Use it to establish consistent structure across your application.',
      },
      {
        key: 'avatar',
        name: 'Avatar',
        desc: 'Avatars represent a person or entity with an image, initials, or icon. They are commonly used in user profiles, comments, and contact lists.',
      },
      {
        key: 'badge',
        name: 'Badge',
        desc: 'Badges display small counts or status labels. They can be attached to icons, buttons, or list items to surface key information at a glance.',
      },
      {
        key: 'banner',
        name: 'Banner',
        desc: 'Banners show important, non-modal messages at the top of a page or section. They communicate status, warnings, or promotional information.',
      },
      {
        key: 'button',
        name: 'Button',
        desc: 'Buttons let people take action. They can be used in forms, dialogs, and toolbars, or as standalone links.',
      },
      {
        key: 'calendar',
        name: 'Calendar',
        desc: 'Calendar provides a date-picking grid for selecting single dates or date ranges. It integrates with form fields for date input.',
      },
      {
        key: 'dialog',
        name: 'Dialog',
        desc: 'Dialogs are modal overlays that require user attention or action before continuing. They are used for confirmations, forms, and critical decisions.',
      },
      {
        key: 'dropdownmenu',
        name: 'DropdownMenu',
        desc: 'DropdownMenu presents a list of actions or options in a floating overlay. It is triggered by a button and supports nested submenus.',
      },
      {
        key: 'emptystate',
        name: 'EmptyState',
        desc: 'EmptyState provides a placeholder when there is no content to display. It guides users with a message, illustration, and optional call-to-action.',
      },
      {
        key: 'hovercard',
        name: 'HoverCard',
        desc: 'HoverCard shows a rich preview of content when users hover over a trigger element. It is ideal for previewing profiles, links, or details.',
      },
      {
        key: 'icon',
        name: 'Icon',
        desc: 'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text.',
      },
      {
        key: 'kbd',
        name: 'Kbd',
        desc: 'Kbd renders keyboard shortcut hints in a styled inline element. Use it to show users which key combinations perform specific actions.',
      },
      {
        key: 'link',
        name: 'Link',
        desc: 'Links provide navigation between pages or to external resources. They follow accessible anchor semantics with visual affordance.',
      },
      {
        key: 'list',
        name: 'List',
        desc: 'List displays a vertical set of related items. It supports selection, icons, and metadata for building menus, nav lists, and more.',
      },
      {
        key: 'metadatalist',
        name: 'MetadataList',
        desc: 'MetadataList displays key-value pairs in a structured layout. Use it for detail panels, settings summaries, and record information.',
      },
      {
        key: 'moremenu',
        name: 'MoreMenu',
        desc: 'MoreMenu provides an overflow menu triggered by an icon button. It collects secondary actions that do not fit in the primary toolbar.',
      },
      {
        key: 'overflowlist',
        name: 'OverflowList',
        desc: 'OverflowList renders as many items as fit in the available space and collapses the rest into an overflow menu automatically.',
      },
      {
        key: 'pagination',
        name: 'Pagination',
        desc: 'Pagination lets users navigate through pages of content. It supports page numbers, previous/next controls, and page-size selection.',
      },
      {
        key: 'popover',
        name: 'Popover',
        desc: 'Popover displays rich content in a floating panel anchored to a trigger element. It is used for forms, filters, and contextual tools.',
      },
      {
        key: 'progressbar',
        name: 'ProgressBar',
        desc: 'ProgressBar shows the completion status of a task or process. It provides visual feedback for uploads, installations, and multi-step flows.',
      },
      {
        key: 'skeleton',
        name: 'Skeleton',
        desc: 'Skeleton renders placeholder shapes that mimic content layout while loading. It reduces perceived wait time and prevents layout shifts.',
      },
      {
        key: 'spinner',
        name: 'Spinner',
        desc: 'Spinner indicates that a process is in progress when the duration is unknown. It draws attention without blocking the interface.',
      },
      {
        key: 'statusdot',
        name: 'StatusDot',
        desc: 'StatusDot shows a small colored indicator for online, offline, busy, or custom statuses. It is often paired with avatars or list items.',
      },
      {
        key: 'table',
        name: 'Table',
        desc: 'Table displays structured data in rows and columns with support for sorting, selection, and custom cell rendering.',
      },
      {
        key: 'thumbnail',
        name: 'Thumbnail',
        desc: 'Thumbnail renders a small image preview with consistent sizing and optional rounded corners. It is used in media lists, cards, and galleries.',
      },
      {
        key: 'timestamp',
        name: 'Timestamp',
        desc: 'Timestamp formats and displays dates and times with relative or absolute labels. It updates automatically to stay current.',
      },
      {
        key: 'toast',
        name: 'Toast',
        desc: 'Toasts display brief, non-blocking notifications at the edge of the screen. They auto-dismiss and are used for success, error, or info messages.',
      },
      {
        key: 'togglebutton',
        name: 'ToggleButton',
        desc: 'ToggleButton is a button that switches between an on and off state. Use it for binary options like bookmarking, favoriting, or muting.',
      },
      {
        key: 'token',
        name: 'Token',
        desc: 'Tokens display compact metadata labels such as tags, categories, or filters. They can be dismissible and support selection state.',
      },
      {
        key: 'tooltip',
        name: 'Tooltip',
        desc: 'Tooltips show concise helper text when users hover over or focus an element. They clarify icons, truncated labels, and controls.',
      },
      {
        key: 'treelist',
        name: 'TreeList',
        desc: 'TreeList renders hierarchical data in an expandable tree structure. It supports multi-level nesting, selection, and lazy loading.',
      },
    ],
  },
  {
    label: 'Typography',
    items: [
      {
        key: 'heading',
        name: 'Heading',
        desc: 'Heading renders semantic section titles from h1 through h6. It establishes visual hierarchy and supports multiple weight and size options.',
      },
      {
        key: 'text',
        name: 'Text',
        desc: 'Text renders body copy, labels, and supporting content with consistent typography. It supports sizes from display down to caption.',
      },
    ],
  },
  {
    label: 'Layout',
    items: [
      {
        key: 'aspectratio',
        name: 'AspectRatio',
        desc: 'AspectRatio constrains its child to a specified width-to-height ratio. Use it for responsive images, videos, and embedded media.',
      },
      {
        key: 'card',
        name: 'Card',
        desc: 'Cards group related content and actions in a contained surface. They can include headers, media, body text, and action bars.',
      },
      {
        key: 'center',
        name: 'Center',
        desc: 'Center aligns its child horizontally and vertically within the available space. It is useful for empty states, loading screens, and hero sections.',
      },
      {
        key: 'divider',
        name: 'Divider',
        desc: 'Dividers separate content into distinct sections with a subtle or strong horizontal line. They can optionally include a label.',
      },
      {
        key: 'grid',
        name: 'Grid',
        desc: 'Grid provides a CSS grid-based layout container with configurable columns, rows, and gap. It simplifies responsive multi-column designs.',
      },
      {
        key: 'layout',
        name: 'Layout',
        desc: 'Layout provides foundational page-level primitives for header, sidebar, and content regions. It establishes consistent spacing and structure.',
      },
      {
        key: 'section',
        name: 'Section',
        desc: 'Section wraps a block of content with consistent vertical spacing and an optional heading. It structures pages into logical groups.',
      },
      {
        key: 'stack',
        name: 'Stack',
        desc: 'Stack arranges child elements in a row or column with consistent gap spacing. It is the primary tool for one-dimensional layout composition.',
      },
      {
        key: 'toolbar',
        name: 'Toolbar',
        desc: 'Toolbar arranges a row of action buttons and controls in a compact, aligned strip. It is used at the top of panels, editors, and cards.',
      },
    ],
  },
  {
    label: 'Navigation',
    items: [
      {
        key: 'breadcrumbs',
        name: 'Breadcrumbs',
        desc: "Breadcrumbs show the user's current location within a navigation hierarchy. They provide quick links back to parent pages.",
      },
      {
        key: 'mobilenav',
        name: 'MobileNav',
        desc: 'MobileNav provides a responsive navigation menu optimized for small screens. It typically slides in from the edge of the viewport.',
      },
      {
        key: 'sidenav',
        name: 'SideNav',
        desc: 'SideNav renders a vertical navigation panel with links, sections, and collapsible groups. It is used as the primary nav in dashboard layouts.',
      },
      {
        key: 'tablist',
        name: 'TabList',
        desc: 'TabList switches between content views using a horizontal row of tabs. Only one tab is active at a time, and content changes without a page reload.',
      },
      {
        key: 'topnav',
        name: 'TopNav',
        desc: 'TopNav provides an app-level navigation bar across the top of the page. It holds branding, primary links, search, and user actions.',
      },
    ],
  },
  {
    label: 'Form',
    items: [
      {
        key: 'checkboxinput',
        name: 'CheckboxInput',
        desc: 'CheckboxInput renders a single checkbox with a label. It is used for boolean opt-in choices like terms acceptance or feature toggles.',
      },
      {
        key: 'selector',
        name: 'Selector',
        desc: 'Selector lets users pick a single item from a dropdown list. It supports search, grouping, and custom option rendering.',
      },
      {
        key: 'switch',
        name: 'Switch',
        desc: 'Switch toggles a setting between on and off states with immediate effect. It is used for preferences, feature flags, and real-time controls.',
      },
      {
        key: 'textinput',
        name: 'TextInput',
        desc: 'TextInput is a single-line text field for short user input like names, emails, and search queries. It supports icons, prefixes, and validation.',
      },
      {
        key: 'typeahead',
        name: 'Typeahead',
        desc: 'Typeahead provides an autocomplete search input that suggests results as the user types. It supports async data sources and custom rendering.',
      },
    ],
  },
  {
    label: 'Components',
    items: [
      {
        key: 'codeblock',
        name: 'CodeBlock',
        desc: 'CodeBlock displays formatted, syntax-highlighted source code. It supports line numbers, copy-to-clipboard, and language detection.',
      },
      {
        key: 'collapsible',
        name: 'Collapsible',
        desc: 'Collapsible wraps content that can be expanded or collapsed with a trigger. It is used for FAQs, advanced settings, and progressive disclosure.',
      },
      {
        key: 'markdown',
        name: 'Markdown',
        desc: 'Markdown renders markdown-formatted text into styled HTML. It supports headings, lists, links, code blocks, and inline formatting.',
      },
    ],
  },
  {
    label: 'Chat',
    items: [
      {
        key: 'chat',
        name: 'Chat',
        desc: 'Chat provides a conversational message interface with message bubbles, input, and thread support. It is used for AI assistants and messaging UIs.',
      },
    ],
  },
  {
    label: 'CommandPalette',
    items: [
      {
        key: 'commandpalette',
        name: 'CommandPalette',
        desc: 'CommandPalette is a keyboard-driven command menu for quick navigation and actions. It is opened with a hotkey and supports fuzzy search.',
      },
    ],
  },
];

const COMPONENT_DOCS: Record<
  string,
  {
    usage: string;
    bestPractices: {type: 'do' | 'dont'; text: string}[];
    examples: {title: string; description: string; code: string}[];
  }
> = {
  button: {
    usage:
      'Buttons provide visual cues for actions and events. These fundamental components allow users to commit actions and navigate a page flow. Use a Button when a user needs to submit a form, start a new task or action, or trigger a new UI element to appear on the page.',
    bestPractices: [
      {
        type: 'do',
        text: 'Convey clear action hierarchy: Each surface should only have 1 primary button. A majority of buttons should be in default or flat style.',
      },
      {
        type: 'do',
        text: 'Promote clarity: Consider labels alongside icons where appropriate.',
      },
      {
        type: 'dont',
        text: 'Overuse primary or special buttons: Overusing colored buttons will result in a page with less intentionality, create visual confusion and a lack of page hierarchy.',
      },
    ],
    examples: [
      {
        title: 'Semantics',
        description:
          'We have four semantic buttons types: flat, default, primary, and destructive. Flat buttons are used to limit visual prominence, whereas primary emphasizes a single action. Use destructive for deletions that trigger dialog confirmations.',
        code: `<XDSButton label="Flat" variant="ghost" />\n<XDSButton label="Default" variant="secondary" />\n<XDSButton label="Primary" variant="primary" />\n<XDSButton label="Destructive" variant="destructive" />`,
      },
      {
        title: 'Default button with badge',
        description:
          'Buttons can include a badge to highlight new or updated actions.',
        code: `<XDSButton\n  label="Button"\n  variant="default"\n/>`,
      },
    ],
  },
};

function getComponentName(key: string): string {
  for (const cat of COMPONENT_CATEGORIES) {
    const item = cat.items.find(i => i.key === key);
    if (item) {
      return item.name;
    }
  }
  return key;
}

function getComponentDocs(key: string) {
  if (COMPONENT_DOCS[key]) {
    return COMPONENT_DOCS[key];
  }
  const name = getComponentName(key);
  let desc = '';
  for (const cat of COMPONENT_CATEGORIES) {
    const item = cat.items.find(i => i.key === key);
    if (item) {
      desc = item.desc;
      break;
    }
  }
  return {
    usage: desc,
    bestPractices: [
      {
        type: 'do' as const,
        text: `Use ${name} in the appropriate context to provide the functionality described above.`,
      },
      {
        type: 'do' as const,
        text: `Pair ${name} with related components to create cohesive, accessible interfaces.`,
      },
      {
        type: 'dont' as const,
        text: `Use ${name} when a simpler alternative achieves the same goal with less complexity.`,
      },
    ],
    examples: [
      {
        title: `Basic ${name}`,
        description: `A simple example of the ${name} component with default settings.`,
        code: `<XDS${name} />`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// ComponentDetailView
// ---------------------------------------------------------------------------

function ComponentDetailView({
  activeNav,
  nav,
}: {
  activeNav: string;
  nav: React.ReactNode;
}) {
  const [exampleTabs, setExampleTabs] = useState<Record<string, string>>({});

  const EXAMPLE_PREVIEWS: Record<string, React.ReactNode[]> = {
    button: [
      <XDSHStack key="semantics" gap={3} vAlign="center">
        <XDSButton label="Flat" variant="ghost" />
        <XDSButton label="Default" variant="secondary" />
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Destructive" variant="destructive" />
      </XDSHStack>,
      <XDSButton key="badge" label="Button" variant="secondary" />,
    ],
  };

  const COMPONENT_PREVIEWS: Record<string, React.ReactNode> = {
    button: (
      <XDSButton
        label="Button"
        variant="secondary"
        icon={<XDSIcon icon={PlusIcon} />}
        endContent={<XDSBadge label="New" variant="info" />}
      />
    ),
    avatar: <XDSAvatar name="Alice" size="medium" />,
    badge: <XDSBadge label="Success" variant="success" />,
    card: (
      <XDSCard>
        <XDSVStack gap={2}>
          <XDSHeading level={4}>Card Title</XDSHeading>
          <XDSText type="body" color="secondary">
            Cards group related content and actions.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    ),
    banner: (
      <XDSBanner status="info" title="Information">
        <XDSText type="body">This is an informational banner message.</XDSText>
      </XDSBanner>
    ),
    dialog: <DialogPreview />,
    text: <XDSText type="body">Body text</XDSText>,
    divider: <XDSDivider />,
    token: <XDSToken label="Design" />,
    tooltip: (
      <XDSTooltip content="Primary action">
        <XDSButton label="Hover me" variant="primary" />
      </XDSTooltip>
    ),
  };

  const docs = useMemo(() => getComponentDocs(activeNav), [activeNav]);
  const previews = EXAMPLE_PREVIEWS[activeNav] ?? [];

  return (
    <XDSLayout
      height="fill"
      contentWidth={960}
      start={
        <XDSLayoutPanel hasDivider padding={0}>
          {nav}
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent padding={8}>
          <XDSVStack gap={8}>
            <XDSVStack gap={2}>
              <XDSText type="display-1">{getComponentName(activeNav)}</XDSText>
              <XDSText type="supporting" color="secondary">
                March 30, 2026 · Updated 5:40 p.m. PST
              </XDSText>
            </XDSVStack>

            <XDSDivider />

            <XDSCard variant="muted" padding={0}>
              <XDSCenter height={360}>
                {COMPONENT_PREVIEWS[activeNav] ?? (
                  <XDSText type="supporting" color="secondary">
                    Preview coming soon
                  </XDSText>
                )}
              </XDSCenter>
            </XDSCard>

            <XDSVStack gap={4}>
              <XDSHeading level={2}>Usage</XDSHeading>
              <XDSText type="large" weight="normal">
                {docs.usage}
              </XDSText>
              <XDSHeading level={3}>Best practices</XDSHeading>
              <XDSTable
                data={docs.bestPractices as Record<string, unknown>[]}
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
            </XDSVStack>

            <XDSDivider />

            <XDSVStack gap={4}>
              <XDSHeading level={2}>Examples</XDSHeading>
              <XDSText type="large" weight="normal">
                Explore common configurations, variations, and states for this
                component.
              </XDSText>
            </XDSVStack>
            <XDSVStack gap={8}>
              {docs.examples.map((example, i) => {
                const tabKey = `${activeNav}-${i}`;
                const activeTab = exampleTabs[tabKey] ?? 'description';
                return (
                  <XDSCard key={i} padding={0}>
                    <XDSSection padding={3} variant="transparent">
                      <XDSHStack gap={3} vAlign="center">
                        <XDSStackItem size="fill">
                          <XDSText type="body" weight="medium">
                            {example.title}
                          </XDSText>
                        </XDSStackItem>
                        <XDSHStack gap={1} vAlign="center">
                          <XDSButton
                            label="Open in Craft"
                            variant="ghost"
                            size="sm"
                            icon={<XDSIcon icon={ArrowTopRightOnSquareIcon} />}
                          />
                          <XDSButton
                            label="Send to CLI"
                            variant="ghost"
                            size="sm"
                          />
                          <XDSIconButton
                            label="Fullscreen"
                            variant="ghost"
                            size="sm"
                            icon={<XDSIcon icon={ArrowsPointingOutIcon} />}
                          />
                        </XDSHStack>
                      </XDSHStack>
                    </XDSSection>
                    <XDSCenter height={280}>
                      {previews[i] ?? (
                        <XDSText type="supporting" color="secondary">
                          Preview coming soon
                        </XDSText>
                      )}
                    </XDSCenter>
                    <XDSSection variant="muted" padding={3} dividers={['top']}>
                      <XDSVStack gap={3}>
                        <XDSTabList
                          value={activeTab}
                          onChange={value =>
                            setExampleTabs(prev => ({...prev, [tabKey]: value}))
                          }
                          size="sm"
                          xstyle={styles.tabListFlush}>
                          <XDSTab value="description" label="Description" />
                          <XDSTab value="code" label="Code" />
                        </XDSTabList>
                        {activeTab === 'description' ? (
                          <XDSText type="body">{example.description}</XDSText>
                        ) : (
                          <XDSCodeBlock code={example.code} language="tsx" />
                        )}
                      </XDSVStack>
                    </XDSSection>
                  </XDSCard>
                );
              })}
            </XDSVStack>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DesignDocumentationPage() {
  const [activePage, setActivePage] = useState<string>('button');

  return (
    <ComponentDetailView
      activeNav={activePage}
      nav={
        <XDSSideNav header={<XDSSideNavHeading heading="Product Name" />}>
          {COMPONENT_CATEGORIES.map(category => (
            <XDSSideNavSection key={category.label} title={category.label}>
              {category.items.map(item => (
                <XDSSideNavItem
                  key={item.key}
                  label={item.name}
                  isSelected={activePage === item.key}
                  onClick={
                    item.key === 'button'
                      ? () => setActivePage(item.key)
                      : undefined
                  }
                />
              ))}
            </XDSSideNavSection>
          ))}
        </XDSSideNav>
      }
    />
  );
}
