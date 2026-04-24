import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';
import {XDSResizeHandle, useResizable} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';

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
  title: 'Components/Resizable',
  component: XDSResizeHandle,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hook-based resizable panel system. useResizable() manages size state; ' +
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
    const sidebar = useResizable({
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
    const top = useResizable({
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
    const sidebar = useResizable({
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
    const explorer = useResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400,
    });
    const editor = useResizable({
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
    const sidebar = useResizable({
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
    const sidebar = useResizable({defaultSize: 250, minSizePx: 150});
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
