'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSSection} from '@xds/core/Section';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  TagIcon,
  EllipsisHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  Bars4Icon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import {FolderIcon} from '@heroicons/react/24/solid';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
}

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

const styles = stylex.create({
  fillHeight: {height: '100%'},
  scrollable: {overflowY: 'auto'},
  fixedColumn: {flexShrink: 0, alignSelf: 'stretch'},
  fillRemaining: {flex: 1, alignSelf: 'stretch'},
});

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

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.substring(dot + 1).toUpperCase() : 'File';
}

export default function FileExplorerPage() {
  const [selectedPath, setSelectedPath] = useState<string[]>([
    'applications',
    'chrome-apps',
    'component-lab',
  ]);

  const columns = useMemo(() => {
    const cols: {items: FileSystemItem[]; selectedId: string | null}[] = [];
    cols.push({items: FILESYSTEM, selectedId: selectedPath[0] ?? null});
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

  const selectedFile = useMemo(() => {
    if (selectedPath.length === 0) return null;
    const lastId = selectedPath[selectedPath.length - 1];
    const item = findItem(FILESYSTEM, lastId);
    return item?.type === 'file' ? item : null;
  }, [selectedPath]);

  const handleSelect = (columnIndex: number, itemId: string) => {
    setSelectedPath([...selectedPath.slice(0, columnIndex), itemId]);
  };

  return (
    <XDSLayout
      height="fill"
      header={
        <XDSToolbar
            label="File Explorer"
            size="sm"
            dividers={['bottom']}
            startContent={
              <>
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={ChevronLeftIcon} size="sm" />}
                  onClick={() => {
                    if (selectedPath.length > 0) {
                      setSelectedPath(selectedPath.slice(0, -1));
                    }
                  }}
                  isDisabled={selectedPath.length === 0}
                  label="Go back"
                />
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={ChevronRightIcon} size="sm" />}
                  isDisabled
                  label="Go forward"
                />
                <XDSText type="label">{currentFolderName}</XDSText>
              </>
            }
            centerContent={
              <XDSSegmentedControl
                value="column"
                onChange={() => {}}
                label="View mode">
                <XDSSegmentedControlItem
                  value="grid"
                  label="Grid"
                  icon={<XDSIcon icon={Squares2X2Icon} size="sm" />}
                  isLabelHidden
                />
                <XDSSegmentedControlItem
                  value="list"
                  label="List"
                  icon={<XDSIcon icon={Bars4Icon} size="sm" />}
                  isLabelHidden
                />
                <XDSSegmentedControlItem
                  value="column"
                  label="Column"
                  icon={<XDSIcon icon={ViewColumnsIcon} size="sm" />}
                  isLabelHidden
                />
                <XDSSegmentedControlItem
                  value="gallery"
                  label="Gallery"
                  icon={<XDSIcon icon={TableCellsIcon} size="sm" />}
                  isLabelHidden
                />
              </XDSSegmentedControl>
            }
            endContent={
              <>
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={AdjustmentsHorizontalIcon} size="sm" />}
                  label="Group"
                />
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={ShareIcon} size="sm" />}
                  label="Share"
                />
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={TagIcon} size="sm" />}
                  label="Tags"
                />
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={EllipsisHorizontalIcon} size="sm" />}
                  label="More"
                />
                <XDSIconButton
                  variant="ghost"
                  size="sm"
                  icon={<XDSIcon icon={MagnifyingGlassIcon} size="sm" />}
                  label="Search"
                />
              </>
            }
          />
      }
      content={
        <XDSLayoutContent padding={0} isScrollable={false}>
          <XDSHStack xstyle={styles.fillHeight}>
            {columns.map((col, colIndex) => {
              const showDivider =
                colIndex < columns.length - 1 || selectedFile != null;
              return (
                <XDSSection
                  key={colIndex}
                  width={240}
                  padding={2}
                  variant="transparent"
                  dividers={showDivider ? ['end'] : undefined}
                  xstyle={[styles.scrollable, styles.fixedColumn]}>
                  <XDSList density="compact" hasDividers={false}>
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
                          startContent={
                            <XDSIcon
                              icon={
                                item.type === 'folder'
                                  ? FolderIcon
                                  : DocumentIcon
                              }
                              color={
                                item.type === 'folder'
                                  ? 'accent'
                                  : 'secondary'
                              }
                              size="sm"
                            />
                          }
                          endContent={
                            hasChildren ? (
                              <XDSIcon
                                icon={ChevronRightIcon}
                                size="xsm"
                                color="secondary"
                              />
                            ) : undefined
                          }
                          onClick={() => handleSelect(colIndex, item.id)}
                          isSelected={isSelected}
                        />
                      );
                    })}
                  </XDSList>
                </XDSSection>
              );
            })}
            {selectedFile && (
              <XDSSection
                padding={6}
                variant="transparent"
                xstyle={[styles.scrollable, styles.fillRemaining]}>
                <XDSVStack gap={4} hAlign="center">
                  <XDSAvatar name={selectedFile.name} size={96} />
                  <XDSVStack gap={1} hAlign="center">
                    <XDSText type="label">{selectedFile.name}</XDSText>
                    <XDSText type="supporting">
                      {getFileExtension(selectedFile.name)} Document
                    </XDSText>
                  </XDSVStack>
                  <XDSMetadataList title="Information">
                    <XDSMetadataListItem label="Created">
                      March 28, 2026 at 2:15 PM
                    </XDSMetadataListItem>
                    <XDSMetadataListItem label="Modified">
                      Yesterday, 10:27 PM
                    </XDSMetadataListItem>
                    <XDSMetadataListItem label="Kind">
                      {getFileExtension(selectedFile.name)} Document
                    </XDSMetadataListItem>
                  </XDSMetadataList>
                </XDSVStack>
              </XDSSection>
            )}
          </XDSHStack>
        </XDSLayoutContent>
      }
    />
  );
}
