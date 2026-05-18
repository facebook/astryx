// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {XDSLink} from '@xds/core/Link';
import {XDSBanner} from '@xds/core/Banner';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {
  XDSTable,
  pixel,
  proportional,
  useXDSTableSortable,
  useXDSTableSortableState,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {
  PROFILE_CRAFT_ITEMS,
  PROFILE_USED_ITEMS,
  PROFILE_LIKED_ITEMS,
  PROFILE_COLLECTIONS,
  THEME_PICKER_ENTRIES,
} from './constants';
import {
  SearchIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  FolderIcon,
} from './docsite-icons';

import {TemplatePreviewModal} from './TemplatePreviewModal';
import {getComponentName, getComponentDocs} from './docsview-data';
import {COMPONENT_PREVIEWS} from './ComponentPreviews';
import {AppTopNav} from './AppTopNav';
import {
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ArrowLeftIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateSparklineData(seed: number, length = 12): number[] {
  const rng = seededRandom(seed);
  const points: number[] = [rng() * 40 + 30];
  for (let i = 1; i < length; i++) {
    const prev = points[i - 1];
    points.push(Math.max(5, Math.min(95, prev + (rng() - 0.4) * 20)));
  }
  return points;
}

function Sparkline({
  data,
  width = '100%',
  height = 40,
}: {
  data: number[];
  width?: string | number;
  height?: number;
}) {
  const viewW = 200;
  const viewH = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = viewW / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = viewH - ((v - min) / range) * (viewH * 0.8) - viewH * 0.1;
    return `${x},${y}`;
  });

  const linePath = `M${points.join('L')}`;
  const areaPath = `${linePath}L${viewW},${viewH}L0,${viewH}Z`;

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      width={width}
      height={height}
      preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-positive)"
            stopOpacity="0.15"
          />
          <stop
            offset="100%"
            stopColor="var(--color-positive)"
            stopOpacity="0.02"
          />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkFill)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-positive)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TrendIndicator({value}: {value: number}) {
  const isPositive = value >= 0;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: 'var(--color-positive)',
      }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {isPositive ? (
          <path
            d="M2 10C4 7 6 5 8 6C10 7 11 4 12 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M2 4C4 7 6 9 8 8C10 7 11 10 12 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span style={{fontSize: 13}}>
        {isPositive ? '+' : ''}
        {value}%
      </span>
    </span>
  );
}

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

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'neutral' | 'error'
> = {
  Published: 'success',
  'In Review': 'warning',
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
      renderCell: item => (
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
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
          <XDSVStack gap={0}>
            <XDSText type="body" style={{fontWeight: 600}}>
              {item.name}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {item.type}
            </XDSText>
          </XDSVStack>
        </XDSHStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(120),
      sortable: true,
      renderCell: item => (
        <XDSBadge label={item.status} variant={STATUS_VARIANT[item.status]} />
      ),
    },
    {
      key: 'views',
      header: 'Views',
      width: pixel(100),
      align: 'end',
      sortable: true,
      renderCell: item =>
        item.status === 'Draft' ||
        item.status === 'Needs Fixes' ||
        item.status === 'In Review' ? (
          <XDSText type="body" color="secondary">
            —
          </XDSText>
        ) : (
          <XDSText type="body" color="secondary">
            {item.views.toLocaleString()}
          </XDSText>
        ),
    },
    {
      key: 'used',
      header: 'Uses',
      width: pixel(80),
      align: 'end',
      sortable: true,
      renderCell: item =>
        item.status === 'Draft' ||
        item.status === 'Needs Fixes' ||
        item.status === 'In Review' ? (
          <XDSText type="body" color="secondary">
            —
          </XDSText>
        ) : (
          <XDSText type="body" color="secondary">
            {item.used.toLocaleString()}
          </XDSText>
        ),
    },
    {
      key: 'lastUpdated',
      header: 'Updated',
      width: pixel(100),
      sortable: true,
      renderCell: item => (
        <XDSText type="body" color="secondary">
          {timeAgo(item.lastUpdated)}
        </XDSText>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: pixel(48),
      renderCell: item => (
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
              {
                label: 'Duplicate',
                icon: DocumentDuplicateIcon,
                onClick: () => {},
              },
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
  onOpenComponentDocs: (componentKey: string) => void,
): XDSTableColumn<UsedItem>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      width: proportional(3, {minWidth: 200}),
      renderCell: item => (
        <XDSHStack
          gap={3}
          vAlign="center"
          style={{cursor: 'pointer'}}
          onClick={() => {
            if (item.type === 'Component') {
              onOpenComponentDocs(item.name.toLowerCase().replace(/\s+/g, ''));
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
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
          <XDSVStack gap={0.5} style={{minWidth: 0}}>
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
        </XDSHStack>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: pixel(120),
      sortable: true,
      renderCell: item => (
        <XDSBadge label={item.type} variant={TYPE_VARIANT[item.type]} />
      ),
    },
    {
      key: 'usageCount',
      header: 'Times Used',
      width: pixel(100),
      align: 'end',
      sortable: true,
      renderCell: item => (
        <XDSText type="body" color="secondary">
          {item.usageCount}
        </XDSText>
      ),
    },
    {
      key: 'lastUsed',
      header: 'Last Used',
      width: pixel(100),
      sortable: true,
      renderCell: item => (
        <XDSText type="body" color="secondary">
          {timeAgo(item.lastUsed)}
        </XDSText>
      ),
    },
  ];
}

function BookmarkCard({
  item,
  index,
  onRemove,
  onClick,
}: {
  item: (typeof PROFILE_LIKED_ITEMS)[number];
  index: number;
  onRemove: () => void;
  onClick: () => void;
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
          onMouseLeave={() => setHovered(false)}
          onClick={onClick}>
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
                icon={<BookmarkFilledIcon style={{width: 16, height: 16}} />}
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

function PreviewDialogShell({
  isOpen,
  onClose,
  imgSrc,
  imgAlt,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  imgAlt: string;
  children: React.ReactNode;
}) {
  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      width="90vw"
      maxHeight="90vh"
      purpose="info"
      style={
        {
          padding: 0,
          overflow: 'visible',
          maxWidth: 1600,
          '--xds-dialog-padding': '0px',
        } as React.CSSProperties
      }>
      {isOpen && (
        <>
          <div style={{position: 'absolute', top: 0, right: -40, zIndex: 1}}>
            <XDSCard padding={0} style={{borderRadius: '50%'}}>
              <XDSButton
                label="Close"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<span style={{fontSize: 16, lineHeight: 1}}>✕</span>}
                onClick={onClose}
              />
            </XDSCard>
          </div>
          <div style={{overflowY: 'auto', height: '100%'}}>
            <div
              style={{display: 'flex', minHeight: '100%', padding: '0 32px'}}>
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
                    src={imgSrc}
                    alt={imgAlt}
                    style={{width: '100%', display: 'block'}}
                  />
                </div>
              </XDSVStack>
              <XDSVStack style={{width: 360, flexShrink: 0, padding: '32px 0'}}>
                {children}
              </XDSVStack>
            </div>
          </div>
        </>
      )}
    </XDSDialog>
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
  onStartCrafting,
  profileTab,
  onTabChange,
  profileCraftName,
  onCraftPreviewChange,
  profileUsedName,
  onUsedPreviewChange,
  profileSettingsOpen,
  onSettingsChange,
  profileCollectionName,
  onCollectionChange,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile' | 'theme';
  setActiveView: (
    v: 'craft' | 'explore' | 'docs' | 'profile' | 'theme',
  ) => void;
  onStartCrafting: () => void;
  profileTab: 'Crafted' | 'Used' | 'Bookmarks';
  onTabChange: (tab: 'Crafted' | 'Used' | 'Bookmarks') => void;
  profileCraftName: string | null;
  onCraftPreviewChange: (name: string | null) => void;
  profileUsedName: string | null;
  onUsedPreviewChange: (name: string | null) => void;
  profileSettingsOpen: boolean;
  onSettingsChange: (open: boolean) => void;
  profileCollectionName: string | null;
  onCollectionChange: (name: string | null) => void;
}) {
  const activeTab = profileTab;
  const setActiveTab = onTabChange;
  const isSettingsOpen = profileSettingsOpen;
  const setIsSettingsOpen = onSettingsChange;

  const previewItem = useMemo(() => {
    if (!profileCraftName) return null;
    return (PROFILE_CRAFT_ITEMS.find(i => i.name === profileCraftName) ??
      null) as CraftItem | null;
  }, [profileCraftName]);
  const setPreviewItem = useCallback(
    (item: CraftItem | null) => onCraftPreviewChange(item ? item.name : null),
    [onCraftPreviewChange],
  );

  const [selectedTheme, setSelectedTheme] = useState('default');
  const [sendTo, setSendTo] = useState('clipboard');

  // Crafted tab state
  const [craftTypeFilter, setCraftTypeFilter] = useState('all');
  const [craftStatusFilter, setCraftStatusFilter] = useState('all');
  const [craftSort, setCraftSort] = useState('recent');

  const handlePreview = useCallback(
    (item: CraftItem) => {
      setPreviewItem(item);
    },
    [setPreviewItem],
  );

  const craftColumns = useMemo(
    () => makeCraftColumns(handlePreview),
    [handlePreview],
  );

  // Crafted table sorting
  const craftSortState = useXDSTableSortableState<
    CraftItem,
    'lastUpdated' | 'views' | 'used'
  >({
    data: [] as CraftItem[],
    defaultSort: [{sortKey: 'lastUpdated', direction: 'descending'}],
    comparators: {
      views: (a, b) => a.views - b.views,
      used: (a, b) => a.used - b.used,
      lastUpdated: (a, b) =>
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
    },
  });
  const craftSortPlugin = useXDSTableSortable<
    CraftItem,
    'lastUpdated' | 'views' | 'used'
  >(craftSortState.sortConfig);

  // Used tab state
  const [usedSearch, setUsedSearch] = useState('');
  const [usedSort, setUsedSort] = useState('recent');
  const [usedTypeFilter, setUsedTypeFilter] = useState('all');
  const previewUsedItem = useMemo(() => {
    if (!profileUsedName) return null;
    return (PROFILE_USED_ITEMS.find(i => i.name === profileUsedName) ??
      null) as UsedItem | null;
  }, [profileUsedName]);
  const setPreviewUsedItem = useCallback(
    (item: UsedItem | null) => onUsedPreviewChange(item ? item.name : null),
    [onUsedPreviewChange],
  );

  const [componentDrawerKey, setComponentDrawerKey] = useState<string | null>(
    null,
  );

  const handlePreviewUsed = useCallback(
    (item: UsedItem) => {
      setPreviewUsedItem(item);
    },
    [setPreviewUsedItem],
  );

  const handleOpenComponentDocs = useCallback((key: string) => {
    setComponentDrawerKey(key);
  }, []);

  const usedColumns = useMemo(
    () => makeUsedColumns(handlePreviewUsed, handleOpenComponentDocs),
    [handlePreviewUsed, handleOpenComponentDocs],
  );

  // Used table sorting
  const usedSortState = useXDSTableSortableState<
    UsedItem,
    'lastUsed' | 'usageCount'
  >({
    data: [] as UsedItem[],
    defaultSort: [{sortKey: 'lastUsed', direction: 'descending'}],
    comparators: {
      usageCount: (a, b) => a.usageCount - b.usageCount,
      lastUsed: (a, b) =>
        new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime(),
    },
  });
  const usedSortPlugin = useXDSTableSortable<
    UsedItem,
    'lastUsed' | 'usageCount'
  >(usedSortState.sortConfig);

  // Bookmarks tab state
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [removedBookmarks, setRemovedBookmarks] = useState<Set<string>>(
    () => new Set(),
  );
  const [previewBookmarkItem, setPreviewBookmarkItem] = useState<
    (typeof PROFILE_LIKED_ITEMS)[number] | null
  >(null);
  const [editingCollectionName, setEditingCollectionName] = useState(false);
  const [collectionNameDraft, setCollectionNameDraft] = useState('');
  const [editingCollectionItems, setEditingCollectionItems] = useState(false);
  const [collectionItemsDraft, setCollectionItemsDraft] = useState<Set<string>>(
    () => new Set(),
  );
  const [isNewCollection, setIsNewCollection] = useState(false);

  const handleBookmarkClick = useCallback(
    (item: (typeof PROFILE_LIKED_ITEMS)[number]) => {
      if (item.type === 'Component') {
        setComponentDrawerKey(item.name.toLowerCase().replace(/\s+/g, ''));
      } else {
        setPreviewBookmarkItem(item);
      }
    },
    [],
  );
  const selectedCollection = useMemo(() => {
    if (isNewCollection) {
      return {
        name: collectionNameDraft || 'Untitled',
        count: 0,
        color: '#6B7280',
        items: [] as string[],
      };
    }
    if (!profileCollectionName) return null;
    return (
      PROFILE_COLLECTIONS.find(c => c.name === profileCollectionName) ?? null
    );
  }, [profileCollectionName, isNewCollection, collectionNameDraft]);
  const setSelectedCollection = useCallback(
    (col: (typeof PROFILE_COLLECTIONS)[number] | null) =>
      onCollectionChange(col ? col.name : null),
    [onCollectionChange],
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
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
    return items;
  }, [usedSearch, usedSort, usedTypeFilter]);

  const filteredBookmarks = useMemo(() => {
    let items = PROFILE_LIKED_ITEMS.filter(i => !removedBookmarks.has(i.name));
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
          {/* Profile header */}
          <div style={{marginBottom: 32}}>
            <XDSText type="display-1">Your crafts</XDSText>
          </div>
        </div>

        {/* Tab bar + settings — full-width divider with tabs resting on the line */}
        <div
          style={{
            borderBottom: '1px solid var(--color-divider, #e0e0e0)',
          }}>
          <div style={{maxWidth: 1400, margin: '0 auto', marginBottom: -1}}>
            <XDSHStack vAlign="end">
              <XDSTabList
                value={activeTab}
                onChange={v => {
                  setActiveTab(v as (typeof PROFILE_TABS)[number]);
                  setSelectedCollection(null);
                }}
                size="lg"
                hasDivider={false}>
                {PROFILE_TABS.map(tab => (
                  <XDSTab key={tab} value={tab} label={tab} />
                ))}
              </XDSTabList>
              <XDSStackItem size="fill" />
              <div style={{paddingBottom: 8}}>
                <XDSButton
                  label="Settings"
                  variant="ghost"
                  size="lg"
                  isIconOnly
                  icon={<Cog6ToothIcon style={{width: 24, height: 24}} />}
                  onClick={() => setIsSettingsOpen(true)}
                />
              </div>
            </XDSHStack>
          </div>
        </div>

        <div style={{maxWidth: 1400, margin: '0 auto'}}>
          {/* ===== CRAFTED TAB ===== */}
          {activeTab === 'Crafted' && (
            <>
              {/* Filter + sort + actions row */}
              <XDSHStack
                gap={2}
                vAlign="center"
                style={{marginTop: 32, marginBottom: 20}}>
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
                  onClick={onStartCrafting}
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
                        onClick={onStartCrafting}
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
                style={{marginTop: 32, marginBottom: 20}}>
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
                  data={
                    filteredUsed as Array<
                      (typeof filteredUsed)[number] & Record<string, unknown>
                    >
                  }
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
                  <div style={{marginTop: 32, marginBottom: 32}}>
                    <XDSHStack
                      gap={2}
                      vAlign="center"
                      style={{marginBottom: 4}}>
                      <XDSButton
                        label="Back to bookmarks"
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        icon={<ArrowLeftIcon style={{width: 18, height: 18}} />}
                        onClick={() => {
                          setSelectedCollection(null);
                          setIsNewCollection(false);
                          setEditingCollectionName(false);
                          setEditingCollectionItems(false);
                        }}
                      />
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor:
                            'var(--color-background-muted, #f0f0f0)',
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
                      <XDSVStack gap={0}>
                        {editingCollectionName ? (
                          <input
                            autoFocus
                            value={collectionNameDraft}
                            onChange={e =>
                              setCollectionNameDraft(e.target.value)
                            }
                            onBlur={() => setEditingCollectionName(false)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === 'Escape') {
                                setEditingCollectionName(false);
                              }
                            }}
                            style={{
                              font: 'inherit',
                              fontSize: 20,
                              fontWeight: 600,
                              border: 'none',
                              outline: 'none',
                              padding: '2px 0',
                              background: 'transparent',
                              borderBottom:
                                '2px solid var(--color-accent, #0066FF)',
                              width: Math.max(
                                120,
                                collectionNameDraft.length * 11,
                              ),
                            }}
                          />
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              setCollectionNameDraft(selectedCollection.name);
                              setEditingCollectionName(true);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setCollectionNameDraft(selectedCollection.name);
                                setEditingCollectionName(true);
                              }
                            }}>
                            <XDSHeading level={3}>
                              {selectedCollection.name}
                            </XDSHeading>
                          </div>
                        )}
                        <XDSText type="supporting" color="secondary">
                          {collectionItems.length}{' '}
                          {collectionItems.length === 1 ? 'item' : 'items'}
                        </XDSText>
                      </XDSVStack>
                      <XDSStackItem size="fill" />
                      {editingCollectionItems ? (
                        <XDSHStack gap={2}>
                          <XDSButton
                            label="Cancel"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCollectionItems(false)}
                          />
                          <XDSButton
                            label="Save"
                            variant="primary"
                            size="sm"
                            onClick={() => setEditingCollectionItems(false)}
                          />
                        </XDSHStack>
                      ) : (
                        <XDSButton
                          label="Add item"
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          icon={<PlusIcon style={{width: 20, height: 20}} />}
                          onClick={() => {
                            setCollectionItemsDraft(
                              new Set(selectedCollection.items),
                            );
                            setEditingCollectionItems(true);
                          }}
                        />
                      )}
                    </XDSHStack>
                  </div>

                  {editingCollectionItems ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 16,
                      }}>
                      {PROFILE_LIKED_ITEMS.filter(
                        item => !removedBookmarks.has(item.name),
                      ).map((item, i) => {
                        const isInCollection = collectionItemsDraft.has(
                          item.name,
                        );
                        return (
                          <div
                            key={item.name}
                            onClick={() => {
                              setCollectionItemsDraft(prev => {
                                const next = new Set(prev);
                                if (next.has(item.name)) next.delete(item.name);
                                else next.add(item.name);
                                return next;
                              });
                            }}
                            style={{
                              animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                              cursor: 'pointer',
                            }}>
                            <XDSCard padding={0}>
                              <div
                                style={{
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}>
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    aspectRatio: '1920 / 1205',
                                    objectFit: 'cover',
                                    objectPosition: 'top',
                                    opacity: isInCollection ? 1 : 0.5,
                                    transition: 'opacity 200ms ease',
                                  }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                  }}>
                                  <XDSCheckboxInput
                                    label={item.name}
                                    isLabelHidden
                                    value={isInCollection}
                                    onChange={() => {
                                      setCollectionItemsDraft(prev => {
                                        const next = new Set(prev);
                                        if (next.has(item.name))
                                          next.delete(item.name);
                                        else next.add(item.name);
                                        return next;
                                      });
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '24px 12px 12px',
                                    background:
                                      'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                  }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 8,
                                    }}>
                                    <XDSText
                                      type="body"
                                      style={{color: '#fff', fontWeight: 600}}>
                                      {item.name}
                                    </XDSText>
                                    <XDSText
                                      type="supporting"
                                      style={{color: 'rgba(255,255,255,0.7)'}}>
                                      {item.type}
                                    </XDSText>
                                  </div>
                                </div>
                              </div>
                            </XDSCard>
                          </div>
                        );
                      })}
                    </div>
                  ) : collectionItems.length === 0 ? (
                    <div style={{marginTop: 48}}>
                      <XDSEmptyState
                        title="This collection is empty"
                        description="Bookmark items and add them to this collection."
                        actions={
                          <XDSButton
                            label="Add items"
                            variant="primary"
                            onClick={() => {
                              setCollectionItemsDraft(
                                new Set(selectedCollection.items),
                              );
                              setEditingCollectionItems(true);
                            }}
                          />
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
                      {collectionItems.map((item, i) => (
                        <BookmarkCard
                          key={item.name}
                          item={item}
                          index={i}
                          onClick={() => handleBookmarkClick(item)}
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
                  <div style={{marginTop: 32, marginBottom: 32}}>
                    <XDSHStack vAlign="center" style={{marginBottom: 12}}>
                      <XDSHeading level={2}>Collections</XDSHeading>
                      <XDSStackItem size="fill" />
                      <XDSButton
                        label="Add collection"
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        icon={<PlusIcon style={{width: 20, height: 20}} />}
                        onClick={() => {
                          setIsNewCollection(true);
                          setCollectionNameDraft('Untitled');
                          setEditingCollectionName(true);
                          setEditingCollectionItems(false);
                          setCollectionItemsDraft(new Set());
                        }}
                      />
                    </XDSHStack>
                    <XDSGrid columns={{minWidth: 180}} gap={3}>
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
                                  backgroundColor:
                                    'var(--color-background-muted, #f0f0f0)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}>
                                <FolderIcon
                                  style={{
                                    width: 18,
                                    height: 18,
                                    color:
                                      'var(--color-text-secondary, #6b7280)',
                                  }}
                                />
                              </div>
                              <XDSVStack gap={0}>
                                <XDSText type="body" style={{fontWeight: 600}}>
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
                  <XDSHStack vAlign="center" style={{marginBottom: 16}}>
                    <XDSHeading level={2}>All bookmarks</XDSHeading>
                    <XDSStackItem size="fill" />
                    <div style={{width: 280}}>
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
                  </XDSHStack>

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
                          onClick={() => handleBookmarkClick(item)}
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

      {/* Craft preview dialog */}
      <PreviewDialogShell
        isOpen={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        imgSrc={previewItem?.img ?? ''}
        imgAlt={previewItem?.name ?? ''}>
        {previewItem && (
          <>
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
              <XDSText type="supporting" color="secondary">
                {previewItem.type} · Updated {timeAgo(previewItem.lastUpdated)}
              </XDSText>
            </XDSHStack>

            {(previewItem.status === 'In Review' ||
              previewItem.status === 'Needs Fixes') && (
              <div style={{marginTop: 16}}>
                <XDSBanner
                  status={
                    previewItem.status === 'Needs Fixes' ? 'warning' : 'info'
                  }
                  title={
                    previewItem.status === 'Needs Fixes'
                      ? 'Changes requested'
                      : 'In review'
                  }
                  description={
                    <>
                      {previewItem.status === 'Needs Fixes'
                        ? 'Reviewers have left comments on your craft. Open the diffs tool to resolve them.'
                        : 'Your craft is being reviewed by the XDS team. This usually takes 2–3 business days.'}{' '}
                      <XDSText type="supporting">
                        <XDSLink
                          label="Learn more"
                          href="#"
                          color="secondary"
                          hasUnderline
                          onClick={e => {
                            e.preventDefault();
                            setPreviewItem(null);
                            setActiveView('docs');
                          }}>
                          Learn more
                        </XDSLink>
                      </XDSText>
                    </>
                  }
                />
              </div>
            )}

            {previewItem.status === 'Published' && (
              <div style={{marginTop: 12}}>
                <XDSList hasDividers density="balanced">
                  <XDSListItem
                    label="Views"
                    startContent={
                      <EyeIcon
                        style={{
                          width: 18,
                          height: 18,
                          color: 'var(--color-secondary)',
                        }}
                      />
                    }
                    endContent={
                      <XDSText type="label">
                        {previewItem.views.toLocaleString()}
                      </XDSText>
                    }
                  />
                  <XDSListItem
                    label="Uses"
                    startContent={
                      <CursorArrowRaysIcon
                        style={{
                          width: 18,
                          height: 18,
                          color: 'var(--color-secondary)',
                        }}
                      />
                    }
                    endContent={
                      <XDSText type="label">
                        {previewItem.used.toLocaleString()}
                      </XDSText>
                    }
                  />
                  <XDSListItem
                    label="Bookmarked"
                    startContent={
                      <BookmarkIcon
                        style={{
                          width: 18,
                          height: 18,
                          color: 'var(--color-secondary)',
                        }}
                      />
                    }
                    endContent={
                      <XDSText type="label">
                        {previewItem.bookmarks.toLocaleString()}
                      </XDSText>
                    }
                  />
                </XDSList>
              </div>
            )}

            <XDSVStack gap={2} style={{marginTop: 'auto', paddingTop: 32}}>
              {previewItem.status === 'In Review' ||
              previewItem.status === 'Needs Fixes' ? (
                <XDSButton
                  variant="secondary"
                  label="Edit"
                  size="lg"
                  style={{width: '100%'}}
                  onClick={() => setPreviewItem(null)}
                />
              ) : (
                <>
                  <XDSButton
                    variant={
                      previewItem.status === 'Published'
                        ? 'primary'
                        : 'secondary'
                    }
                    label="Edit"
                    size="lg"
                    style={{width: '100%'}}
                    onClick={() => setPreviewItem(null)}
                  />
                  <XDSButton
                    variant={
                      previewItem.status === 'Published'
                        ? 'secondary'
                        : 'primary'
                    }
                    label={
                      previewItem.status === 'Published'
                        ? 'Unpublish'
                        : 'Submit for review'
                    }
                    size="lg"
                    style={{width: '100%'}}
                    onClick={() => setPreviewItem(null)}
                  />
                </>
              )}
            </XDSVStack>
          </>
        )}
      </PreviewDialogShell>

      {/* Used item preview dialog */}
      <PreviewDialogShell
        isOpen={previewUsedItem !== null}
        onClose={() => setPreviewUsedItem(null)}
        imgSrc={previewUsedItem?.img ?? ''}
        imgAlt={previewUsedItem?.name ?? ''}>
        {previewUsedItem && (
          <>
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

            <div style={{marginTop: 12}}>
              <XDSList hasDividers density="balanced">
                <XDSListItem
                  label="Times used"
                  startContent={
                    <CursorArrowRaysIcon
                      style={{
                        width: 18,
                        height: 18,
                        color: 'var(--color-secondary)',
                      }}
                    />
                  }
                  endContent={
                    <XDSText type="label">{previewUsedItem.usageCount}</XDSText>
                  }
                />
                <XDSListItem
                  label="Last used"
                  startContent={
                    <ClockIcon
                      style={{
                        width: 18,
                        height: 18,
                        color: 'var(--color-secondary)',
                      }}
                    />
                  }
                  endContent={
                    <XDSText type="label">
                      {timeAgo(previewUsedItem.lastUsed)}
                    </XDSText>
                  }
                />
              </XDSList>
            </div>

            <XDSVStack gap={2} style={{marginTop: 'auto', paddingTop: 32}}>
              <XDSButton
                variant="primary"
                label="Use again"
                size="lg"
                style={{width: '100%'}}
                onClick={() => setPreviewUsedItem(null)}
              />
              <XDSButton
                variant="secondary"
                label="Start crafting"
                size="lg"
                style={{width: '100%'}}
                onClick={() => setPreviewUsedItem(null)}
              />
            </XDSVStack>
          </>
        )}
      </PreviewDialogShell>

      {/* Component docs drawer */}
      <XDSDialog
        isOpen={componentDrawerKey !== null}
        onOpenChange={open => {
          if (!open) setComponentDrawerKey(null);
        }}
        width="90vw"
        maxHeight="90vh"
        purpose="info"
        style={
          {
            padding: 0,
            overflow: 'visible',
            maxWidth: 1200,
            '--xds-dialog-padding': '0px',
          } as React.CSSProperties
        }>
        {componentDrawerKey &&
          (() => {
            const docs = getComponentDocs(componentDrawerKey);
            const name = getComponentName(componentDrawerKey);
            return (
              <>
                <div
                  style={{position: 'absolute', top: 0, right: -40, zIndex: 1}}>
                  <XDSCard padding={0} style={{borderRadius: '50%'}}>
                    <XDSButton
                      label="Close"
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      icon={
                        <span style={{fontSize: 16, lineHeight: 1}}>✕</span>
                      }
                      onClick={() => setComponentDrawerKey(null)}
                    />
                  </XDSCard>
                </div>
                <div style={{overflowY: 'auto', maxHeight: '85vh'}}>
                  <div
                    style={{
                      maxWidth: 840,
                      margin: '0 auto',
                      padding: '32px 40px',
                    }}>
                    <XDSText type="display-1">{name}</XDSText>
                    <div style={{marginTop: 4, marginBottom: 32}}>
                      <XDSText type="supporting" color="secondary">
                        Component
                      </XDSText>
                    </div>

                    {/* Live preview */}
                    <div
                      style={{
                        border:
                          '1px solid var(--color-divider, rgba(0,0,0,0.1))',
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
                          backgroundColor:
                            'var(--color-background-surface, #ffffff)',
                        }}>
                        <XDSText
                          type="supporting"
                          weight="semibold"
                          color="secondary">
                          Live preview
                        </XDSText>
                        <XDSButton
                          label="Open full docs"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setComponentDrawerKey(null);
                            setActiveView('docs');
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 240,
                          padding: 24,
                          backgroundColor:
                            'var(--color-background-muted, #f5f5f5)',
                        }}>
                        {COMPONENT_PREVIEWS[componentDrawerKey] ?? (
                          <XDSText type="supporting" color="secondary">
                            Preview coming soon
                          </XDSText>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{marginBottom: 48}}>
                      <XDSHeading level={3}>{docs.tagline}</XDSHeading>
                      <div style={{marginTop: 12}}>
                        <XDSText type="body">{docs.description}</XDSText>
                      </div>
                      <div style={{marginTop: 24}}>
                        <XDSHeading level={4}>When to use</XDSHeading>
                        <div style={{marginTop: 8}}>
                          <XDSList density="compact" listStyle="disc">
                            {docs.whenToUse.map((item, i) => (
                              <XDSListItem key={i} label={item} />
                            ))}
                          </XDSList>
                        </div>
                      </div>
                      <div style={{marginTop: 24}}>
                        <XDSHeading level={4}>When NOT to use</XDSHeading>
                        <div style={{marginTop: 8}}>
                          <XDSList density="compact" listStyle="disc">
                            {docs.whenNotToUse.map((item, i) => (
                              <XDSListItem key={i} label={item} />
                            ))}
                          </XDSList>
                        </div>
                      </div>
                    </div>

                    {/* Anatomy */}
                    <div style={{marginBottom: 48}}>
                      <XDSHeading level={2}>Anatomy</XDSHeading>
                      <div style={{marginTop: 16}}>
                        <XDSText type="body">
                          The {name} is composed of the following elements.
                          Required elements must always be present, while
                          optional elements can be included as needed.
                        </XDSText>
                      </div>
                      <div style={{marginTop: 16}}>
                        <XDSTable
                          data={docs.anatomy as {[key: string]: unknown}[]}
                          columns={[
                            {key: 'element', header: 'Element'},
                            {key: 'required', header: 'Required'},
                            {key: 'description', header: 'Description'},
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
      </XDSDialog>

      {/* Bookmark preview dialog — reuses the exact same modal as the home page */}
      <TemplatePreviewModal
        isOpen={previewBookmarkItem !== null}
        onClose={() => setPreviewBookmarkItem(null)}
        item={
          previewBookmarkItem
            ? {
                name: previewBookmarkItem.name,
                img: previewBookmarkItem.img,
                author: previewBookmarkItem.author,
                description: previewBookmarkItem.description,
              }
            : null
        }
        onStartCrafting={() => {
          setPreviewBookmarkItem(null);
          onStartCrafting();
        }}
        isBookmarked={true}
        onBookmarkToggle={() => {
          if (previewBookmarkItem) {
            setRemovedBookmarks(prev => {
              const next = new Set(prev);
              next.add(previewBookmarkItem.name);
              return next;
            });
            setPreviewBookmarkItem(null);
          }
        }}
        moreLikeThis={
          previewBookmarkItem
            ? PROFILE_LIKED_ITEMS.filter(
                i =>
                  i.name !== previewBookmarkItem.name &&
                  !removedBookmarks.has(i.name),
              )
                .slice(0, 4)
                .map(i => ({name: i.name, img: i.img, key: i.name}))
            : []
        }
        onMoreLikeThisClick={mlItem => {
          const found = PROFILE_LIKED_ITEMS.find(i => i.name === mlItem.name);
          if (found) setPreviewBookmarkItem(found);
        }}
        exploreTags={[
          'website',
          'dashboard',
          'admin panel',
          'settings',
          'form layout',
          'data table',
          'sidebar nav',
          'landing page',
          'e-commerce',
          'documentation',
          'profile page',
        ]}
        componentTags={[
          'XDSAppShell',
          'XDSTopNav',
          'XDSVStack',
          'XDSHStack',
          'XDSHeading',
          'XDSText',
          'XDSButton',
          'XDSCard',
          'XDSBadge',
          'XDSAvatar',
        ]}
      />

      {/* Settings dialog */}
      <XDSDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        width={720}>
        <XDSDialogHeader title="Settings" onOpenChange={setIsSettingsOpen} />
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
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </XDSText>
                    </div>
                    <XDSGrid columns={4} gap={3}>
                      {entries.map(entry => {
                        const isSelected = selectedTheme === entry.key;
                        const p = entry.preview;
                        return (
                          <div
                            key={entry.key}
                            onClick={() => setSelectedTheme(entry.key)}
                            style={{
                              borderRadius: 12,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: isSelected
                                ? '2px solid var(--color-accent, #0066FF)'
                                : '1px solid var(--color-border-emphasized, #e0e0e0)',
                              transition: 'border-color 0.15s ease',
                            }}>
                            <XDSVStack>
                              <div
                                style={{
                                  height: 80,
                                  backgroundColor: p.bg,
                                  display: 'flex',
                                  flexDirection: 'column' as const,
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
                                    fontWeight: isSelected ? 600 : 400,
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
