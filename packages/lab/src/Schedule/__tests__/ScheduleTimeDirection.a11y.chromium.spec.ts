// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ScheduleTimeDirection.a11y.chromium.spec.ts
 * @input The built Lab/Schedule week, month, and list stories in real Chromium
 * @output Receipted evidence that every painted time — hour labels, event
 *   times, month chip times, and list rows — reads in order in both
 *   directions: its number paints before its AM or PM
 * @position Browser binding for the Schedule's direction support
 *   (`component:Schedule` AR6). jsdom does not run the bidirectional
 *   algorithm, so only a browser shows the painted order.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  finishEvidence,
  openStory,
  record,
  startEvidence,
  WEEKLY,
  WIDE,
  type Evidence,
} from './timeGridProbe';

const STORIES = [
  ['week', WEEKLY],
  ['month', 'lab-schedule--monthly'],
  ['list', 'lab-schedule--list'],
] as const;

let evidence: Evidence;
test.beforeAll(async () => {
  evidence = await startEvidence();
});
test.afterAll(async () => {
  await finishEvidence(evidence, 'time-direction');
});

interface TimeReading {
  readonly text: string;
  /** The time's number paints before its AM or PM. */
  readonly inOrder: boolean;
}

/**
 * Every visible time in the schedule: text nodes with a number followed by
 * AM or PM, skipping visually hidden text (read by assistive technology in
 * logical order, never painted).
 */
function readTimes(page: Page): Promise<TimeReading[]> {
  return page.evaluate(() => {
    const root = document.querySelector('.astryx-schedule');
    if (root == null) {
      throw new Error('no Schedule in the story');
    }
    const isHidden = (element: Element | null): boolean => {
      for (let node = element; node != null; node = node.parentElement) {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        if (
          style.clipPath !== 'none' ||
          style.clip !== 'auto' ||
          (rect.width <= 1 && style.overflow === 'hidden')
        ) {
          return true;
        }
      }
      return false;
    };
    const readings: Array<{text: string; inOrder: boolean}> = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node != null; node = walker.nextNode()) {
      const text = node.textContent ?? '';
      const match = /(\d{1,2}(?::\d{2})?)\s?([AP]M)/.exec(text);
      if (match == null || isHidden(node.parentElement)) {
        continue;
      }
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[1].length);
      const digits = range.getBoundingClientRect();
      const meridiemAt = text.indexOf(match[2], match.index + match[1].length);
      range.setStart(node, meridiemAt);
      range.setEnd(node, meridiemAt + match[2].length);
      const meridiem = range.getBoundingClientRect();
      if (digits.width < 1 || meridiem.width < 1) {
        continue;
      }
      readings.push({
        text: text.trim(),
        inOrder: digits.right <= meridiem.left + 1,
      });
    }
    return readings;
  });
}

for (const [view, story] of STORIES) {
  for (const [direction, globals] of [
    ['ltr', undefined],
    ['rtl', 'direction:rtl'],
  ] as const) {
    test(`every painted ${view} time reads in order (${direction})`, async ({
      page,
    }) => {
      await openStory(evidence, page, story, WIDE, globals);
      const times = await readTimes(page);
      await record(
        evidence,
        page,
        `time-direction-${view}-${direction}`,
        story,
        direction,
        {
          count: times.length,
          outOfOrder: times
            .filter(time => !time.inOrder)
            .map(time => time.text),
        },
      );
      expect(times.length, `${view} paints times`).toBeGreaterThan(0);
      expect(
        times.filter(time => !time.inOrder).map(time => time.text),
        `${view} times painted out of order`,
      ).toEqual([]);
    });
  }
}
