'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';
import {XDSAvatar} from '@xds/core/Avatar';

// =============================================================================
// Types
// =============================================================================

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  owner: string;
  ownerAvatar: string;
  extension?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  files: number;
  modified: string;
  badge?: {label: string; variant: 'info' | 'success' | 'warning' | 'error'};
}

interface TeamItem {
  id: string;
  name: string;
  members: number;
  projects: ProjectItem[];
  avatar: string;
}

// =============================================================================
// Icons
// =============================================================================

function FolderIcon({
  size = 16,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M1.5 3A1.5 1.5 0 013 1.5h3.146a1.5 1.5 0 011.094.474L8.34 3.12a.5.5 0 00.365.158H13A1.5 1.5 0 0114.5 4.78v7.72A1.5 1.5 0 0113 14H3a1.5 1.5 0 01-1.5-1.5V3z"
        fill={color}
      />
    </svg>
  );
}

function FileIcon({
  size = 16,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 1.5A1.5 1.5 0 015 0h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14.5a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5v-13z"
        fill={color}
        opacity={0.15}
      />
      <path
        d="M3.5 1.5A1.5 1.5 0 015 0h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14.5a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5v-13z"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
    </svg>
  );
}

function ChevronRightIcon({size = 12}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path
        d="M4.5 2.5l3.5 3.5-3.5 3.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth={1.2}
      />
      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth={1.2}
      />
      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth={1.2}
      />
      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M1 3h14M1 8h14M1 13h14"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

// =============================================================================
// Mock Data
// =============================================================================

const TEAMS: TeamItem[] = [
  {
    id: 'design-systems',
    name: 'Design Systems',
    members: 12,
    avatar: 'https://i.pravatar.cc/36?img=10',
    projects: [
      {
        id: 'xds-core',
        name: 'XDS Core',
        description:
          'Core component library — buttons, inputs, layout primitives',
        files: 142,
        modified: '2 hours ago',
        badge: {label: 'Active', variant: 'success'},
      },
      {
        id: 'xds-themes',
        name: 'XDS Themes',
        description:
          'Theme packages — default, neutral, brutalist, meta, whatsapp',
        files: 38,
        modified: '1 day ago',
        badge: {label: 'Active', variant: 'success'},
      },
      {
        id: 'xds-icons',
        name: 'XDS Icons',
        description: 'Icon registry and default icon set',
        files: 24,
        modified: '3 days ago',
      },
    ],
  },
  {
    id: 'frontend-infra',
    name: 'Frontend Infra',
    members: 8,
    avatar: 'https://i.pravatar.cc/36?img=20',
    projects: [
      {
        id: 'build-tools',
        name: 'Build Tools',
        description: 'Webpack, Babel, and bundler config for internal apps',
        files: 67,
        modified: '5 hours ago',
        badge: {label: 'In Review', variant: 'warning'},
      },
      {
        id: 'perf-monitoring',
        name: 'Perf Monitoring',
        description: 'Core Web Vitals tracking and performance budgets',
        files: 31,
        modified: '1 week ago',
      },
    ],
  },
  {
    id: 'product-eng',
    name: 'Product Engineering',
    members: 24,
    avatar: 'https://i.pravatar.cc/36?img=30',
    projects: [
      {
        id: 'dashboard-v2',
        name: 'Dashboard v2',
        description: 'Next-gen analytics dashboard with real-time data',
        files: 203,
        modified: '30 min ago',
        badge: {label: 'Active', variant: 'success'},
      },
      {
        id: 'settings-ui',
        name: 'Settings UI',
        description: 'User and org settings management interface',
        files: 89,
        modified: '2 days ago',
      },
      {
        id: 'onboarding-flow',
        name: 'Onboarding Flow',
        description: 'New user onboarding wizard and setup experience',
        files: 45,
        modified: '4 days ago',
        badge: {label: 'Archived', variant: 'error'},
      },
    ],
  },
];

const FILES: Record<string, FileItem[]> = {
  'xds-core': [
    {
      id: '1',
      name: 'Button',
      type: 'folder',
      modified: '2 hours ago',
      owner: 'Alice Chen',
      ownerAvatar: 'https://i.pravatar.cc/24?img=1',
    },
    {
      id: '2',
      name: 'Card',
      type: 'folder',
      modified: '1 day ago',
      owner: 'Bob Kim',
      ownerAvatar: 'https://i.pravatar.cc/24?img=2',
    },
    {
      id: '3',
      name: 'Layout',
      type: 'folder',
      modified: '3 days ago',
      owner: 'Alice Chen',
      ownerAvatar: 'https://i.pravatar.cc/24?img=1',
    },
    {
      id: '4',
      name: 'Text',
      type: 'folder',
      modified: '1 week ago',
      owner: 'Carol Wu',
      ownerAvatar: 'https://i.pravatar.cc/24?img=3',
    },
    {
      id: '5',
      name: 'Table',
      type: 'folder',
      modified: '2 days ago',
      owner: 'David Park',
      ownerAvatar: 'https://i.pravatar.cc/24?img=4',
    },
    {
      id: '6',
      name: 'index.ts',
      type: 'file',
      extension: 'ts',
      size: '2.4 KB',
      modified: '2 hours ago',
      owner: 'Alice Chen',
      ownerAvatar: 'https://i.pravatar.cc/24?img=1',
    },
    {
      id: '7',
      name: 'README.md',
      type: 'file',
      extension: 'md',
      size: '8.1 KB',
      modified: '3 days ago',
      owner: 'Bob Kim',
      ownerAvatar: 'https://i.pravatar.cc/24?img=2',
    },
    {
      id: '8',
      name: 'package.json',
      type: 'file',
      extension: 'json',
      size: '1.2 KB',
      modified: '1 week ago',
      owner: 'Carol Wu',
      ownerAvatar: 'https://i.pravatar.cc/24?img=3',
    },
    {
      id: '9',
      name: 'tsconfig.json',
      type: 'file',
      extension: 'json',
      size: '0.5 KB',
      modified: '2 weeks ago',
      owner: 'David Park',
      ownerAvatar: 'https://i.pravatar.cc/24?img=4',
    },
    {
      id: '10',
      name: '.eslintrc.js',
      type: 'file',
      extension: 'js',
      size: '0.8 KB',
      modified: '1 month ago',
      owner: 'Alice Chen',
      ownerAvatar: 'https://i.pravatar.cc/24?img=1',
    },
  ],
  'xds-themes': [
    {
      id: '11',
      name: 'default',
      type: 'folder',
      modified: '1 day ago',
      owner: 'Eve Lin',
      ownerAvatar: 'https://i.pravatar.cc/24?img=5',
    },
    {
      id: '12',
      name: 'neutral',
      type: 'folder',
      modified: '3 days ago',
      owner: 'Eve Lin',
      ownerAvatar: 'https://i.pravatar.cc/24?img=5',
    },
    {
      id: '13',
      name: 'brutalist',
      type: 'folder',
      modified: '1 week ago',
      owner: 'Frank Zhao',
      ownerAvatar: 'https://i.pravatar.cc/24?img=6',
    },
    {
      id: '14',
      name: 'theme.config.ts',
      type: 'file',
      extension: 'ts',
      size: '3.2 KB',
      modified: '1 day ago',
      owner: 'Eve Lin',
      ownerAvatar: 'https://i.pravatar.cc/24?img=5',
    },
  ],
  'xds-icons': [
    {
      id: '15',
      name: 'icons',
      type: 'folder',
      modified: '3 days ago',
      owner: 'Grace Ng',
      ownerAvatar: 'https://i.pravatar.cc/24?img=7',
    },
    {
      id: '16',
      name: 'registry.ts',
      type: 'file',
      extension: 'ts',
      size: '1.8 KB',
      modified: '3 days ago',
      owner: 'Grace Ng',
      ownerAvatar: 'https://i.pravatar.cc/24?img=7',
    },
  ],
  'build-tools': [
    {
      id: '17',
      name: 'webpack',
      type: 'folder',
      modified: '5 hours ago',
      owner: 'Hank Lee',
      ownerAvatar: 'https://i.pravatar.cc/24?img=8',
    },
    {
      id: '18',
      name: 'babel.config.js',
      type: 'file',
      extension: 'js',
      size: '2.1 KB',
      modified: '5 hours ago',
      owner: 'Hank Lee',
      ownerAvatar: 'https://i.pravatar.cc/24?img=8',
    },
  ],
  'perf-monitoring': [
    {
      id: '19',
      name: 'vitals',
      type: 'folder',
      modified: '1 week ago',
      owner: 'Iris Tan',
      ownerAvatar: 'https://i.pravatar.cc/24?img=9',
    },
    {
      id: '20',
      name: 'budgets.json',
      type: 'file',
      extension: 'json',
      size: '4.5 KB',
      modified: '1 week ago',
      owner: 'Iris Tan',
      ownerAvatar: 'https://i.pravatar.cc/24?img=9',
    },
  ],
  'dashboard-v2': [
    {
      id: '21',
      name: 'components',
      type: 'folder',
      modified: '30 min ago',
      owner: 'Jack Chen',
      ownerAvatar: 'https://i.pravatar.cc/24?img=11',
    },
    {
      id: '22',
      name: 'hooks',
      type: 'folder',
      modified: '2 hours ago',
      owner: 'Kate Liu',
      ownerAvatar: 'https://i.pravatar.cc/24?img=12',
    },
    {
      id: '23',
      name: 'utils',
      type: 'folder',
      modified: '1 day ago',
      owner: 'Jack Chen',
      ownerAvatar: 'https://i.pravatar.cc/24?img=11',
    },
    {
      id: '24',
      name: 'App.tsx',
      type: 'file',
      extension: 'tsx',
      size: '5.2 KB',
      modified: '30 min ago',
      owner: 'Kate Liu',
      ownerAvatar: 'https://i.pravatar.cc/24?img=12',
    },
  ],
  'settings-ui': [
    {
      id: '25',
      name: 'pages',
      type: 'folder',
      modified: '2 days ago',
      owner: 'Leo Wang',
      ownerAvatar: 'https://i.pravatar.cc/24?img=13',
    },
    {
      id: '26',
      name: 'SettingsLayout.tsx',
      type: 'file',
      extension: 'tsx',
      size: '3.8 KB',
      modified: '2 days ago',
      owner: 'Leo Wang',
      ownerAvatar: 'https://i.pravatar.cc/24?img=13',
    },
  ],
  'onboarding-flow': [
    {
      id: '27',
      name: 'steps',
      type: 'folder',
      modified: '4 days ago',
      owner: 'Mia Huang',
      ownerAvatar: 'https://i.pravatar.cc/24?img=14',
    },
    {
      id: '28',
      name: 'WizardContainer.tsx',
      type: 'file',
      extension: 'tsx',
      size: '6.1 KB',
      modified: '4 days ago',
      owner: 'Mia Huang',
      ownerAvatar: 'https://i.pravatar.cc/24?img=14',
    },
  ],
};

function getFilesForProject(projectId: string): FileItem[] {
  return (
    FILES[projectId] || [
      {
        id: 'default-1',
        name: 'src',
        type: 'folder',
        modified: 'recently',
        owner: 'Unknown',
        ownerAvatar: 'https://i.pravatar.cc/24?img=15',
      },
      {
        id: 'default-2',
        name: 'README.md',
        type: 'file',
        extension: 'md',
        size: '1.0 KB',
        modified: 'recently',
        owner: 'Unknown',
        ownerAvatar: 'https://i.pravatar.cc/24?img=15',
      },
    ]
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getExtensionColor(ext?: string): string {
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '#3178c6';
    case 'js':
    case 'jsx':
      return '#f0db4f';
    case 'json':
      return '#6d8086';
    case 'md':
      return '#519aba';
    case 'css':
      return '#563d7c';
    default:
      return '#8b949e';
  }
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 'calc(100vh - 64px)',
  },
  header: {padding: '1.5rem 2rem 1rem'},
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  searchArea: {maxWidth: 320},
  body: {display: 'flex', flex: 1, overflow: 'hidden'},
  column: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e0e0e0',
    overflow: 'auto',
  },
  teamsColumn: {width: 220, flexShrink: 0},
  projectsColumn: {width: 280, flexShrink: 0},
  filesColumn: {flex: 1, borderRight: 'none'},
  columnHeader: {padding: '0.75rem 1rem', borderBottom: '1px solid #e0e0e0'},
  columnHeaderText: {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#666',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1rem',
    cursor: 'pointer',
    transition: 'background 0.1s',
    borderBottom: '1px solid #f0f0f0',
  },
  listItemHover: {':hover': {backgroundColor: '#f8f8f8'}},
  listItemSelected: {backgroundColor: '#e8f0fe'},
  listItemContent: {flex: 1, minWidth: 0},
  listItemName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  listItemDescription: {
    fontSize: '0.75rem',
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '0.125rem',
  },
  listItemMeta: {fontSize: '0.7rem', color: '#999', whiteSpace: 'nowrap'},
  listItemChevron: {color: '#999', flexShrink: 0},
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    transition: 'background 0.1s',
    ':hover': {backgroundColor: '#f8f8f8'},
  },
  fileIcon: {
    flexShrink: 0,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  fileInfo: {flex: 1, minWidth: 0},
  fileName: {fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a'},
  fileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: '#999',
    marginTop: '0.125rem',
  },
  fileOwner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    flexShrink: 0,
  },
  fileSize: {
    flexShrink: 0,
    fontSize: '0.75rem',
    color: '#999',
    width: 60,
    textAlign: 'right',
  },
  fileModified: {
    flexShrink: 0,
    fontSize: '0.75rem',
    color: '#999',
    width: 100,
    textAlign: 'right',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8rem',
    color: '#666',
  },
  breadcrumbLink: {cursor: 'pointer', ':hover': {color: '#1a1a1a'}},
  breadcrumbCurrent: {fontWeight: 600, color: '#1a1a1a'},
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '2rem',
  },
  viewToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem',
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  viewToggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#999',
    transition: 'all 0.1s',
  },
  viewToggleActive: {
    backgroundColor: 'white',
    color: '#1a1a1a',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  filesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.75rem',
    padding: '1rem',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.75rem',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.1s',
    ':hover': {backgroundColor: '#f8f8f8'},
  },
  gridItemIcon: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  gridItemName: {
    fontSize: '0.8rem',
    fontWeight: 500,
    textAlign: 'center',
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  gridItemMeta: {fontSize: '0.65rem', color: '#999'},
});

// =============================================================================
// Component
// =============================================================================

/**
 * File Explorer template.
 *
 * A three-column file browser with Teams > Projects > Files drill-down.
 * Demonstrates XDS layout patterns for master-detail navigation with:
 * - Multi-column panel navigation
 * - Search/filter functionality
 * - List and grid view toggling
 * - Breadcrumb navigation
 * - Avatar integration for file ownership
 * - Badge usage for project status
 */
export default function FileExplorerPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    'design-systems',
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    'xds-core',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const selectedTeam = useMemo(
    () => TEAMS.find(t => t.id === selectedTeamId) ?? null,
    [selectedTeamId],
  );
  const selectedProject = useMemo(
    () => selectedTeam?.projects.find(p => p.id === selectedProjectId) ?? null,
    [selectedTeam, selectedProjectId],
  );

  const files = useMemo(() => {
    if (!selectedProjectId) return [];
    const projectFiles = getFilesForProject(selectedProjectId);
    if (!searchQuery) return projectFiles;
    const q = searchQuery.toLowerCase();
    return projectFiles.filter(f => f.name.toLowerCase().includes(q));
  }, [selectedProjectId, searchQuery]);

  return (
    <div {...stylex.props(styles.page)}>
      {/* Header */}
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerRow)}>
          <XDSVStack gap={1}>
            <XDSHeading level={2}>File Explorer</XDSHeading>
            <div {...stylex.props(styles.breadcrumb)}>
              <span
                {...stylex.props(styles.breadcrumbLink)}
                onClick={() => {
                  setSelectedTeamId(null);
                  setSelectedProjectId(null);
                }}>
                Workspace
              </span>
              {selectedTeam && (
                <>
                  <ChevronRightIcon />
                  <span
                    {...stylex.props(styles.breadcrumbLink)}
                    onClick={() => setSelectedProjectId(null)}>
                    {selectedTeam.name}
                  </span>
                </>
              )}
              {selectedProject && (
                <>
                  <ChevronRightIcon />
                  <span {...stylex.props(styles.breadcrumbCurrent)}>
                    {selectedProject.name}
                  </span>
                </>
              )}
            </div>
          </XDSVStack>
          <XDSHStack gap={3} vAlign="center">
            <div {...stylex.props(styles.searchArea)}>
              <XDSTextInput
                label=""
                placeholder="Search files..."
                value={searchQuery}
                onChange={setSearchQuery}
                size="sm"
              />
            </div>
            <div {...stylex.props(styles.viewToggle)}>
              <button
                {...stylex.props(
                  styles.viewToggleButton,
                  viewMode === 'list' && styles.viewToggleActive,
                )}
                onClick={() => setViewMode('list')}
                aria-label="List view">
                <ListIcon />
              </button>
              <button
                {...stylex.props(
                  styles.viewToggleButton,
                  viewMode === 'grid' && styles.viewToggleActive,
                )}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view">
                <GridIcon />
              </button>
            </div>
          </XDSHStack>
        </div>
      </div>

      <XDSDivider />

      {/* Three-column layout */}
      <div {...stylex.props(styles.body)}>
        {/* Column 1: Teams */}
        <div {...stylex.props(styles.column, styles.teamsColumn)}>
          <div {...stylex.props(styles.columnHeader)}>
            <span {...stylex.props(styles.columnHeaderText)}>Teams</span>
          </div>
          {TEAMS.map(team => (
            <div
              key={team.id}
              {...stylex.props(
                styles.listItem,
                styles.listItemHover,
                selectedTeamId === team.id && styles.listItemSelected,
              )}
              onClick={() => {
                setSelectedTeamId(team.id);
                setSelectedProjectId(null);
                setSearchQuery('');
              }}>
              <XDSAvatar src={team.avatar} name={team.name} size="small" />
              <div {...stylex.props(styles.listItemContent)}>
                <div {...stylex.props(styles.listItemName)}>{team.name}</div>
                <div {...stylex.props(styles.listItemMeta)}>
                  {team.members} members · {team.projects.length} projects
                </div>
              </div>
              <span {...stylex.props(styles.listItemChevron)}>
                <ChevronRightIcon />
              </span>
            </div>
          ))}
        </div>

        {/* Column 2: Projects */}
        <div {...stylex.props(styles.column, styles.projectsColumn)}>
          <div {...stylex.props(styles.columnHeader)}>
            <span {...stylex.props(styles.columnHeaderText)}>
              Projects{selectedTeam ? ` — ${selectedTeam.name}` : ''}
            </span>
          </div>
          {selectedTeam ? (
            selectedTeam.projects.map(project => (
              <div
                key={project.id}
                {...stylex.props(
                  styles.listItem,
                  styles.listItemHover,
                  selectedProjectId === project.id && styles.listItemSelected,
                )}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setSearchQuery('');
                }}>
                <div {...stylex.props(styles.listItemContent)}>
                  <XDSHStack gap={2} vAlign="center">
                    <div {...stylex.props(styles.listItemName)}>
                      {project.name}
                    </div>
                    {project.badge && (
                      <XDSBadge
                        variant={project.badge.variant}
                        label={project.badge.label}
                      />
                    )}
                  </XDSHStack>
                  <div {...stylex.props(styles.listItemDescription)}>
                    {project.description}
                  </div>
                  <div {...stylex.props(styles.listItemMeta)}>
                    {project.files} files · {project.modified}
                  </div>
                </div>
                <span {...stylex.props(styles.listItemChevron)}>
                  <ChevronRightIcon />
                </span>
              </div>
            ))
          ) : (
            <div {...stylex.props(styles.emptyState)}>
              <XDSText type="supporting" color="secondary">
                Select a team
              </XDSText>
            </div>
          )}
        </div>

        {/* Column 3: Files */}
        <div {...stylex.props(styles.column, styles.filesColumn)}>
          <div {...stylex.props(styles.columnHeader)}>
            <XDSHStack hAlign="between" vAlign="center">
              <span {...stylex.props(styles.columnHeaderText)}>
                Files{selectedProject ? ` — ${selectedProject.name}` : ''}
              </span>
              {selectedProject && (
                <span {...stylex.props(styles.listItemMeta)}>
                  {files.length} items
                </span>
              )}
            </XDSHStack>
          </div>
          {selectedProject ? (
            viewMode === 'list' ? (
              <div>
                {files.map(file => (
                  <div key={file.id} {...stylex.props(styles.fileRow)}>
                    <div
                      {...stylex.props(styles.fileIcon)}
                      style={{
                        backgroundColor:
                          file.type === 'folder'
                            ? 'rgba(59, 130, 246, 0.08)'
                            : undefined,
                      }}>
                      {file.type === 'folder' ? (
                        <FolderIcon size={16} color="#3b82f6" />
                      ) : (
                        <FileIcon
                          size={16}
                          color={getExtensionColor(file.extension)}
                        />
                      )}
                    </div>
                    <div {...stylex.props(styles.fileInfo)}>
                      <div {...stylex.props(styles.fileName)}>{file.name}</div>
                      <div {...stylex.props(styles.fileMeta)}>
                        <span>
                          {file.type === 'folder'
                            ? 'Folder'
                            : file.extension?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div {...stylex.props(styles.fileOwner)}>
                      <XDSAvatar
                        src={file.ownerAvatar}
                        name={file.owner}
                        size="tiny"
                      />
                      <span {...stylex.props(styles.listItemMeta)}>
                        {file.owner.split(' ')[0]}
                      </span>
                    </div>
                    {file.size && (
                      <span {...stylex.props(styles.fileSize)}>
                        {file.size}
                      </span>
                    )}
                    <span {...stylex.props(styles.fileModified)}>
                      {file.modified}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div {...stylex.props(styles.filesGrid)}>
                {files.map(file => (
                  <div key={file.id} {...stylex.props(styles.gridItem)}>
                    <div
                      {...stylex.props(styles.gridItemIcon)}
                      style={{
                        backgroundColor:
                          file.type === 'folder'
                            ? 'rgba(59, 130, 246, 0.08)'
                            : undefined,
                      }}>
                      {file.type === 'folder' ? (
                        <FolderIcon size={20} color="#3b82f6" />
                      ) : (
                        <FileIcon
                          size={20}
                          color={getExtensionColor(file.extension)}
                        />
                      )}
                    </div>
                    <div {...stylex.props(styles.gridItemName)}>
                      {file.name}
                    </div>
                    <span {...stylex.props(styles.gridItemMeta)}>
                      {file.modified}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div {...stylex.props(styles.emptyState)}>
              <XDSText type="supporting" color="secondary">
                Select a project to browse files
              </XDSText>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
