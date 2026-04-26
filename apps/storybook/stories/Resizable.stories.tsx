import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';
import {XDSResizeHandle, useXDSResizable} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSStack,
} from '@xds/core/Layout';
import {XDSSideNav, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSDivider} from '@xds/core/Divider';

const ps = stylex.create({
  shell: {
    height: 400,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
  },
  sz: {opacity: 0.6, fontSize: 12, fontFamily: 'monospace'},
});

const meta: Meta<typeof XDSResizeHandle> = {
  title: 'Lab/Resizable',
  component: XDSResizeHandle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hook-based resizable panel system. useXDSResizable() manages size state; ' +
          'XDSResizeHandle provides the interactive pill-grip separator with optional divider line.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof XDSResizeHandle>;
/** Basic horizontal split with divider line. */
export const HorizontalSplit: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 250,
      minSizePx: 150,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                <XDSStack gap="space2">
                  <XDSHeading level={4}>Sidebar</XDSHeading>
                  <XDSText>
                    <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                  </XDSText>
                  <XDSText>
                    Drag the handle to resize. Arrow keys when focused.
                  </XDSText>
                </XDSStack>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
                label="Resize sidebar"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSStack gap="space2">
                <XDSHeading level={4}>Content</XDSHeading>
                <XDSText>Main content area fills remaining space.</XDSText>
              </XDSStack>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Vertical split with divider line. */
export const VerticalSplit: Story = {
  render: () => {
    const top = useXDSResizable({
      defaultSize: 250,
      minSizePx: 100,
      maxSizePx: 350,
    });
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          header={
            <div style={{height: top.size}}>
              <XDSLayoutPanel padding={4} width="100%">
                <XDSStack gap="space2">
                  <XDSHeading level={4}>Editor</XDSHeading>
                  <XDSText>
                    <span {...stylex.props(ps.sz)}>{top.size}px</span>
                  </XDSText>
                </XDSStack>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="vertical"
                hasDivider
                resizable={top.props}
                label="Resize editor"
              />
            </div>
          }
          content={
            <XDSLayoutContent>
              <XDSStack gap="space2">
                <XDSHeading level={4}>Terminal</XDSHeading>
                <XDSText>Bottom panel fills remaining space.</XDSText>
              </XDSStack>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Collapsible sidebar — drag past threshold or double-click to collapse. */
export const Collapsible: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 260,
      minSizePx: 180,
      collapsible: true,
      collapsedSize: 60,
    });
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              {!sidebar.isCollapsed && (
                <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                  <XDSStack gap="space2">
                    <XDSHeading level={4}>Sidebar</XDSHeading>
                    <XDSText>
                      <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                    </XDSText>
                    <XDSText>
                      Double-click handle or press Enter to collapse.
                    </XDSText>
                  </XDSStack>
                </XDSLayoutPanel>
              )}
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
                label="Resize sidebar"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSStack gap="space2">
                <XDSHeading level={4}>Content</XDSHeading>
                <XDSText>
                  Sidebar is {sidebar.isCollapsed ? 'collapsed' : 'expanded'}.
                  {sidebar.isCollapsed && (
                    <button
                      onClick={() => sidebar.expand()}
                      style={{marginLeft: 8}}>
                      Expand
                    </button>
                  )}
                </XDSText>
              </XDSStack>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Three-panel IDE layout with nested horizontal + vertical splits. */
export const ThreePanelIDE: Story = {
  render: () => {
    const explorer = useXDSResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400,
    });
    const editor = useXDSResizable({
      defaultSize: 280,
      minSizePx: 100,
      maxSizePx: 350,
    });
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={explorer.size} hasDivider={false}>
                <XDSStack gap="space2">
                  <XDSHeading level={4}>Explorer</XDSHeading>
                  <XDSText>
                    <span {...stylex.props(ps.sz)}>{explorer.size}px</span>
                  </XDSText>
                </XDSStack>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={explorer.props}
                label="Resize explorer"
              />
            </>
          }
          content={
            <XDSLayoutContent padding={0}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                <div style={{flex: 'none', height: editor.size, padding: 16}}>
                  <XDSStack gap="space2">
                    <XDSHeading level={4}>Editor</XDSHeading>
                    <XDSText>
                      <span {...stylex.props(ps.sz)}>{editor.size}px</span>
                    </XDSText>
                  </XDSStack>
                </div>
                <XDSResizeHandle
                  direction="vertical"
                  hasDivider
                  resizable={editor.props}
                  label="Resize editor"
                />
                <div style={{flex: 1, padding: 16}}>
                  <XDSHeading level={4}>Terminal</XDSHeading>
                </div>
              </div>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Snap points — sidebar snaps to predefined widths. */
export const SnapPoints: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 260,
      minSizePx: 56,
      maxSizePx: 600,
      snaps: [56, 160, 260, 400],
    });
    const isRail = sidebar.size <= 60;
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                {isRail ? (
                  <XDSText>{'\u2630'}</XDSText>
                ) : (
                  <XDSStack gap="space2">
                    <XDSHeading level={4}>Sidebar</XDSHeading>
                    <XDSText>
                      <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                    </XDSText>
                    <XDSText>
                      Snaps to 56 \u00b7 160 \u00b7 260 \u00b7 400px.
                    </XDSText>
                  </XDSStack>
                )}
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
                label="Resize sidebar"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSHeading level={4}>Content</XDSHeading>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Pill hidden at rest — only appears on hover/focus. */
export const HiddenPill: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 250,
      minSizePx: 150,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                <XDSStack gap="space2">
                  <XDSHeading level={4}>Sidebar</XDSHeading>
                  <XDSText>
                    <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                  </XDSText>
                  <XDSText>Pill only appears on hover.</XDSText>
                </XDSStack>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                isAlwaysVisible={false}
                resizable={sidebar.props}
                label="Resize sidebar"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSHeading level={4}>Content</XDSHeading>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Disabled handle — divider visible but non-interactive. */
export const Disabled: Story = {
  render: () => {
    const sidebar = useXDSResizable({defaultSize: 250, minSizePx: 150});
    return (
      <div {...stylex.props(ps.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                <XDSHeading level={4}>Sidebar (locked)</XDSHeading>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
                isDisabled
                label="Locked"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSHeading level={4}>Content</XDSHeading>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Integration with XDSLayout — resizable sidebar with collapsible. */
export const WithXDSLayout: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 260,
      minSizePx: 180,
      maxSizePx: 450,
      collapsible: true,
      collapsedSize: 50,
    });
    return (
      <div {...stylex.props(ps.shell)} style={{height: 500}}>
        <XDSLayout
          height="fill"
          start={
            <>
              {!sidebar.isCollapsed && (
                <XDSLayoutPanel
                  resizable={sidebar.props}
                  hasDivider={false}
                  role="navigation"
                  label="Sidebar">
                  <XDSStack gap="space2">
                    <XDSHeading level={4}>Navigation</XDSHeading>
                    <XDSText>
                      <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                    </XDSText>
                    <XDSDivider />
                    <XDSText>Drag the handle to resize.</XDSText>
                    <XDSText>Double-click or press Enter to collapse.</XDSText>
                  </XDSStack>
                </XDSLayoutPanel>
              )}
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
                label="Resize navigation"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSStack gap="space3">
                <XDSHeading level={3}>Main Content</XDSHeading>
                <XDSText>
                  XDSLayoutPanel with resizable prop + XDSResizeHandle with
                  hasDivider.
                </XDSText>
                <XDSText>
                  Sidebar is{' '}
                  <strong>
                    {sidebar.isCollapsed ? 'collapsed' : 'expanded'}
                  </strong>
                  {sidebar.isCollapsed && (
                    <button
                      onClick={() => sidebar.expand()}
                      style={{marginLeft: 8}}>
                      Expand
                    </button>
                  )}
                </XDSText>
              </XDSStack>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** AppShell with resizable SideNav. */
export const WithAppShell: Story = {
  render: () => {
    const nav = useXDSResizable({
      defaultSize: 260,
      minSizePx: 200,
      maxSizePx: 400,
      collapsible: true,
      collapsedSize: 50,
      snaps: [56, 260],
    });
    return (
      <div {...stylex.props(ps.shell)} style={{height: 500}}>
        <XDSLayout
          height="fill"
          start={
            <>
              {!nav.isCollapsed && (
                <XDSLayoutPanel width={nav.size} hasDivider={false} padding={0}>
                  <XDSSideNav>
                    <XDSSideNavItem label="Home" isSelected />
                    <XDSSideNavItem label="Dashboard" />
                    <XDSSideNavItem label="Settings" />
                  </XDSSideNav>
                </XDSLayoutPanel>
              )}
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={nav.props}
                label="Resize navigation"
              />
            </>
          }
          content={
            <XDSLayoutContent>
              <XDSStack gap="space3">
                <XDSHeading level={3}>Dashboard</XDSHeading>
                <XDSText>
                  <span {...stylex.props(ps.sz)}>{nav.size}px</span>
                  {' \u2014 '}
                  {nav.isCollapsed ? 'Collapsed' : 'Expanded'}
                </XDSText>
                <XDSText>
                  SideNav width driven by useXDSResizable. Double-click handle
                  to collapse.
                </XDSText>
              </XDSStack>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};
