'use client';

import {useState, useMemo} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSDivider} from '@xds/core';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

// =============================================================================
// Types
// =============================================================================

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
}

// =============================================================================
// Icons
// =============================================================================

function FolderIcon({color = '#5AADFE'}: {color?: string}) {
  return (
    <svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <path
        d="M2 5.5A1.5 1.5 0 013.5 4h3.764a1.5 1.5 0 011.073.453l1.326 1.36a.5.5 0 00.358.152L16.5 6A1.5 1.5 0 0118 7.5v7a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 14.5v-9z"
        fill={color}
      />
    </svg>
  );
}

function FileIcon({
  color = '#8E8E93',
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M5 2.5A1.5 1.5 0 016.5 1h4.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0116 5.622V17.5a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 015 17.5v-15z"
        fill="white"
        stroke={color}
        strokeWidth={1}
      />
      <path d="M11 1v3.5a1 1 0 001 1h3.5" stroke={color} strokeWidth={1} />
    </svg>
  );
}

function AppIcon({label, bg}: {label: string; bg: string}) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 8,
        fontWeight: 700,
        color: 'white',
        flexShrink: 0,
      }}>
      {label}
    </div>
  );
}

function ChevronRight({color = '#C7C7CC'}: {color?: string}) {
  return (
    <svg width={8} height={13} viewBox="0 0 8 13" fill="none">
      <path
        d="M1.5 1.5l5 5-5 5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 12 20" fill="none">
      <path
        d="M10.5 1.5l-8 8.5 8 8.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 12 20" fill="none">
      <path
        d="M1.5 1.5l8 8.5-8 8.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ColumnViewIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="1"
        y="1"
        width="4.5"
        height="16"
        rx="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="6.75"
        y="1"
        width="4.5"
        height="16"
        rx="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="12.5"
        y="1"
        width="4.5"
        height="16"
        rx="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
    </svg>
  );
}

function GridViewIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="1"
        y="1"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="10"
        y="1"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="1"
        y="10"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="10"
        y="10"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0.5}
      />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="1"
        y="2"
        width="16"
        height="3"
        rx="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="1"
        y="7.5"
        width="16"
        height="3"
        rx="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="1"
        y="13"
        width="16"
        height="3"
        rx="1"
        fill="currentColor"
        fillOpacity={0.5}
      />
    </svg>
  );
}

function GalleryViewIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="3"
        y="1"
        width="12"
        height="12"
        rx="1.5"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <rect
        x="1"
        y="15"
        width="4"
        height="2"
        rx="0.5"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <rect
        x="7"
        y="15"
        width="4"
        height="2"
        rx="0.5"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <rect
        x="13"
        y="15"
        width="4"
        height="2"
        rx="0.5"
        fill="currentColor"
        fillOpacity={0.3}
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="#8E8E93" strokeWidth={1.5} />
      <path
        d="M10.5 10.5L14.5 14.5"
        stroke="#8E8E93"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1v9M4.5 4.5L8 1l3.5 3.5"
        stroke="#8E8E93"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 8v5.5a1 1 0 001 1h8a1 1 0 001-1V8"
        stroke="#8E8E93"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M1.5 8.793V2.5a1 1 0 011-1h6.293a1 1 0 01.707.293l5.207 5.207a1 1 0 010 1.414L9.414 14.707a1 1 0 01-1.414 0L1.793 8.5a1 1 0 01-.293-.707z"
        stroke="#8E8E93"
        strokeWidth={1.3}
      />
      <circle cx="5" cy="5" r="1" fill="#8E8E93" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="8" r="1.5" fill="#8E8E93" />
      <circle cx="8" cy="8" r="1.5" fill="#8E8E93" />
      <circle cx="13" cy="8" r="1.5" fill="#8E8E93" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width={18} height={16} viewBox="0 0 18 16" fill="none">
      <rect
        x="1"
        y="1"
        width="16"
        height="4"
        rx="1"
        fill="#8E8E93"
        fillOpacity={0.4}
      />
      <rect
        x="1"
        y="7"
        width="16"
        height="3"
        rx="0.5"
        fill="#8E8E93"
        fillOpacity={0.3}
      />
      <rect
        x="1"
        y="12"
        width="16"
        height="3"
        rx="0.5"
        fill="#8E8E93"
        fillOpacity={0.3}
      />
    </svg>
  );
}

// =============================================================================
// Data — filesystem tree
// =============================================================================

const FILESYSTEM: FileSystemItem[] = [
  {
    id: 'applications',
    name: 'Applications',
    type: 'folder',
    children: [
      {
        id: 'chrome-apps',
        name: 'Chrome Apps',
        type: 'folder',
        children: [
          {id: 'component-lab', name: 'Component Lab.app', type: 'file'},
          {id: 'google-chat', name: 'Google Chat.app', type: 'file'},
          {id: 'workchat', name: 'Workchat.app', type: 'file'},
        ],
      },
      {id: 'figma', name: 'Figma.app', type: 'file'},
      {id: 'safari', name: 'Safari.app', type: 'file'},
      {id: 'slack', name: 'Slack.app', type: 'file'},
      {id: 'terminal', name: 'Terminal.app', type: 'file'},
      {id: 'vscode', name: 'Visual Studio Code.app', type: 'file'},
      {id: 'xcode', name: 'Xcode.app', type: 'file'},
    ],
  },
  {id: 'debug-log', name: 'debug-storybook.log', type: 'file'},
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    children: [
      {id: 'screenshot1', name: 'Screenshot 2026-03-28.png', type: 'file'},
      {id: 'notes-txt', name: 'meeting-notes.txt', type: 'file'},
      {
        id: 'projects',
        name: 'Projects',
        type: 'folder',
        children: [
          {id: 'readme-proj', name: 'README.md', type: 'file'},
          {
            id: 'src-folder',
            name: 'src',
            type: 'folder',
            children: [
              {id: 'index-ts', name: 'index.ts', type: 'file'},
              {id: 'app-tsx', name: 'App.tsx', type: 'file'},
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    type: 'folder',
    children: [
      {id: 'design-spec', name: 'design-spec.pdf', type: 'file'},
      {id: 'resume', name: 'resume.docx', type: 'file'},
      {
        id: 'work',
        name: 'Work',
        type: 'folder',
        children: [
          {id: 'q1-report', name: 'Q1-report.xlsx', type: 'file'},
          {id: 'presentation', name: 'team-presentation.pptx', type: 'file'},
        ],
      },
    ],
  },
  {
    id: 'downloads',
    name: 'Downloads',
    type: 'folder',
    children: [
      {id: 'archive', name: 'archive.zip', type: 'file'},
      {id: 'installer', name: 'installer.dmg', type: 'file'},
      {id: 'photo', name: 'photo-2026.jpg', type: 'file'},
    ],
  },
  {id: 'login-screenshot', name: 'login-02-screenshot.png', type: 'file'},
  {
    id: 'movies',
    name: 'Movies',
    type: 'folder',
    children: [{id: 'recording', name: 'screen-recording.mov', type: 'file'}],
  },
  {
    id: 'music',
    name: 'Music',
    type: 'folder',
    children: [{id: 'playlist', name: 'favorites.m3u', type: 'file'}],
  },
  {
    id: 'node-modules',
    name: 'node_modules',
    type: 'folder',
    children: [
      {
        id: 'react',
        name: 'react',
        type: 'folder',
        children: [{id: 'react-index', name: 'index.js', type: 'file'}],
      },
      {
        id: 'stylex',
        name: '@stylexjs',
        type: 'folder',
        children: [{id: 'stylex-index', name: 'stylex.js', type: 'file'}],
      },
    ],
  },
  {
    id: 'pictures',
    name: 'Pictures',
    type: 'folder',
    children: [
      {
        id: 'vacation',
        name: 'vacation-2026',
        type: 'folder',
        children: [
          {id: 'img1', name: 'IMG_0001.jpg', type: 'file'},
          {id: 'img2', name: 'IMG_0002.jpg', type: 'file'},
          {id: 'img3', name: 'IMG_0003.jpg', type: 'file'},
        ],
      },
      {
        id: 'screenshots-folder',
        name: 'Screenshots',
        type: 'folder',
        children: [
          {id: 'ss1', name: 'Screen Shot 1.png', type: 'file'},
          {id: 'ss2', name: 'Screen Shot 2.png', type: 'file'},
        ],
      },
    ],
  },
  {
    id: 'public',
    name: 'Public',
    type: 'folder',
    children: [
      {id: 'drop-box', name: 'Drop Box', type: 'folder', children: []},
    ],
  },
  {
    id: 'xds',
    name: 'xds',
    type: 'folder',
    children: [
      {id: 'xds-readme', name: 'README.md', type: 'file'},
      {id: 'xds-pkg', name: 'package.json', type: 'file'},
      {
        id: 'xds-packages',
        name: 'packages',
        type: 'folder',
        children: [
          {
            id: 'xds-core',
            name: 'core',
            type: 'folder',
            children: [
              {
                id: 'core-src',
                name: 'src',
                type: 'folder',
                children: [
                  {id: 'button-tsx', name: 'Button.tsx', type: 'file'},
                  {id: 'card-tsx', name: 'Card.tsx', type: 'file'},
                  {id: 'text-tsx', name: 'Text.tsx', type: 'file'},
                ],
              },
            ],
          },
          {
            id: 'xds-cli',
            name: 'cli',
            type: 'folder',
            children: [{id: 'cli-index', name: 'index.ts', type: 'file'}],
          },
        ],
      },
      {
        id: 'xds-apps',
        name: 'apps',
        type: 'folder',
        children: [
          {
            id: 'storybook',
            name: 'storybook',
            type: 'folder',
            children: [
              {
                id: 'sb-config',
                name: '.storybook',
                type: 'folder',
                children: [],
              },
            ],
          },
          {
            id: 'sandbox-app',
            name: 'sandbox',
            type: 'folder',
            children: [
              {
                id: 'sandbox-src',
                name: 'src',
                type: 'folder',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const APP_ICONS: Record<string, {label: string; bg: string}> = {
  'Component Lab.app': {label: 'CL', bg: '#5856D6'},
  'Google Chat.app': {label: 'G', bg: '#34C759'},
  'Workchat.app': {label: 'W', bg: '#30B0C7'},
  'Figma.app': {label: 'F', bg: '#A259FF'},
  'Safari.app': {label: 'S', bg: '#007AFF'},
  'Slack.app': {label: 'S', bg: '#611F69'},
  'Terminal.app': {label: '>', bg: '#1D1D1F'},
  'Visual Studio Code.app': {label: 'VS', bg: '#007ACC'},
  'Xcode.app': {label: 'X', bg: '#147EFB'},
};

// =============================================================================
// Styles — inline for layout, minimal StyleX for tokens only
// =============================================================================

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const inlineStyles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    userSelect: 'none' as const,
    fontFamily: FONT,
    backgroundColor: 'var(--xds-color-background-surface, #FFFFFF)',
    position: 'fixed' as const,
    inset: 0,
  },
  toolbar: {
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  column: (isLast: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    width: 240,
    flex: 'none',
    borderRight: isLast ? 'none' : '1px solid var(--xds-color-border, #E5E5EA)',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    backgroundColor: 'var(--xds-color-background-surface, #FFFFFF)',
    flexShrink: 0,
  }),
  columnContent: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  row: (isSelected: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    height: 22,
    paddingLeft: isSelected ? 5 : 8,
    paddingRight: isSelected ? 5 : 8,
    marginLeft: isSelected ? 4 : 0,
    marginRight: isSelected ? 4 : 0,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: FONT,
    color: isSelected
      ? 'var(--xds-color-on-accent, #FFFFFF)'
      : 'var(--xds-color-text-primary, #1D1D1F)',
    backgroundColor: isSelected
      ? 'var(--xds-color-accent, #007AFF)'
      : 'transparent',
    borderRadius: isSelected ? 5 : 0,
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    lineHeight: '22px',
  }),
  rowName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowChevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  iconWrapper: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
  },
};

// =============================================================================
// Helpers
// =============================================================================

function findItem(items: FileSystemItem[], id: string): FileSystemItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// =============================================================================
// Component
// =============================================================================

/**
 * File Explorer template — macOS Finder column view.
 *
 * A multi-column file browser that drills down through a filesystem tree.
 * Each selection opens a new column to the right showing the children.
 *
 * Demonstrates:
 * - Multi-column panel navigation (Finder-style)
 * - StyleX for all layout and theming
 * - XDS design token integration
 * - Dynamic column rendering based on selection depth
 */
export default function FileExplorerPage() {
  const [selectedPath, setSelectedPath] = useState<string[]>([
    'applications',
    'chrome-apps',
    'component-lab',
  ]);

  const columns = useMemo(() => {
    const cols: {items: FileSystemItem[]; selectedId: string | null}[] = [];

    cols.push({
      items: FILESYSTEM,
      selectedId: selectedPath[0] ?? null,
    });

    let currentItems: FileSystemItem[] = FILESYSTEM;
    for (let i = 0; i < selectedPath.length; i++) {
      const selected = currentItems.find(item => item.id === selectedPath[i]);
      if (selected?.children && selected.children.length > 0) {
        cols.push({
          items: selected.children,
          selectedId: selectedPath[i + 1] ?? null,
        });
        currentItems = selected.children;
      } else {
        break;
      }
    }

    return cols;
  }, [selectedPath]);

  const currentFolderName = useMemo(() => {
    if (selectedPath.length === 0) return 'Home';
    const lastId = selectedPath[selectedPath.length - 1];
    const item = findItem(FILESYSTEM, lastId);
    if (item?.type === 'folder') return item.name;
    if (selectedPath.length >= 2) {
      const parent = findItem(
        FILESYSTEM,
        selectedPath[selectedPath.length - 2],
      );
      return parent?.name ?? 'Home';
    }
    return 'Home';
  }, [selectedPath]);

  // Check if the last selected item is a file (for preview pane)
  const selectedFile = useMemo(() => {
    if (selectedPath.length === 0) return null;
    const lastId = selectedPath[selectedPath.length - 1];
    const item = findItem(FILESYSTEM, lastId);
    if (item && item.type === 'file') return item;
    return null;
  }, [selectedPath]);

  const handleSelect = (columnIndex: number, itemId: string) => {
    const newPath = [...selectedPath.slice(0, columnIndex), itemId];
    setSelectedPath(newPath);
  };

  const handleBack = () => {
    if (selectedPath.length > 0) {
      setSelectedPath(selectedPath.slice(0, -1));
    }
  };

  function renderPreviewIcon(item: FileSystemItem) {
    const appIcon = APP_ICONS[item.name];
    if (appIcon) {
      return (
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 28,
            backgroundColor: appIcon.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          }}>
          {appIcon.label}
        </div>
      );
    }
    return (
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: 16,
          backgroundColor: 'var(--xds-color-background-body, #F5F5F7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
        <FileIcon color="var(--xds-color-icon-secondary, #86868B)" size={64} />
      </div>
    );
  }

  function getFileExtension(name: string): string {
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.substring(dot + 1).toUpperCase() : 'File';
  }

  function renderIcon(item: FileSystemItem, isSelected: boolean) {
    if (item.type === 'folder') {
      return (
        <div style={inlineStyles.iconWrapper}>
          <FolderIcon color={isSelected ? '#A0CCFF' : '#5AADFE'} />
        </div>
      );
    }

    const appIcon = APP_ICONS[item.name];
    if (appIcon) {
      return (
        <div style={inlineStyles.iconWrapper}>
          <AppIcon label={appIcon.label} bg={appIcon.bg} />
        </div>
      );
    }

    return (
      <div style={inlineStyles.iconWrapper}>
        <FileIcon color={isSelected ? '#FFFFFF' : '#8E8E93'} />
      </div>
    );
  }

  return (
    <div style={inlineStyles.page}>
      {/* Toolbar */}
      <XDSToolbar
        label="File Explorer"
        padding={0}
        style={{...inlineStyles.toolbar, paddingTop: 8, paddingBottom: 8}}
        startContent={
          <XDSHStack gap={1} vAlign="center">
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<BackIcon />}
              onClick={handleBack}
              isDisabled={selectedPath.length === 0}
              label="Go back"
              aria-label="Go back"
            />
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<ForwardIcon />}
              isDisabled
              label="Go forward"
              aria-label="Go forward"
            />
            <XDSText type="label" style={{marginLeft: 6}}>
              {currentFolderName}
            </XDSText>
          </XDSHStack>
        }
        centerContent={
          <XDSSegmentedControl
            value="column"
            onChange={() => {}}
            label="View mode">
            <XDSSegmentedControlItem
              value="grid"
              label="Grid"
              icon={<GridViewIcon />}
              isLabelHidden
            />
            <XDSSegmentedControlItem
              value="list"
              label="List"
              icon={<ListViewIcon />}
              isLabelHidden
            />
            <XDSSegmentedControlItem
              value="column"
              label="Column"
              icon={<ColumnViewIcon />}
              isLabelHidden
            />
            <XDSSegmentedControlItem
              value="gallery"
              label="Gallery"
              icon={<GalleryViewIcon />}
              isLabelHidden
            />
          </XDSSegmentedControl>
        }
        endContent={
          <XDSHStack gap={1} vAlign="center">
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<GroupIcon />}
              label="Group"
              aria-label="Group"
            />
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<ShareIcon />}
              label="Share"
              aria-label="Share"
            />
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<TagIcon />}
              label="Tags"
              aria-label="Tags"
            />
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<MoreIcon />}
              label="More"
              aria-label="More"
            />
            <XDSButton
              variant="ghost"
              size="sm"
              icon={<SearchIcon />}
              label="Search"
              aria-label="Search"
            />
          </XDSHStack>
        }
      />

      <XDSDivider />

      {/* Columns */}
      <XDSHStack style={inlineStyles.body}>
        {columns.map((col, colIndex) => {
          const isLast = colIndex === columns.length - 1;
          return (
            <div key={colIndex} style={inlineStyles.column(isLast)}>
              <XDSList
                density="compact"
                hasDividers={false}
                style={{padding: 8}}>
                {col.items.map(item => {
                  const isSelected = col.selectedId === item.id;
                  const hasChildren =
                    item.type === 'folder' &&
                    item.children != null &&
                    item.children.length > 0;

                  return (
                    <XDSListItem
                      key={item.id}
                      label={item.name}
                      startContent={renderIcon(item, isSelected)}
                      endContent={
                        hasChildren ? (
                          <ChevronRight
                            color={'var(--xds-color-icon-secondary, #86868B)'}
                          />
                        ) : undefined
                      }
                      onClick={() => handleSelect(colIndex, item.id)}
                      isSelected={isSelected}
                    />
                  );
                })}
              </XDSList>
            </div>
          );
        })}

        {/* Preview Pane */}
        {selectedFile && (
          <div
            style={{
              flex: 1,
              flexShrink: 0,
              borderLeft: '1px solid var(--xds-color-border, #E5E5EA)',
              overflowY: 'auto' as const,
              backgroundColor: 'var(--xds-color-background-surface, #FFFFFF)',
              padding: 16,
            }}>
            <XDSVStack
              gap={4}
              hAlign="center"
              style={{maxWidth: 300, margin: '0 auto'}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBlock: 32,
                }}>
                {renderPreviewIcon(selectedFile)}
              </div>
              <XDSVStack gap={1} hAlign="center" style={{width: '100%'}}>
                <XDSText type="label">{selectedFile.name}</XDSText>
                <XDSText type="supporting">
                  {getFileExtension(selectedFile.name)} Document
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={2} style={{width: '100%'}}>
                <XDSText type="label">Information</XDSText>
                <XDSHStack hAlign="between">
                  <XDSText type="supporting">Created</XDSText>
                  <XDSText type="supporting">March 28, 2026 at 2:15 PM</XDSText>
                </XDSHStack>
                <XDSHStack hAlign="between">
                  <XDSText type="supporting">Modified</XDSText>
                  <XDSText type="supporting">Yesterday, 10:27 PM</XDSText>
                </XDSHStack>
              </XDSVStack>
              <XDSVStack gap={1} style={{width: '100%'}}>
                <XDSText type="label">Tags</XDSText>
                <XDSText type="supporting" color="secondary">
                  Add Tags...
                </XDSText>
              </XDSVStack>
            </XDSVStack>
          </div>
        )}
      </XDSHStack>
    </div>
  );
}
