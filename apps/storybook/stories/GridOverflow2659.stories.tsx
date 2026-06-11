// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Storybook story to reproduce issue #2659:
 * XDSGrid auto-fit tracks overflow container on narrow viewports
 * when using `repeat: 'fit'` with a `max` prop.
 *
 * The bug: `minmax(480px, ...)` in grid-template-columns forces tracks
 * to be at least 480px, which overflows when the container is narrower.
 * The fix should wrap the min value: `min(100%, 480px)`.
 */

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  narrowContainer: {
    width: 400,
    border: '2px dashed red',
    padding: spacingVars['--spacing-2'],
    overflow: 'visible',
    position: 'relative',
  },
  mediumContainer: {
    width: 600,
    border: '2px dashed red',
    padding: spacingVars['--spacing-2'],
    overflow: 'visible',
    position: 'relative',
  },
  item: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-accent-muted'],
    borderRadius: radiusVars['--radius-element'],
    textAlign: 'center',
  },
  overflowIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
  label: {
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  wrapper: {
    padding: spacingVars['--spacing-4'],
  },
});

const meta: Meta = {
  title: 'Bugs/Grid Overflow #2659',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Reproduction of issue #2659: auto-fit tracks overflow their container on narrow viewports when `max` is set.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const GridItem = ({children}: {children: React.ReactNode}) => (
  <div {...stylex.props(styles.item)}>
    <XDSText type="body">{children}</XDSText>
  </div>
);

/**
 * The core reproduction case from the issue:
 * `columns={{minWidth: 480, max: 2, repeat: 'fit'}}` inside a 400px container.
 *
 * The grid track min is 480px which exceeds the 400px container,
 * causing horizontal overflow. The red dashed border shows the
 * container boundary — content should not escape it.
 */
export const OverflowReproduction: Story = {
  render: () => (
    <div {...stylex.props(styles.wrapper)}>
      <XDSVStack gap={6}>
        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"400px container with columns={{minWidth: 480, max: 2, repeat: 'fit'}} — tracks overflow (BUG)"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 480, max: 2, repeat: 'fit'}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>

        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"400px container with columns={{minWidth: 480, max: 2}} — auto-fill also overflows"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 480, max: 2}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>
      </XDSVStack>
    </div>
  ),
};

/**
 * Without `max`, the same `minWidth: 480` still overflows on narrow containers.
 * This shows the issue exists in the basic responsive path too, because
 * `minmax(480px, 1fr)` has a hard 480px minimum.
 */
export const OverflowWithoutMax: Story = {
  render: () => (
    <div {...stylex.props(styles.wrapper)}>
      <XDSVStack gap={6}>
        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"400px container, columns={{minWidth: 480, repeat: 'fit'}} — no max, still overflows"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 480, repeat: 'fit'}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>

        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"400px container, columns={{minWidth: 480}} — auto-fill, no max"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 480}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>
      </XDSVStack>
    </div>
  ),
};

/**
 * BUG: auto-fit with max doesn't stretch to fill on narrow viewports.
 *
 * When only 1 track fits (mobile), auto-fit should collapse empty tracks
 * and stretch items to 100% width. But the trackMax formula
 * `calc((100% - (max-1)*gap) / max)` caps each track at 1/max of the
 * container, preventing stretch even when there's only one visible column.
 *
 * Compare: without `max`, auto-fit correctly stretches the single item.
 */
export const AutoFitDoesNotStretchWithMax: Story = {
  render: () => (
    <div {...stylex.props(styles.wrapper)}>
      <XDSVStack gap={6}>
        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"BUG: auto-fit + max: 2 — items don't stretch to fill (capped at 50% of container)"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 200, max: 2, repeat: 'fit'}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>

        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"EXPECTED: auto-fit WITHOUT max — single track stretches to fill container"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>

        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"BUG: auto-fit + max: 3, 600px container — 2 items should stretch to fill, but capped at 1/3 each"}
          </XDSText>
          <div {...stylex.props(styles.mediumContainer)}>
            <XDSGrid columns={{minWidth: 200, max: 3, repeat: 'fit'}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>

        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"EXPECTED: auto-fit without max, 600px — 2 items stretch to fill"}
          </XDSText>
          <div {...stylex.props(styles.mediumContainer)}>
            <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
              <GridItem>Item 1</GridItem>
              <GridItem>Item 2</GridItem>
            </XDSGrid>
          </div>
        </div>
      </XDSVStack>
    </div>
  ),
};

/**
 * Side-by-side with cards to visualize how the bug looks in real usage.
 * Simulates the template thumbnail grid from the issue report.
 */
export const RealWorldReproduction: Story = {
  render: () => (
    <div {...stylex.props(styles.wrapper)}>
      <XDSVStack gap={6}>
        <div>
          <XDSText type="supporting" xstyle={styles.label}>
            {"Simulated narrow viewport (~400px) with template cards — columns={{minWidth: 480, max: 2, repeat: 'fit'}}"}
          </XDSText>
          <div {...stylex.props(styles.narrowContainer)}>
            <XDSGrid columns={{minWidth: 480, max: 2, repeat: 'fit'}} gap={4}>
              <XDSCard>
                <XDSText type="label" display="block">
                  Template 1
                </XDSText>
                <XDSText type="supporting" display="block">
                  This card should not overflow the container
                </XDSText>
              </XDSCard>
              <XDSCard>
                <XDSText type="label" display="block">
                  Template 2
                </XDSText>
                <XDSText type="supporting" display="block">
                  This card should not overflow the container
                </XDSText>
              </XDSCard>
            </XDSGrid>
          </div>
        </div>
      </XDSVStack>
    </div>
  ),
};
