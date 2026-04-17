'use client';

import {useState, useMemo, useCallback} from 'react';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSGrid} from '@xds/core/Grid';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSCard} from '@xds/core/Card';
import {XDSSelector} from '@xds/core/Selector';
import {XDSToken} from '@xds/core/Token';
import {XDSTable, pixel, proportional, useXDSTableSortable, useXDSTableSortableState} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {
  PROFILE_CRAFT_ITEMS,
  PROFILE_USED_ITEMS,
  PROFILE_LIKED_ITEMS,
  PROFILE_COLLECTIONS,
  THEME_PICKER_ENTRIES,
} from './constants';
import {SearchIcon, BookmarkFilledIcon, FolderIcon} from './docsite-icons';
import {AppTopNav} from './AppTopNav';
import {
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'neutral' | 'error'> = {
  Published: 'success',
  'In Review': 'blue',
  Draft: 'neutral',
  'Needs Fixes': 'error',
};

const TYPE_VARIANT: Record<string, 'blue' | 'purple' | 'teal'> = {
  Template: 'blue',
  Theme: 'purple',
  Component: 'teal',
};

type CraftItem = (typeof PROFILE_CRAFT_ITEMS)[number] & Record<string, unknown>;

function makeCraftColumns(
  onPreview: (item: CraftItem) => void,
): XDSTableColumn<CraftItem>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      width: proportional(3, {minWidth: 200}),
      renderCell: (item) => (
        <XDSHStack
          gap={3}
          vAlign="center"
          style={{cursor: 'pointer'}}
          onClick={() => onPreview(item)}>
          <div
            style={{
              width: 80,
              height: 52,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: 'var(--color-background-muted, #f0f0f0)',
            }}>
            <img
              src={item.img}
              alt=""
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
            />
          </div>
          <XDSVStack gap={0}>
            <XDSText type="body" style={{fontWeight: 600}}>{item.name}</XDSText>
            <XDSText type="supporting" color="secondary">{item.type}</XDSText>
          </XDSVStack>
        </XDSHStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(120),
      sortable: true,
      renderCell: (item) => (
        <XDSBadge label={item.status} variant={STATUS_VARIANT[item.status]} />
      ),
    },
    {
      key: 'views',
      header: 'Views',
      width: pixel(100),
      align: 'end',
      sortable: true,
      renderCell: (item) => (
        <XDSText type="body" color="secondary">{item.views.toLocaleString()}</XDSText>
      ),
    },
    {
      key: 'used',
      header: 'Uses',
      width: pixel(80),
      align: 'end',
      sortable: true,
      renderCell: (item) => (
        <XDSText type="body" color="secondary">{item.used.toLocaleString()}</XDSText>
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Updated',
      width: pixel(100),
      sortable: true,
      renderCell: (item) => (
        <XDSText type="body" color="secondary">{timeAgo(item.lastUpdated)}</XDSText>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: pixel(48),
      renderCell: (item) => (
        <div style={{position: 'relative'}}>
          <XDSDropdownMenu
            button={{
              label: 'Actions',
              variant: 'ghost',
              size: 'sm',
              isIconOnly: true,
              icon: <EllipsisHorizontalIcon style={{width: 18, height: 18}} />,
            }}
            hasChevron={false}
            items={[
              {label: 'Edit', icon: PencilIcon, onClick: () => {}},
              {label: 'Duplicate', icon: DocumentDuplicateIcon, onClick: () => {}},
              {
                label: item.status === 'Published' ? 'Unpublish' : 'Publish',
                icon: ArrowUpTrayIcon,
                onClick: () => {},
              },
              {type: 'divider' as const},
              {label: 'Delete', icon: TrashIcon, onClick: () => {}},
            ]}
          />
        </div>
      ),
    },
  ];
}

type UsedItem = (typeof PROFILE_USED_ITEMS)[number] & Record<string, unknown>;

function makeUsedColumns(
  onPreviewTemplate: (item: UsedItem) => void,
  onOpenDocs: () => void,
): XDSTableColumn<UsedItem>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      width: proportional(3, {minWidth: 200}),
      renderCell: (item) => (
        <XDSHStack
          gap={3}
          vAlign="center"
          style={{cursor: 'pointer'}}
          onClick={() => {
            if (item.type === 'Component') {
              onOpenDocs();
            } else {
              onPreviewTemplate(item);
            }
          }}>
          <div
            style={{
              width: 80,
              height: 52,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: 'var(--color-background-muted, #f0f0f0)',
            }}>
            <img
              src={item.img}
              alt=""
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
            />
          </div>
          <XDSVStack gap={0.5} style={{minWidth: 0}}>
            <XDSText type="body" style={{fontWeight: 600}}>{item.name}</XDSText>
            <XDSText
              type="supporting"
              color="secondary"
              style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {item.description}
            </XDSText>
          </XDSVStack>
        </XDSHStack>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: pixel(120),
      sortable: true,
      renderCell: (item) => (
        <XDSBadge label={item.type} variant={TYPE_VARIANT[item.type]} />
      ),
    },
    {
      key: 'usageCount',
      header: 'Times Used',
      width: pixel(100),
      align: 'end',
      sortable: true,
      renderCell: (item) => (
        <XDSText type="body" color="secondary">{item.usageCount}</XDSText>
      ),
    },
    {
      key: 'lastUsed',
      header: 'Last Used',
      width: pixel(100),
      sortable: true,
      renderCell: (item) => (
        <XDSText type="body" color="secondary">{timeAgo(item.lastUsed)}</XDSText>
      ),
    },
  ];
}

function BookmarkCard({
  item,
  index,
  onRemove,
}: {
  item: (typeof PROFILE_LIKED_ITEMS)[number];
  index: number;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        animation: `craftCardFadeIn 400ms ${index * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
      }}>
      <XDSCard padding={0}>
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}>
          <img
            src={item.img}
            alt={item.name}
            style={{
              display: 'block',
              width: '100%',
              aspectRatio: '1920 / 1205',
              objectFit: 'cover',
              objectPosition: 'top',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-overlay, rgba(0,0,0,0.5))',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 300ms ease',
            }}>
            {/* Top-right: remove bookmark */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
              }}
              onClick={e => e.stopPropagation()}>
              <XDSButton
                label="Remove bookmark"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={
                  <BookmarkFilledIcon style={{width: 16, height: 16}} />
                }
                style={{color: '#fff'}}
                onClick={onRemove}
              />
            </div>
            {/* Bottom: info + actions */}
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}>
              <XDSVStack gap={0}>
                <XDSHeading level={3} style={{color: '#fff'}}>
                  {item.name}
                </XDSHeading>
                <XDSText
                  type="supporting"
                  style={{color: 'rgba(255,255,255,0.7)'}}>
                  {item.type} · Bookmarked {timeAgo(item.bookmarkedAt)}
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={2} style={{flexShrink: 0}}>
                <XDSButton
                  label="Use"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={() => {}}
                />
                <XDSButton
                  label="Craft"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={() => {}}
                />
              </XDSHStack>
            </div>
          </div>
        </div>
      </XDSCard>
    </div>
  );
}

export function DialogPreview() {
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

const PROFILE_TABS = ['Crafted', 'Used', 'Bookmarks'] as const;

const CRAFT_TYPE_OPTIONS = [
  {value: 'all', label: 'All types'},
  {value: 'Template', label: 'Template'},
  {value: 'Theme', label: 'Theme'},
  {value: 'Component', label: 'Component'},
];

const CRAFT_STATUS_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'Published', label: 'Published'},
  {value: 'In Review', label: 'In Review'},
  {value: 'Needs Fixes', label: 'Needs Fixes'},
  {value: 'Draft', label: 'Draft'},
];

const CRAFT_SORT_OPTIONS = [
  {value: 'recent', label: 'Most recent'},
  {value: 'views', label: 'Most views'},
  {value: 'uses', label: 'Most used'},
];

const USED_SORT_OPTIONS = [
  {value: 'recent', label: 'Last used'},
  {value: 'frequency', label: 'Most used'},
  {value: 'name', label: 'Name'},
];

export function ProfileView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (v: 'craft' | 'explore' | 'docs' | 'profile') => void;
}) {
  const [activeTab, setActiveTab] =
    useState<(typeof PROFILE_TABS)[number]>('Crafted');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [sendTo, setSendTo] = useState('clipboard');

  // Crafted tab state
  const [craftTypeFilter, setCraftTypeFilter] = useState('all');
  const [craftStatusFilter, setCraftStatusFilter] = useState('all');
  const [craftSort, setCraftSort] = useState('recent');
  const [previewItem, setPreviewItem] = useState<CraftItem | null>(null);

  const handlePreview = useCallback((item: CraftItem) => {
    setPreviewItem(item);
  }, []);

  const craftColumns = useMemo(
    () => makeCraftColumns(handlePreview),
    [handlePreview],
  );

  // Crafted table sorting
  const craftSortState = useXDSTableSortableState({
    data: [] as CraftItem[],
    defaultSort: [{sortKey: 'lastUpdated', direction: 'descending'}],
    comparators: {
      views: (a, b) => (a as CraftItem).views - (b as CraftItem).views,
      used: (a, b) => (a as CraftItem).used - (b as CraftItem).used,
      lastUpdated: (a, b) =>
        new Date((a as CraftItem).lastUpdated).getTime() - new Date((b as CraftItem).lastUpdated).getTime(),
    },
  });
  const craftSortPlugin = useXDSTableSortable(craftSortState.sortConfig);

  // Used tab state
  const [usedSearch, setUsedSearch] = useState('');
  const [usedSort, setUsedSort] = useState('recent');
  const [usedTypeFilter, setUsedTypeFilter] = useState('all');
  const [previewUsedItem, setPreviewUsedItem] = useState<UsedItem | null>(null);

  const handlePreviewUsed = useCallback((item: UsedItem) => {
    setPreviewUsedItem(item);
  }, []);

  const usedColumns = useMemo(
    () => makeUsedColumns(handlePreviewUsed, () => setActiveView('docs')),
    [handlePreviewUsed, setActiveView],
  );

  // Used table sorting
  const usedSortState = useXDSTableSortableState({
    data: [] as UsedItem[],
    defaultSort: [{sortKey: 'lastUsed', direction: 'descending'}],
    comparators: {
      usageCount: (a, b) => (a as UsedItem).usageCount - (b as UsedItem).usageCount,
      lastUsed: (a, b) =>
        new Date((a as UsedItem).lastUsed).getTime() - new Date((b as UsedItem).lastUsed).getTime(),
    },
  });
  const usedSortPlugin = useXDSTableSortable(usedSortState.sortConfig);

  // Bookmarks tab state
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [removedBookmarks, setRemovedBookmarks] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedCollection, setSelectedCollection] = useState<
    (typeof PROFILE_COLLECTIONS)[number] | null
  >(null);

  const filteredCrafts = useMemo(() => {
    let items = [...PROFILE_CRAFT_ITEMS];
    if (craftTypeFilter !== 'all') {
      items = items.filter(i => i.type === craftTypeFilter);
    }
    if (craftStatusFilter !== 'all') {
      items = items.filter(i => i.status === craftStatusFilter);
    }
    items.sort((a, b) => {
      if (craftSort === 'views') return b.views - a.views;
      if (craftSort === 'uses') return b.used - a.used;
      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    });
    return items;
  }, [craftTypeFilter, craftStatusFilter, craftSort]);

  const filteredUsed = useMemo(() => {
    let items = [...PROFILE_USED_ITEMS];
    if (usedTypeFilter !== 'all') {
      items = items.filter(i => i.type === usedTypeFilter);
    }
    if (usedSearch) {
      const q = usedSearch.toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    items.sort((a, b) => {
      if (usedSort === 'frequency') return b.usageCount - a.usageCount;
      if (usedSort === 'name') return a.name.localeCompare(b.name);
      return (
        new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      );
    });
    return items;
  }, [usedSearch, usedSort, usedTypeFilter]);

  const filteredBookmarks = useMemo(() => {
    let items = PROFILE_LIKED_ITEMS.filter(
      i => !removedBookmarks.has(i.name),
    );
    if (bookmarkSearch) {
      const q = bookmarkSearch.toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [bookmarkSearch, removedBookmarks]);

  const collectionItems = useMemo(() => {
    if (!selectedCollection) return [];
    const itemNames = new Set(selectedCollection.items);
    return PROFILE_LIKED_ITEMS.filter(
      i => itemNames.has(i.name) && !removedBookmarks.has(i.name),
    );
  }, [selectedCollection, removedBookmarks]);


  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
      }}>
      <AppTopNav
        activeView={activeView}
        setActiveView={setActiveView}
        activeTab="all"
        onActiveTabChange={() => setActiveView('craft')}
      />
      <div
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '32px 24px 140px',
        }}>
        <style>{`
          @keyframes craftCardFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        <div style={{maxWidth: 1400, margin: '0 auto'}}>
          {/* Profile header with metrics */}
          <div style={{marginBottom: 32}}>
            <XDSHStack vAlign="center">
              <XDSText type="display-1">Your crafts</XDSText>
              <XDSStackItem size="fill" />
              <XDSButton
                label="Settings"
                variant="ghost"
                size="lg"
                isIconOnly
                icon={
                  <Cog6ToothIcon style={{width: 24, height: 24}} />
                }
                onClick={() => setIsSettingsOpen(true)}
              />
            </XDSHStack>
          </div>

          {/* Tab bar */}
          <XDSTabList
            value={activeTab}
            onChange={v => {
              setActiveTab(v as (typeof PROFILE_TABS)[number]);
              setSelectedCollection(null);
            }}
            hasDivider>
            {PROFILE_TABS.map(tab => (
              <XDSTab key={tab} value={tab} label={tab} />
            ))}
          </XDSTabList>

          {/* ===== CRAFTED TAB ===== */}
          {activeTab === 'Crafted' && (
            <>
              {/* Filter + sort + actions row */}
              <XDSHStack
                gap={2}
                vAlign="center"
                style={{marginTop: 16, marginBottom: 20}}>
                <XDSSelector
                  label="Type"
                  isLabelHidden
                  options={CRAFT_TYPE_OPTIONS}
                  value={craftTypeFilter}
                  onChange={setCraftTypeFilter}
                  size="md"
                />
                <XDSSelector
                  label="Status"
                  isLabelHidden
                  options={CRAFT_STATUS_OPTIONS}
                  value={craftStatusFilter}
                  onChange={setCraftStatusFilter}
                  size="md"
                />
                <XDSSelector
                  label="Sort"
                  isLabelHidden
                  options={CRAFT_SORT_OPTIONS}
                  value={craftSort}
                  onChange={setCraftSort}
                  size="md"
                />
                <XDSStackItem size="fill" />
                <XDSButton
                  label="Start crafting"
                  variant="primary"
                  size="md"
                  onClick={() => {}}
                />
              </XDSHStack>

              <XDSTable
                data={filteredCrafts as CraftItem[]}
                columns={craftColumns}
                idKey="name"
                hasHover
                plugins={{sort: craftSortPlugin}}
                emptyState={
                  <XDSEmptyState
                    title="No crafts yet"
                    description="Create your first template, theme, or component and publish it to the community."
                    actions={
                      <XDSButton
                        label="Start crafting"
                        variant="primary"
                        onClick={() => {}}
                      />
                    }
                  />
                }
              />
            </>
          )}

          {/* ===== USED TAB ===== */}
          {activeTab === 'Used' && (
            <>
              <XDSHStack
                gap={2}
                vAlign="center"
                style={{marginTop: 16, marginBottom: 20}}>
                <div style={{width: 280}}>
                  <XDSTextInput
                    label="Search"
                    isLabelHidden
                    placeholder="Search used items..."
                    value={usedSearch}
                    onChange={setUsedSearch}
                    size="md"
                    startIcon={SearchIcon}
                  />
                </div>
                <XDSSelector
                  label="Type"
                  isLabelHidden
                  options={CRAFT_TYPE_OPTIONS}
                  value={usedTypeFilter}
                  onChange={setUsedTypeFilter}
                  size="md"
                />
                <XDSSelector
                  label="Sort"
                  isLabelHidden
                  options={USED_SORT_OPTIONS}
                  value={usedSort}
                  onChange={setUsedSort}
                  size="md"
                />
                <XDSStackItem size="fill" />
              </XDSHStack>

              {filteredUsed.length === 0 ? (
                <div style={{marginTop: 48}}>
                  <XDSEmptyState
                    title={
                      usedSearch
                        ? 'No results found'
                        : "You haven't used anything yet"
                    }
                    description={
                      usedSearch
                        ? 'Try a different search term.'
                        : 'Browse the community and start using templates, themes, and components in your projects.'
                    }
                    actions={
                      !usedSearch ? (
                        <XDSButton
                          label="Explore"
                          variant="primary"
                          onClick={() => setActiveView('explore')}
                        />
                      ) : undefined
                    }
                  />
                </div>
              ) : (
                <XDSTable
                  data={filteredUsed as Array<(typeof filteredUsed)[number] & Record<string, unknown>>}
                  columns={usedColumns}
                  idKey="name"
                  hasHover
                  plugins={{sort: usedSortPlugin}}
                />
              )}
            </>
          )}

          {/* ===== BOOKMARKS TAB ===== */}
          {activeTab === 'Bookmarks' && (
            <>
              {selectedCollection ? (
                <>
                  {/* Collection detail view */}
                  <div style={{marginTop: 20, marginBottom: 24}}>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSButton
                        label="Back to bookmarks"
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        icon={<ArrowLeftIcon style={{width: 18, height: 18}} />}
                        onClick={() => setSelectedCollection(null)}
                      />
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: 'var(--color-background-muted, #f0f0f0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                        <FolderIcon
                          style={{
                            width: 16,
                            height: 16,
                            color: 'var(--color-text-secondary, #6b7280)',
                          }}
                        />
                      </div>
                      <XDSHeading level={3}>{selectedCollection.name}</XDSHeading>
                      <XDSText type="supporting" color="secondary">
                        {collectionItems.length}{' '}
                        {collectionItems.length === 1 ? 'item' : 'items'}
                      </XDSText>
                    </XDSHStack>
                  </div>

                  {collectionItems.length === 0 ? (
                    <div style={{marginTop: 48}}>
                      <XDSEmptyState
                        title="This collection is empty"
                        description="Bookmark items and add them to this collection."
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 16,
                      }}>
                      {collectionItems.map((item, i) => (
                        <BookmarkCard
                          key={item.name}
                          item={item}
                          index={i}
                          onRemove={() =>
                            setRemovedBookmarks(prev => {
                              const next = new Set(prev);
                              next.add(item.name);
                              return next;
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Collections */}
                  <div style={{marginTop: 20, marginBottom: 24}}>
                    <XDSText
                      type="supporting"
                      color="secondary"
                      style={{
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 12,
                        display: 'block',
                      }}>
                      Collections
                    </XDSText>
                    <XDSGrid minChildWidth={180} gap={3}>
                      {PROFILE_COLLECTIONS.map((col, i) => (
                        <div
                          key={col.name}
                          onClick={() => setSelectedCollection(col)}
                          style={{
                            cursor: 'pointer',
                            animation: `craftCardFadeIn 300ms ${i * 50}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                          }}>
                          <XDSCard padding={3}>
                            <XDSHStack gap={3} vAlign="center">
                              <div
                                style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              backgroundColor: 'var(--color-background-muted, #f0f0f0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                            <FolderIcon
                              style={{
                                width: 18,
                                height: 18,
                                color: 'var(--color-text-secondary, #6b7280)',
                              }}
                                />
                              </div>
                              <XDSVStack gap={0}>
                                <XDSText
                                  type="body"
                                  style={{fontWeight: 600}}>
                                  {col.name}
                                </XDSText>
                                <XDSText type="supporting" color="secondary">
                                  {col.count}{' '}
                                  {col.count === 1 ? 'item' : 'items'}
                                </XDSText>
                              </XDSVStack>
                            </XDSHStack>
                          </XDSCard>
                        </div>
                      ))}
                    </XDSGrid>
                  </div>

                  {/* Bookmark items */}
                  <XDSText
                    type="supporting"
                    color="secondary"
                    style={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 12,
                      display: 'block',
                    }}>
                    All bookmarks
                  </XDSText>

                  <div style={{marginBottom: 16, width: 280}}>
                    <XDSTextInput
                      label="Search bookmarks"
                      isLabelHidden
                      placeholder="Search bookmarks..."
                    value={bookmarkSearch}
                    onChange={setBookmarkSearch}
                    size="md"
                      startIcon={SearchIcon}
                    />
                  </div>

                  {filteredBookmarks.length === 0 ? (
                    <div style={{marginTop: 32}}>
                      <XDSEmptyState
                        title={
                          bookmarkSearch
                            ? 'No bookmarks match'
                            : 'No bookmarks yet'
                        }
                        description={
                          bookmarkSearch
                            ? 'Try a different search term.'
                            : 'Bookmark templates, themes, and components to save them for later.'
                        }
                        actions={
                          !bookmarkSearch ? (
                            <XDSButton
                              label="Explore"
                              variant="primary"
                              onClick={() => setActiveView('explore')}
                            />
                          ) : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 16,
                      }}>
                      {filteredBookmarks.map((item, i) => (
                        <BookmarkCard
                          key={item.name}
                          item={item}
                          index={i}
                          onRemove={() =>
                            setRemovedBookmarks(prev => {
                              const next = new Set(prev);
                              next.add(item.name);
                              return next;
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview dialog */}
      <XDSDialog
        isOpen={previewItem !== null}
        onOpenChange={(open) => { if (!open) setPreviewItem(null); }}
        width="90vw"
        maxHeight="90vh"
        purpose="info"
        style={{padding: 0, overflow: 'visible', maxWidth: 1600, '--xds-dialog-padding': '0px'} as React.CSSProperties}>
        {previewItem && (
          <>
            <div
              style={{position: 'absolute', top: 0, right: -40, zIndex: 1}}>
              <XDSCard padding={0} style={{borderRadius: '50%'}}>
                <XDSButton
                  label="Close"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<span style={{fontSize: 16, lineHeight: 1}}>✕</span>}
                  onClick={() => setPreviewItem(null)}
                />
              </XDSCard>
            </div>
            <div style={{overflowY: 'auto'}}>
              <div style={{display: 'flex', minHeight: 0, padding: '0 32px'}}>
                {/* Left — Preview image */}
                <XDSVStack
                  gap={3}
                  style={{flex: 1, minWidth: 0, padding: '32px 32px 32px 0'}}>
                  <div
                    style={{
                      flex: 1,
                      aspectRatio: '16 / 10',
                      backgroundColor: 'var(--color-background-muted, #f9f9f9)',
                      borderRadius: 12,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      border: '1px solid var(--color-border, #e0e0e0)',
                    }}>
                    <img
                      src={previewItem.img}
                      alt={previewItem.name}
                      style={{width: '100%', display: 'block'}}
                    />
                  </div>
                </XDSVStack>

                {/* Right — Details panel */}
                <XDSVStack
                  style={{width: 360, flexShrink: 0, padding: '32px 0'}}>
                  <XDSText type="display-2">{previewItem.name}</XDSText>

                  <div style={{marginTop: 8}}>
                    <XDSText type="body" color="secondary">
                      {previewItem.description}
                    </XDSText>
                  </div>

                  <XDSHStack gap={2} vAlign="center" style={{marginTop: 16}}>
                    <XDSBadge
                      label={previewItem.status}
                      variant={STATUS_VARIANT[previewItem.status]}
                    />
                    <XDSBadge
                      label={previewItem.type}
                      variant={TYPE_VARIANT[previewItem.type]}
                    />
                  </XDSHStack>

                  <XDSHStack gap={4} vAlign="center" style={{marginTop: 16}}>
                    <XDSVStack gap={0}>
                      <XDSText type="body" style={{fontWeight: 700, fontSize: 18}}>
                        {previewItem.views.toLocaleString()}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">Views</XDSText>
                    </XDSVStack>
                    <XDSVStack gap={0}>
                      <XDSText type="body" style={{fontWeight: 700, fontSize: 18}}>
                        {previewItem.used.toLocaleString()}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">Uses</XDSText>
                    </XDSVStack>
                    <XDSVStack gap={0}>
                      <XDSText type="body" style={{fontWeight: 700, fontSize: 18}}>
                        {timeAgo(previewItem.lastUpdated)}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">Updated</XDSText>
                    </XDSVStack>
                  </XDSHStack>

                  <XDSVStack gap={2} style={{marginTop: 32}}>
                    <XDSButton
                      variant="primary"
                      label="Edit"
                      size="lg"
                      style={{width: '100%'}}
                      onClick={() => setPreviewItem(null)}
                    />
                    <XDSButton
                      variant="secondary"
                      label={previewItem.status === 'Published' ? 'Unpublish' : 'Publish'}
                      size="lg"
                      style={{width: '100%'}}
                      onClick={() => setPreviewItem(null)}
                    />
                  </XDSVStack>

                  {previewItem.tags.length > 0 && (
                    <div style={{marginTop: 24}}>
                      <XDSText
                        type="supporting"
                        color="secondary"
                        style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>
                        Tags
                      </XDSText>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                        {previewItem.tags.map(tag => (
                          <XDSToken key={tag} label={tag} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </XDSVStack>
              </div>
            </div>
          </>
        )}
      </XDSDialog>

      {/* Used item preview dialog */}
      <XDSDialog
        isOpen={previewUsedItem !== null}
        onOpenChange={(open) => { if (!open) setPreviewUsedItem(null); }}
        width="90vw"
        maxHeight="90vh"
        purpose="info"
        style={{padding: 0, overflow: 'visible', maxWidth: 1600, '--xds-dialog-padding': '0px'} as React.CSSProperties}>
        {previewUsedItem && (
          <>
            <div
              style={{position: 'absolute', top: 0, right: -40, zIndex: 1}}>
              <XDSCard padding={0} style={{borderRadius: '50%'}}>
                <XDSButton
                  label="Close"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<span style={{fontSize: 16, lineHeight: 1}}>✕</span>}
                  onClick={() => setPreviewUsedItem(null)}
                />
              </XDSCard>
            </div>
            <div style={{overflowY: 'auto'}}>
              <div style={{display: 'flex', minHeight: 0, padding: '0 32px'}}>
                <XDSVStack
                  gap={3}
                  style={{flex: 1, minWidth: 0, padding: '32px 32px 32px 0'}}>
                  <div
                    style={{
                      flex: 1,
                      aspectRatio: '16 / 10',
                      backgroundColor: 'var(--color-background-muted, #f9f9f9)',
                      borderRadius: 12,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      border: '1px solid var(--color-border, #e0e0e0)',
                    }}>
                    <img
                      src={previewUsedItem.img}
                      alt={previewUsedItem.name}
                      style={{width: '100%', display: 'block'}}
                    />
                  </div>
                </XDSVStack>

                <XDSVStack
                  style={{width: 360, flexShrink: 0, padding: '32px 0'}}>
                  <XDSText type="display-2">{previewUsedItem.name}</XDSText>

                  <div style={{marginTop: 8}}>
                    <XDSText type="body" color="secondary">
                      {previewUsedItem.description}
                    </XDSText>
                  </div>

                  <XDSHStack gap={2} vAlign="center" style={{marginTop: 16}}>
                    <XDSBadge
                      label={previewUsedItem.type}
                      variant={TYPE_VARIANT[previewUsedItem.type]}
                    />
                  </XDSHStack>

                  <XDSHStack gap={4} vAlign="center" style={{marginTop: 16}}>
                    <XDSVStack gap={0}>
                      <XDSText type="body" style={{fontWeight: 700, fontSize: 18}}>
                        {previewUsedItem.usageCount}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">Times used</XDSText>
                    </XDSVStack>
                    <XDSVStack gap={0}>
                      <XDSText type="body" style={{fontWeight: 700, fontSize: 18}}>
                        {timeAgo(previewUsedItem.lastUsed)}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">Last used</XDSText>
                    </XDSVStack>
                  </XDSHStack>

                  <XDSVStack gap={2} style={{marginTop: 32}}>
                    <XDSButton
                      variant="primary"
                      label="Use again"
                      size="lg"
                      style={{width: '100%'}}
                      onClick={() => setPreviewUsedItem(null)}
                    />
                    <XDSButton
                      variant="secondary"
                      label="View details"
                      size="lg"
                      style={{width: '100%'}}
                      onClick={() => setPreviewUsedItem(null)}
                    />
                  </XDSVStack>
                </XDSVStack>
              </div>
            </div>
          </>
        )}
      </XDSDialog>

      {/* Settings dialog */}
      <XDSDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} width={720}>
        <XDSDialogHeader
          title="Settings"
          onOpenChange={setIsSettingsOpen}
        />
        <div
          style={{
            padding: 24,
            maxHeight: '70vh',
            overflowY: 'auto' as const,
          }}>
          <XDSVStack gap={6}>
            <XDSRadioList
              label="Send to"
              value={sendTo}
              onChange={setSendTo}
              description="Choose where templates and code are sent when you use them.">
              <XDSRadioListItem
                value="clipboard"
                label="Clipboard"
                description="Copy code to your clipboard"
              />
              <XDSRadioListItem
                value="vscode"
                label="VS Code"
                description="Open directly in VS Code"
              />
              <XDSRadioListItem
                value="github"
                label="GitHub"
                description="Create a new repo or gist"
              />
              <XDSRadioListItem
                value="download"
                label="Download"
                description="Save as a file to your device"
              />
            </XDSRadioList>
            <div>
              <XDSHeading level={3} style={{marginBottom: 16}}>
                Theme preference
              </XDSHeading>
              {(['official', 'community'] as const).map(category => {
                const entries = THEME_PICKER_ENTRIES.filter(
                  e => e.category === category,
                );
                if (entries.length === 0) return null;
                return (
                  <div key={category} style={{marginBottom: 20}}>
                    <div style={{marginBottom: 8}}>
                      <XDSText type="supporting" color="secondary">
                        {category.charAt(0).toUpperCase() +
                          category.slice(1)}
                      </XDSText>
                    </div>
                    <XDSGrid columns={4} gap={3}>
                      {entries.map(entry => {
                        const isSelected =
                          selectedTheme === entry.key;
                        const p = entry.preview;
                        return (
                          <div
                            key={entry.key}
                            onClick={() =>
                              setSelectedTheme(entry.key)
                            }
                            style={{
                              borderRadius: 12,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: isSelected
                                ? '2px solid var(--color-accent, #0066FF)'
                                : '1px solid var(--color-border-emphasized, #e0e0e0)',
                              transition:
                                'border-color 0.15s ease',
                            }}>
                            <XDSVStack>
                              <div
                                style={{
                                  height: 80,
                                  backgroundColor: p.bg,
                                  display: 'flex',
                                  flexDirection:
                                    'column' as const,
                                  overflow: 'hidden',
                                }}>
                                <XDSHStack
                                  gap={1}
                                  vAlign="center"
                                  style={{
                                    height: 14,
                                    backgroundColor: p.surface,
                                    borderBottom: `1px solid ${p.text}1A`,
                                    paddingInline: 8,
                                  }}>
                                  <div
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: '50%',
                                      backgroundColor: p.accent,
                                    }}
                                  />
                                  <div
                                    style={{
                                      width: 16,
                                      height: 2,
                                      borderRadius: 1,
                                      backgroundColor: p.text,
                                      opacity: 0.3,
                                    }}
                                  />
                                </XDSHStack>
                                <XDSVStack
                                  gap={1}
                                  style={{
                                    flex: 1,
                                    padding: 8,
                                  }}>
                                  <div
                                    style={{
                                      width: '65%',
                                      height: 4,
                                      borderRadius: 2,
                                      backgroundColor: p.text,
                                      opacity: 0.6,
                                    }}
                                  />
                                  <div
                                    style={{
                                      width: '45%',
                                      height: 3,
                                      borderRadius: 1.5,
                                      backgroundColor: p.text,
                                      opacity: 0.25,
                                    }}
                                  />
                                  <div
                                    style={{
                                      width: 28,
                                      height: 10,
                                      borderRadius: 4,
                                      backgroundColor: p.accent,
                                      marginTop: 'auto',
                                    }}
                                  />
                                </XDSVStack>
                              </div>
                              <div
                                style={{
                                  padding: '8px 10px',
                                }}>
                                <XDSText
                                  type="supporting"
                                  style={{
                                    fontWeight: isSelected
                                      ? 600
                                      : 400,
                                  }}>
                                  {entry.name}
                                </XDSText>
                                {entry.description && (
                                  <div
                                    style={{
                                      marginTop: 2,
                                    }}>
                                    <XDSText
                                      type="supporting"
                                      color="secondary">
                                      {entry.description}
                                    </XDSText>
                                  </div>
                                )}
                              </div>
                            </XDSVStack>
                          </div>
                        );
                      })}
                    </XDSGrid>
                  </div>
                );
              })}
            </div>
          </XDSVStack>
        </div>
      </XDSDialog>
    </div>
  );
}
