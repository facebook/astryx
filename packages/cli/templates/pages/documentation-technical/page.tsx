'use client';

import {useState, useMemo} from 'react';
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
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSToken} from '@xds/core/Token';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
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
// DialogPreview
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
      {key: 'appshell', name: 'AppShell', desc: 'Foundational page layout with header, sidebar, and content regions.'},
      {key: 'avatar', name: 'Avatar', desc: 'Represents a person or entity with an image, initials, or icon.'},
      {key: 'badge', name: 'Badge', desc: 'Small counts or status labels attached to icons, buttons, or list items.'},
      {key: 'banner', name: 'Banner', desc: 'Important, non-modal messages at the top of a page or section.'},
      {key: 'button', name: 'Button', desc: 'Buttons let people take action in forms, dialogs, and toolbars.'},
      {key: 'card', name: 'Card', desc: 'Cards group related content and actions in a contained surface.'},
      {key: 'dialog', name: 'Dialog', desc: 'Modal overlays that require user attention or action before continuing.'},
      {key: 'dropdownmenu', name: 'DropdownMenu', desc: 'List of actions or options in a floating overlay triggered by a button.'},
      {key: 'icon', name: 'Icon', desc: 'Small visual symbols that represent actions, objects, or concepts.'},
      {key: 'link', name: 'Link', desc: 'Navigation between pages or to external resources with visual affordance.'},
      {key: 'list', name: 'List', desc: 'Vertical set of related items with selection, icons, and metadata.'},
      {key: 'popover', name: 'Popover', desc: 'Rich content in a floating panel anchored to a trigger element.'},
      {key: 'table', name: 'Table', desc: 'Structured data in rows and columns with sorting, selection, and custom cells.'},
      {key: 'token', name: 'Token', desc: 'Compact metadata labels such as tags, categories, or filters.'},
      {key: 'tooltip', name: 'Tooltip', desc: 'Concise helper text when users hover over or focus an element.'},
    ],
  },
  {
    label: 'Layout',
    items: [
      {key: 'stack', name: 'Stack', desc: 'Arranges children in a row or column with consistent gap spacing.'},
      {key: 'grid', name: 'Grid', desc: 'CSS grid-based layout container with configurable columns and gap.'},
      {key: 'divider', name: 'Divider', desc: 'Separates content into distinct sections with a subtle line.'},
      {key: 'section', name: 'Section', desc: 'Wraps content with consistent vertical spacing and optional heading.'},
      {key: 'center', name: 'Center', desc: 'Centers its child horizontally and vertically within available space.'},
    ],
  },
  {
    label: 'Navigation',
    items: [
      {key: 'sidenav', name: 'SideNav', desc: 'Vertical navigation panel with links, sections, and collapsible groups.'},
      {key: 'topnav', name: 'TopNav', desc: 'App-level navigation bar with branding, links, and user actions.'},
      {key: 'tablist', name: 'TabList', desc: 'Switches between content views using a horizontal row of tabs.'},
      {key: 'breadcrumbs', name: 'Breadcrumbs', desc: "Shows user's current location within a navigation hierarchy."},
    ],
  },
  {
    label: 'Form',
    items: [
      {key: 'textinput', name: 'TextInput', desc: 'Single-line text field for names, emails, and search queries.'},
      {key: 'selector', name: 'Selector', desc: 'Pick a single item from a dropdown list with search and grouping.'},
      {key: 'switch', name: 'Switch', desc: 'Toggles a setting between on and off states with immediate effect.'},
      {key: 'checkboxinput', name: 'CheckboxInput', desc: 'Single checkbox with a label for boolean opt-in choices.'},
      {key: 'radiolist', name: 'RadioList', desc: 'Group of mutually exclusive options for settings and preferences.'},
      {key: 'slider', name: 'Slider', desc: 'Select a value or range by dragging a handle along a track.'},
    ],
  },
];

const COMPONENT_DOCS: Record<
  string,
  {
    usage: string;
    bestPractices: {type: 'do' | 'dont'; text: string}[];
    props: {name: string; type: string; default: string; description: string}[];
    examples: {title: string; description: string; code: string}[];
  }
> = {
  button: {
    usage:
      'Buttons provide visual cues for actions and events. These fundamental components allow users to commit actions and navigate a page flow. Use a Button when a user needs to submit a form, start a new task or action, or trigger a new UI element to appear on the page.',
    bestPractices: [
      {type: 'do', text: 'Convey clear action hierarchy: Each surface should only have 1 primary button.'},
      {type: 'do', text: 'Promote clarity: Consider labels alongside icons where appropriate.'},
      {type: 'dont', text: 'Overuse primary buttons: Overusing colored buttons creates visual confusion.'},
      {type: 'dont', text: 'Use a button for navigation: Use Link instead for page transitions.'},
    ],
    props: [
      {name: 'label', type: 'string', default: '—', description: 'Accessible label text for the button.'},
      {name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'destructive'", default: "'secondary'", description: 'Visual style variant.'},
      {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the button.'},
      {name: 'icon', type: 'ReactNode', default: '—', description: 'Icon element displayed before the label.'},
      {name: 'isIconOnly', type: 'boolean', default: 'false', description: 'Render only the icon, hiding the label visually.'},
      {name: 'isDisabled', type: 'boolean', default: 'false', description: 'Prevents interaction and dims the button.'},
      {name: 'isLoading', type: 'boolean', default: 'false', description: 'Shows a spinner and disables interaction.'},
      {name: 'onClick', type: '() => void', default: '—', description: 'Callback fired when the button is clicked.'},
    ],
    examples: [
      {
        title: 'Variants',
        description: 'Four semantic button types: ghost, secondary, primary, and destructive.',
        code: `<XDSButton label="Ghost" variant="ghost" />
<XDSButton label="Secondary" variant="secondary" />
<XDSButton label="Primary" variant="primary" />
<XDSButton label="Destructive" variant="destructive" />`,
      },
      {
        title: 'With icon',
        description: 'Buttons can include a leading icon for visual reinforcement.',
        code: `<XDSButton
  label="Add item"
  variant="primary"
  icon={<PlusIcon />}
/>`,
      },
      {
        title: 'Icon only',
        description: 'Icon-only buttons for compact toolbars. Always provide a label for accessibility.',
        code: `<XDSButton
  label="Settings"
  variant="ghost"
  icon={<CogIcon />}
  isIconOnly
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
      {type: 'do' as const, text: `Use ${name} in the appropriate context to provide the described functionality.`},
      {type: 'do' as const, text: `Pair ${name} with related components to create cohesive, accessible interfaces.`},
      {type: 'dont' as const, text: `Use ${name} when a simpler alternative achieves the same goal with less complexity.`},
    ],
    props: [
      {name: 'label', type: 'string', default: '—', description: `Accessible label for the ${name} component.`},
      {name: 'children', type: 'ReactNode', default: '—', description: `Content rendered inside the ${name}.`},
      {name: 'className', type: 'string', default: '—', description: 'Additional CSS class name.'},
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
// Sub-views
// ---------------------------------------------------------------------------

function ComponentDetailView({activeNav}: {activeNav: string}) {
  const [exampleTabs, setExampleTabs] = useState<Record<string, string>>({});

  const EXAMPLE_PREVIEWS: Record<string, React.ReactNode[]> = {
    button: [
      <XDSHStack key="variants" gap={3} vAlign="center">
        <XDSButton label="Ghost" variant="ghost" />
        <XDSButton label="Secondary" variant="secondary" />
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Destructive" variant="destructive" />
      </XDSHStack>,
      <XDSButton key="icon" label="Add item" variant="primary" icon={<XDSIcon icon={PlusIcon} />} />,
      <XDSButton key="icononly" label="Settings" variant="ghost" icon={<XDSIcon icon={PlusIcon} />} isIconOnly />,
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
          <XDSText type="body" color="secondary">Cards group related content and actions.</XDSText>
        </XDSVStack>
      </XDSCard>
    ),
    banner: (
      <XDSBanner status="info" title="Information">
        <XDSText type="body">This is an informational banner message.</XDSText>
      </XDSBanner>
    ),
    dialog: <DialogPreview />,
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
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          {/* Header */}
          <XDSVStack gap={2}>
            <XDSText type="display-1">{getComponentName(activeNav)}</XDSText>
            <XDSText type="supporting" color="secondary">
              March 30, 2026 · Updated 5:40 p.m. PST
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* Live Preview */}
          <XDSCard variant="muted" padding={0}>
            <XDSCenter height={360}>
              {COMPONENT_PREVIEWS[activeNav] ?? (
                <XDSText type="supporting" color="secondary">Preview coming soon</XDSText>
              )}
            </XDSCenter>
          </XDSCard>

          {/* Usage & Best Practices */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Usage</XDSHeading>
            <XDSText type="large" weight="normal">{docs.usage}</XDSText>
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
                    <XDSText type="body" textWrap="wrap">{item.text as string}</XDSText>
                  ),
                },
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>

          <XDSDivider />

          {/* Props table */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Props</XDSHeading>
            <XDSText type="body" color="secondary">
              All available props for the {getComponentName(activeNav)} component.
            </XDSText>
            <XDSTable
              data={docs.props as Record<string, unknown>[]}
              columns={[
                {key: 'name', header: 'Prop', width: pixel(140), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="body" weight="bold" style={{fontFamily: 'monospace', fontSize: 13}}>{item.name as string}</XDSText>
                )},
                {key: 'type', header: 'Type', width: pixel(200), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 12}}>{item.type as string}</XDSText>
                )},
                {key: 'default', header: 'Default', width: pixel(100), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" color="secondary" style={{fontFamily: 'monospace', fontSize: 12}}>{item.default as string}</XDSText>
                )},
                {key: 'description', header: 'Description'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>

          <XDSDivider />

          {/* Examples */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Examples</XDSHeading>
            <XDSText type="large" weight="normal">
              Explore common configurations, variations, and states.
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
                        <XDSText type="body" weight="medium">{example.title}</XDSText>
                      </XDSStackItem>
                      <XDSHStack gap={1} vAlign="center">
                        <XDSButton
                          label="Open in Craft"
                          variant="ghost"
                          size="sm"
                          icon={<XDSIcon icon={ArrowTopRightOnSquareIcon} />}
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
                      <XDSText type="supporting" color="secondary">Preview coming soon</XDSText>
                    )}
                  </XDSCenter>
                  <XDSSection variant="wash" padding={3} dividers={['top']}>
                    <XDSVStack gap={3}>
                      <XDSTabList
                        value={activeTab}
                        onChange={value => setExampleTabs(prev => ({...prev, [tabKey]: value}))}
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
    } />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TechnicalDocumentationPage() {
  const [activePage, setActivePage] = useState<string>('button');

  return (
    <XDSAppShell
      variant="section"
      height="fill"
      sideNav={
        <XDSSideNav
          header={<XDSSideNavHeading heading="API Reference" />}>
          {COMPONENT_CATEGORIES.map(category => (
            <XDSSideNavSection key={category.label} title={category.label}>
              {category.items.map(item => (
                <XDSSideNavItem
                  key={item.key}
                  label={item.name}
                  isSelected={activePage === item.key}
                  onClick={() => setActivePage(item.key)}
                />
              ))}
            </XDSSideNavSection>
          ))}
        </XDSSideNav>
      }>
      <ComponentDetailView activeNav={activePage} />
    </XDSAppShell>
  );
}
