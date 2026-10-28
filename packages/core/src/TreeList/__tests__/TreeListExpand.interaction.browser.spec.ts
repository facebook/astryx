// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TreeListExpand.interaction.browser.spec.ts
 * @input The built TreeList story, real touch input (Chromium CDP / WebKit's
 *   input command), the interaction harness, and the outline spring from the
 *   UIKit constants table (motion/uikit/list.ts)
 * @output Interaction and animation proofs for a TreeList row's expand and
 *   collapse under a finger: the children slide out from under the parent
 *   as one block inside the group's clip and the chevron turns, both on the
 *   outline spring, sampled frame by frame, while the rows below take their
 *   new places at once (no animated layout handle, `spec:AST-105` FR2); a
 *   collapse slides them back and removes them, no child showing outside
 *   the group up to the frame it leaves; the children keep moving while the
 *   main thread is blocked, with no Layout or Paint;
 *   under reduced motion an expand and a collapse cross-fade, opacity only,
 *   within 200 ms (`design:reduced-motion`); right to left mirrors the
 *   chevron's turn; a theme's outline spring times it; content after the
 *   tree takes its new place by layout at once, with no translate on it and
 *   a fixed element inside it staying fixed; a storyboard of the expand
 * @position Interaction evidence for TreeList/useTreeExpansionMotion.ts
 *   under a finger (List/__tests__/touchStory.ts), with an Android case that
 *   moves the same way and a mouse case where the children come and go in
 *   one frame
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  compareCurve,
  countBetween,
  holdAnimations,
  markElement,
  releaseAnimations,
  seekAnimations,
  startScreencast,
  timeline,
  touchDriver,
  trackMarker,
  traceRendering,
  waitForAnimation,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';
import {openStory} from '../../List/__tests__/touchStory';
import {expectReducedMotionCrossFade} from '../../List/__tests__/reducedMotion';
import {
  blockBehindBeacon,
  installBeacon,
  sampleVideoPoints,
} from '../../List/__tests__/rowPixels';
import {solveSpring, toSpring} from '../../motion/spring';
import {list} from '../../motion/uikit/list';

const storybook = withStorybook(test);

const STORY = 'core-treelist--basic';
const SPRING = toSpring(list.update.outlineSpring);
/** The spring's progress (0 → 1) t ms after it starts. */
const progress = (t: number) =>
  solveSpring(SPRING, {from: 0, to: 1}).value(t / 1000);
/** Where it settles: every sampled curve is judged up to here. */
const SETTLE_MS =
  solveSpring(SPRING, {from: 0, to: 1}).settleTime(0.001) * 1000;

/** A tree row by its item id (an ancestor row contains its label too). */
const treeItem = (page: Page, id: string) =>
  page.locator(`[role="treeitem"][data-tree-id="${id}"]`);

/** The group's last row: the first part of the sliding block to show. */
const lastChild = (page: Page) =>
  treeItem(page, 'components')
    .locator(':scope > [role="group"] > [role="treeitem"]')
    .last();

/** The toggle of the "components" folder, its group, a child and a row below. */
function parts(page: Page) {
  const parent = treeItem(page, 'components');
  return {
    parent,
    // Its own toggle, group and chevron: not a descendant row's.
    toggle: parent.locator(':scope > :not([role="group"]) [data-tree-toggle]'),
    group: parent.locator(':scope > [role="group"]'),
    chevron: parent.locator(
      ':scope > :not([role="group"]) [data-tree-chevron]',
    ),
    child: treeItem(page, 'button'),
    below: treeItem(page, 'app'),
  };
}

/** How many tree rows and chevron parts show at less than full opacity. */
const hiddenParts = async (page: Page) =>
  page.evaluate(
    () =>
      [
        ...document.querySelectorAll(
          '[role="treeitem"], [data-tree-chevron], [data-tree-chevron] *',
        ),
      ].filter(element => getComputedStyle(element).opacity !== '1').length,
  );

/** The `y` of an element's `translate`, as the engine presents it. */
const translateY = async (element: Locator) =>
  element.evaluate(el => {
    const value = getComputedStyle(el).translate;
    if (value === 'none' || value === '') {
      return 0;
    }
    const [, y = '0px'] = value.split(' ');
    return Number.parseFloat(y);
  });

/** The additive `rotate` on the chevron, degrees. */
const rotation = async (element: Locator) =>
  element.evaluate(el => {
    const value = getComputedStyle(el).rotate;
    return value === 'none' || value === '' ? 0 : Number.parseFloat(value);
  });

async function tapToggle(page: Page) {
  const {toggle} = parts(page);
  const box = await toggle.boundingBox();
  if (box == null) {
    throw new Error('no toggle');
  }
  const driver = await touchDriver(page);
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
}

async function open(page: Page) {
  await openStory(page, storybook(), STORY);
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the expansion moves under a finger only');
  await expect(parts(page).below).toBeVisible();
}

test('a busy first frame delays the expand instead of skipping into it', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'WebKit starts an animation created just before a block at its last frame time (motion/animator.ts, known limits)',
  );
  await open(page);
  const {toggle, parent} = parts(page);
  // The toggle's handler commits the expand and starts its motions; 150 ms
  // of script then hold the main thread before the first frame. The motions
  // start when the browser commits them, so the first frame due after the
  // block shows the child at most one frame from where it started, a
  // group's height up from its place.
  const result = await parent.evaluate(
    async (folder, toggleButton) =>
      new Promise<{
        first: number;
        pending: boolean;
        startedAfterBlock: boolean;
      }>(resolve => {
        // The expand's commit inserts the group; this observer runs right
        // after it, in the same task, before any frame.
        const observer = new MutationObserver(() => {
          observer.disconnect();
          const row = folder.querySelector<HTMLElement>(
            '[data-tree-id="button"]',
          );
          if (row == null) {
            throw new Error('no child');
          }
          // The product's part: the motions it just started carry no start
          // of their own; the browser sets it when it commits them.
          const motions = row.getAnimations();
          const pending =
            motions.length > 0 &&
            motions.every(animation => animation.startTime == null);
          const until = performance.now() + 150;
          while (performance.now() < until) {
            // Busy: the main thread is held.
          }
          // The first frame due after the block: a frame scheduled before
          // it runs with that earlier time.
          const read = () => {
            if ((document.timeline.currentTime as number) < until) {
              requestAnimationFrame(read);
              return;
            }
            const value = getComputedStyle(row).translate;
            const [, y = '0px'] =
              value === 'none' || value === '' ? ['0px'] : value.split(' ');
            resolve({
              first: Number.parseFloat(y),
              pending,
              // Where the browser put the start: after the block, or (a
              // frame stamped when it was due, motion/animator.ts, known
              // limits) inside it.
              startedAfterBlock: motions.every(
                animation => Number(animation.startTime) >= until - 1,
              ),
            });
          };
          requestAnimationFrame(read);
        });
        const tree = folder.closest('[role="tree"]');
        if (tree != null) {
          observer.observe(tree, {childList: true, subtree: true});
        }
        (toggleButton as HTMLElement).click();
      }),
    await toggle.elementHandle(),
  );
  const height = await parts(page).group.evaluate(
    el => el.getBoundingClientRect().height,
  );
  expect(result.pending).toBe(true);
  if (result.startedAfterBlock) {
    // At most one frame into the outline spring (about 93% of the way
    // left); a start pinned before the block would show it more than half
    // done.
    expect(result.first).toBeLessThan(-0.85 * height);
  } else {
    // This browser stamped the frame that started the motions with a time
    // inside the block, so no first frame can show the start the commit
    // would set; what the component controls is asserted above.
    testInfo.annotations.push({
      type: 'start stamped inside the block',
      description: `first frame at ${result.first.toFixed(1)} px of ${(-height).toFixed(1)} px`,
    });
  }
  await expect.poll(async () => translateY(parts(page).child)).toBe(0);
});

test('Android: a tap expands with the same motion (one touch model)', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Android is Chromium');
  await openStory(page, storybook(), STORY);
  const {child, below} = parts(page);
  await expect(below).toBeVisible();
  await tapToggle(page);
  await expect(child).toBeVisible();
  // The block slides out from under the parent and springs home, as on iOS.
  expect(await child.evaluate(el => el.getAnimations().length)).toBeGreaterThan(
    0,
  );
  await expect.poll(async () => translateY(child)).toBe(0);
});

test('a mouse: a click expands and collapses in one frame, as before', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 900, height: 700},
  });
  const page = await context.newPage();
  try {
    await openStory(page, storybook(), STORY);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const {group, child, below, toggle} = parts(page);
    await expect(below).toBeVisible();
    await toggle.click();
    await expect(child).toBeVisible();
    // No motion: the row below is already in place, nothing animating it.
    expect(await translateY(below)).toBe(0);
    expect(await below.evaluate(el => el.getAnimations().length)).toBe(0);
    await toggle.click();
    // The children leave with the click's own commit.
    await page.evaluate(
      async () =>
        new Promise<void>(resolve => requestAnimationFrame(() => resolve())),
    );
    expect(await group.count()).toBe(0);
    expect(await translateY(below)).toBe(0);
  } finally {
    await context.close();
  }
});

test('the expansion keeps its own outline spring, whatever a theme writes', async ({
  page,
}) => {
  await open(page);
  // The outline spring is an internal constant: a variable written the way a
  // theme would write one (0.8 s, no bounce, on the root) changes nothing.
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--motion-list-update-outline-spring',
      '0.8s 0',
    ),
  );
  const table = solveSpring(SPRING, {from: 0, to: 1});
  const {group, child} = parts(page);
  await tapToggle(page);
  await expect(child).toBeVisible();
  await holdAnimations(page);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  for (const t of [SETTLE_MS / 2, SETTLE_MS]) {
    await seekAnimations(page, t);
    const expected = -height * (1 - table.value(t / 1000));
    expect(await translateY(child)).toBeCloseTo(expected, 0);
  }
  await releaseAnimations(page, {finish: true});
  await expect.poll(async () => translateY(child)).toBe(0);
});

test('under reduced motion an expand and a collapse cross-fade: opacity only, within 200 ms', async ({
  page,
}) => {
  // design:reduced-motion DR1 and DR2, under a finger: nothing travels or
  // turns; the children fade in where they land and out where they are.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await open(page);
  const {child} = parts(page);
  await tapToggle(page);
  await expect(child).toBeVisible();
  expectReducedMotionCrossFade(await holdAnimations(page));
  // The held fades play out: a row or chevron that travels dips (it fades
  // out, lands while invisible, then fades back in once its fade out has
  // ended). The collapse starts when the expand has settled, everything
  // showing again.
  await releaseAnimations(page);
  await expect.poll(async () => translateY(child)).toBe(0);
  await expect.poll(async () => hiddenParts(page)).toBe(0);
  await tapToggle(page);
  expectReducedMotionCrossFade(await holdAnimations(page));
  await releaseAnimations(page, {finish: true});
  await expect(child).toHaveCount(0);
});

test("right to left: the chevron's quarter turn mirrors, and the children slide the same way", async ({
  page,
}) => {
  await openStory(page, storybook(), STORY, {
    globals: 'direction:rtl',
  });
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the expansion moves under a finger only');
  const {group, child, chevron} = parts(page);
  await expect(parts(page).below).toBeVisible();
  expect(await chevron.evaluate(el => getComputedStyle(el).direction)).toBe(
    'rtl',
  );
  await tapToggle(page);
  await expect(child).toBeVisible();
  await holdAnimations(page);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  for (const t of [0, SETTLE_MS / 4, SETTLE_MS / 2]) {
    await seekAnimations(page, t);
    // LTR starts the additive turn at −90°; right to left at +90°.
    expect(await rotation(chevron)).toBeCloseTo(90 * (1 - progress(t)), 0);
    expect(await translateY(child)).toBeCloseTo(-height * (1 - progress(t)), 0);
  }
  await releaseAnimations(page, {finish: true});
  await expect.poll(async () => rotation(chevron)).toBe(0);
});

test('expand: the children slide out from under the parent and the chevron turns, on the outline spring, while the rows below take their places at once', async ({
  page,
}, testInfo) => {
  await open(page);
  const {group, child, below, chevron} = parts(page);
  const belowBefore = (await below.boundingBox())?.y ?? 0;
  await tapToggle(page);
  await expect(child).toBeVisible();
  const held = await holdAnimations(page);
  expect(held.length, JSON.stringify(held)).toBeGreaterThan(0);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  expect(await group.evaluate(el => getComputedStyle(el).overflow)).toBe(
    'clip',
  );
  // With no animated layout handle (`spec:AST-105` FR2) the row below is in
  // its new place from the first frame, a group's height lower, with nothing
  // animating it.
  expect(await below.evaluate(el => el.getAnimations().length)).toBe(0);
  expect(((await below.boundingBox())?.y ?? 0) - belowBefore).toBeCloseTo(
    height,
    0,
  );
  const samples: {t: number; child: number; below: number; chevron: number}[] =
    [];
  for (const t of timeline(SETTLE_MS)) {
    await seekAnimations(page, t);
    samples.push({
      t,
      child: await translateY(child),
      below: await translateY(below),
      chevron: await rotation(chevron),
    });
  }
  await releaseAnimations(page, {finish: true});
  // The block travels the group's height, the chevron turns the quarter
  // turn, on one spring; the row below never moves.
  const offset = (t: number) => -height * (1 - progress(t));
  const turn = (t: number) => -90 * (1 - progress(t));
  const childCurve = compareCurve(
    samples.map(s => ({t: s.t, value: s.child})),
    offset,
    0.5,
  );
  const chevronCurve = compareCurve(
    samples.map(s => ({t: s.t, value: s.chevron})),
    turn,
    0.5,
  );
  await writeEvidence(
    'curves/tree-list-expand',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          spring: list.update.outlineSpring,
          height,
          samples,
          childCurve,
          chevronCurve,
        },
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(samples[0].child).toBeCloseTo(-height, 0);
  expect(childCurve.maxError, JSON.stringify(childCurve.worst)).toBeLessThan(
    0.5,
  );
  expect(samples.every(sample => sample.below === 0)).toBe(true);
  expect(
    chevronCurve.maxError,
    JSON.stringify(chevronCurve.worst),
  ).toBeLessThan(0.5);
  // At rest: the clip is gone, nothing is translated, the row below still
  // sits a group's height lower than before.
  await expect
    .poll(async () => group.evaluate(el => getComputedStyle(el).overflow))
    .not.toBe('clip');
  expect(await translateY(below)).toBe(0);
  expect(((await below.boundingBox())?.y ?? 0) - belowBefore).toBeCloseTo(
    height,
    0,
  );
});

test('collapse: the children slide back under the parent, then leave, and the rows below take their places when they do', async ({
  page,
}) => {
  await open(page);
  const {group, child, below} = parts(page);
  const belowCollapsed = (await below.boundingBox())?.y ?? 0;
  await tapToggle(page);
  await expect(child).toBeVisible();
  await expect.poll(async () => translateY(child)).toBe(0);
  await expect
    .poll(async () => group.evaluate(el => getComputedStyle(el).overflow))
    .not.toBe('clip');
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);

  await tapToggle(page);
  // Still rendered while it slides away, but out of reach.
  await expect(group).toHaveAttribute('inert', '');
  await holdAnimations(page);
  await seekAnimations(page, SETTLE_MS / 3);
  const midway = await translateY(child);
  expect(midway).toBeLessThan(-1);
  expect(midway).toBeGreaterThan(-height + 1);
  // The row below waits in place, untranslated, while the block slides.
  expect(await translateY(below)).toBe(0);
  expect(await below.evaluate(el => el.getAnimations().length)).toBe(0);
  await releaseAnimations(page, {finish: true});
  // Gone, and the row below sits where it sat before the expand, taken there
  // by the commit that removed the children.
  await expect(group).toHaveCount(0);
  expect(await translateY(below)).toBe(0);
  expect((await below.boundingBox())?.y ?? 0).toBeCloseTo(belowCollapsed, 0);
});

test('collapse: the group leaves the frame its block is fully clipped, not when the spring settles', async ({
  page,
}) => {
  await open(page);
  const {group, child} = parts(page);
  await tapToggle(page);
  await expect(child).toBeVisible();
  await expect.poll(async () => translateY(child)).toBe(0);
  await expect
    .poll(async () => group.evaluate(el => getComputedStyle(el).overflow))
    .not.toBe('clip');
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  // When the outline spring brings the block within half a pixel of the
  // group's height above it: from then on nothing of it shows.
  let clipMs = 0;
  while (height * (1 - progress(clipMs)) > 0.5) {
    clipMs += 4;
  }
  expect(clipMs).toBeLessThan(SETTLE_MS - 100);
  // From the collapse's commit (the group turns inert) to its removal.
  const watch = page.evaluate(
    async () =>
      new Promise<number>(resolve => {
        const parent = document.querySelector('[data-tree-id="components"]');
        if (parent == null) {
          throw new Error('no parent');
        }
        let start = 0;
        const observer = new MutationObserver(() => {
          const current = parent.querySelector(':scope > [role="group"]');
          if (start === 0 && current?.hasAttribute('inert') === true) {
            start = performance.now();
          }
          if (start !== 0 && current == null) {
            observer.disconnect();
            resolve(performance.now() - start);
          }
        });
        observer.observe(parent, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['inert'],
        });
      }),
  );
  await tapToggle(page);
  const elapsed = await watch;
  // Closer to the clip than to the settle: no empty band before the rows
  // below take their places.
  expect(elapsed, `clip ${clipMs} ms, settle ${SETTLE_MS} ms`).toBeLessThan(
    (clipMs + SETTLE_MS) / 2,
  );
  expect(elapsed).toBeGreaterThan(clipMs - 50);
});

test('the end of a collapse shows no child outside the group, up to the frame the group leaves', async ({
  page,
}) => {
  await open(page);
  const {child} = parts(page);
  await tapToggle(page);
  await expect(child).toBeVisible();
  await expect
    .poll(async () =>
      parts(page).group.evaluate(el => getComputedStyle(el).overflow),
    )
    .not.toBe('clip');
  // Every frame from the collapse's tap until the group is gone: a child
  // painted above the group's top edge with no clip shows over the parent
  // row.
  await page.evaluate(() => {
    const w = window as unknown as {__frames: string[]; __stop: boolean};
    w.__frames = [];
    w.__stop = false;
    const parent = document.querySelector('[data-tree-id="components"]');
    const frame = () => {
      const group = parent?.querySelector<HTMLElement>(
        ':scope > [role="group"]',
      );
      if (group != null && getComputedStyle(group).overflow !== 'clip') {
        const top = group.getBoundingClientRect().top;
        for (const item of group.children) {
          const box = item.getBoundingClientRect();
          if (box.height > 0 && box.top < top - 0.5) {
            w.__frames.push(
              `${(item.textContent ?? '').slice(0, 12)} at ${box.top} above ${top}`,
            );
          }
        }
      }
      if (!w.__stop) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  });
  await tapToggle(page);
  await expect(parts(page).group).toHaveCount(0, {timeout: 3000});
  await page.waitForTimeout(50);
  const outside = await page.evaluate(() => {
    const w = window as unknown as {__frames: string[]; __stop: boolean};
    w.__stop = true;
    return w.__frames;
  });
  expect(outside).toEqual([]);
});

test('content after the tree takes its place by layout at once, with no translate, and a fixed element inside it stays fixed', async ({
  page,
}) => {
  await openStory(page, storybook(), 'core-treelist--with-content-below');
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the expansion moves under a finger only');
  const button = page.getByRole('button', {name: 'Open folder'});
  const {group, below} = parts(page);
  await expect(button).toBeVisible();
  // More content after the tree, holding a position: fixed element, which
  // stays where the viewport puts it as long as nothing transforms its
  // ancestors.
  await button.evaluate(el => {
    const after = document.createElement('div');
    after.style.height = '20px';
    const fixed = document.createElement('div');
    fixed.setAttribute('data-test-fixed', '');
    fixed.style.cssText =
      'position: fixed; top: 10px; left: 10px; width: 8px; height: 8px;';
    after.append(fixed);
    el.insertAdjacentElement('afterend', after);
  });
  const fixedTop = async () =>
    page
      .locator('[data-test-fixed]')
      .evaluate(el => el.getBoundingClientRect().top);
  const rest = (await button.boundingBox())?.y ?? 0;

  await tapToggle(page);
  await holdAnimations(page);
  await seekAnimations(page, 0);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  // Its new layout at once, one group height down, with nothing on it.
  expect(await button.evaluate(el => getComputedStyle(el).translate)).toBe(
    'none',
  );
  expect(((await button.boundingBox())?.y ?? 0) - rest).toBeCloseTo(height, 0);
  expect(await fixedTop()).toBeCloseTo(10, 0);
  // So does the row after the group inside the tree: no animated layout
  // handle (`spec:AST-105` FR2).
  expect(await translateY(below)).toBe(0);
  await releaseAnimations(page, {finish: true});

  // A collapse: it stays where it is while the children slide back, then
  // takes its place when the group leaves, never translated.
  await tapToggle(page);
  await holdAnimations(page);
  await seekAnimations(page, SETTLE_MS / 3);
  expect(await button.evaluate(el => getComputedStyle(el).translate)).toBe(
    'none',
  );
  expect(await fixedTop()).toBeCloseTo(10, 0);
  await releaseAnimations(page, {finish: true});
  await expect(group).toHaveCount(0);
  expect(await button.evaluate(el => getComputedStyle(el).translate)).toBe(
    'none',
  );
  expect((await button.boundingBox())?.y ?? 0).toBeCloseTo(rest, 0);
});

test('the children keep moving on every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright',
  );
  await open(page);
  const cast = await startScreencast(page);
  await page.waitForTimeout(100);
  await tapToggle(page);
  // The group's last row, the first part of the block to show, carries the
  // marker from the commit that inserts it.
  const last = lastChild(page);
  const unmark = await markElement(last);
  await waitForAnimation(last, {minProgressMs: 16});
  const block = await blockMainThread(page, 300);
  await page.waitForTimeout(200);
  const frames = await cast.stop();
  await unmark();
  const tracked = await trackMarker(page, frames);
  const proof = busyWindowProof(tracked, block, {
    axis: 'y',
    settledWithin: 1,
  });
  await writeEvidence(
    'busy-main-thread/tree-list-expand',
    {[`${testInfo.project.name}.json`]: JSON.stringify(proof, null, 1)},
    testInfo,
  );
  // Frames kept coming through the block, each one further down.
  expect(proof.changed, JSON.stringify(proof)).toBeGreaterThanOrEqual(3);
  expect(proof.monotonic, JSON.stringify(proof)).toBe(true);
  expect(proof.longestStallMs, JSON.stringify(proof)).toBeLessThan(40);
});

test('WebKit: the children keep moving while the main thread is blocked (video)', async ({
  browser,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'webkit',
    'the Chromium screencast test covers Chromium',
  );
  const size = {width: 402, height: 714};
  const context = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    recordVideo: {dir: testInfo.outputPath('video'), size},
  });
  const page = await context.newPage();
  await open(page);
  const {group} = parts(page);
  // Where the block's last row (the first part of it to show) comes to rest,
  // and how far it travels: expand once, read both, collapse again.
  await tapToggle(page);
  await expect.poll(async () => translateY(lastChild(page))).toBe(0);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  const unmark = await markElement(lastChild(page));
  const chip = await page.evaluate(() => {
    const el = document.querySelector('[data-harness-marker-chip]');
    const box = el?.getBoundingClientRect();
    return box == null
      ? null
      : {x: box.x + box.width / 2, y: box.y + box.height / 2};
  });
  await unmark();
  if (chip == null) {
    throw new Error('no marker chip');
  }
  await tapToggle(page);
  await expect(group).toHaveCount(0);
  // Probes every 4 px along the chip's path, from a group's height up to
  // where it rests, read where the chip is in each recorded frame.
  const probes = Array.from({length: Math.floor(height / 4) + 1}, (_, k) => ({
    x: Math.round(chip.x),
    y: Math.round(chip.y - height + k * 4),
  }));
  await installBeacon(page);
  await page.waitForTimeout(300);
  await tapToggle(page);
  await markElement(lastChild(page));
  await waitForAnimation(lastChild(page), {minProgressMs: 1});
  await blockBehindBeacon(page, 300);
  await page.waitForTimeout(400);
  const video = page.video();
  await context.close();
  const path = await video?.path();
  expect(path).toBeTruthy();
  const samples = await sampleVideoPoints(path as string, probes, size);
  /** Where the chip is: the mean probe index it covers, in px down its path. */
  const position = (marker: ReadonlyArray<boolean>) => {
    const hits = marker.flatMap((hit, k) => (hit ? [k] : []));
    return hits.length === 0
      ? null
      : (hits.reduce((a, b) => a + b, 0) / hits.length) * 4;
  };
  const blocked = samples
    .filter(s => s.beacon === 'blocked')
    .map(s => ({t: s.t, y: position(s.marker)}))
    .filter((s): s is {t: number; y: number} => s.y != null);
  const distinct = blocked
    .map(s => Math.round(s.y))
    .filter((v, i, all) => i === 0 || v !== all[i - 1]);
  await writeEvidence(
    'busy-main-thread/tree-list-expand-webkit',
    {'webkit.json': JSON.stringify({height, blocked, distinct}, null, 1)},
    testInfo,
  );
  // The block kept moving down while script could not run.
  expect(distinct.length, JSON.stringify(distinct)).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < distinct.length; i++) {
    expect(distinct[i]).toBeGreaterThan(distinct[i - 1]);
  }
});

test('the expand does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await open(page);
  const {parent, child} = parts(page);
  // Expanded from the keyboard (an iPad's): the same motion, with no press
  // feedback of the toggle's own in the trace.
  await parent.focus();
  let window = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await page.keyboard.press('ArrowRight');
    const [started] = await waitForAnimation(child);
    window = {from: started.from, to: started.from + SETTLE_MS};
    await page.waitForTimeout(SETTLE_MS + 100);
  });
  const during = countBetween(trace, window.from + 30, window.to - 30);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test(
  'storyboard: a TreeList row expanding on iOS under a finger',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await open(page);
    await tapToggle(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'tree-list-expand',
      clip: {x: 0, y: 0, width: 402, height: 340},
      times: [0, 33, 67, 100, 150, 200, 267, Math.round(SETTLE_MS)],
      columns: 8,
      cellScale: 0.45,
    });
    await releaseAnimations(page, {finish: true});
    await storyboard.write(testInfo);
  },
);
