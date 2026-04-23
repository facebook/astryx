'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {radiusVars} from '@xds/core/theme/tokens.stylex';

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
// Main component
// ---------------------------------------------------------------------------

export default function DocumentationOverviewPage() {
  return (
    <XDSAppShell
      variant="section"
      height="fill"
      sideNav={
        <XDSSideNav
          header={<XDSSideNavHeading heading="Product Name" />}>
          <XDSSideNavSection title="Navigation" isHeaderHidden>
            <XDSSideNavItem label="Home" isSelected />
            <XDSSideNavItem label="Getting started" />
          </XDSSideNavSection>

          {COMPONENT_CATEGORIES.map(category => (
            <XDSSideNavSection key={category.label} title={category.label}>
              {category.items.map(item => (
                <XDSSideNavItem key={item.key} label={item.name} />
              ))}
            </XDSSideNavSection>
          ))}
        </XDSSideNav>
      }>
      <XDSLayout contentWidth={1200} content={
        <XDSLayoutContent padding={8}>
          <XDSVStack gap={10}>
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
                      />
                    </XDSHStack>
                  </XDSVStack>
                </XDSStackItem>
                <XDSStackItem size="fill" />
              </XDSHStack>
            </XDSCard>

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
          </XDSVStack>
        </XDSLayoutContent>
      } />
    </XDSAppShell>
  );
}
