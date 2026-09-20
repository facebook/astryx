// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useEffect, useRef} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, waitFor} from 'storybook/test';
import * as stylex from '@stylexjs/stylex';
import {
  Chart,
  bar,
  line,
  ChartGrid,
  ChartAxis,
  currency,
} from '@astryxdesign/charts';
import {useLocale} from '@astryxdesign/core';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {monthlyData} from './_data';

const styles = stylex.create({
  modal: {
    inlineSize: 720,
    maxInlineSize: 'calc(100vw - 32px)',
    padding: spacingVars['--spacing-4'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-surface'],
  },
});

const meta: Meta<typeof Chart> = {
  title: 'Charts/Chrome/Tooltip',
  component: Chart,
};
export default meta;

function TooltipChart() {
  const locale = useLocale();
  return (
    <Chart
      data={monthlyData}
      xKey="month"
      series={[
        bar('revenue', {color: '#3b82f6', label: 'Revenue', stack: 'x'}),
        bar('costs', {color: '#ef4444', label: 'Costs', stack: 'x'}),
        line('trend', {color: '#f59e0b', label: 'Trend'}),
      ]}
      tooltip
      grid={<ChartGrid />}
      axes={
        <>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency('$', locale)} />
        </>
      }
      height={320}
    />
  );
}

/** Hover the chart: a grouped tooltip shows every series value at that x, with a
 *  column highlight for bars and hover dots on lines. */
export const Default: StoryObj = {
  render: () => <TooltipChart />,
};

function ModalLayeringFixture() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Chart tooltip layering test"
      {...stylex.props(styles.modal)}>
      <TooltipChart />
    </dialog>
  );
}

/**
 * Keeps the chart inside a native modal and opens its tooltip after the modal.
 * The play assertion proves the tooltip is a later browser top-layer entry,
 * rather than a high-z-index body portal hidden behind the dialog.
 */
export const ModalLayering: StoryObj = {
  render: () => <ModalLayeringFixture />,
  play: async ({canvasElement}) => {
    const dialog = canvasElement.querySelector('dialog');
    await waitFor(() => expect(dialog?.matches(':modal')).toBe(true));

    const eventSurface = canvasElement.querySelector<SVGRectElement>(
      'svg rect[fill="transparent"]',
    );
    expect(eventSurface).not.toBeNull();
    if (!eventSurface) {
      return;
    }

    const eventRect = eventSurface.getBoundingClientRect();
    eventSurface.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: eventRect.left + eventRect.width / 2,
        clientY: eventRect.top + eventRect.height / 2,
        pointerType: 'mouse',
      }),
    );

    await waitFor(() => {
      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
      expect(tooltip).not.toBeNull();
      if (!tooltip) {
        return;
      }

      const layer = tooltip.parentElement;
      expect(layer?.matches(':popover-open')).toBe(true);
      const tooltipRect = tooltip.getBoundingClientRect();
      expect(tooltipRect.width).toBeGreaterThan(0);
      expect(tooltipRect.height).toBeGreaterThan(0);

      const hit = document.elementFromPoint(
        tooltipRect.left + tooltipRect.width / 2,
        tooltipRect.top + tooltipRect.height / 2,
      );
      expect(hit === tooltip || tooltip.contains(hit)).toBe(true);
    });
  },
};
