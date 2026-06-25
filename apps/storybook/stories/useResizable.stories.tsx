// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useResizable, ResizeHandle} from '@astryxdesign/core/Resizable';
import {Layout, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';

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
  title: 'Core/useResizable',
  component: HookDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hook that manages resize state for panel regions. ' +
          'Pair with ResizeHandle for interactive resizing.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof HookDemo>;

/** Two side-by-side panels with a divider handle. */
export const Horizontal: Story = {
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                Sidebar
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
              />
            </>
          }
          content={<LayoutContent>Content</LayoutContent>}
        />
      </div>
    );
  },
};

/** Vertical layout — top and bottom panels. */
export const Vertical: Story = {
  render: () => {
    const top = useResizable({
      defaultSize: 150,
      minSizePx: 60,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          header={
            <>
              <LayoutPanel width="100%" padding={4}>
                <div style={{height: top.size}}>Header</div>
              </LayoutPanel>
              <ResizeHandle
                direction="vertical"
                hasDivider
                resizable={top.props}
              />
            </>
          }
          content={<LayoutContent>Content</LayoutContent>}
        />
      </div>
    );
  },
};

/** Three panels with two handles — mail client layout. */
export const ThreePanel: Story = {
  render: () => {
    const left = useResizable({
      defaultSize: 180,
      minSizePx: 120,
      maxSizePx: 300,
    });
    const right = useResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={left.size} hasDivider={false}>
                Folders
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={left.props}
              />
            </>
          }
          content={<LayoutContent>Inbox</LayoutContent>}
          end={
            <>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                isReversed
                resizable={right.props}
              />
              <LayoutPanel width={right.size} hasDivider={false}>
                Preview
              </LayoutPanel>
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
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350,
    });
    const editor = useResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                Explorer
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
              />
            </>
          }
          content={
            <LayoutContent padding={0}>
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
                <ResizeHandle
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
            </LayoutContent>
          }
        />
      </div>
    );
  },
};

/** Always-visible pill grip with divider line. */
export const AlwaysVisible: Story = {
  render: () => {
    const sidebar = useResizable({
      defaultSize: 250,
      minSizePx: 100,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                Sidebar
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={sidebar.props}
              />
            </>
          }
          content={<LayoutContent>Content</LayoutContent>}
        />
      </div>
    );
  },
};

/** Mixed container styles — no divider lines, relying on background contrast. */
export const MixedContainers: Story = {
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350,
    });
    const editor = useResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel
                width={sidebar.size}
                hasDivider={false}
                xstyle={s.muted}>
                Explorer
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                resizable={sidebar.props}
              />
            </>
          }
          content={
            <LayoutContent padding={0}>
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
                <ResizeHandle
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
            </LayoutContent>
          }
        />
      </div>
    );
  },
};
