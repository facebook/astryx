// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useEffect, useRef, useState} from 'react';
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
  constraintStack: {
    display: 'grid',
    gap: spacingVars['--spacing-4'],
  },
  constraintFrame: {height: 120},
});

function HookDemo({children}: {children: React.ReactNode}) {
  return <div>{children}</div>;
}

function CssMathConstraintProbe({kind}: {kind: 'minimum' | 'maximum'}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const isMinimum = kind === 'minimum';
  const expression = isMinimum ? 'max(40%, 333px)' : 'min(400px, 10%)';
  const region = useResizable(
    isMinimum
      ? {
          defaultSize: 0,
          minSize: 'max(40%, 333px)',
          containerRef: frameRef,
        }
      : {
          defaultSize: 500,
          maxSize: 'min(400px, 10%)',
          containerRef: frameRef,
        },
  );
  const resolvedBound = isMinimum
    ? region.props._minSizePx
    : region.props._maxSizePx;
  const testId = `css-math-${kind}`;

  return (
    <div
      ref={frameRef}
      data-testid={`${testId}-frame`}
      data-expression={expression}
      data-resolved-bound={resolvedBound}
      data-size={region.size}
      {...stylex.props(s.shell, s.constraintFrame)}>
      <Layout
        height="fill"
        start={
          <>
            <LayoutPanel
              width={region.size}
              hasDivider={false}
              data-testid={`${testId}-panel`}>
              {Math.round(region.size)}px
            </LayoutPanel>
            <ResizeHandle
              direction="horizontal"
              hasDivider
              label={`Resize ${kind} constraint example`}
              resizable={region.props}
            />
          </>
        }
        content={<LayoutContent>{expression}</LayoutContent>}
      />
    </div>
  );
}

function CssMathDefaultProbe({
  initialWidth,
  label,
}: {
  initialWidth: number;
  label: 'wide' | 'narrow';
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const expression = 'max(40%, 333px)';
  const storageKey = `storybook-css-math-default-${label}`;
  const region = useResizable({
    defaultSize: expression,
    containerRef: frameRef,
    autoSaveId: storageKey,
  });

  return (
    <div
      ref={frameRef}
      data-testid={`css-math-default-${label}-frame`}
      data-expression={expression}
      data-initial-width={initialWidth}
      data-size={region.size}
      data-storage-key={`astryx-resizable:${storageKey}`}
      {...stylex.props(s.shell, s.constraintFrame)}
      style={{width: initialWidth}}>
      <Layout
        height="fill"
        start={
          <>
            <LayoutPanel
              width={region.size}
              hasDivider={false}
              data-testid={`css-math-default-${label}-panel`}>
              <div {...stylex.props(s.card)}>
                <strong>
                  {label === 'wide' ? 'Wide' : 'Narrow'} initial basis ·{' '}
                  {initialWidth}px outer / {initialWidth - 2}px content
                </strong>
                <div>
                  <code>defaultSize: &apos;{expression}&apos;</code>
                </div>
                <div>{Math.round(region.size)}px initial pixel choice</div>
              </div>
            </LayoutPanel>
            <ResizeHandle
              direction="horizontal"
              hasDivider
              label={`Resize ${label} default expression example`}
              resizable={region.props}
            />
          </>
        }
        content={
          <LayoutContent>
            Later container resizes do not rescale this initial choice.
          </LayoutContent>
        }
      />
    </div>
  );
}

function CssMathDefaultsStory() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem('astryx-resizable:storybook-css-math-default-wide');
    localStorage.removeItem(
      'astryx-resizable:storybook-css-math-default-narrow',
    );
    setStorageReady(true);
  }, []);

  if (!storageReady) {
    return null;
  }

  return (
    <div data-testid="css-math-defaults" {...stylex.props(s.constraintStack)}>
      <CssMathDefaultProbe initialWidth={1000} label="wide" />
      <CssMathDefaultProbe initialWidth={500} label="narrow" />
    </div>
  );
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
 * A CSS math default chooses one initial pixel size, then stops following its basis.
 *
 * Both rows use `defaultSize: 'max(40%, 333px)'`. Their different initial
 * containing blocks select different arms: 399px from the wide 998px content box,
 * and 333px from the narrow 498px content box. Changing either containing block
 * later does not rescale the selected size. Use `minSize: 'max(40%, 333px)'`
 * instead when the expression should remain a persistent responsive floor.
 */
export const CssMathDefaults: Story = {
  render: () => <CssMathDefaultsStory />,
};

/**
 * Recursive CSS min()/max() constraints against a live container basis.
 *
 * The two rows intentionally keep the canonical expressions separate: combining
 * this minimum and maximum would invert the bounds, in which case the maximum
 * wins. Resize either frame to see percentage leaves recompute recursively.
 */
export const CssMathConstraints: Story = {
  render: () => (
    <div
      data-testid="css-math-constraints"
      {...stylex.props(s.constraintStack)}>
      <CssMathConstraintProbe kind="minimum" />
      <CssMathConstraintProbe kind="maximum" />
    </div>
  ),
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
