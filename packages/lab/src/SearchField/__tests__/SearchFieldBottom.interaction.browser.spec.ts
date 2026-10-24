// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SearchFieldBottom.interaction.browser.spec.ts
 * @input The built "Lab/SearchField" Bottom story on the harness's phone
 *   (touch, so the touch presentation applies), a stand-in visual viewport
 *   that reports a software keyboard, real touch input (Chromium CDP /
 *   WebKit's input command), the UIKit search table and the interaction
 *   harness
 * @output Proofs that the bottom (toolbar) placement moves as iOS 26.2's
 *   does: a tap plays the measured activation on every part (the field's
 *   swell and narrowing, the close button growing in) within half a pixel;
 *   the bar rides the keyboard on the keyboard's spring with the field's
 *   centre 36 px above the keyboard's top; the close button narrows the
 *   field 16 px at each side, springs it out to rest and shrinks the button
 *   in place while the bar rides down; the ride keeps advancing through a
 *   blocked main thread; storyboards of the activation and the cancel
 * @position Interaction proof for lab SearchField's bottom placement
 *   (SearchField.tsx, searchFieldModel.ts). Headless browsers have no
 *   software keyboard, so the page's `visualViewport` is replaced by one the
 *   test shrinks the way Mobile Safari does (one `resize`, final height), as
 *   ChatLayoutKeyboard.interaction.browser.spec.ts does; Mobile Safari itself
 *   is proven on the iOS simulator (pull request evidence)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  curveOf,
  holdAnimations,
  markElement,
  openStory,
  phone,
  releaseAnimations,
  sampleCurve,
  springStep,
  startScreencast,
  timeline,
  touchDriver,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// The bottom placement's measurements, as in the UIKit table
// (`uikit.search.bottom`, motion/uikit/search.ts, which search.test.ts holds
// together): the field's geometry and its measured frames, [ms, leading
// progress, trailing progress, height scale] for the field and [ms, opacity,
// scale, x] for the close button. Spelled out here because a spec runs
// against the built Storybook, outside the packages' builds.
const bottom = {
  fieldHeight: 38,
  keyboardCenterOffset: 36,
  restInset: 33,
  activeInset: 17,
  closeSize: 38,
  closeGap: 22,
  cancelNarrowing: 16,
  // prettier-ignore
  activationFrames: [[0, 0, 0, 1], [66, 1.076, -0.365, 1.003], [87, 1.008, -0.35, 0.999], [103, 0.994, -0.203, 0.998], [120, 1.099, -0.019, 1.076], [137, 1.201, 0.183, 1.152], [153, 1.243, 0.387, 1.162], [170, 1.206, 0.581, 1.115], [187, 1.146, 0.742, 1.059], [203, 1.042, 0.877, 1.014], [220, 0.994, 0.96, 0.989], [237, 0.946, 1.017, 0.979], [253, 0.933, 1.043, 0.979], [270, 0.931, 1.052, 0.983], [287, 0.938, 1.051, 0.989], [303, 0.952, 1.043, 0.994], [320, 0.964, 1.033, 0.997], [337, 0.978, 1.024, 0.998], [353, 0.986, 1.016, 0.999], [370, 0.993, 1.002, 0.999], [387, 0.996, 1.002, 0.999], [403, 0.999, 1, 1], [420, 0.999, 1, 1], [437, 0.999, 1, 1], [453, 1, 1, 1]],
  // prettier-ignore
  cancelFrames: [[0, 0, 1.364, 1], [17, 0, 1.364, 1], [34, 0, 1.252, 1], [51, -0.004, 0.948, 1.079], [67, -0.007, 0.631, 1.144], [84, -0.009, 0.351, 1.191], [101, -0.009, 0.15, 1.2], [117, -0.009, 0.001, 1.202], [134, -0.009, -0.103, 1.176], [151, -0.008, -0.142, 1.119], [167, -0.006, -0.128, 1.052], [184, -0.003, -0.094, 1.02], [201, -0.001, -0.058, 0.992], [217, 0, -0.031, 0.985], [234, 0.001, -0.013, 0.984], [251, 0.001, -0.003, 0.988], [267, 0.001, 0, 0.994], [284, 0.001, 0.001, 0.997], [301, 0, 0, 1]],
  // prettier-ignore
  closeEnterFrames: [[0, 0, 0.2, -16.67], [153, 0, 0.238, -16.67], [170, 0.024, 0.257, -16.26], [187, 0.067, 0.287, -15.55], [203, 0.157, 0.348, -14.05], [220, 0.228, 0.396, -12.86], [237, 0.342, 0.474, -10.96], [253, 0.42, 0.53, -9.67], [270, 0.532, 0.615, -7.81], [287, 0.602, 0.671, -6.64], [303, 0.698, 0.75, -5.04], [320, 0.755, 0.798, -4.09], [337, 0.829, 0.861, -2.85], [353, 0.871, 0.896, -2.15], [370, 0.923, 0.939, -1.28], [387, 0.958, 0.966, -0.7], [403, 0.985, 0.988, -0.25], [420, 1, 1.005, 0.1], [437, 1, 1.015, 0.31], [453, 1, 1.025, 0.52], [470, 1, 1.029, 0.61], [487, 1, 1.033, 0.68], [503, 1, 1.033, 0.7], [520, 1, 1.033, 0.68], [537, 1, 1.031, 0.65], [553, 1, 1.028, 0.59], [570, 1, 1.026, 0.54], [587, 1, 1.022, 0.46], [603, 1, 1.019, 0.41], [620, 1, 1.016, 0.33], [637, 1, 1.013, 0.27], [653, 1, 1.011, 0.22], [670, 1, 1.008, 0.16], [687, 1, 1.006, 0], [703, 1, 1, 0]],
  // prettier-ignore
  closeExitFrames: [[0, 1, 1.069], [17, 1, 1.387], [34, 0.918, 1.282], [51, 0.76, 1.083], [67, 0.581, 0.861], [84, 0.414, 0.66], [101, 0.274, 0.497], [117, 0.167, 0.376], [134, 0.089, 0.291], [151, 0.037, 0.236], [167, 0.005, 0.201], [184, 0, 0.182]],
} as const;

// UIKit's keyboard spring (motion/uikit springs.keyboard): mass 1,
// stiffness 555.0265, damping 47.118, critically damped.
const KEYBOARD = {
  response: (2 * Math.PI) / Math.sqrt(555.0265),
  dampingFraction: 47.118 / (2 * Math.sqrt(555.0265)),
};
// The cover Mobile Safari reports on an iPhone 17 Pro.
const COVER = 337;
// The phone's width: the field's edges as on a 402 pt iPhone 17 Pro.
const WIDTH = phone.viewport.width;
const REST = {leading: bottom.restInset, trailing: WIDTH - bottom.restInset};
const ACTIVE = {
  leading: bottom.activeInset,
  trailing: WIDTH - bottom.activeInset - bottom.closeSize - bottom.closeGap,
};
const CAP = bottom.fieldHeight / 2;

/** A frame table's column at `ms`, linear between rows, held at the ends. */
function frameAt(
  table: readonly (readonly number[])[],
  column: number,
  ms: number,
) {
  if (ms <= table[0][0]) {
    return table[0][column];
  }
  const last = table[table.length - 1];
  if (ms >= last[0]) {
    return last[column];
  }
  let i = 1;
  while (table[i][0] < ms) {
    i++;
  }
  const a = table[i - 1];
  const b = table[i];
  return a[column] + ((b[column] - a[column]) * (ms - a[0])) / (b[0] - a[0]);
}

/** The field's edges at `ms` into a gel table, px. */
function edgesAt(table: readonly (readonly number[])[], ms: number) {
  return {
    leading:
      REST.leading + frameAt(table, 1, ms) * (ACTIVE.leading - REST.leading),
    trailing:
      REST.trailing + frameAt(table, 2, ms) * (ACTIVE.trailing - REST.trailing),
    heightScale: frameAt(table, 3, ms),
  };
}

/**
 * Replaces `window.visualViewport` before the page loads with one the test
 * drives: `__keyboard(cover)` shrinks it from the bottom and fires one
 * `resize`, as Mobile Safari does.
 */
async function installKeyboard(page: Page) {
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      width: window.innerWidth,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      get: () => viewport,
    });
    (window as unknown as {__keyboard: (cover: number) => void}).__keyboard =
      cover => {
        viewport.height = window.innerHeight - cover;
        viewport.dispatchEvent(new Event('resize'));
      };
  });
}

const showKeyboard = async (page: Page, cover = COVER) =>
  page.evaluate(
    c => (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c),
    cover,
  );

// The first page of a fresh WebKit worker stops presenting frames for about
// a second after its first composited animation starts (the engine setting
// up compositing). One throwaway activation pays that cost first.
test.beforeAll(async ({browser, browserName}) => {
  if (browserName !== 'webkit') {
    return;
  }
  const context = await browser.newContext(phone);
  const page = await context.newPage();
  await openStory(page, storybook(), 'lab-searchfield--bottom');
  const field = page.getByRole('searchbox', {name: 'Search'});
  const box = await field.boundingBox();
  if (box != null) {
    await (
      await touchDriver(page)
    ).tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    await page.waitForTimeout(2000);
  }
  await context.close();
});

async function openBottom(page: Page) {
  await installKeyboard(page);
  await openStory(page, storybook(), 'lab-searchfield--bottom');
  const driver = await touchDriver(page);
  const field = page.getByRole('searchbox', {name: 'Search'});
  await expect(field).toBeVisible();
  await waitForRest(page.locator('[data-search-field-end]'));
  return {driver, field};
}

const root = (page: Page) => page.getByRole('search');
const start = (page: Page) => page.locator('[data-search-field-start]');
const middle = (page: Page) => page.locator('[data-search-field-middle]');
const end = (page: Page) => page.locator('[data-search-field-end]');
const endCap = (page: Page) => page.locator('[data-search-field-end-cap]');
const close = (page: Page) => page.locator('[data-search-field-close]');

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** The presented `translate`, px: [x, y]. */
const translate = async (locator: Locator) =>
  locator.evaluate(element => {
    const value = getComputedStyle(element).translate;
    if (value === 'none') {
      return [0, 0];
    }
    const [x, y] = value.split(' ').map(part => parseFloat(part) || 0);
    return [x ?? 0, y ?? 0];
  });

/** Opens the Bottom story, activates it and brings the keyboard up. */
async function openActive(page: Page) {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await showKeyboard(page);
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  await waitForRest(close(page));
  await waitForRest(root(page));
  return {driver, field};
}

test('a tap plays iOS’s measured activation on every part', async ({
  page,
}, testInfo) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await waitForAnimation(end(page));
  const held = await holdAnimations(page);
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  const curveEnd = Math.max(...held.map(a => a.curveEndMs));
  const times = timeline(curveEnd);
  const [starts, middles, ends, caps, closes] = await Promise.all(
    [start, middle, end, endCap, close].map(async part =>
      sampleCurve(part(page), times),
    ),
  );
  await releaseAnimations(page, {finish: true});
  const samples = times.map((t, i) => {
    const edges = edgesAt(bottom.activationFrames, t);
    return {
      t: +t.toFixed(1),
      startX: starts[i].transform.translateX,
      middleScale: middles[i].transform.scaleX,
      endX: ends[i].transform.translateX,
      heightScale: caps[i].transform.scaleY,
      closeX: closes[i].transform.translateX,
      closeScale: closes[i].transform.scaleX,
      closeOpacity: closes[i].opacity,
      measured: {
        startX: edges.leading - REST.leading,
        middleScale:
          (edges.trailing - edges.leading - 2 * CAP) /
          (REST.trailing - REST.leading - 2 * CAP),
        endX: edges.trailing - REST.trailing,
        heightScale: edges.heightScale,
        closeX: frameAt(bottom.closeEnterFrames, 3, t),
        closeScale: frameAt(bottom.closeEnterFrames, 2, t),
        closeOpacity: frameAt(bottom.closeEnterFrames, 1, t),
      },
    };
  });
  await writeEvidence(
    'curves/searchfield-bottom-activation',
    {[`${testInfo.project.name}.json`]: JSON.stringify(samples, null, 1)},
    testInfo,
  );
  for (const sample of samples) {
    const {measured} = sample;
    const at = `at ${sample.t} ms`;
    expect(Math.abs(sample.startX - measured.startX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.endX - measured.endX), at).toBeLessThan(0.5);
    expect(
      Math.abs(sample.middleScale - measured.middleScale) *
        (REST.trailing - REST.leading - 2 * CAP),
      at,
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.heightScale - measured.heightScale),
      at,
    ).toBeLessThan(0.01);
    expect(Math.abs(sample.closeX - measured.closeX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.closeScale - measured.closeScale), at).toBeLessThan(
      0.01,
    );
    expect(
      Math.abs(sample.closeOpacity - measured.closeOpacity),
      at,
    ).toBeLessThan(0.02);
  }
  // It swells past rest before it narrows, as iOS's field does.
  expect(Math.max(...samples.map(s => s.endX))).toBeGreaterThan(10);
  await waitForRest(end(page));
  expect((await translate(end(page)))[0]).toBeCloseTo(
    ACTIVE.trailing - REST.trailing,
    1,
  );
});

test('the bar rides the keyboard on its spring, the field’s centre 36 px above the keyboard', async ({
  page,
}, testInfo) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await waitForRest(end(page));
  // Active with no keyboard yet: pinned 36 px above the viewport's bottom
  // edge, 16 px below its rest (iOS's first frame does the same).
  const restGap = await root(page).evaluate(
    element =>
      window.innerHeight -
      (element.getBoundingClientRect().top -
        (parseFloat(getComputedStyle(element).translate.split(' ')[1] ?? '0') ||
          0) +
        element.getBoundingClientRect().height / 2),
  );
  const pinned = restGap - bottom.keyboardCenterOffset;
  expect((await translate(root(page)))[1]).toBeCloseTo(pinned, 0);

  await showKeyboard(page);
  await waitForAnimation(root(page));
  const held = await holdAnimations(page, root(page));
  const curveEnd = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(root(page), timeline(curveEnd)),
    'translateY',
  );
  await releaseAnimations(page);
  const expected = (t: number) => pinned - COVER * springStep(KEYBOARD, t);
  const result = compareCurve(samples, expected, 0.5);
  await writeEvidence(
    'curves/searchfield-bottom-keyboard',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {restGap, held, comparison: result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  await waitForRest(root(page));
  const box = await root(page).boundingBox();
  const keyboardTop = await page.evaluate(
    cover => window.innerHeight - cover,
    COVER,
  );
  expect(keyboardTop - ((box?.y ?? 0) + (box?.height ?? 0) / 2)).toBeCloseTo(
    bottom.keyboardCenterOffset,
    0,
  );
});

test('the close button narrows the field, springs it out to rest and shrinks in place as the bar rides down', async ({
  page,
}, testInfo) => {
  const {driver} = await openActive(page);
  await driver.tap(await centerOf(close(page)));
  await showKeyboard(page, 0);
  await waitForAnimation(end(page));
  const held = await holdAnimations(page);
  await expect(root(page)).not.toHaveAttribute('data-search-field-active');
  const fieldEnd = Math.max(
    ...held.filter(a => a.curveEndMs < 1000).map(a => a.curveEndMs),
  );
  const times = timeline(fieldEnd);
  const [ends, closes] = await Promise.all(
    [end, close].map(async part => sampleCurve(part(page), times)),
  );
  await releaseAnimations(page, {finish: true});
  const samples = times.map((t, i) => ({
    t: +t.toFixed(1),
    endX: ends[i].transform.translateX,
    closeX: closes[i].transform.translateX,
    closeScale: closes[i].transform.scaleX,
    closeOpacity: closes[i].opacity,
    measured: {
      endX: edgesAt(bottom.cancelFrames, t).trailing - REST.trailing,
      closeX: -bottom.cancelNarrowing,
      closeScale: frameAt(bottom.closeExitFrames, 2, t),
      closeOpacity: frameAt(bottom.closeExitFrames, 1, t),
    },
  }));
  await writeEvidence(
    'curves/searchfield-bottom-cancel',
    {[`${testInfo.project.name}.json`]: JSON.stringify(samples, null, 1)},
    testInfo,
  );
  // The trailing edge starts 16 px inside the active field's.
  expect(samples[0].endX).toBeCloseTo(
    ACTIVE.trailing - bottom.cancelNarrowing - REST.trailing,
    0,
  );
  for (const sample of samples) {
    const {measured} = sample;
    const at = `at ${sample.t} ms`;
    expect(Math.abs(sample.endX - measured.endX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.closeX - measured.closeX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.closeScale - measured.closeScale), at).toBeLessThan(
      0.01,
    );
    expect(
      Math.abs(sample.closeOpacity - measured.closeOpacity),
      at,
    ).toBeLessThan(0.02);
  }
  await waitForRest(root(page));
  expect((await translate(root(page)))[1]).toBeCloseTo(0, 0);
  await expect(close(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('searchbox')).not.toBeFocused();
});

test('the ride keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  // Every part settled, so the only animation in the field is the ride.
  await waitForRest(end(page));
  await waitForRest(close(page));
  await markElement(root(page));
  const cast = await startScreencast(page);
  await showKeyboard(page);
  // The guide dates the ride back to when the keyboard started to rise, so
  // the animation reports progress before its first frame is presented:
  // block once it has been on screen for a few frames.
  const block = await blockMainThread(page, 500, {
    during: root(page),
    minProgressMs: 60,
  });
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(tracked, block, {settledWithin: 2});
  await writeEvidence(
    'busy-main-thread/searchfield-bottom-keyboard',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            y: f.box?.y ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'searchfield-bottom-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: proof.judged.to + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({y: tracked.find(f => f.t === t)?.box?.y ?? -1}),
  });
  await film.write(testInfo, {block, judged: proof.judged});
  expect(proof.verdict.failures, proof.summary).toEqual([]);
});

test(
  'storyboard: the bottom field activating with the keyboard',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, field} = await openBottom(page);
    await driver.tap(await centerOf(field));
    await showKeyboard(page);
    await waitForAnimation(root(page));
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-bottom-activation',
      clip: {x: 0, y: 300, width: WIDTH, height: 414},
      times: Array.from({length: 30}, (_, i) => i * 16.667),
      measure: async () => ({
        y: (await translate(root(page)))[1],
        endX: (await translate(end(page)))[0],
        closeOpacity: await close(page).evaluate(element =>
          parseFloat(getComputedStyle(element).opacity),
        ),
      }),
      columns: 6,
      cellScale: 0.4,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {y: number; endX: number; closeOpacity: number},
    );
    expect(frames.at(-1)?.y ?? 0).toBeLessThan(-200);
    expect(frames.at(-1)?.closeOpacity ?? 0).toBeGreaterThan(0.95);
  },
);

test(
  'storyboard: the bottom field cancelling with the keyboard',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver} = await openActive(page);
    await driver.tap(await centerOf(close(page)));
    await showKeyboard(page, 0);
    await waitForAnimation(end(page));
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-bottom-cancel',
      clip: {x: 0, y: 300, width: WIDTH, height: 414},
      times: Array.from({length: 30}, (_, i) => i * 16.667),
      measure: async () => ({
        y: (await translate(root(page)))[1],
        endX: (await translate(end(page)))[0],
        closeOpacity: await close(page).evaluate(element =>
          parseFloat(getComputedStyle(element).opacity),
        ),
      }),
      columns: 6,
      cellScale: 0.4,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {y: number; endX: number; closeOpacity: number},
    );
    expect(Math.abs(frames.at(-1)?.y ?? 99)).toBeLessThan(2);
    expect(frames.at(-1)?.closeOpacity ?? 1).toBeLessThan(0.01);
  },
);
