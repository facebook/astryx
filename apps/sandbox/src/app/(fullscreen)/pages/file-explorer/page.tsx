'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';

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
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path
        d="M2 5.5A1.5 1.5 0 013.5 4h3.764a1.5 1.5 0 011.073.453l1.326 1.36a.5.5 0 00.358.152L16.5 6A1.5 1.5 0 0118 7.5v7a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 14.5v-9z"
        fill={color}
      />
    </svg>
  );
}

function FileIcon({color = '#8E8E93'}: {color?: string}) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
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
        width: 20,
        height: 20,
        borderRadius: 5,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
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
    <svg width={12} height={20} viewBox="0 0 12 20" fill="none">
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
    <svg width={12} height={20} viewBox="0 0 12 20" fill="none">
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

function ColumnViewIcon({active}: {active?: boolean}) {
  const c = active ? '#007AFF' : '#8E8E93';
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="1"
        y="1"
        width="4.5"
        height="16"
        rx="1"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="6.75"
        y="1"
        width="4.5"
        height="16"
        rx="1"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="12.5"
        y="1"
        width="4.5"
        height="16"
        rx="1"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
    </svg>
  );
}

function GridViewIcon({active}: {active?: boolean}) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="1"
        y="1"
        width="7"
        height="7"
        rx="1.5"
        fill={active ? '#007AFF' : '#8E8E93'}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="10"
        y="1"
        width="7"
        height="7"
        rx="1.5"
        fill={active ? '#007AFF' : '#8E8E93'}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="1"
        y="10"
        width="7"
        height="7"
        rx="1.5"
        fill={active ? '#007AFF' : '#8E8E93'}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="10"
        y="10"
        width="7"
        height="7"
        rx="1.5"
        fill={active ? '#007AFF' : '#8E8E93'}
        fillOpacity={active ? 1 : 0.5}
      />
    </svg>
  );
}

function ListViewIcon({active}: {active?: boolean}) {
  const c = active ? '#007AFF' : '#8E8E93';
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="1"
        y="2"
        width="16"
        height="3"
        rx="1"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="1"
        y="7.5"
        width="16"
        height="3"
        rx="1"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="1"
        y="13"
        width="16"
        height="3"
        rx="1"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
    </svg>
  );
}

function GalleryViewIcon({active}: {active?: boolean}) {
  const c = active ? '#007AFF' : '#8E8E93';
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <rect
        x="3"
        y="1"
        width="12"
        height="12"
        rx="1.5"
        fill={c}
        fillOpacity={active ? 1 : 0.5}
      />
      <rect
        x="1"
        y="15"
        width="4"
        height="2"
        rx="0.5"
        fill={c}
        fillOpacity={active ? 0.6 : 0.3}
      />
      <rect
        x="7"
        y="15"
        width="4"
        height="2"
        rx="0.5"
        fill={c}
        fillOpacity={active ? 0.6 : 0.3}
      />
      <rect
        x="13"
        y="15"
        width="4"
        height="2"
        rx="0.5"
        fill={c}
        fillOpacity={active ? 0.6 : 0.3}
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
// Styles
// =============================================================================

const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: colorVars['--color-background-body'],
    overflow: 'hidden',
    userSelect: 'none',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottom: '1px solid var(--xds-color-border-primary, #D5D5D5)',
    backgroundColor: colorVars['--color-background-surface'],
    flexShrink: 0,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  toolbarCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'var(--xds-color-background-body, #F5F5F5)',
    borderRadius: 6,
    padding: 2,
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--xds-color-content-secondary, #8E8E93)',
    cursor: 'pointer',
    padding: 0,
  },
  navButtonDisabled: {
    opacity: 0.3,
    cursor: 'default',
  },
  toolbarButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
    borderRadius: 5,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  viewButtonActive: {
    backgroundColor: 'var(--xds-color-background-surface, white)',
    boxShadow: '0 0.5px 1px rgba(0,0,0,0.12), 0 0 0.5px rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--xds-color-content-primary, #1D1D1F)',
    marginLeft: 8,
  },
  groupButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingLeft: 8,
    paddingRight: 6,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 11,
    color: 'var(--xds-color-content-secondary, #8E8E93)',
  },
  groupChevron: {
    fontSize: 8,
    color: 'var(--xds-color-content-secondary, #8E8E93)',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 180,
    maxWidth: 340,
    width: '33.333%',
    borderRight: '1px solid var(--xds-color-border-primary, #D5D5D5)',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: colorVars['--color-background-body'],
    flexShrink: 0,
  },
  lastColumn: {
    borderRight: 'none',
    flex: 1,
    maxWidth: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingLeft: 8,
    paddingRight: 8,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--xds-color-content-primary, #1D1D1F)',
    borderRadius: 0,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '24px',
  },
  rowSelected: {
    backgroundColor: '#0058D0',
    color: 'white',
    borderRadius: 5,
    marginLeft: 4,
    marginRight: 4,
    paddingLeft: 4,
    paddingRight: 4,
  },
  rowName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
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
    width: 20,
    height: 20,
  },
  columnContent: {
    paddingTop: 4,
    paddingBottom: 4,
  },
});

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

  const handleSelect = (columnIndex: number, itemId: string) => {
    const newPath = [...selectedPath.slice(0, columnIndex), itemId];
    setSelectedPath(newPath);
  };

  const handleBack = () => {
    if (selectedPath.length > 0) {
      setSelectedPath(selectedPath.slice(0, -1));
    }
  };

  function renderIcon(item: FileSystemItem, isSelected: boolean) {
    if (item.type === 'folder') {
      return (
        <div {...stylex.props(styles.iconWrapper)}>
          <FolderIcon color={isSelected ? '#A0CCFF' : '#5AADFE'} />
        </div>
      );
    }

    const appIcon = APP_ICONS[item.name];
    if (appIcon) {
      return (
        <div {...stylex.props(styles.iconWrapper)}>
          <AppIcon label={appIcon.label} bg={appIcon.bg} />
        </div>
      );
    }

    return (
      <div {...stylex.props(styles.iconWrapper)}>
        <FileIcon color={isSelected ? '#FFFFFF' : '#8E8E93'} />
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.page)}>
      {/* Toolbar */}
      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.toolbarLeft)}>
          <button
            {...stylex.props(
              styles.navButton,
              selectedPath.length === 0 && styles.navButtonDisabled,
            )}
            onClick={handleBack}
            aria-label="Go back">
            <BackIcon />
          </button>
          <button
            {...stylex.props(styles.navButton, styles.navButtonDisabled)}
            aria-label="Go forward">
            <ForwardIcon />
          </button>
          <span {...stylex.props(styles.title)}>{currentFolderName}</span>
        </div>

        <div {...stylex.props(styles.toolbarCenter)}>
          <button {...stylex.props(styles.viewButton)} aria-label="Grid view">
            <GridViewIcon />
          </button>
          <button {...stylex.props(styles.viewButton)} aria-label="List view">
            <ListViewIcon />
          </button>
          <button
            {...stylex.props(styles.viewButton, styles.viewButtonActive)}
            aria-label="Column view">
            <ColumnViewIcon active />
          </button>
          <button
            {...stylex.props(styles.viewButton)}
            aria-label="Gallery view">
            <GalleryViewIcon />
          </button>
        </div>

        <div {...stylex.props(styles.toolbarRight)}>
          <button {...stylex.props(styles.toolbarButton)} aria-label="Group">
            <GroupIcon />
          </button>
          <button {...stylex.props(styles.toolbarButton)} aria-label="Share">
            <ShareIcon />
          </button>
          <button {...stylex.props(styles.toolbarButton)} aria-label="Tags">
            <TagIcon />
          </button>
          <button {...stylex.props(styles.toolbarButton)} aria-label="More">
            <MoreIcon />
          </button>
          <button {...stylex.props(styles.toolbarButton)} aria-label="Search">
            <SearchIcon />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div {...stylex.props(styles.body)}>
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            {...stylex.props(
              styles.column,
              colIndex === columns.length - 1 && styles.lastColumn,
            )}>
            <div {...stylex.props(styles.columnContent)}>
              {col.items.map(item => {
                const isSelected = col.selectedId === item.id;
                const hasChildren =
                  item.type === 'folder' &&
                  item.children != null &&
                  item.children.length > 0;

                return (
                  <div
                    key={item.id}
                    {...stylex.props(
                      styles.row,
                      isSelected && styles.rowSelected,
                    )}
                    onClick={() => handleSelect(colIndex, item.id)}>
                    {renderIcon(item, isSelected)}
                    <span {...stylex.props(styles.rowName)}>{item.name}</span>
                    {hasChildren && (
                      <span {...stylex.props(styles.rowChevron)}>
                        <ChevronRight
                          color={isSelected ? 'white' : '#C7C7CC'}
                        />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
