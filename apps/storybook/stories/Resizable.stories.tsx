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
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSStack,
} from '@xds/core/Layout';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSDivider} from '@xds/core/Divider';

const ps = stylex.create({
  container: {
    display: 'flex',
    height: 400,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
  },
  containerV: {flexDirection: 'column'},
  panel: {padding: spacingVars['--spacing-4'], overflow: 'auto', flexShrink: 0},
  start: {backgroundColor: colorVars['--color-background-muted']},
  main: {flex: 1, minWidth: 0, minHeight: 0},
  end: {backgroundColor: colorVars['--color-background-muted']},
  collapsed: {
    padding: spacingVars['--spacing-1'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
          'XDSResizeHandle provides the interactive pill-grip separator.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof XDSResizeHandle>;

/** Basic horizontal split — sidebar + content. Hover the divider to see the grip pill. */
export const HorizontalSplit: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 250,
      minSizePx: 150,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(ps.container)}>
        <div
          {...stylex.props(ps.panel, ps.start)}
          style={{width: sidebar.size}}>
          <XDSStack gap="space2">
            <XDSHeading level={4}>Sidebar</XDSHeading>
            <XDSText>
              <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
            </XDSText>
            <XDSText>
              Drag the handle to resize. Use arrow keys when focused.
            </XDSText>
          </XDSStack>
        </div>
        <XDSResizeHandle
          direction="horizontal"
          resizable={sidebar.props}
          label="Resize sidebar"
        />
        <div {...stylex.props(ps.panel, ps.main)}>
          <XDSStack gap="space2">
            <XDSHeading level={4}>Content</XDSHeading>
            <XDSText>Main content area fills remaining space.</XDSText>
          </XDSStack>
        </div>
      </div>
    );
  },
};

/** Vertical split — editor on top, terminal below. */
export const VerticalSplit: Story = {
  render: () => {
    const top = useXDSResizable({
      defaultSize: 250,
      minSizePx: 100,
      maxSizePx: 350,
    });
    return (
      <div {...stylex.props(ps.container, ps.containerV)}>
        <div {...stylex.props(ps.panel, ps.start)} style={{height: top.size}}>
          <XDSStack gap="space2">
            <XDSHeading level={4}>Editor</XDSHeading>
            <XDSText>
              <span {...stylex.props(ps.sz)}>{top.size}px</span>
            </XDSText>
          </XDSStack>
        </div>
        <XDSResizeHandle
          direction="vertical"
          resizable={top.props}
          label="Resize editor"
        />
        <div {...stylex.props(ps.panel, ps.main)}>
          <XDSStack gap="space2">
            <XDSHeading level={4}>Terminal</XDSHeading>
            <XDSText>Bottom panel fills remaining space.</XDSText>
          </XDSStack>
        </div>
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
      <div {...stylex.props(ps.container)}>
        <div
          {...stylex.props(
            ps.panel,
            ps.start,
            sidebar.isCollapsed && ps.collapsed,
          )}
          style={{width: sidebar.isCollapsed ? 0 : sidebar.size}}>
          {sidebar.isCollapsed ? (
            <XDSText>\u2630</XDSText>
          ) : (
            <XDSStack gap="space2">
              <XDSHeading level={4}>Sidebar</XDSHeading>
              <XDSText>
                <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
              </XDSText>
              <XDSText>Double-click handle or press Enter to collapse.</XDSText>
            </XDSStack>
          )}
        </div>
        <XDSResizeHandle
          direction="horizontal"
          resizable={sidebar.props}
          label="Resize sidebar"
        />
        <div {...stylex.props(ps.panel, ps.main)}>
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
        </div>
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
      <div {...stylex.props(ps.container)}>
        <div
          {...stylex.props(ps.panel, ps.start)}
          style={{width: explorer.size}}>
          <XDSStack gap="space2">
            <XDSHeading level={4}>Explorer</XDSHeading>
            <XDSText>
              <span {...stylex.props(ps.sz)}>{explorer.size}px</span>
            </XDSText>
          </XDSStack>
        </div>
        <XDSResizeHandle
          direction="horizontal"
          resizable={explorer.props}
          label="Resize explorer"
        />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
          <div {...stylex.props(ps.panel)} style={{height: editor.size}}>
            <XDSStack gap="space2">
              <XDSHeading level={4}>Editor</XDSHeading>
              <XDSText>
                <span {...stylex.props(ps.sz)}>{editor.size}px</span>
              </XDSText>
            </XDSStack>
          </div>
          <XDSResizeHandle
            direction="vertical"
            resizable={editor.props}
            label="Resize editor"
          />
          <div {...stylex.props(ps.panel, ps.main)}>
            <XDSHeading level={4}>Terminal</XDSHeading>
          </div>
        </div>
      </div>
    );
  },
};

/** Snap points — sidebar snaps to 56px (icon rail) and 260px (full). */
export const SnapPoints: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 260,
      minSizePx: 56,
      maxSizePx: 400,
      snaps: [56, 260],
    });
    const isRail = sidebar.size <= 60;
    return (
      <div {...stylex.props(ps.container)}>
        <div
          {...stylex.props(ps.panel, ps.start, isRail && ps.collapsed)}
          style={{width: sidebar.size}}>
          {isRail ? (
            <XDSText>\u2630</XDSText>
          ) : (
            <XDSStack gap="space2">
              <XDSHeading level={4}>Sidebar</XDSHeading>
              <XDSText>
                <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
              </XDSText>
              <XDSText>Snaps to 56px (rail) and 260px (full).</XDSText>
            </XDSStack>
          )}
        </div>
        <XDSResizeHandle
          direction="horizontal"
          resizable={sidebar.props}
          label="Resize sidebar"
        />
        <div {...stylex.props(ps.panel, ps.main)}>
          <XDSHeading level={4}>Content</XDSHeading>
        </div>
      </div>
    );
  },
};

/** Disabled handle — visible but non-interactive. */
export const Disabled: Story = {
  render: () => {
    const sidebar = useXDSResizable({defaultSize: 250, minSizePx: 150});
    return (
      <div {...stylex.props(ps.container)}>
        <div
          {...stylex.props(ps.panel, ps.start)}
          style={{width: sidebar.size}}>
          <XDSHeading level={4}>Sidebar (locked)</XDSHeading>
        </div>
        <XDSResizeHandle
          direction="horizontal"
          resizable={sidebar.props}
          isDisabled
          label="Locked"
        />
        <div {...stylex.props(ps.panel, ps.main)}>
          <XDSHeading level={4}>Content</XDSHeading>
        </div>
      </div>
    );
  },
};

/** Integration with XDSLayout — resizable sidebar panel inside a full layout. */
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
      <div
        style={{
          height: 500,
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
        <XDSLayout
          height="fill"
          start={
            <div style={{display: 'flex', height: '100%'}}>
              <XDSLayoutPanel
                width={sidebar.isCollapsed ? 0 : sidebar.size}
                hasDivider={false}
                role="navigation"
                label="Sidebar">
                <XDSStack gap="space2">
                  <XDSHeading level={4}>Navigation</XDSHeading>
                  <XDSText>
                    <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                  </XDSText>
                  <XDSDivider />
                  <XDSText>Drag the handle to resize this panel.</XDSText>
                  <XDSText>Double-click or press Enter to collapse.</XDSText>
                </XDSStack>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                resizable={sidebar.props}
                label="Resize navigation"
              />
            </div>
          }
          content={
            <XDSLayoutContent>
              <XDSStack gap="space3">
                <XDSHeading level={3}>Main Content</XDSHeading>
                <XDSText>
                  This demonstrates useXDSResizable + XDSResizeHandle working
                  alongside XDSLayout and XDSLayoutPanel. The sidebar width is
                  driven by the hook, and the handle sits between the panel and
                  content area.
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
                      Expand sidebar
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

/** AppShell with resizable SideNav — the target integration pattern. */
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
    const isRail = nav.size <= 60;

    return (
      <div
        style={{
          height: 500,
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
        <div style={{display: 'flex', height: '100%'}}>
          <div
            style={{
              width: nav.isCollapsed ? 0 : nav.size,
              flexShrink: 0,
              overflow: 'hidden',
            }}>
            <XDSSideNav>
              {!isRail && (
                <XDSHeading level={4} xstyle={sidenavPadding}>
                  App Name
                </XDSHeading>
              )}
              <XDSSideNavItem label="Home" isSelected />
              <XDSSideNavItem label="Dashboard" />
              <XDSSideNavItem label="Settings" />
            </XDSSideNav>
          </div>
          <XDSResizeHandle
            direction="horizontal"
            resizable={nav.props}
            label="Resize navigation"
          />
          <div style={{flex: 1, padding: 24, overflow: 'auto'}}>
            <XDSStack gap="space3">
              <XDSHeading level={3}>Dashboard</XDSHeading>
              <XDSText>
                <span {...stylex.props(ps.sz)}>{nav.size}px</span>
                {' — '}
                {nav.isCollapsed
                  ? 'Collapsed'
                  : isRail
                    ? 'Rail mode (56px snap)'
                    : 'Expanded'}
              </XDSText>
              <XDSText>
                The SideNav width is driven by useXDSResizable. Snap points at
                56px (icon rail) and 260px (full). Double-click the handle to
                collapse.
              </XDSText>
            </XDSStack>
          </div>
        </div>
      </div>
    );
  },
};

const sidenavPadding = stylex.create({
  base: {
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
  },
}).base;
