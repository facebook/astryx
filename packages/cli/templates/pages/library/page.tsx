// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSCenter} from '@xds/core/Center';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

interface LibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'Component' | 'Pattern' | 'Utility';
  imageUrl?: string;
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
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-home-horizontal-1.png',
  },
  {
    id: '2',
    name: 'Grid',
    description:
      'Responsive grid container with auto-fit columns and gap control.',
    category: 'Layout',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-3.jpg',
  },
  {
    id: '3',
    name: 'Card',
    description:
      'Surface container with optional padding, border, and shadow variants.',
    category: 'Layout',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-2.png',
  },
  {
    id: '4',
    name: 'Center',
    description: 'Centers its child both horizontally and vertically.',
    category: 'Layout',
    type: 'Utility',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-scene-horizontal-1.png',
  },
  {
    id: '5',
    name: 'Section',
    description: 'Semantic page section with optional heading and divider.',
    category: 'Layout',
    type: 'Pattern',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-2.png',
  },
  {
    id: '6',
    name: 'Collapsible',
    description: 'Expandable region with animated height transition.',
    category: 'Layout',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png',
  },
  {
    id: '7',
    name: 'TextInput',
    description:
      'Single-line text field with label, placeholder, and validation states.',
    category: 'Forms',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-working-horizontal-1.png',
  },
  {
    id: '8',
    name: 'TextArea',
    description: 'Multi-line text field with auto-resize and character count.',
    category: 'Forms',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-working-horizontal-3.png',
  },
  {
    id: '9',
    name: 'CheckboxInput',
    description: 'Checkbox with label, indeterminate state, and group support.',
    category: 'Forms',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
  },
  {
    id: '10',
    name: 'RadioList',
    description: 'Group of radio buttons with accessible fieldset wrapper.',
    category: 'Forms',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
  },
  {
    id: '11',
    name: 'Switch',
    description: 'Toggle switch for binary on/off settings.',
    category: 'Forms',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-home-horizontal-2.png',
  },
  {
    id: '12',
    name: 'Selector',
    description:
      'Dropdown or inline option selector with single and multi-select modes.',
    category: 'Forms',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-product-1.png',
  },
  {
    id: '13',
    name: 'TabList',
    description:
      'Horizontal tab navigation with underline indicator and keyboard support.',
    category: 'Navigation',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-5.jpg',
  },
  {
    id: '14',
    name: 'TopNav',
    description: 'Application top bar with logo, nav links, and action slots.',
    category: 'Navigation',
    type: 'Pattern',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-1.png',
  },
  {
    id: '15',
    name: 'SideNav',
    description:
      'Vertical sidebar navigation with collapsible groups and active states.',
    category: 'Navigation',
    type: 'Pattern',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-lifestyle-horizontal-1.png',
  },
  {
    id: '16',
    name: 'Breadcrumbs',
    description: 'Path trail navigation with separator and truncation support.',
    category: 'Navigation',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-home-horizontal-2.png',
  },
  {
    id: '17',
    name: 'Pagination',
    description:
      'Page navigation with prev/next controls and page count display.',
    category: 'Navigation',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-working-horizontal-1.png',
  },
  {
    id: '18',
    name: 'MobileNav',
    description:
      'Bottom tab bar for mobile viewports with icon and label slots.',
    category: 'Navigation',
    type: 'Pattern',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-3.png',
  },
  {
    id: '19',
    name: 'Badge',
    description:
      'Compact label for status, count, or category with semantic color variants.',
    category: 'Feedback',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-working-horizontal-2.png',
  },
  {
    id: '20',
    name: 'Banner',
    description:
      'Full-width alert bar for info, success, warning, and error messages.',
    category: 'Feedback',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-2.jpg',
  },
  {
    id: '21',
    name: 'Spinner',
    description: 'Animated loading indicator with size and color variants.',
    category: 'Feedback',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-1.png',
  },
  {
    id: '22',
    name: 'ProgressBar',
    description: 'Horizontal bar indicating task completion percentage.',
    category: 'Feedback',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-horizontal-1.png',
  },
  {
    id: '23',
    name: 'StatusDot',
    description:
      'Small dot indicator for presence, health, or pipeline status.',
    category: 'Feedback',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-home-horizontal-1.png',
  },
  {
    id: '24',
    name: 'Tooltip',
    description:
      'Contextual label that appears on hover with configurable placement.',
    category: 'Feedback',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-working-horizontal-2.png',
  },
  {
    id: '25',
    name: 'Table',
    description:
      'Feature-rich data table with sorting, selection, and column resizing.',
    category: 'Data',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-4.jpg',
  },
  {
    id: '26',
    name: 'Avatar',
    description:
      'User profile image with fallback initials and status dot support.',
    category: 'Data',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-4.png',
  },
  {
    id: '27',
    name: 'Skeleton',
    description:
      'Placeholder shimmer for loading states matching content shapes.',
    category: 'Data',
    type: 'Utility',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-lifestyle-horizontal-2.png',
  },
  {
    id: '28',
    name: 'HoverCard',
    description: 'Rich popover that appears on hover with arbitrary content.',
    category: 'Data',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-scene-horizontal-2.png',
  },
  {
    id: '29',
    name: 'PowerSearch',
    description:
      'Command-palette style search with grouped results and keyboard nav.',
    category: 'Data',
    type: 'Pattern',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/colorful-product-2.png',
  },
  {
    id: '30',
    name: 'Typeahead',
    description:
      'Autocomplete input with async suggestion loading and selection.',
    category: 'Data',
    type: 'Component',
    imageUrl:
      'https://lookaside.facebook.com/assets/xds_oss/moody-working-horizontal-3.png',
  },
];

const styles = stylex.create({
  thumbnailWrapper: {
    position: 'relative',
    aspectRatio: '16/9',
    overflow: 'clip',
    flexShrink: 0,
  },
  thumbnailImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

// =============================================================================
// Side Nav
// =============================================================================

function LibraryCard({item}: {item: LibraryItem}) {
  return (
    <XDSCard padding={0}>
      <div {...stylex.props(styles.thumbnailWrapper)}>
        <img
          src={item.imageUrl}
          alt={item.name}
          {...stylex.props(styles.thumbnailImage)}
        />
      </div>
      <XDSSection variant="transparent" padding={4}>
        <XDSVStack gap={1}>
          <XDSHeading level={3}>{item.name}</XDSHeading>
          <XDSText type="body" size="sm" color="secondary">
            {item.description}
          </XDSText>
        </XDSVStack>
      </XDSSection>
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
      <XDSGrid columns={{minWidth: 320}} gap={4}>
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
    const sorted = [...items];
    if (sortOrder === 'A-Z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'Z-A') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === 'Newest') {
      sorted.sort((a, b) => Number(b.id) - Number(a.id));
    }
    return sorted;
  }, [activeTab, search, sortOrder]);

  const groupedSections = useMemo(() => {
    if (activeTab !== 'All') {
      return null;
    }
    const order = CATEGORIES.filter(c => c !== 'All');
    const map = new Map<string, LibraryItem[]>();
    for (const item of filtered) {
      let group = map.get(item.category);
      if (!group) {
        group = [];
        map.set(item.category, group);
      }
      group.push(item);
    }
    return order
      .filter(cat => map.has(cat))
      .map(cat => ({category: cat, items: map.get(cat) ?? []}));
  }, [activeTab, filtered]);

  return (
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
              <XDSHStack vAlign="center" gap={4}>
                <XDSStackItem size="fill">
                  <XDSVStack>
                    <XDSToggleButtonGroup
                      label="Filter by category"
                      value={activeTab}
                      onChange={v => setActiveTab(v ?? 'All')}>
                      <XDSOverflowList
                        gap={1}
                        behavior="observeParent"
                        overflowRenderer={overflowItems => (
                          <XDSDropdownMenu
                            button={{
                              label: `+${overflowItems.length}`,
                              variant: 'ghost',
                              size: 'lg',
                            }}
                            items={overflowItems.map(({index}) => ({
                              label: CATEGORIES[index],
                              onClick: () => setActiveTab(CATEGORIES[index]),
                            }))}
                          />
                        )}>
                        {CATEGORIES.map(cat => (
                          <XDSToggleButton
                            key={cat}
                            label={cat}
                            value={cat}
                            size="lg"
                          />
                        ))}
                      </XDSOverflowList>
                    </XDSToggleButtonGroup>
                  </XDSVStack>
                </XDSStackItem>
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
              <XDSCenter>
                <XDSText type="supporting" color="secondary">
                  No results found.
                </XDSText>
              </XDSCenter>
            ) : (
              <XDSVStack gap={6}>
                {(
                  groupedSections ?? [{category: activeTab, items: filtered}]
                ).flatMap(section => [
                  <XDSDivider key={`d-${section.category}`} />,
                  <LibrarySection
                    key={section.category}
                    category={section.category}
                    items={section.items}
                  />,
                ])}
              </XDSVStack>
            )}
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
