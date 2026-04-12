'use client';

import {useState} from 'react';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSCard} from '@xds/core/Card';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSDivider} from '@xds/core/Divider';
import {XDSEmptyState} from '@xds/core/EmptyState';
import DocTopNav from '../doc-nav/DocTopNav';

type Category = 'All' | 'Components' | 'Patterns' | 'Templates' | 'Tools';
const CATEGORIES: Category[] = [
  'All',
  'Components',
  'Patterns',
  'Templates',
  'Tools',
];

interface DiscoverItem {
  name: string;
  description: string;
  category: Category;
  author: string;
  downloads: string;
  tags: string[];
}

const ITEMS: DiscoverItem[] = [
  {
    name: 'DataTable',
    description:
      'Full-featured data table with sorting, filtering, pagination, and row selection.',
    category: 'Components',
    author: 'XDS Core',
    downloads: '12.4k',
    tags: ['table', 'data', 'filtering'],
  },
  {
    name: 'FormBuilder',
    description:
      'Declarative form composition with built-in validation and error handling.',
    category: 'Patterns',
    author: 'XDS Core',
    downloads: '8.2k',
    tags: ['form', 'validation', 'input'],
  },
  {
    name: 'Dashboard',
    description:
      'Pre-built dashboard template with sidebar nav, stats cards, and chart areas.',
    category: 'Templates',
    author: 'XDS Team',
    downloads: '6.7k',
    tags: ['dashboard', 'layout', 'analytics'],
  },
  {
    name: 'Theme Editor',
    description:
      'Visual editor for customizing and previewing XDS design tokens in real-time.',
    category: 'Tools',
    author: 'XDS Team',
    downloads: '3.1k',
    tags: ['theme', 'tokens', 'preview'],
  },
  {
    name: 'NavigationShell',
    description:
      'App shell with sidebar, top nav, breadcrumbs, and responsive collapse.',
    category: 'Components',
    author: 'XDS Core',
    downloads: '9.8k',
    tags: ['navigation', 'shell', 'layout'],
  },
  {
    name: 'CommandPalette',
    description:
      'Keyboard-driven command palette for quick actions and search.',
    category: 'Components',
    author: 'XDS Labs',
    downloads: '4.5k',
    tags: ['search', 'keyboard', 'shortcuts'],
  },
  {
    name: 'Auth Flow',
    description:
      'Complete authentication flow with login, registration, and password reset pages.',
    category: 'Templates',
    author: 'XDS Team',
    downloads: '5.3k',
    tags: ['auth', 'login', 'security'],
  },
  {
    name: 'CRUD Pattern',
    description:
      'Create-Read-Update-Delete pattern with modals, toasts, and confirmation dialogs.',
    category: 'Patterns',
    author: 'XDS Core',
    downloads: '7.1k',
    tags: ['crud', 'modal', 'data'],
  },
  {
    name: 'Vibe Tester',
    description:
      'AI-powered tool for testing component usage and validating design system adherence.',
    category: 'Tools',
    author: 'XDS Labs',
    downloads: '2.8k',
    tags: ['ai', 'testing', 'quality'],
  },
  {
    name: 'MegaMenu',
    description:
      'Full-width dropdown navigation menu with sections, icons, and featured content.',
    category: 'Components',
    author: 'XDS Core',
    downloads: '5.9k',
    tags: ['navigation', 'menu', 'dropdown'],
  },
  {
    name: 'Settings Page',
    description:
      'Settings template with tabbed sections, form fields, and save/cancel actions.',
    category: 'Templates',
    author: 'XDS Team',
    downloads: '4.0k',
    tags: ['settings', 'form', 'tabs'],
  },
  {
    name: 'Empty States',
    description:
      'Reusable empty state patterns with illustrations, CTAs, and guidance text.',
    category: 'Patterns',
    author: 'XDS Core',
    downloads: '3.6k',
    tags: ['empty', 'placeholder', 'onboarding'],
  },
];

const CATEGORY_BADGE_VARIANT: Record<
  string,
  'blue' | 'purple' | 'teal' | 'orange'
> = {
  Components: 'blue',
  Patterns: 'purple',
  Templates: 'teal',
  Tools: 'orange',
};

function ImagePlaceholder() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#b0b0b0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export default function DocDiscoverPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');

  const filtered = ITEMS.filter(item => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
      <DocTopNav />

      <div style={{maxWidth: 1280, margin: '0 auto', padding: '0 32px'}}>
        {/* Compact header: text left, search right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 40,
            paddingBottom: 24,
            gap: 32,
          }}>
          <XDSVStack gap={1}>
            <XDSHeading level={1}>Discover</XDSHeading>
            <XDSText type="body" color="secondary">
              Find components, patterns, templates, and tools for your next
              project.
            </XDSText>
          </XDSVStack>

          <div style={{width: 320, flexShrink: 0}}>
            <XDSTextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              value={search}
              onChange={setSearch}
              hasClear
            />
          </div>
        </div>

        {/* Category filter */}
        <div style={{paddingBottom: 24}}>
          <XDSSegmentedControl
            value={activeCategory}
            onChange={v => setActiveCategory(v as Category)}
            label="Filter by category">
            {CATEGORIES.map(cat => (
              <XDSSegmentedControlItem key={cat} value={cat} label={cat} />
            ))}
          </XDSSegmentedControl>
        </div>

        {/* Results count */}
        <div style={{paddingBottom: 16}}>
          <XDSText type="supporting" color="secondary">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </XDSText>
        </div>

        {/* Cards grid or empty state */}
        {filtered.length === 0 ? (
          <div style={{paddingTop: 40, paddingBottom: 80}}>
            <XDSEmptyState
              title="No results found"
              description="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              paddingBottom: 64,
            }}>
            {filtered.map(item => (
              <XDSCard key={item.name} padding={0}>
                <XDSVStack gap={0}>
                  {/* Placeholder image area */}
                  <div
                    style={{
                      height: 160,
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <ImagePlaceholder />
                  </div>

                  {/* Card body */}
                  <div style={{padding: 16}}>
                    <XDSVStack gap={3}>
                      {/* Name + category badge */}
                      <XDSHStack gap={2} vAlign="center">
                        <XDSText type="body" weight="bold">
                          {item.name}
                        </XDSText>
                        <XDSBadge
                          label={item.category}
                          variant={
                            CATEGORY_BADGE_VARIANT[item.category] ?? 'neutral'
                          }
                        />
                      </XDSHStack>

                      {/* Description */}
                      <XDSText type="supporting" color="secondary">
                        {item.description}
                      </XDSText>

                      {/* Tags */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}>
                        {item.tags.map(tag => (
                          <XDSBadge key={tag} label={tag} variant="neutral" />
                        ))}
                      </div>

                      {/* Divider */}
                      <XDSDivider />

                      {/* Footer: author + installs */}
                      <XDSHStack gap={2} vAlign="center" hAlign="between">
                        <XDSHStack gap={2} vAlign="center">
                          <XDSAvatar name={item.author} size="xsmall" />
                          <XDSText type="supporting" color="secondary">
                            {item.author}
                          </XDSText>
                        </XDSHStack>
                        <XDSText type="supporting" color="secondary">
                          {item.downloads} installs
                        </XDSText>
                      </XDSHStack>
                    </XDSVStack>
                  </div>
                </XDSVStack>
              </XDSCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
