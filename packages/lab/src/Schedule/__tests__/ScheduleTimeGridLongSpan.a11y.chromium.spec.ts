// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ScheduleTimeGridLongSpan.a11y.chromium.spec.ts
 * @input The built Lab/Schedule long-timed-events story in real Chromium
 * @output Receipted evidence that a timed event of 24 hours or more is one
 *   span in the all-day row whose edges meet its first and last day columns,
 *   that it leaves the day columns and their overlap clusters alone, and that
 *   shorter timed events stay one block per day, in LTR and RTL
 * @position Browser binding for `component:Schedule` FR21 and AR2. jsdom has
 *   no layout, so it cannot measure where a span paints or how wide a block is.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  finishEvidence,
  openStory,
  readTimeGrid,
  record,
  startEvidence,
  WIDE,
  type Box,
  type Evidence,
} from './timeGridProbe';

const STORY = 'lab-schedule--long-timed-events';
// Day columns in document order: Sunday May 10 … Saturday May 16, 2026.
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const DAY_NAMES = [
  'Sunday, May 10, 2026',
  'Monday, May 11, 2026',
  'Tuesday, May 12, 2026',
  'Wednesday, May 13, 2026',
  'Thursday, May 14, 2026',
  'Friday, May 15, 2026',
  'Saturday, May 16, 2026',
] as const;
// A span sits inside its columns by its pill margins: 2px at the start and
// 2px plus a 1px border at the end.
const SPAN_EDGE_TOLERANCE = 4;

let evidence: Evidence;
test.beforeAll(async () => {
  evidence = await startEvidence();
});
test.afterAll(async () => {
  await finishEvidence(evidence, 'long-span');
});

function eventButton(page: Page, group: string, title: string) {
  return page
    .getByRole('group', {name: group})
    .getByRole('button', {name: new RegExp(`^${title},`)});
}

async function boxOf(page: Page, group: string, title: string): Promise<Box> {
  const box = await eventButton(page, group, title).boundingBox();
  if (box == null) {
    throw new Error(`${title} has no box in ${group}`);
  }
  return {
    left: box.x,
    right: box.x + box.width,
    top: box.y,
    bottom: box.y + box.height,
    width: box.width,
    height: box.height,
  };
}

function union(columns: ReadonlyArray<Box>): {left: number; right: number} {
  return {
    left: Math.min(...columns.map(column => column.left)),
    right: Math.max(...columns.map(column => column.right)),
  };
}

for (const [direction, globals] of [
  ['ltr', undefined],
  ['rtl', 'direction:rtl'],
] as const) {
  test(`a timed event of 24 hours or more is one all-day span across its days (${direction})`, async ({
    page,
  }) => {
    await openStory(evidence, page, STORY, WIDE, globals);
    // Spans live in the all-day row and nowhere in the day columns.
    await expect(eventButton(page, 'All-day events', 'Offsite')).toHaveCount(1);
    await expect(
      eventButton(page, 'All-day events', 'On-call handoff'),
    ).toHaveCount(1);
    for (const day of [MONDAY, TUESDAY, WEDNESDAY]) {
      await expect(eventButton(page, DAY_NAMES[day], 'Offsite')).toHaveCount(0);
    }
    // Shorter timed events stay blocks, one per day they touch.
    await expect(eventButton(page, 'All-day events', 'Long shift')).toHaveCount(
      0,
    );
    await expect(
      eventButton(page, DAY_NAMES[FRIDAY], 'Long shift'),
    ).toHaveCount(1);
    await expect(
      eventButton(page, DAY_NAMES[TUESDAY], 'Late deploy'),
    ).toHaveCount(1);
    await expect(
      eventButton(page, DAY_NAMES[WEDNESDAY], 'Late deploy'),
    ).toHaveCount(1);

    const grid = await readTimeGrid(page);
    const offsite = await boxOf(page, 'All-day events', 'Offsite');
    const handoff = await boxOf(page, 'All-day events', 'On-call handoff');
    const offsiteColumns = union(
      [MONDAY, TUESDAY, WEDNESDAY].map(day => grid.bodyColumns[day]),
    );
    const handoffColumns = union(
      [THURSDAY, FRIDAY].map(day => grid.bodyColumns[day]),
    );
    const standup = await boxOf(page, DAY_NAMES[TUESDAY], 'Standup');
    const tuesday = grid.bodyColumns[TUESDAY];
    const name = await eventButton(
      page,
      'All-day events',
      'Offsite',
    ).getAttribute('aria-label');
    const reading = {
      direction: grid.direction,
      offsite: {
        startGap: Math.abs(offsite.left - offsiteColumns.left),
        endGap: Math.abs(offsite.right - offsiteColumns.right),
        name,
      },
      handoff: {
        startGap: Math.abs(handoff.left - handoffColumns.left),
        endGap: Math.abs(handoff.right - handoffColumns.right),
      },
      // A block that shares no cluster with the span keeps its column.
      standupWidthShare: standup.width / tuesday.width,
    };
    await record(
      evidence,
      page,
      `long-span-${direction}`,
      STORY,
      direction,
      reading,
    );

    expect(grid.direction).toBe(direction);
    expect(reading.offsite.startGap).toBeLessThanOrEqual(SPAN_EDGE_TOLERANCE);
    expect(reading.offsite.endGap).toBeLessThanOrEqual(SPAN_EDGE_TOLERANCE);
    expect(reading.handoff.startGap).toBeLessThanOrEqual(SPAN_EDGE_TOLERANCE);
    expect(reading.handoff.endGap).toBeLessThanOrEqual(SPAN_EDGE_TOLERANCE);
    expect(reading.standupWidthShare).toBeGreaterThan(0.85);
    expect(name).toMatch(
      /^Offsite, May 11(,| at) 9:00\sAM\s–\sMay 13(,| at) 9:00\sAM, Company, Monday, May 11, 2026$/u,
    );
  });
}
