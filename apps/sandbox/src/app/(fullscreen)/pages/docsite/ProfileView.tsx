'use client';

import {useState, useMemo} from 'react';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSGrid} from '@xds/core/Grid';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSCard} from '@xds/core/Card';
import {XDSSelector} from '@xds/core/Selector';
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
  EyeIcon,
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

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'neutral'> = {
  Published: 'success',
  'In Review': 'warning',
  Draft: 'neutral',
};

const TYPE_VARIANT: Record<string, 'blue' | 'purple' | 'teal'> = {
  Template: 'blue',
  Theme: 'purple',
  Component: 'teal',
};

function CraftCard({
  item,
}: {
  item: (typeof PROFILE_CRAFT_ITEMS)[number];
}) {
  return (
    <div
      style={{
        cursor: 'pointer',
      }}>
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          aspectRatio: '4 / 3',
          backgroundColor: 'var(--color-background-muted, #f0f0f0)',
          border: '1px solid var(--color-border-emphasized, #e0e0e0)',
          position: 'relative',
        }}>
        <img
          src={item.img}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Status + type badges overlay */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            gap: 6,
          }}>
          <XDSBadge
            label={item.status}
            variant={STATUS_VARIANT[item.status]}
          />
          <XDSBadge label={item.type} variant={TYPE_VARIANT[item.type]} />
        </div>
        {/* Overflow menu */}
        <div
          style={{position: 'absolute', top: 8, right: 8}}
          onClick={e => e.stopPropagation()}>
          <XDSDropdownMenu
            button={{
              label: 'Actions',
              variant: 'ghost',
              size: 'sm',
              isIconOnly: true,
              icon: (
                <EllipsisHorizontalIcon style={{width: 18, height: 18}} />
              ),
              style: {
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(4px)',
                borderRadius: 8,
              },
            }}
            hasChevron={false}
            items={[
              {label: 'Edit', icon: PencilIcon, onClick: () => {}},
              {label: 'Duplicate', icon: DocumentDuplicateIcon, onClick: () => {}},
              {
                label:
                  item.status === 'Published' ? 'Unpublish' : 'Publish',
                icon: ArrowUpTrayIcon,
                onClick: () => {},
              },
              {type: 'divider' as const},
              {label: 'Delete', icon: TrashIcon, onClick: () => {}},
            ]}
          />
        </div>
      </div>
      {/* Card metadata */}
      <div style={{marginTop: 8, paddingInline: 2}}>
        <XDSText type="body" style={{fontWeight: 700}}>
          {item.name}
        </XDSText>
        <XDSHStack gap={2} vAlign="center" style={{marginTop: 4}}>
          <XDSHStack gap={0.5} vAlign="center">
            <XDSIcon icon={EyeIcon} size="xs" color="secondary" />
            <XDSText type="supporting" color="secondary">
              {item.views.toLocaleString()}
            </XDSText>
          </XDSHStack>
          <XDSText type="supporting" color="secondary">
            ·
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {item.used} {item.used === 1 ? 'use' : 'uses'}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            ·
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {timeAgo(item.lastUpdated)}
          </XDSText>
        </XDSHStack>
      </div>
    </div>
  );
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
        cursor: 'pointer',
        animation: `craftCardFadeIn 400ms ${index * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
      }}>
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          aspectRatio: '4 / 3',
          backgroundColor: 'var(--color-background-muted, #f0f0f0)',
          border: '1px solid var(--color-border-emphasized, #e0e0e0)',
          position: 'relative',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <img
          src={item.img}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Hover overlay with actions */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 200ms ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
          {/* Top-right: remove bookmark */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: 10,
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
          {/* Bottom: Use button */}
          <div
            style={{
              padding: 16,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={e => e.stopPropagation()}>
            <XDSButton
              label="Use"
              variant="secondary"
              size="sm"
              style={{
                backgroundColor: 'var(--color-background-surface)',
              }}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
      {/* Card metadata */}
      <div style={{marginTop: 8, paddingInline: 2}}>
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="body" style={{fontWeight: 700}}>
            {item.name}
          </XDSText>
          <XDSBadge label={item.type} variant={TYPE_VARIANT[item.type]} />
        </XDSHStack>
        <XDSText
          type="supporting"
          color="secondary"
          display="block"
          style={{marginTop: 2}}>
          {timeAgo(item.bookmarkedAt)}
        </XDSText>
      </div>
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

  // Used tab state
  const [usedSearch, setUsedSearch] = useState('');
  const [usedSort, setUsedSort] = useState('recent');

  // Bookmarks tab state
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [removedBookmarks, setRemovedBookmarks] = useState<Set<string>>(
    () => new Set(),
  );

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
  }, [usedSearch, usedSort]);

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

  const profileMetrics = useMemo(() => {
    const totalCrafts = PROFILE_CRAFT_ITEMS.length;
    const totalViews = PROFILE_CRAFT_ITEMS.reduce(
      (sum, i) => sum + i.views,
      0,
    );
    const totalUses = PROFILE_CRAFT_ITEMS.reduce(
      (sum, i) => sum + i.used,
      0,
    );
    const published = PROFILE_CRAFT_ITEMS.filter(
      i => i.status === 'Published',
    ).length;
    return {totalCrafts, totalViews, totalUses, published};
  }, []);

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
            <XDSText type="display-1">Your crafts</XDSText>
            <XDSHStack gap={6} vAlign="center" style={{marginTop: 12}}>
              {[
                {
                  label: 'Crafts',
                  value: profileMetrics.totalCrafts,
                },
                {
                  label: 'Published',
                  value: profileMetrics.published,
                },
                {
                  label: 'Views',
                  value: profileMetrics.totalViews.toLocaleString(),
                },
                {
                  label: 'Uses',
                  value: profileMetrics.totalUses.toLocaleString(),
                },
              ].map(stat => (
                <XDSHStack key={stat.label} gap={1} vAlign="center">
                  <XDSText
                    type="body"
                    style={{fontWeight: 700, fontSize: 18}}>
                    {stat.value}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {stat.label}
                  </XDSText>
                </XDSHStack>
              ))}
            </XDSHStack>
          </div>

          {/* Tab bar */}
          <XDSTabList
            value={activeTab}
            onChange={v =>
              setActiveTab(v as (typeof PROFILE_TABS)[number])
            }
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
                  size="sm"
                />
                <XDSSelector
                  label="Status"
                  isLabelHidden
                  options={CRAFT_STATUS_OPTIONS}
                  value={craftStatusFilter}
                  onChange={setCraftStatusFilter}
                  size="sm"
                />
                <XDSSelector
                  label="Sort"
                  isLabelHidden
                  options={CRAFT_SORT_OPTIONS}
                  value={craftSort}
                  onChange={setCraftSort}
                  size="sm"
                />
                <XDSStackItem size="fill" />
                <XDSButton
                  label="Settings"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={
                    <Cog6ToothIcon style={{width: 18, height: 18}} />
                  }
                  onClick={() => setIsSettingsOpen(true)}
                />
                <XDSButton
                  label="Create"
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveView('craft')}
                />
              </XDSHStack>

              {filteredCrafts.length === 0 ? (
                <div style={{marginTop: 48}}>
                  <XDSEmptyState
                    title="No crafts yet"
                    description="Create your first template, theme, or component and publish it to the community."
                    actions={
                      <XDSButton
                        label="Create"
                        variant="primary"
                        onClick={() => setActiveView('craft')}
                      />
                    }
                  />
                </div>
              ) : (
                <XDSGrid minChildWidth={280} gap={6}>
                  {filteredCrafts.map((item, i) => (
                    <div
                      key={item.name}
                      style={{
                        animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                      }}>
                      <CraftCard item={item} />
                    </div>
                  ))}
                </XDSGrid>
              )}
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
                    size="lg"
                    startIcon={SearchIcon}
                  />
                </div>
                <XDSSelector
                  label="Sort"
                  isLabelHidden
                  options={USED_SORT_OPTIONS}
                  value={usedSort}
                  onChange={setUsedSort}
                  size="sm"
                />
                <XDSStackItem size="fill" />
                <XDSText type="supporting" color="secondary">
                  {filteredUsed.length}{' '}
                  {filteredUsed.length === 1 ? 'item' : 'items'}
                </XDSText>
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
                <XDSVStack gap={0}>
                  {filteredUsed.map((item, i) => (
                    <div
                      key={item.name}
                      style={{
                        padding: '14px 16px',
                        borderBottom:
                          '1px solid var(--color-border-default, #e5e5e5)',
                        animation: `craftCardFadeIn 300ms ${i * 40}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                      }}>
                      <XDSHStack gap={4} vAlign="center">
                        <XDSVStack gap={0.5} style={{flex: 1, minWidth: 0}}>
                          <XDSText type="body" style={{fontWeight: 600}}>
                            {item.name}
                          </XDSText>
                          <XDSText
                            type="supporting"
                            color="secondary"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                            {item.description}
                          </XDSText>
                        </XDSVStack>
                        <XDSHStack gap={4} vAlign="center">
                          <XDSText
                            type="supporting"
                            color="secondary"
                            style={{whiteSpace: 'nowrap'}}>
                            Used {item.usageCount}×
                          </XDSText>
                          <XDSText
                            type="supporting"
                            color="secondary"
                            style={{
                              whiteSpace: 'nowrap',
                              minWidth: 64,
                              textAlign: 'right',
                            }}>
                            {timeAgo(item.lastUsed)}
                          </XDSText>
                          <XDSButton
                            label="Open docs"
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveView('docs')}
                          />
                        </XDSHStack>
                      </XDSHStack>
                    </div>
                  ))}
                </XDSVStack>
              )}
            </>
          )}

          {/* ===== BOOKMARKS TAB ===== */}
          {activeTab === 'Bookmarks' && (
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
                      style={{
                        animation: `craftCardFadeIn 300ms ${i * 50}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                      }}>
                      <XDSCard padding={3}>
                        <XDSHStack gap={3} vAlign="center">
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              backgroundColor: col.color + '18',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                            <FolderIcon
                              style={{
                                width: 18,
                                height: 18,
                                color: col.color,
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
                  size="lg"
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
                <XDSGrid minChildWidth={280} gap={6}>
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
                </XDSGrid>
              )}
            </>
          )}
        </div>
      </div>

      {/* Settings dialog */}
      <XDSDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
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
          </XDSVStack>
        </div>
      </XDSDialog>
    </div>
  );
}
