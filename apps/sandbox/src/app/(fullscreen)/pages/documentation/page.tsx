// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Token} from '@astryxdesign/core/Token';
import {List, ListItem} from '@astryxdesign/core/List';
import {Banner} from '@astryxdesign/core/Banner';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {Table} from '@astryxdesign/core/Table';

const localStyles = stylex.create({
  previewCard: {
    borderRadius: 12,
    cursor: 'pointer',
  },
});

// ---------------------------------------------------------------------------
// Icons (Lucide-style inline SVGs)
// ---------------------------------------------------------------------------

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MaximizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

// ---------------------------------------------------------------------------
// SectionLabel — sidebar category header
// ---------------------------------------------------------------------------

function SectionLabel({label}: {label: string}) {
  return (
    <div
      style={{
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '12px 8px 4px',
        margin: 0,
      }}>
      <Text type="supporting" weight="semibold" color="secondary">
        {label}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DialogPreview — stateful dialog preview for component previews
// ---------------------------------------------------------------------------

function DialogPreview() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div style={{marginBottom: 16}}>
        <Heading level={3}>Dialog</Heading>
      </div>
      <Button
        label="Open Dialog"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <DialogHeader title="Example Dialog" onOpenChange={setIsOpen} />
        <div style={{padding: 16}}>
          <Text type="body">
            This is an example dialog. Dialogs are used to require user action
            or display important information that needs acknowledgment.
          </Text>
        </div>
      </Dialog>
    </div>
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
        key: 'empty-state',
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
        key: 'checkboxlist',
        name: 'CheckboxList',
        desc: 'CheckboxList displays a group of checkboxes for selecting multiple options. It manages shared state and supports select-all behavior.',
      },
      {
        key: 'dateinput',
        name: 'DateInput',
        desc: 'DateInput provides a text field with calendar picker for entering dates. It validates format and supports min/max date constraints.',
      },
      {
        key: 'field',
        name: 'Field',
        desc: 'Field wraps a form control with a label, helper text, and error message. It ensures consistent layout and accessibility across all form inputs.',
      },
      {
        key: 'formlayout',
        name: 'FormLayout',
        desc: 'FormLayout arranges form fields in a structured vertical or horizontal layout with consistent spacing and alignment.',
      },
      {
        key: 'multiselector',
        name: 'MultiSelector',
        desc: 'MultiSelector lets users pick multiple items from a searchable list with tokenized selections. It is ideal for assigning tags, teams, or categories.',
      },
      {
        key: 'numberinput',
        name: 'NumberInput',
        desc: 'NumberInput provides a text field for numeric values with optional increment/decrement controls. It supports min, max, and step constraints.',
      },
      {
        key: 'powersearch',
        name: 'PowerSearch',
        desc: 'PowerSearch provides an advanced search interface with filters, suggestions, and structured query support for complex data exploration.',
      },
      {
        key: 'radiolist',
        name: 'RadioList',
        desc: 'RadioList presents a group of mutually exclusive options. Only one option can be selected at a time, making it ideal for settings and preferences.',
      },
      {
        key: 'selector',
        name: 'Selector',
        desc: 'Selector lets users pick a single item from a dropdown list. It supports search, grouping, and custom option rendering.',
      },
      {
        key: 'slider',
        name: 'Slider',
        desc: 'Slider lets users select a value or range by dragging a handle along a track. It is used for volume, brightness, and numeric range inputs.',
      },
      {
        key: 'switch',
        name: 'Switch',
        desc: 'Switch toggles a setting between on and off states with immediate effect. It is used for preferences, feature flags, and real-time controls.',
      },
      {
        key: 'textarea',
        name: 'TextArea',
        desc: 'TextArea provides a multi-line text field for longer-form content like comments, descriptions, and messages. It supports auto-resize.',
      },
      {
        key: 'textinput',
        name: 'TextInput',
        desc: 'TextInput is a single-line text field for short user input like names, emails, and search queries. It supports icons, prefixes, and validation.',
      },
      {
        key: 'timeinput',
        name: 'TimeInput',
        desc: 'TimeInput provides a field for entering times with optional picker support. It validates format and supports 12- and 24-hour modes.',
      },
      {
        key: 'tokenizer',
        name: 'Tokenizer',
        desc: 'Tokenizer is a text input that converts entries into removable tokens. It is used for multi-value fields like email recipients and tags.',
      },
      {
        key: 'typeahead',
        name: 'Typeahead',
        desc: 'Typeahead provides an autocomplete search input that suggests results as the user types. It supports async data sources and custom rendering.',
      },
    ],
  },
  {
    label: 'Inputs',
    items: [
      {
        key: 'segmentedcontrol',
        name: 'SegmentedControl',
        desc: 'SegmentedControl lets users toggle between a small set of mutually exclusive options displayed as connected segments. It works like a visual radio group.',
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
    tagline: string;
    description: string;
    whenToUse: string[];
    whenNotToUse: string[];
    anatomy: {element: string; required: string; description: string}[];
  }
> = {
  button: {
    tagline: 'Trigger actions and navigate',
    description:
      'Buttons communicate the action that will occur when the user touches them. They can be placed in dialogs, forms, cards, and toolbars. The primary variant is used for the most important action on a page, while secondary and ghost variants provide visual hierarchy.',
    whenToUse: [
      'To trigger an action such as submitting a form or opening a dialog',
      'As a call-to-action in marketing or onboarding surfaces',
      'In toolbars and action bars for contextual operations',
    ],
    whenNotToUse: [
      'For navigation to another page; use Link instead',
      'To toggle a state on/off — use ToggleButton or Switch instead',
      'When the action is part of a menu — use DropdownMenu instead',
    ],
    anatomy: [
      {
        element: 'Root',
        required: 'Yes',
        description:
          'The outer <button> element that handles click events and focus state',
      },
      {
        element: 'Label',
        required: 'Yes',
        description: 'Text content describing the action the button performs',
      },
      {
        element: 'Icon',
        required: 'No',
        description:
          'Optional leading or trailing icon for visual reinforcement',
      },
      {
        element: 'Spinner',
        required: 'No',
        description:
          'Shown when the button is in a loading state, replaces the icon slot',
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

function getComponentDesc(key: string): string {
  for (const cat of COMPONENT_CATEGORIES) {
    const item = cat.items.find(i => i.key === key);
    if (item) {
      return item.desc;
    }
  }
  return '';
}

function getComponentDocs(key: string) {
  if (COMPONENT_DOCS[key]) {
    return COMPONENT_DOCS[key];
  }
  const name = getComponentName(key);
  const desc = getComponentDesc(key);
  return {
    tagline: desc.split('.')[0] + '.',
    description: desc,
    whenToUse: [
      `Use ${name} when you need the functionality it provides`,
      'Integrate it into forms, pages, or panels as appropriate',
    ],
    whenNotToUse: [
      'When a simpler alternative achieves the same goal',
      'If the use case falls outside the intended scope of this component',
    ],
    anatomy: [
      {
        element: 'Root',
        required: 'Yes',
        description: `The outermost container element for ${name}`,
      },
      {
        element: 'Content',
        required: 'Yes',
        description: 'The primary content area',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DocumentationPage() {
  const [activeNav, setActiveNav] = useState('button');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );

  const COMPONENT_PREVIEWS: Record<string, React.ReactNode> = {
    button: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Variants</Heading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
            marginBottom: 32,
          }}>
          <Button label="Primary" variant="primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
        </div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Sizes</Heading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap' as const,
          }}>
          <Button label="Small" variant="primary" size="sm" />
          <Button label="Medium" variant="primary" size="md" />
          <Button label="Large" variant="primary" size="lg" />
        </div>
      </div>
    ),
    avatar: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Sizes</Heading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap' as const,
          }}>
          <Avatar name="Alice" size="small" />
          <Avatar name="Bob" size="medium" />
          <Avatar name="Charlie" size="large" />
        </div>
      </div>
    ),
    badge: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Variants</Heading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
          }}>
          <Badge label="Default" />
          <Badge label="Info" variant="info" />
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error" variant="error" />
        </div>
      </div>
    ),
    card: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Card</Heading>
        </div>
        <div style={{maxWidth: 400}}>
          <Card>
            <div style={{padding: 16}}>
              <Heading level={4}>Card Title</Heading>
              <div style={{marginTop: 8}}>
                <Text type="body" color="secondary">
                  Cards are containers for grouping related content and actions.
                  They provide a flexible surface for displaying information.
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    banner: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Status Variants</Heading>
        </div>
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 12}}>
          <Banner status="info" title="Information">
            <Text type="body">
              This is an informational banner message.
            </Text>
          </Banner>
          <Banner status="success" title="Success">
            <Text type="body">Operation completed successfully.</Text>
          </Banner>
          <Banner status="warning" title="Warning">
            <Text type="body">Please review before continuing.</Text>
          </Banner>
        </div>
      </div>
    ),
    dialog: <DialogPreview />,
    text: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Typography Scale</Heading>
        </div>
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 12}}>
          <Text type="display-1">Display 1</Text>
          <Text type="display-2">Display 2</Text>
          <Text type="display-3">Display 3</Text>
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Heading level={4}>Heading 4</Heading>
          <Text type="body">Body text</Text>
          <Text type="supporting">Supporting text</Text>
        </div>
      </div>
    ),
    divider: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Divider</Heading>
        </div>
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 24}}>
          <div>
            <Text type="supporting" color="secondary">
              Subtle (default)
            </Text>
            <div style={{marginTop: 8}}>
              <Divider />
            </div>
          </div>
          <div>
            <Text type="supporting" color="secondary">
              Strong
            </Text>
            <div style={{marginTop: 8}}>
              <Divider variant="strong" />
            </div>
          </div>
          <div>
            <Text type="supporting" color="secondary">
              With label
            </Text>
            <div style={{marginTop: 8}}>
              <Divider label="Section" />
            </div>
          </div>
        </div>
      </div>
    ),
    token: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Tokens</Heading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap' as const,
          }}>
          <Token label="Design" />
          <Token label="Engineering" />
          <Token label="Product" />
          <Token label="Research" />
        </div>
      </div>
    ),
    tooltip: (
      <div>
        <div style={{marginBottom: 16}}>
          <Heading level={3}>Tooltip</Heading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
          }}>
          <Tooltip content="Primary action">
            <Button label="Hover me" variant="primary" />
          </Tooltip>
          <Tooltip content="Secondary action">
            <Button label="Or me" variant="secondary" />
          </Tooltip>
          <Tooltip content="Ghost action">
            <Button label="Or me" variant="ghost" />
          </Tooltip>
        </div>
      </div>
    ),
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column' as const,
          backgroundColor: 'var(--color-background-surface, #ffffff)',
          overflow: 'hidden',
        }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 24px 8px',
            flexShrink: 0,
          }}>
          <span style={{fontWeight: 700, fontSize: 18}}>Astryx</span>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            padding: '0 16px 16px 16px',
          }}>
          <List density="balanced">
            <ListItem
              label="Overview"
              isSelected={selectedComponent === null}
              onClick={() => {
                setSelectedComponent(null);
              }}
            />
            <ListItem label="Getting started" onClick={() => {}} />
            <ListItem label="Quick start" onClick={() => {}} />
          </List>

          {COMPONENT_CATEGORIES.map(category => (
            <div key={category.label}>
              <SectionLabel label={category.label.toUpperCase()} />
              <List density="balanced">
                {category.items.map(item => (
                  <ListItem
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
              </List>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '32px 40px',
        }}>
        {selectedComponent === null ? (
          /* ============ OVERVIEW ============ */
          <div style={{maxWidth: 1200, margin: '0 auto'}}>
            {/* Hero banner */}
            <div
              style={{
                marginBottom: 48,
                backgroundColor:
                  'var(--color-background-accent-muted, #e3f2fd)',
                borderRadius: 24,
                padding: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 48,
                overflow: 'hidden',
                minHeight: 320,
              }}>
              <div style={{flex: 1, minWidth: 0}}>
                <Text type="supporting" color="secondary">
                  Astryx Design System
                </Text>
                <div style={{marginTop: 8}}>
                  <Text type="display-1">Web overview</Text>
                </div>
                <div style={{marginTop: 16}}>
                  <Text type="large" color="secondary">
                    Astryx Web React is an open-source UI library created by the
                    Astryx Design Team to help developers quickly build beautiful,
                    accessible products.
                  </Text>
                </div>
                <div style={{marginTop: 24}}>
                  <Button
                    label="Get started"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setSelectedComponent('button');
                      setActiveNav('button');
                    }}
                  />
                </div>
              </div>
              <div style={{flex: 1}} />
            </div>

            {/* Category sections */}
            {COMPONENT_CATEGORIES.map(category => (
              <div key={category.label} style={{marginBottom: 64}}>
                <div style={{marginBottom: 16}}>
                  <Text type="display-2">{category.label}</Text>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 32,
                  }}>
                  {category.items.map(item => (
                    <div
                      key={item.key}
                      onClick={() => {
                        setSelectedComponent(item.key);
                        setActiveNav(item.key);
                      }}
                      style={{cursor: 'pointer'}}>
                      <Card
                        variant="muted"
                        padding={0}
                        minHeight={160}
                        xstyle={localStyles.previewCard}
                      />
                      <div style={{paddingTop: 12}}>
                        <Text type="body" style={{fontWeight: 700}}>
                          {item.name}
                        </Text>
                        <Text type="body" color="secondary">
                          {item.desc}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ============ COMPONENT DETAIL ============ */
          <div style={{maxWidth: 840, margin: '0 auto'}}>
            {/* Header */}
            <div style={{marginBottom: 8}}>
              <Text type="display-1">{getComponentName(activeNav)}</Text>
            </div>
            <div style={{marginBottom: 32}}>
              <Text type="supporting" color="secondary">
                March 30, 2026 · Updated 5:40 p.m. PST
              </Text>
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
                <Text type="supporting" weight="semibold" color="secondary">
                  Live preview
                </Text>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <Button
                    label="Open in Craft"
                    variant="ghost"
                    size="sm"
                    icon={<ExternalLinkIcon />}
                  />
                  <DropdownMenu
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
                  <Button
                    label="Toggle theme"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<SunIcon />}
                  />
                  <Button
                    label="Fullscreen"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<MaximizeIcon />}
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
                  <Text type="supporting" color="secondary">
                    Preview coming soon
                  </Text>
                )}
              </div>
            </div>

            {/* Description */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <Heading level={3}>{docs.tagline}</Heading>
                  <div style={{marginTop: 12}}>
                    <Text type="body">{docs.description}</Text>
                  </div>
                  <div style={{marginTop: 24}}>
                    <Heading level={4}>When to use</Heading>
                    <div style={{marginTop: 8}}>
                      <List density="compact" listStyle="disc">
                        {docs.whenToUse.map((item, i) => (
                          <ListItem key={i} label={item} />
                        ))}
                      </List>
                    </div>
                  </div>
                  <div style={{marginTop: 24}}>
                    <Heading level={4}>When NOT to use</Heading>
                    <div style={{marginTop: 8}}>
                      <List density="compact" listStyle="disc">
                        {docs.whenNotToUse.map((item, i) => (
                          <ListItem key={i} label={item} />
                        ))}
                      </List>
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
                  <Heading level={2}>Anatomy</Heading>
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
                    <Text type="supporting" color="secondary">
                      Anatomy diagram
                    </Text>
                  </div>
                  <div style={{marginTop: 16}}>
                    <Text type="body">
                      The {getComponentName(activeNav)} is composed of the
                      following elements. Required elements must always be
                      present, while optional elements can be included as
                      needed.
                    </Text>
                  </div>
                  <div style={{marginTop: 16}}>
                    <Table
                      data={docs.anatomy as Record<string, unknown>[]}
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
      </main>
    </div>
  );
}
