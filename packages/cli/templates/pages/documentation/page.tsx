'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSToken} from '@xds/core/Token';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHStack} from '@xds/core/Stack';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSTable, pixel} from '@xds/core/Table';
import {
  borderVars,
  colorVars,
  spacingVars,
} from '@xds/core/theme/tokens.stylex';

const cellStyles = stylex.create({
  wrap: {
    whiteSpace: 'normal',
  },
  tabListFlush: {
    marginLeft: `calc(-1 * ${spacingVars['--spacing-3']})`,
  },
  mutedCardBorder: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
  },
  dividerSpacing: {
    paddingBottom: spacingVars['--spacing-12'],
  },
  sectionSpacing: {
    marginBottom: spacingVars['--spacing-12'],
  },
  tabsContainer: {
    backgroundColor: colorVars['--color-background-muted'],
    borderTopWidth: borderVars['--border-width'],
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border'],
    paddingInline: spacingVars['--spacing-4'],
    paddingTop: spacingVars['--spacing-2'],
    paddingBottom: spacingVars['--spacing-4'],
  },
  tabContent: {
    paddingTop: spacingVars['--spacing-3'],
  },
  previewArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '280px',
    paddingBlock: spacingVars['--spacing-8'],
    paddingInline: spacingVars['--spacing-8'],
  },
  heroPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '360px',
  },
  cardHeader: {
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
  },
  narrowContent: {
    maxWidth: '640px',
    marginInline: 'auto',
  },
  wideContent: {
    maxWidth: '960px',
    marginInline: 'auto',
  },
  headerSpacing: {
    marginBottom: spacingVars['--spacing-2'],
  },
  subheaderSpacing: {
    marginBottom: spacingVars['--spacing-8'],
  },
  usageTextSpacing: {
    marginTop: spacingVars['--spacing-3'],
  },
  bestPracticesSpacing: {
    marginTop: spacingVars['--spacing-6'],
  },
  tableSpacing: {
    marginTop: spacingVars['--spacing-4'],
  },
  examplesTextSpacing: {
    marginTop: spacingVars['--spacing-2'],
  },
  exampleCardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-8'],
    marginTop: spacingVars['--spacing-6'],
  },
  flexGrow: {
    flexGrow: 1,
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

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="m6 9 6 6 6-6" />
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
      <XDSText type="supporting" weight="semibold" color="secondary">
        {label}
      </XDSText>
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
        <XDSHeading level={3}>Dialog</XDSHeading>
      </div>
      <XDSButton
        label="Open Dialog"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSDialogHeader title="Example Dialog" onOpenChange={setIsOpen} />
        <div style={{padding: 16}}>
          <XDSText type="body">
            This is an example dialog. Dialogs are used to require user action
            or display important information that needs acknowledgment.
          </XDSText>
        </div>
      </XDSDialog>
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
    usage: string;
    bestPractices: {type: 'do' | 'dont'; text: string}[];
    examples: {
      title: string;
      description: string;
      code: string;
    }[];
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
        code: `<XDSButton label="Flat" variant="ghost" />
<XDSButton label="Default" variant="secondary" />
<XDSButton label="Primary" variant="primary" />
<XDSButton label="Destructive" variant="destructive" />`,
      },
      {
        title: 'Default button with badge',
        description:
          'Buttons can include a badge to highlight new or updated actions.',
        code: `<XDSButton
  label="Button"
  variant="default"
/>`,
      },
    ],
  },
};

function getComponentName(key: string): string {
  for (const cat of COMPONENT_CATEGORIES) {
    const item = cat.items.find(i => i.key === key);
    if (item) return item.name;
  }
  return key;
}

function getComponentDesc(key: string): string {
  for (const cat of COMPONENT_CATEGORIES) {
    const item = cat.items.find(i => i.key === key);
    if (item) return item.desc;
  }
  return '';
}

function getComponentDocs(key: string) {
  if (COMPONENT_DOCS[key]) return COMPONENT_DOCS[key];
  const name = getComponentName(key);
  const desc = getComponentDesc(key);
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
// Main component
// ---------------------------------------------------------------------------

export default function DocumentationPage() {
  const [activeNav, setActiveNav] = useState('button');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );
  const [exampleTabs, setExampleTabs] = useState<Record<string, string>>({});

  const EXAMPLE_PREVIEWS: Record<string, React.ReactNode[]> = {
    button: [
      // Semantics
      <XDSHStack key="semantics" gap={3} vAlign="center">
        <XDSButton label="Flat" variant="ghost" />
        <XDSButton label="Default" variant="secondary" />
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Destructive" variant="destructive" />
      </XDSHStack>,
      // Default button with badge
      <XDSButton key="badge" label="Button" variant="secondary" />,
    ],
  };

  const COMPONENT_PREVIEWS: Record<string, React.ReactNode> = {
    button: (
      <XDSButton
        label="Button"
        variant="secondary"
        icon={<PlusIcon />}
        endContent={<XDSBadge label="New" variant="info" />}
      />
    ),
    avatar: <XDSAvatar name="Alice" size="medium" />,
    badge: <XDSBadge label="Success" variant="success" />,
    card: (
      <XDSCard>
        <div style={{padding: 16}}>
          <XDSHeading level={4}>Card Title</XDSHeading>
          <div style={{marginTop: 8}}>
            <XDSText type="body" color="secondary">
              Cards group related content and actions.
            </XDSText>
          </div>
        </div>
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

  return (
    <>
      <style>{`.code-block-full-width > pre { width: 100% !important; }`}</style>
      <div
        style={{
          display: 'flex',
          height: '100%',
          backgroundColor: 'var(--color-background-surface, #ffffff)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
        {/* LEFT SIDEBAR */}
        <aside
          style={{
            width: 240,
            minWidth: 240,
            height: '100%',
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
            <XDSHeading level={1}>Product Name</XDSHeading>
          </div>

          {/* Nav */}
          <nav
            style={{
              flex: 1,
              overflowY: 'auto' as const,
              padding: '0 16px 16px 16px',
            }}>
            <XDSList density="balanced">
              <XDSListItem
                label="Overview"
                isSelected={selectedComponent === null}
                onClick={() => {
                  setSelectedComponent(null);
                }}
              />
              <XDSListItem
                label="Getting started"
                isSelected={
                  activeNav === 'getting-started' && selectedComponent !== null
                }
                onClick={() => {
                  setSelectedComponent('getting-started');
                  setActiveNav('getting-started');
                }}
              />
            </XDSList>

            {COMPONENT_CATEGORIES.map(category => (
              <div key={category.label}>
                <SectionLabel label={category.label.toUpperCase()} />
                <XDSList density="balanced">
                  {category.items.map(item => (
                    <XDSListItem
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
                </XDSList>
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
                  <XDSText type="supporting" color="secondary">
                    Product Name Design System
                  </XDSText>
                  <div style={{marginTop: 8}}>
                    <XDSText type="display-1">Web overview</XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSText type="large" color="secondary">
                      An open-source UI library to help developers quickly build
                      beautiful, accessible products.
                    </XDSText>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSButton
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
                    <XDSText type="display-2">{category.label}</XDSText>
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
                        <XDSCard
                          padding={0}
                          style={{
                            border: 'none',
                            boxShadow: 'none',
                            outline: 'none',
                          }}>
                          {/* Preview area */}
                          <div
                            style={{
                              height: 160,
                              backgroundColor:
                                'var(--color-background-muted, #c4cdd5)',
                              borderRadius: 12,
                            }}
                          />
                          {/* Card body */}
                          <div style={{padding: '12px 0 0'}}>
                            <XDSText type="body" style={{fontWeight: 700}}>
                              {item.name}
                            </XDSText>
                            <div style={{marginTop: 0}}>
                              <XDSText type="body" color="secondary">
                                {item.desc}
                              </XDSText>
                            </div>
                          </div>
                        </XDSCard>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : activeNav === 'getting-started' ? (
            /* ============ GETTING STARTED ============ */
            <div
              style={{
                display: 'flex',
                gap: 48,
                maxWidth: 740,
                margin: '0 auto',
              }}>
              {/* Article content */}
              <div style={{flex: 1, minWidth: 0}}>
                {/* Header */}
                <div style={{marginBottom: 8}}>
                  <XDSText type="display-1">
                    Getting started with Product Name
                  </XDSText>
                </div>
                <div style={{marginBottom: 16}}>
                  <XDSText type="supporting" color="secondary">
                    Last updated March 30, 2026
                  </XDSText>
                </div>
                <div style={{marginBottom: 32}}>
                  <XDSText type="body">
                    Install the package, configure your theme, and build your
                    first component in three steps.
                  </XDSText>
                </div>

                {/* AI Assistance prompt card */}
                <div style={{marginBottom: 48}}>
                  <XDSCard>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                        }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                          <SparklesIcon
                            width={16}
                            height={16}
                            style={{
                              color: 'var(--color-text-secondary, #666)',
                            }}
                          />
                          <XDSText type="body" weight="semibold">
                            AI Assistance
                          </XDSText>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                          <XDSButton
                            label="Copy prompt"
                            variant="ghost"
                            size="sm"
                            icon={<CopyIcon />}
                            onClick={() => {
                              void navigator.clipboard.writeText(
                                'Help me get set up with Product Name. Based on my project, do the following: 1. Install @xds/core and the StyleX compiler. 2. Wrap my app in XDSThemeProvider. 3. Replace one existing component with an XDS equivalent. After setup, suggest relevant next steps based on my project.',
                              );
                            }}
                          />
                          <XDSDropdownMenu
                            button={{
                              label: '',
                              variant: 'ghost',
                              size: 'sm',
                              isIconOnly: true,
                              icon: <ChevronDownIcon />,
                            }}
                            items={[
                              {label: 'Open in v0', onClick: () => {}},
                              {label: 'Open in Claude', onClick: () => {}},
                              {label: 'Open in ChatGPT', onClick: () => {}},
                              {label: 'Open in Cursor', onClick: () => {}},
                            ]}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          overflow: 'hidden',
                          maxHeight: '2.8em',
                          lineHeight: '1.4em',
                        }}>
                        <XDSText type="body" color="secondary">
                          Help me get set up with Product Name. Based on my
                          project, do the following: 1. Install @xds/core and
                          the StyleX compiler. 2. Wrap my app in
                          XDSThemeProvider. 3. Replace one existing component
                          with an XDS equivalent. After setup, suggest relevant
                          next steps based on my project.
                        </XDSText>
                      </div>
                    </div>
                  </XDSCard>
                </div>

                {/* Prerequisites */}
                <div id="prerequisites" style={{marginBottom: 48}}>
                  <XDSHeading level={2}>Prerequisites</XDSHeading>
                  <div style={{marginTop: 16}}>
                    <XDSList density="compact" listStyle="disc">
                      <XDSListItem label="Node.js 18+" />
                      <XDSListItem label="React 18 or 19" />
                      <XDSListItem label="A package manager (npm, yarn, or pnpm)" />
                    </XDSList>
                  </div>
                </div>

                <XDSDivider />

                {/* Install the package */}
                <div
                  id="install-the-package"
                  style={{marginBottom: 48, marginTop: 48}}>
                  <XDSHeading level={2}>Install the package</XDSHeading>
                  <div style={{marginTop: 12}}>
                    <XDSText type="body">
                      Every project starts with installing the core package.
                      This gives you access to all components, tokens, and
                      utilities.
                    </XDSText>
                  </div>

                  {/* Step 1 */}
                  <div style={{marginTop: 32, display: 'flex', gap: 16}}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border:
                          '1.5px solid var(--color-divider, rgba(0,0,0,0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                      1
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <XDSText type="body" weight="bold">
                        Install the core package
                      </XDSText>
                      <XDSCard
                        padding={0}
                        style={{marginTop: 12, overflow: 'hidden'}}>
                        <div style={{width: '100%'}}>
                          <XDSCodeBlock
                            code="npm install @xds/core"
                            language="bash"
                          />
                        </div>
                      </XDSCard>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{marginTop: 28, display: 'flex', gap: 16}}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border:
                          '1.5px solid var(--color-divider, rgba(0,0,0,0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                      2
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <XDSText type="body" weight="bold">
                        Add the StyleX compiler
                      </XDSText>
                      <div style={{marginTop: 8}}>
                        <XDSText type="body" color="secondary">
                          XDS uses StyleX for styling. Add the compiler plugin
                          to your build configuration.
                        </XDSText>
                      </div>
                      <XDSCard
                        padding={0}
                        style={{marginTop: 12, overflow: 'hidden'}}>
                        <div style={{width: '100%'}}>
                          <XDSCodeBlock
                            code="npm install @stylexjs/babel-plugin"
                            language="bash"
                          />
                        </div>
                      </XDSCard>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{marginTop: 28, display: 'flex', gap: 16}}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border:
                          '1.5px solid var(--color-divider, rgba(0,0,0,0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                      3
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <XDSText type="body" weight="bold">
                        Import your first component
                      </XDSText>
                      <XDSCard
                        padding={0}
                        style={{marginTop: 12, overflow: 'hidden'}}>
                        <div style={{width: '100%'}}>
                          <XDSCodeBlock
                            code={`import { XDSButton } from '@xds/core/Button';

export default function App() {
  return <XDSButton label="Hello XDS" variant="primary" />;
}`}
                            language="tsx"
                          />
                        </div>
                      </XDSCard>
                    </div>
                  </div>
                </div>

                <XDSDivider />

                {/* Configure theming */}
                <div
                  id="configure-theming"
                  style={{marginBottom: 48, marginTop: 48}}>
                  <XDSHeading level={2}>Configure theming</XDSHeading>
                  <div style={{marginTop: 12}}>
                    <XDSText type="body">
                      XDS ships with a default theme that works out of the box.
                      To customize colors, typography, and spacing, wrap your
                      app in a theme provider.
                    </XDSText>
                  </div>
                  <XDSCard
                    padding={0}
                    style={{marginTop: 16, overflow: 'hidden'}}>
                    <div style={{width: '100%'}}>
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
                    </div>
                  </XDSCard>
                  <div style={{marginTop: 16}}>
                    <XDSText type="body" color="secondary">
                      See the theming guide for the full list of customizable
                      tokens.
                    </XDSText>
                  </div>
                </div>

                <XDSDivider />

                {/* Next steps */}
                <div id="next-steps" style={{marginBottom: 48}}>
                  <XDSHeading level={2}>Next steps</XDSHeading>
                  <div style={{marginTop: 16}}>
                    <XDSList density="compact" listStyle="disc">
                      <XDSListItem
                        label={
                          <span>
                            <span
                              style={{
                                color: 'var(--color-text-link, #0070f3)',
                                fontWeight: 600,
                              }}>
                              Fundamental concepts
                            </span>
                            {' — How theming, layout, and composition work'}
                          </span>
                        }
                      />
                      <XDSListItem
                        label={
                          <span>
                            <span
                              style={{
                                color: 'var(--color-text-link, #0070f3)',
                                fontWeight: 600,
                              }}>
                              Component API reference
                            </span>
                            {
                              ' — Props, variants, and examples for every component'
                            }
                          </span>
                        }
                      />
                      <XDSListItem
                        label={
                          <span>
                            <span
                              style={{
                                color: 'var(--color-text-link, #0070f3)',
                                fontWeight: 600,
                              }}>
                              Accessibility
                            </span>
                            {' — Built-in a11y features and ARIA patterns'}
                          </span>
                        }
                      />
                      <XDSListItem
                        label={
                          <span>
                            <span
                              style={{
                                color: 'var(--color-text-link, #0070f3)',
                                fontWeight: 600,
                              }}>
                              CLI tools
                            </span>
                            {' — Scaffold projects and manage templates'}
                          </span>
                        }
                      />
                      <XDSListItem
                        label={
                          <span>
                            <span
                              style={{
                                color: 'var(--color-text-link, #0070f3)',
                                fontWeight: 600,
                              }}>
                              Design tokens
                            </span>
                            {' — Colors, spacing, typography, and sizing'}
                          </span>
                        }
                      />
                    </XDSList>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============ COMPONENT DETAIL ============ */
            <div {...stylex.props(cellStyles.wideContent)}>
              {/* Header */}
              <div
                {...stylex.props(
                  cellStyles.narrowContent,
                  cellStyles.headerSpacing,
                )}>
                <XDSText type="display-1">
                  {getComponentName(activeNav)}
                </XDSText>
              </div>
              <div
                {...stylex.props(
                  cellStyles.narrowContent,
                  cellStyles.subheaderSpacing,
                )}>
                <XDSText type="supporting" color="secondary">
                  March 30, 2026 · Updated 5:40 p.m. PST
                </XDSText>
              </div>

              <div {...stylex.props(cellStyles.dividerSpacing)}>
                <XDSDivider />
              </div>

              {/* Live Preview Card */}
              <XDSCard
                variant="muted"
                padding={0}
                xstyle={cellStyles.mutedCardBorder}>
                {/* Preview */}
                <div {...stylex.props(cellStyles.heroPreview)}>
                  {COMPONENT_PREVIEWS[activeNav] ?? (
                    <XDSText type="supporting" color="secondary">
                      Preview coming soon
                    </XDSText>
                  )}
                </div>
              </XDSCard>
              <div {...stylex.props(cellStyles.sectionSpacing)} />

              {/* Usage & Best Practices */}
              {(() => {
                const docs = getComponentDocs(activeNav);
                return (
                  <>
                    <div
                      {...stylex.props(
                        cellStyles.narrowContent,
                        cellStyles.sectionSpacing,
                      )}>
                      <XDSHeading level={2}>Usage</XDSHeading>
                      <div {...stylex.props(cellStyles.usageTextSpacing)}>
                        <XDSText type="large" weight="normal">
                          {docs.usage}
                        </XDSText>
                      </div>
                      <div {...stylex.props(cellStyles.bestPracticesSpacing)}>
                        <XDSHeading level={3}>Best practices</XDSHeading>
                      </div>
                      <div {...stylex.props(cellStyles.tableSpacing)}>
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
                                  variant={
                                    item.type === 'do' ? 'success' : 'error'
                                  }
                                />
                              ),
                            },
                            {
                              key: 'text',
                              header: 'Practices',
                              renderCell: (item: Record<string, unknown>) => (
                                <XDSText type="body" xstyle={cellStyles.wrap}>
                                  {item.text as string}
                                </XDSText>
                              ),
                            },
                          ]}
                          density="spacious"
                          dividers="rows"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}

              <div {...stylex.props(cellStyles.dividerSpacing)}>
                <XDSDivider />
              </div>

              {/* Examples */}
              {(() => {
                const docs = getComponentDocs(activeNav);
                const previews = EXAMPLE_PREVIEWS[activeNav] ?? [];
                return (
                  <div {...stylex.props(cellStyles.sectionSpacing)}>
                    <div {...stylex.props(cellStyles.narrowContent)}>
                      <XDSHeading level={2}>Examples</XDSHeading>
                      <div {...stylex.props(cellStyles.examplesTextSpacing)}>
                        <XDSText type="large" weight="normal">
                          Explore common configurations, variations, and states
                          for this component.
                        </XDSText>
                      </div>
                    </div>
                    <div {...stylex.props(cellStyles.exampleCardsContainer)}>
                      {docs.examples.map((example, i) => {
                        const tabKey = `${activeNav}-${i}`;
                        const activeTab = exampleTabs[tabKey] ?? 'description';
                        return (
                          <XDSCard key={i} padding={0}>
                            {/* Header */}
                            <div {...stylex.props(cellStyles.cardHeader)}>
                              <XDSHStack gap={3} vAlign="center">
                                <div {...stylex.props(cellStyles.flexGrow)}>
                                  <XDSText type="body" weight="medium">
                                    {example.title}
                                  </XDSText>
                                </div>
                                <XDSHStack gap={1} vAlign="center">
                                  <XDSButton
                                    label="Open in Craft"
                                    variant="ghost"
                                    size="sm"
                                    icon={<ExternalLinkIcon />}
                                  />
                                  <XDSButton
                                    label="Send to CLI"
                                    variant="ghost"
                                    size="sm"
                                  />
                                  <XDSButton
                                    label="Fullscreen"
                                    variant="ghost"
                                    size="sm"
                                    isIconOnly
                                    icon={<MaximizeIcon />}
                                  />
                                </XDSHStack>
                              </XDSHStack>
                            </div>
                            {/* Preview */}
                            <div {...stylex.props(cellStyles.previewArea)}>
                              {previews[i] ?? (
                                <XDSText type="supporting" color="secondary">
                                  Preview coming soon
                                </XDSText>
                              )}
                            </div>
                            {/* Tabs + content */}
                            <div {...stylex.props(cellStyles.tabsContainer)}>
                              <XDSTabList
                                value={activeTab}
                                onChange={value =>
                                  setExampleTabs(prev => ({
                                    ...prev,
                                    [tabKey]: value,
                                  }))
                                }
                                size="sm"
                                xstyle={cellStyles.tabListFlush}>
                                <XDSTab
                                  value="description"
                                  label="Description"
                                />
                                <XDSTab value="code" label="Code" />
                              </XDSTabList>
                              <div {...stylex.props(cellStyles.tabContent)}>
                                {activeTab === 'description' ? (
                                  <XDSText type="body">
                                    {example.description}
                                  </XDSText>
                                ) : (
                                  <XDSCodeBlock
                                    code={example.code}
                                    language="tsx"
                                  />
                                )}
                              </div>
                            </div>
                          </XDSCard>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
