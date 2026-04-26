import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

const s = stylex.create({
  shell: {
    height: 300,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
  },
  muted: {backgroundColor: colorVars['--color-background-muted']},
  card: {
    backgroundColor: colorVars['--color-background-card'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    margin: spacingVars['--spacing-2'],
  },
});

function HookDemo({children}: {children: React.ReactNode}) {
  return <div>{children}</div>;
}

const meta: Meta<typeof HookDemo> = {
  title: 'Core/Hooks/useXDSResizable',
  component: HookDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hook that manages resize state for panel regions. ' +
          'Pair with XDSResizeHandle for interactive resizing.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof HookDemo>;

/** Two side-by-side panels with a divider handle. */
export const Horizontal: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                Sidebar
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
              />
            </>
          }
          content={<XDSLayoutContent>Content</XDSLayoutContent>}
        />
      </div>
    );
  },
};

/** Vertical layout — top and bottom panels. */
export const Vertical: Story = {
  render: () => {
    const top = useXDSResizable({
      defaultSize: 150,
      minSizePx: 60,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <XDSLayout
          height="fill"
          header={
            <>
              <XDSLayoutPanel width="100%" padding={4}>
                <div style={{height: top.size}}>Header</div>
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="vertical"
                hasDivider
                resizable={top.props}
              />
            </>
          }
          content={<XDSLayoutContent>Content</XDSLayoutContent>}
        />
      </div>
    );
  },
};

/** Three panels with two handles — mail client layout. */
export const ThreePanel: Story = {
  render: () => {
    const left = useXDSResizable({
      defaultSize: 180,
      minSizePx: 120,
      maxSizePx: 300,
    });
    const right = useXDSResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={left.size} hasDivider={false}>
                Folders
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={left.props}
              />
            </>
          }
          content={<XDSLayoutContent>Inbox</XDSLayoutContent>}
          end={
            <>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                isReversed
                resizable={right.props}
              />
              <XDSLayoutPanel width={right.size} hasDivider={false}>
                Preview
              </XDSLayoutPanel>
            </>
          }
        />
      </div>
    );
  },
};

/** Nested — horizontal split with a vertical split inside. */
export const Nested: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350,
    });
    const editor = useXDSResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                Explorer
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
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
                <div
                  style={{
                    height: editor.size,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  Editor
                </div>
                <XDSResizeHandle
                  direction="vertical"
                  hasDivider
                  resizable={editor.props}
                />
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  Terminal
                </div>
              </div>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};

/** Always-visible pill grip with divider line. */
export const AlwaysVisible: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 250,
      minSizePx: 100,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel width={sidebar.size} hasDivider={false}>
                Sidebar
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
              />
            </>
          }
          content={<XDSLayoutContent>Content</XDSLayoutContent>}
        />
      </div>
    );
  },
};

/** Mixed container styles — no divider lines, relying on background contrast. */
export const MixedContainers: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350,
    });
    const editor = useXDSResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <XDSLayout
          height="fill"
          start={
            <>
              <XDSLayoutPanel
                width={sidebar.size}
                hasDivider={false}
                xstyle={s.muted}>
                Explorer
              </XDSLayoutPanel>
              <XDSResizeHandle
                direction="horizontal"
                resizable={sidebar.props}
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
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  Editor
                </div>
                <XDSResizeHandle
                  direction="vertical"
                  resizable={editor.props}
                />
                <div
                  {...stylex.props(s.card)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  Terminal
                </div>
              </div>
            </XDSLayoutContent>
          }
        />
      </div>
    );
  },
};
