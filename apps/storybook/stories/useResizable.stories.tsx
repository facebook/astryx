// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef} from 'react';
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
  title: 'Core/Hooks/useResizable',
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
              <ResizeHandle direction="horizontal" resizable={sidebar.props} />
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
                <ResizeHandle direction="vertical" resizable={editor.props} />
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

/**
 * Percentage configuration, resolved against a container.
 *
 * `containerRef` marks what a percentage is a share of. The panel starts at 40%
 * of the frame's content box and cannot be dragged past 60% of it. Narrow the
 * frame and the BOUNDS follow — but the size you dragged to stays the pixel
 * size you chose, clamped rather than rescaled. That is the whole contract:
 * percentages configure pixels, they do not create a responsive mode.
 */
export const PercentageSizing: Story = {
  render: () => {
    const frameRef = useRef<HTMLDivElement>(null);
    const region = useResizable({
      defaultSize: '40%',
      minSize: '15%',
      maxSize: '60%',
      containerRef: frameRef,
    });
    return (
      <div ref={frameRef} {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={region.size} hasDivider={false}>
                <div {...stylex.props(s.card)}>{Math.round(region.size)}px</div>
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={region.props}
              />
            </>
          }
          content={<LayoutContent>Content</LayoutContent>}
        />
      </div>
    );
  },
};

/**
 * The compatibility path: a percentage with no `containerRef`.
 *
 * This is what shipped before percentages could name a container, and it is
 * unchanged — `'25%'` resolves once against `window.innerWidth` (1200px on the
 * server), then behaves as pixels. Resize the window and the panel stays where
 * it is; only a percentage BOUND would follow.
 */
export const ViewportPercentage: Story = {
  render: () => {
    const region = useResizable({defaultSize: '25%', minSize: 80});
    return (
      <div {...stylex.props(s.shell)} data-testid="viewport-pct">
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={region.size} hasDivider={false}>
                <div {...stylex.props(s.card)}>{Math.round(region.size)}px</div>
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={region.props}
              />
            </>
          }
          content={<LayoutContent>Content</LayoutContent>}
        />
      </div>
    );
  },
};

/**
 * A bound that is proportional on a wide container and fixed on a narrow one.
 *
 * `minSize: 'max(40%, 333px)'` is the CSS spelling and the CSS meaning: the
 * terms resolve to pixels against the container, and the larger wins. Above a
 * 832.5px frame that is the 40% arm; below it, the 333px floor holds and the
 * panel stops shrinking. `maxSize: 'min(400px, 10%)'` is the mirror image — a
 * 400px cap that tightens to 10% once the frame is under 4000px.
 *
 * Narrow the frame and watch the reported minimum change arm. Only the BOUNDS
 * move; the size you dragged to stays the pixel size you chose.
 */
export const ExpressionBounds: Story = {
  render: () => {
    const frameRef = useRef<HTMLDivElement>(null);
    const region = useResizable({
      defaultSize: '50%',
      minSize: 'max(40%, 333px)',
      maxSize: 'min(400px, 10%)',
      containerRef: frameRef,
    });
    return (
      <div ref={frameRef} {...stylex.props(s.shell)}>
        <Layout
          height="fill"
          start={
            <>
              <LayoutPanel width={region.size} hasDivider={false}>
                <div {...stylex.props(s.card)}>
                  {Math.round(region.size)}px · min{' '}
                  {Math.round(region.props._minSizePx)} · max{' '}
                  {Math.round(region.props._maxSizePx)}
                </div>
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={region.props}
              />
            </>
          }
          content={<LayoutContent>Content</LayoutContent>}
        />
      </div>
    );
  },
};
