// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';

import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@xds/core/Layout';
import {XDSResizeHandle, useXDSResizable} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {XDSStack} from '@xds/core/Layout';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSButton} from '@xds/core/Button';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTreeList} from '@xds/core/TreeList';
import type {XDSTreeListItemData} from '@xds/core/TreeList';
import {
  FolderIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BugAntIcon,
  HomeIcon,
  FolderOpenIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderOpenIcon as FolderOpenSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  PuzzlePieceIcon as PuzzlePieceSolid,
} from '@heroicons/react/24/solid';

const styles = stylex.create({
  contentFill: {
    height: '100%',
  },
  terminalWrapper: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
  },
  tabListPadding: {
    paddingTop: spacingVars['--spacing-2'],
  },
  metadataCompact: {
    gap: `${spacingVars['--spacing-1']} ${spacingVars['--spacing-3']}`,
  },
  historyTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-border-emphasized'],
    marginTop: 6,
    flexShrink: 0,
  },
  editorArea: {
    flex: 1,
    overflow: 'auto',
  },
  fileExplorer: {
    padding: 16,
  },
  terminalArea: {
    height: '100%',
    overflow: 'hidden',
  },
  hideOnMobile: {
    display: {
      default: 'contents',
      '@media (max-width: 768px)': 'none',
    },
  },
  hideSideNav: {
    display: {
      default: 'flex',
      '@media (max-width: 768px)': 'none',
    },
  },
});

const EDITOR_CODE = `import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 16,
  },
  counter: {
    fontSize: 48,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
});

export default function Counter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return (
    <div {...stylex.props(styles.container)}>
      <XDSText type="label">Counter</XDSText>
      <span {...stylex.props(styles.counter)}>
        {count}
      </span>
      <XDSButton label="Increment" onClick={increment} />
      <XDSButton label="Reset" variant="secondary" onClick={reset} />
    </div>
  );
}`;

const TERMINAL_OUTPUT = `$ yarn dev
yarn run v1.22.22
$ next dev
   \u25B2 Next.js 15.5.15
   - Local:   http://localhost:3000

 \u2713 Ready in 2.4s
 \u25CB Compiling /counter ...
 \u2713 Compiled /counter in 1.2s (847 modules)
 GET /counter 200 in 1340ms

$ `;

function buildFileTree(
  onFileClick: (name: string) => void,
): XDSTreeListItemData[] {
  const file = (id: string): XDSTreeListItemData => ({
    id,
    label: id,
    startContent: <XDSIcon icon={DocumentTextIcon} size="xsm" />,
    onClick: () => onFileClick(id),
  });
  return [
    {
      id: 'src',
      label: 'src',
      startContent: <XDSIcon icon={FolderIcon} size="xsm" />,
      isExpanded: true,
      children: [
        {
          id: 'components',
          label: 'components',
          startContent: <XDSIcon icon={FolderIcon} size="xsm" />,
          isExpanded: true,
          children: [
            file('Counter.tsx'),
            file('Header.tsx'),
            file('Layout.tsx'),
          ],
        },
        {
          id: 'pages',
          label: 'pages',
          startContent: <XDSIcon icon={FolderIcon} size="xsm" />,
          isExpanded: true,
          children: [file('index.tsx'), file('about.tsx')],
        },
        {
          id: 'styles',
          label: 'styles',
          startContent: <XDSIcon icon={FolderIcon} size="xsm" />,
          isExpanded: true,
          children: [file('tokens.stylex.ts'), file('theme.ts')],
        },
      ],
    },
    file('package.json'),
    file('tsconfig.json'),
    file('next.config.mjs'),
  ];
}

const PROPERTIES = [
  {label: 'Type', value: 'React Component'},
  {label: 'Language', value: 'TypeScript'},
  {label: 'Lines', value: '42'},
  {label: 'Size', value: '1.2 KB'},
  {label: 'Last modified', value: '2 hours ago'},
  {label: 'Imports', value: '4 modules'},
  {label: 'Exports', value: '1 default'},
  {label: 'Hooks', value: 'useState, useCallback'},
];

const HISTORY_ITEMS = [
  {label: 'Opened Counter.tsx', time: '2 min ago'},
  {label: 'Opened Layout.tsx', time: '6 min ago'},
  {label: 'Viewed tokens.stylex.ts', time: '11 min ago'},
];

export default function ResizableWorkspacePage() {
  const [activeFile, setActiveFile] = useState('Counter.tsx');
  const [activeNavItem, setActiveNavItem] = useState('Explorer');
  const [activeTermTab, setActiveTermTab] = useState('terminal');
  const [activePropertiesTab, setActivePropertiesTab] = useState('properties');
  const fileTree = useMemo(() => buildFileTree(setActiveFile), []);

  const startPanel = useXDSResizable({
    defaultSize: 256,
    minSizePx: 160,
    maxSizePx: 400,
    collapsible: true,
    collapsedSize: 50,
  });

  const endPanel = useXDSResizable({
    defaultSize: 320,
    minSizePx: 180,
    maxSizePx: 500,
    collapsible: true,
    collapsedSize: 50,
  });

  const bottomPanel = useXDSResizable({
    defaultSize: 300,
    minSizePx: 80,
    maxSizePx: Infinity,
    collapsible: true,
    collapsedSize: 40,
  });

  return (
    <XDSLayout
      height="fill"
      start={
        <XDSLayoutPanel hasDivider={false} padding={0}>
          <XDSSideNav
            collapsible={{defaultIsCollapsed: true}}
            resizable
            xstyle={styles.hideSideNav}>
            <XDSSideNavSection title="Navigation" isHeaderHidden>
              <XDSSideNavItem
                label="Home"
                icon={HomeIcon}
                selectedIcon={HomeIconSolid}
                isSelected={activeNavItem === 'Home'}
                onClick={() => setActiveNavItem('Home')}
              />
              <XDSSideNavItem
                label="Explorer"
                icon={FolderOpenIcon}
                selectedIcon={FolderOpenSolid}
                isSelected={activeNavItem === 'Explorer'}
                onClick={() => setActiveNavItem('Explorer')}
              />
              <XDSSideNavItem
                label="Search"
                icon={MagnifyingGlassIcon}
                selectedIcon={MagnifyingGlassSolid}
                isSelected={activeNavItem === 'Search'}
                onClick={() => setActiveNavItem('Search')}
              />
              <XDSSideNavItem
                label="Source Control"
                icon={CodeBracketIcon}
                isSelected={activeNavItem === 'Source Control'}
                onClick={() => setActiveNavItem('Source Control')}
              />
              <XDSSideNavItem
                label="Extensions"
                icon={PuzzlePieceIcon}
                selectedIcon={PuzzlePieceSolid}
                isSelected={activeNavItem === 'Extensions'}
                onClick={() => setActiveNavItem('Extensions')}
              />
            </XDSSideNavSection>
          </XDSSideNav>
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent padding={0}>
          <XDSLayout
            height="fill"
            start={
              <div {...stylex.props(styles.hideOnMobile)}>
                {!startPanel.isCollapsed && (
                  <XDSLayoutPanel
                    width={startPanel.size}
                    hasDivider={false}
                    padding={0}>
                    <XDSStack
                      direction="vertical"
                      xstyle={styles.fileExplorer}
                      gap={2}>
                      <XDSTextInput
                        label="Search files"
                        isLabelHidden
                        value=""
                        placeholder="Search"
                        size="md"
                        startIcon={MagnifyingGlassIcon}
                      />
                      <XDSTreeList items={fileTree} density="compact" />
                    </XDSStack>
                  </XDSLayoutPanel>
                )}
                <XDSResizeHandle
                  direction="horizontal"
                  hasDivider
                  isAlwaysVisible={false}
                  resizable={startPanel.props}
                  label="Resize file explorer"
                />
              </div>
            }
            content={
              <XDSLayoutContent padding={0}>
                <XDSLayout
                  height="fill"
                  content={
                    <XDSLayoutContent padding={0}>
                      <XDSStack
                        direction="vertical"
                        xstyle={styles.contentFill}>
                        <div {...stylex.props(styles.editorArea)}>
                          <XDSCodeBlock
                            code={EDITOR_CODE}
                            language="typescript"
                            hasLineNumbers
                            highlightLines={[21]}
                            hasCopyButton={false}
                            size="sm"
                            style={{
                              width: '100%',
                              height: '100%',
                              borderWidth: 0,
                              borderRadius: 0,
                            }}
                          />
                        </div>
                        <XDSResizeHandle
                          direction="vertical"
                          hasDivider
                          isReversed
                          isAlwaysVisible={false}
                          resizable={bottomPanel.props}
                          label="Resize terminal"
                        />
                        {!bottomPanel.isCollapsed && (
                          <div
                            style={{
                              height: bottomPanel.size,
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}>
                            <XDSStack
                              direction="vertical"
                              xstyle={styles.contentFill}>
                              <XDSTabList
                                value={activeTermTab}
                                onChange={val => setActiveTermTab(val)}
                                size="sm"
                                hasDivider={false}
                                xstyle={styles.tabListPadding}>
                                <XDSTab
                                  label="Terminal"
                                  value="terminal"
                                  icon={
                                    <XDSIcon icon={CommandLineIcon} size="sm" />
                                  }
                                />
                                <XDSTab
                                  label="Problems"
                                  value="problems"
                                  icon={
                                    <XDSIcon
                                      icon={ExclamationTriangleIcon}
                                      size="sm"
                                    />
                                  }
                                />
                                <XDSTab
                                  label="Output"
                                  value="output"
                                  icon={
                                    <XDSIcon
                                      icon={InformationCircleIcon}
                                      size="sm"
                                    />
                                  }
                                />
                                <XDSTab
                                  label="Debug"
                                  value="debug"
                                  icon={<XDSIcon icon={BugAntIcon} size="sm" />}
                                />
                              </XDSTabList>
                              <div {...stylex.props(styles.terminalWrapper)}>
                                <XDSCodeBlock
                                  code={TERMINAL_OUTPUT}
                                  language="bash"
                                  hasCopyButton={false}
                                  size="sm"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    borderWidth: 0,
                                    borderRadius: 0,
                                  }}
                                />
                              </div>
                            </XDSStack>
                          </div>
                        )}
                      </XDSStack>
                    </XDSLayoutContent>
                  }
                  end={
                    <div {...stylex.props(styles.hideOnMobile)}>
                      <XDSResizeHandle
                        direction="horizontal"
                        hasDivider
                        isReversed
                        isAlwaysVisible={false}
                        resizable={endPanel.props}
                        label="Resize properties panel"
                      />
                      {!endPanel.isCollapsed && (
                        <XDSLayoutPanel
                          width={endPanel.size}
                          hasDivider={false}
                          padding={4}>
                          <XDSStack direction="vertical" gap={3}>
                            <XDSSegmentedControl
                              label="Properties panel sections"
                              value={activePropertiesTab}
                              onChange={setActivePropertiesTab}
                              size="sm"
                              layout="fill">
                              <XDSSegmentedControlItem
                                label="Properties"
                                value="properties"
                              />
                              <XDSSegmentedControlItem
                                label="History"
                                value="history"
                              />
                            </XDSSegmentedControl>
                            {activePropertiesTab === 'properties' ? (
                              <>
                                <XDSStack direction="vertical" gap={1}>
                                  <XDSHeading level={3}>
                                    {activeFile}
                                  </XDSHeading>
                                  <XDSText color="secondary" type="supporting">
                                    src/components/{activeFile}
                                  </XDSText>
                                </XDSStack>
                                <XDSMetadataList
                                  xstyle={styles.metadataCompact}>
                                  {PROPERTIES.map(prop => (
                                    <XDSMetadataListItem
                                      key={prop.label}
                                      label={prop.label}>
                                      {prop.value}
                                    </XDSMetadataListItem>
                                  ))}
                                </XDSMetadataList>
                                <XDSStack direction="vertical" gap={2}>
                                  <XDSStack direction="vertical" gap={2}>
                                    <XDSButton
                                      label="Format Document"
                                      size="md"
                                      variant="secondary"
                                    />
                                    <XDSButton
                                      label="Go to Definition"
                                      size="md"
                                      variant="secondary"
                                    />
                                    <XDSButton
                                      label="Find References"
                                      size="md"
                                      variant="secondary"
                                    />
                                  </XDSStack>
                                </XDSStack>
                              </>
                            ) : (
                              <XDSStack direction="vertical" gap={1}>
                                <XDSList>
                                  {HISTORY_ITEMS.map(item => (
                                    <XDSListItem
                                      key={item.label}
                                      label={item.label}
                                      endContent={
                                        <XDSText
                                          type="supporting"
                                          color="secondary">
                                          {item.time}
                                        </XDSText>
                                      }
                                      startContent={
                                        <span
                                          {...stylex.props(
                                            styles.historyTimelineDot,
                                          )}
                                        />
                                      }
                                    />
                                  ))}
                                </XDSList>
                              </XDSStack>
                            )}
                          </XDSStack>
                        </XDSLayoutPanel>
                      )}
                    </div>
                  }
                />
              </XDSLayoutContent>
            }
          />
        </XDSLayoutContent>
      }
    />
  );
}
