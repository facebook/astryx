'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSDivider} from '@xds/core/Divider';
import {
  colorVars,
  textSizeVars,
  fontWeightVars,
  spacingVars,
} from '@xds/core/theme/tokens.stylex';
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
const SORT_OPTIONS = ['Name (A\u2013Z)', 'Name (Z\u2013A)', 'Category'];
const TYPE_OPTIONS = ['All types', 'Component', 'Pattern', 'Utility'];

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

// Standard page padding — 24px on all sides for both header and content.
const PAGE_PAD = spacingVars['--spacing-6'];

const styles = stylex.create({
  page: {
    width: '100%',
    minHeight: '100%',
  },
  // Full-width header. paddingBottom is kept so the tab negative-margin
  // pulls the tabs down to sit exactly on the bottom border line.
  pageHeader: {
    paddingInline: PAGE_PAD,
    paddingTop: PAGE_PAD,
    paddingBottom: PAGE_PAD,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  pageTitle: {
    marginBottom: spacingVars['--spacing-4'],
  },
  // Negative margin = -(paddingBottom + 1px border) pulls tabs onto the border.
  tabsRow: {
    marginBottom: `calc(${PAGE_PAD} * -1 - 1px)`,
  },
  pageContent: {
    paddingInline: PAGE_PAD,
    paddingTop: PAGE_PAD,
    paddingBottom: PAGE_PAD,
  },
  filterBar: {
    paddingBottom: spacingVars['--spacing-4'],
  },
  filterSearch: {
    flex: 1,
    minWidth: 0,
  },
  filterSelectors: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
  },
  selectorWrapper: {
    width: 160,
  },
  dividerRow: {
    paddingTop: spacingVars['--spacing-6'],
    paddingBottom: spacingVars['--spacing-6'],
  },
  sectionHeader: {
    paddingBottom: spacingVars['--spacing-3'],
  },
  cardInner: {
    padding: `${spacingVars['--spacing-4']} ${spacingVars['--spacing-5']} ${spacingVars['--spacing-5']}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1-5'],
    minHeight: 100,
  },
  typePill: {
    display: 'inline-block',
    fontSize: textSizeVars['--font-size-xs'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: colorVars['--color-text-secondary'],
    marginBottom: spacingVars['--spacing-0-5'],
  },
  itemName: {
    fontSize: textSizeVars['--font-size-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    lineHeight: 1.375,
  },
  itemDescription: {
    fontSize: textSizeVars['--font-size-sm'],
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.5,
    marginTop: spacingVars['--spacing-0-5'],
  },
  emptyState: {
    padding: spacingVars['--spacing-12'],
    textAlign: 'center',
  },
});

function LibraryCard({item}: {item: LibraryItem}) {
  return (
    <XDSCard>
      <div {...stylex.props(styles.cardInner)}>
        <span {...stylex.props(styles.typePill)}>{item.type}</span>
        <span {...stylex.props(styles.itemName)}>{item.name}</span>
        <span {...stylex.props(styles.itemDescription)}>
          {item.description}
        </span>
      </div>
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
    <div>
      <div {...stylex.props(styles.sectionHeader)}>
        <XDSHeading level={3}>{category}</XDSHeading>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}>
        {items.map(item => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Name (A\u2013Z)');
  const [typeFilter, setTypeFilter] = useState('All types');

  const filtered = useMemo(() => {
    let items =
      activeTab === 'All' ? ITEMS : ITEMS.filter(i => i.category === activeTab);
    if (typeFilter !== 'All types')
      items = items.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    if (sortBy === 'Name (A\u2013Z)')
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Name (Z\u2013A)')
      items = [...items].sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === 'Category')
      items = [...items].sort((a, b) => a.category.localeCompare(b.category));
    return items;
  }, [activeTab, search, sortBy, typeFilter]);

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
      <div {...stylex.props(styles.page)}>
        {/* Page header */}
        <header {...stylex.props(styles.pageHeader)}>
          <div {...stylex.props(styles.pageTitle)}>
            <XDSHeading level={1}>Library</XDSHeading>
          </div>
          <div {...stylex.props(styles.tabsRow)}>
            <XDSTabList value={activeTab} onChange={setActiveTab}>
              {CATEGORIES.map(cat => (
                <XDSTab key={cat} value={cat} label={cat} />
              ))}
            </XDSTabList>
          </div>
        </header>

        {/* Page content */}
        <section {...stylex.props(styles.pageContent)}>
          <div {...stylex.props(styles.filterBar)}>
            <XDSHStack gap={3} vAlign="center">
              <div {...stylex.props(styles.filterSearch)}>
                <XDSTextInput
                  label="Search"
                  isLabelHidden
                  placeholder="Search..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
              <div {...stylex.props(styles.filterSelectors)}>
                <div {...stylex.props(styles.selectorWrapper)}>
                  <XDSSelector
                    label="Type"
                    isLabelHidden
                    options={TYPE_OPTIONS}
                    value={typeFilter}
                    onChange={v => setTypeFilter(v as string)}
                  />
                </div>
                <div {...stylex.props(styles.selectorWrapper)}>
                  <XDSSelector
                    label="Sort by"
                    isLabelHidden
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={v => setSortBy(v as string)}
                  />
                </div>
              </div>
            </XDSHStack>
          </div>

          {filtered.length === 0 ? (
            <div {...stylex.props(styles.emptyState)}>
              <XDSText type="supporting" color="secondary">
                No results found.
              </XDSText>
            </div>
          ) : groupedSections != null ? (
            <div>
              {groupedSections.map((section, i) => (
                <div key={section.category}>
                  {i > 0 && (
                    <div {...stylex.props(styles.dividerRow)}>
                      <XDSDivider />
                    </div>
                  )}
                  <LibrarySection
                    category={section.category}
                    items={section.items}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 20,
              }}>
              {filtered.map(item => (
                <LibraryCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </XDSAppShell>
  );
}
