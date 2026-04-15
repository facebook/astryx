'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSGrid} from '@xds/core/Grid';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavSection,
  XDSSideNavItem,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  HomeIcon,
  BookOpenIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
} from '@heroicons/react/24/solid';

interface LibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'Component' | 'Pattern' | 'Utility';
}

const CATEGORIES = ['All', 'Layout', 'Forms', 'Navigation', 'Feedback', 'Data'];

const ITEMS: LibraryItem[] = [
  {
    id: '1',
    name: 'Stack',
    description:
      'Vertical and horizontal stack layouts with configurable gap and alignment.',
    category: 'Layout',
    type: 'Component',
  },
  {
    id: '2',
    name: 'Grid',
    description:
      'Responsive grid container with auto-fit columns and gap control.',
    category: 'Layout',
    type: 'Component',
  },
  {
    id: '3',
    name: 'Card',
    description:
      'Surface container with optional padding, border, and shadow variants.',
    category: 'Layout',
    type: 'Component',
  },
  {
    id: '4',
    name: 'Center',
    description: 'Centers its child both horizontally and vertically.',
    category: 'Layout',
    type: 'Utility',
  },
  {
    id: '5',
    name: 'Section',
    description: 'Semantic page section with optional heading and divider.',
    category: 'Layout',
    type: 'Pattern',
  },
  {
    id: '6',
    name: 'Collapsible',
    description: 'Expandable region with animated height transition.',
    category: 'Layout',
    type: 'Component',
  },
  {
    id: '7',
    name: 'TextInput',
    description:
      'Single-line text field with label, placeholder, and validation states.',
    category: 'Forms',
    type: 'Component',
  },
  {
    id: '8',
    name: 'TextArea',
    description: 'Multi-line text field with auto-resize and character count.',
    category: 'Forms',
    type: 'Component',
  },
  {
    id: '9',
    name: 'CheckboxInput',
    description: 'Checkbox with label, indeterminate state, and group support.',
    category: 'Forms',
    type: 'Component',
  },
  {
    id: '10',
    name: 'RadioList',
    description: 'Group of radio buttons with accessible fieldset wrapper.',
    category: 'Forms',
    type: 'Component',
  },
  {
    id: '11',
    name: 'Switch',
    description: 'Toggle switch for binary on/off settings.',
    category: 'Forms',
    type: 'Component',
  },
  {
    id: '12',
    name: 'Selector',
    description:
      'Dropdown or inline option selector with single and multi-select modes.',
    category: 'Forms',
    type: 'Component',
  },
  {
    id: '13',
    name: 'TabList',
    description:
      'Horizontal tab navigation with underline indicator and keyboard support.',
    category: 'Navigation',
    type: 'Component',
  },
  {
    id: '14',
    name: 'TopNav',
    description: 'Application top bar with logo, nav links, and action slots.',
    category: 'Navigation',
    type: 'Pattern',
  },
  {
    id: '15',
    name: 'SideNav',
    description:
      'Vertical sidebar navigation with collapsible groups and active states.',
    category: 'Navigation',
    type: 'Pattern',
  },
  {
    id: '16',
    name: 'Breadcrumbs',
    description: 'Path trail navigation with separator and truncation support.',
    category: 'Navigation',
    type: 'Component',
  },
  {
    id: '17',
    name: 'Pagination',
    description:
      'Page navigation with prev/next controls and page count display.',
    category: 'Navigation',
    type: 'Component',
  },
  {
    id: '18',
    name: 'MobileNav',
    description:
      'Bottom tab bar for mobile viewports with icon and label slots.',
    category: 'Navigation',
    type: 'Pattern',
  },
  {
    id: '19',
    name: 'Badge',
    description:
      'Compact label for status, count, or category with semantic color variants.',
    category: 'Feedback',
    type: 'Component',
  },
  {
    id: '20',
    name: 'Banner',
    description:
      'Full-width alert bar for info, success, warning, and error messages.',
    category: 'Feedback',
    type: 'Component',
  },
  {
    id: '21',
    name: 'Spinner',
    description: 'Animated loading indicator with size and color variants.',
    category: 'Feedback',
    type: 'Component',
  },
  {
    id: '22',
    name: 'ProgressBar',
    description: 'Horizontal bar indicating task completion percentage.',
    category: 'Feedback',
    type: 'Component',
  },
  {
    id: '23',
    name: 'StatusDot',
    description:
      'Small dot indicator for presence, health, or pipeline status.',
    category: 'Feedback',
    type: 'Component',
  },
  {
    id: '24',
    name: 'Tooltip',
    description:
      'Contextual label that appears on hover with configurable placement.',
    category: 'Feedback',
    type: 'Component',
  },
  {
    id: '25',
    name: 'Table',
    description:
      'Feature-rich data table with sorting, selection, and column resizing.',
    category: 'Data',
    type: 'Component',
  },
  {
    id: '26',
    name: 'Avatar',
    description:
      'User profile image with fallback initials and status dot support.',
    category: 'Data',
    type: 'Component',
  },
  {
    id: '27',
    name: 'Skeleton',
    description:
      'Placeholder shimmer for loading states matching content shapes.',
    category: 'Data',
    type: 'Utility',
  },
  {
    id: '28',
    name: 'HoverCard',
    description: 'Rich popover that appears on hover with arbitrary content.',
    category: 'Data',
    type: 'Component',
  },
  {
    id: '29',
    name: 'PowerSearch',
    description:
      'Command-palette style search with grouped results and keyboard nav.',
    category: 'Data',
    type: 'Pattern',
  },
  {
    id: '30',
    name: 'Typeahead',
    description:
      'Autocomplete input with async suggestion loading and selection.',
    category: 'Data',
    type: 'Component',
  },
];

const styles = stylex.create({
  sectionTop: {
    paddingTop: spacingVars['--spacing-4'],
  },
  thumbnail: {
    backgroundColor: colorVars['--color-background-muted'],
    width: '100%',
  },
  cardBody: {
    padding: spacingVars['--spacing-4'],
  },
  emptyState: {
    padding: spacingVars['--spacing-12'],
    textAlign: 'center',
  },
  hideOnSmall: {
    display: {
      default: 'none',
      '@media (min-width: 840px)': 'block',
    },
  },
  hideOnLarge: {
    display: {
      default: 'block',
      '@media (min-width: 840px)': 'none',
    },
  },
});

// =============================================================================
// Side Nav
// =============================================================================

function LibraryNav() {
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon
              icon={<Squares2X2Icon style={{width: 16, height: 16}} />}
            />
          }
          heading="XDS Library"
          headingHref="/"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Home"
          href="/"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
        />
        <XDSSideNavItem
          label="Library"
          href="/templates/library/"
          icon={BookOpenIcon}
          selectedIcon={BookOpenIconSolid}
          isSelected
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Browse">
        <XDSSideNavItem
          label="Components"
          href="/components-patterns/"
          icon={Squares2X2Icon}
        />
        <XDSSideNavItem
          label="Templates"
          href="/templates/"
          icon={WrenchScrewdriverIcon}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

function LibraryCard({item}: {item: LibraryItem}) {
  return (
    <XDSCard padding={0}>
      <XDSAspectRatio ratio={21 / 9} xstyle={styles.thumbnail}>
        <div />
      </XDSAspectRatio>
      <XDSVStack gap={1} xstyle={styles.cardBody}>
        <XDSHeading level={3}>{item.name}</XDSHeading>
        <XDSText type="body" size="sm" color="secondary">
          {item.description}
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}

function LibrarySection({
  category,
  items,
}: {
  category: string;
  items: LibraryItem[];
}) {
  return (
    <XDSVStack gap={6}>
      <XDSHeading level={2}>{category}</XDSHeading>
      <XDSGrid minChildWidth={320} gap={4}>
        {items.map(item => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </XDSGrid>
    </XDSVStack>
  );
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z');

  const filtered = useMemo(() => {
    let items =
      activeTab === 'All' ? ITEMS : ITEMS.filter(i => i.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeTab, search]);

  const groupedSections = useMemo(() => {
    if (activeTab !== 'All') return null;
    const order = CATEGORIES.filter(c => c !== 'All');
    const map = new Map<string, LibraryItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return order
      .filter(cat => map.has(cat))
      .map(cat => ({category: cat, items: map.get(cat)!}));
  }, [activeTab, filtered]);

  return (
    <XDSAppShell sideNav={<LibraryNav />} contentPadding={0}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={6}>
            <XDSHeading level={1}>Library</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent padding={6}>
            <XDSVStack gap={6}>
              <XDSVStack gap={4}>
                <XDSTextInput
                  label="Search"
                  isLabelHidden
                  placeholder="Search..."
                  value={search}
                  onChange={setSearch}
                  startIcon={MagnifyingGlassIcon}
                  size="lg"
                />
                <XDSHStack vAlign="center" hAlign="between">
                  <div {...stylex.props(styles.hideOnSmall)}>
                    <XDSToggleButtonGroup
                      label="Filter by category"
                      value={activeTab}
                      onChange={v => setActiveTab(v ?? 'All')}>
                      {CATEGORIES.map(cat => (
                        <XDSToggleButton
                          key={cat}
                          label={cat}
                          value={cat}
                          size="lg"
                        />
                      ))}
                    </XDSToggleButtonGroup>
                  </div>
                  <div {...stylex.props(styles.hideOnLarge)}>
                    <XDSDropdownMenu
                      button={{label: activeTab, size: 'lg'}}
                      items={CATEGORIES.map(cat => ({
                        label: cat,
                        onClick: () => setActiveTab(cat),
                      }))}
                    />
                  </div>
                  <XDSDropdownMenu
                    button={{label: sortOrder, size: 'lg'}}
                    items={[
                      {label: 'A-Z', onClick: () => setSortOrder('A-Z')},
                      {label: 'Z-A', onClick: () => setSortOrder('Z-A')},
                      {label: 'Newest', onClick: () => setSortOrder('Newest')},
                    ]}
                  />
                </XDSHStack>
              </XDSVStack>

              {filtered.length === 0 ? (
                <div {...stylex.props(styles.emptyState)}>
                  <XDSText type="supporting" color="secondary">
                    No results found.
                  </XDSText>
                </div>
              ) : groupedSections != null ? (
                <XDSVStack gap={6}>
                  {groupedSections.flatMap(section => [
                    <XDSDivider key={`d-${section.category}`} />,
                    <LibrarySection
                      key={section.category}
                      category={section.category}
                      items={section.items}
                    />,
                  ])}
                </XDSVStack>
              ) : (
                <XDSGrid minChildWidth={320} gap={4} xstyle={styles.sectionTop}>
                  {filtered.map(item => (
                    <LibraryCard key={item.id} item={item} />
                  ))}
                </XDSGrid>
              )}
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
    </XDSAppShell>
  );
}
