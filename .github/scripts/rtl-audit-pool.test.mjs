// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  closePageQuietly,
  createPagePool,
  mapPool,
} from '../../apps/storybook/rtl-audit/rtl-audit-pool.mjs';

const TIMEOUT = 'TimeoutError: page.goto: Timeout 30000ms exceeded.';

/**
 * Fake pages. A page that loads the poisoning story fails that story and
 * every later navigation, as a page with a stuck renderer does.
 */
function fakeBrowser({hangOnClose = false} = {}) {
  const opened = [];
  return {
    opened,
    openPage: async () => {
      const page = {
        id: opened.length,
        poisoned: false,
        closed: false,
        close: () =>
          hangOnClose
            ? new Promise(() => {})
            : Promise.resolve().then(() => {
                page.closed = true;
              }),
      };
      opened.push(page);
      return page;
    },
  };
}

function stories(count, poisonAt) {
  return Array.from({length: count}, (_, index) => ({
    storyId: `core-story--${index}`,
    poison: poisonAt.includes(index),
  }));
}

/** One scan phase, counting how often each story is scanned. */
function phase(scanCounts) {
  return {
    scan: async (story, page) => {
      scanCounts.set(story.storyId, (scanCounts.get(story.storyId) ?? 0) + 1);
      await new Promise(resolve => setTimeout(resolve, 1));
      if (page.poisoned) throw new Error(TIMEOUT);
      if (story.poison) {
        page.poisoned = true;
        throw new Error(TIMEOUT);
      }
      return {storyId: story.storyId, verdict: 'N-A', page: page.id};
    },
    onError: (story, error) => ({
      storyId: story.storyId,
      verdict: 'ERROR',
      notes: [String(error)],
    }),
    describe: story => ({storyId: story.storyId}),
  };
}

describe('RTL audit worker pages', () => {
  it('fails only the story that broke a page; the worker continues on a fresh page', async () => {
    const browser = fakeBrowser();
    const pool = await createPagePool({size: 4, openPage: browser.openPage});
    const scanCounts = new Map();
    const results = await mapPool(stories(200, [5]), pool, phase(scanCounts));

    expect(results.filter(result => result.verdict === 'ERROR')).toEqual([
      {
        storyId: 'core-story--5',
        verdict: 'ERROR',
        notes: [`Error: ${TIMEOUT}`],
      },
    ]);
    expect(results.map(result => result.storyId)).toEqual(
      stories(200, []).map(story => story.storyId),
    );
    // No story is scanned twice: the failed one is recorded, not retried.
    expect([...scanCounts.values()].every(count => count === 1)).toBe(true);
    expect(scanCounts.size).toBe(200);
    expect(pool.recoveries).toEqual([
      expect.objectContaining({
        storyId: 'core-story--5',
        error: `Error: ${TIMEOUT}`,
      }),
    ]);
    const [broken] = browser.opened.filter(page => page.poisoned);
    expect(broken.closed).toBe(true);
    expect(pool.pages()).not.toContain(broken);
    expect(browser.opened).toHaveLength(5);
  });

  it('keeps the recovery across phases, and the first page follows its slot', async () => {
    const browser = fakeBrowser();
    const pool = await createPagePool({size: 4, openPage: browser.openPage});
    const firstBefore = pool.first();
    // The first story goes to the first worker, so the first page breaks.
    const d5 = await mapPool(stories(120, [0, 61]), pool, phase(new Map()));
    const d6 = await mapPool(stories(120, []), pool, phase(new Map()));

    expect(
      d5.filter(result => result.verdict === 'ERROR').map(r => r.storyId),
    ).toEqual(['core-story--0', 'core-story--61']);
    expect(d6.filter(result => result.verdict === 'ERROR')).toEqual([]);
    expect(pool.first()).not.toBe(firstBefore);
    expect(pool.first().poisoned).toBe(false);
    expect(pool.recoveries.map(recovery => recovery.storyId)).toEqual([
      'core-story--0',
      'core-story--61',
    ]);
  });

  it('does not wait on a page that never acknowledges its close', async () => {
    const browser = fakeBrowser({hangOnClose: true});
    const pool = await createPagePool({
      size: 2,
      openPage: browser.openPage,
      closePage: page => closePageQuietly(page, 10),
    });
    const results = await mapPool(stories(20, [3]), pool, phase(new Map()));

    expect(results.filter(result => result.verdict === 'ERROR')).toHaveLength(
      1,
    );
    await pool.close();
  });

  it('closes quietly when closing throws', async () => {
    await expect(
      closePageQuietly(
        {close: () => Promise.reject(new Error('Target closed'))},
        10,
      ),
    ).resolves.toBeUndefined();
  });
});
