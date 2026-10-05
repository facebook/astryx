// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CollapsibleGroup.a11y.chromium.spec.ts
 * @input Uses the component-owned Storybook fixture and exact-head build stamp
 * @output Chromium screenshots and fail-closed semantic sensor receipts
 * @position Browser evidence for the CollapsibleGroup audit
 */

import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Browser, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve('test-results/collapsible-group-audit-evidence');
const STORY_ID = 'core-collapsiblegroup--audit-matrix';
const WIDE = {width: 1024, height: 900};
const NARROW = {width: 320, height: 720};
const EXPANDED_NAMES = ['Profile settings', 'Deployment details', 'Build logs'];
const COLLAPSED_NAMES = ['Privacy settings', 'Environment variables'];

interface Case {
  state: string;
  mode: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  viewport: {width: number; height: number};
  coarsePointer?: boolean;
}

const CASES: Case[] = [
  {state: 'wide-light-ltr', mode: 'light', direction: 'ltr', viewport: WIDE},
  {state: 'wide-dark-ltr', mode: 'dark', direction: 'ltr', viewport: WIDE},
  {state: 'wide-light-rtl', mode: 'light', direction: 'rtl', viewport: WIDE},
  {state: 'wide-dark-rtl', mode: 'dark', direction: 'rtl', viewport: WIDE},
  {
    state: 'narrow-light-touch',
    mode: 'light',
    direction: 'ltr',
    viewport: NARROW,
    coarsePointer: true,
  },
  {
    state: 'narrow-dark-touch',
    mode: 'dark',
    direction: 'ltr',
    viewport: NARROW,
    coarsePointer: true,
  },
];

const frames: Record<string, unknown>[] = [];
let storybook: StaticServer;
let checkoutSha: string;
let storybookSha: string;
let browserVersion = 'unknown';

test.beforeAll(async () => {
  checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const expectedHead = process.env.ASTRYX_HEAD_SHA;
  if (expectedHead && expectedHead !== checkoutSha) {
    throw new Error('The audited checkout does not match the PR head');
  }
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
  const stamp = await fetch(`${storybook.origin}/astryx-build-sha.txt`);
  if (!stamp.ok) {
    throw new Error(
      `The Storybook build has no source stamp (${stamp.status})`,
    );
  }
  storybookSha = (await stamp.text()).trim();
  if (storybookSha !== checkoutSha) {
    throw new Error(
      'The served Storybook build does not match the audited checkout',
    );
  }
  fs.mkdirSync(OUTPUT, {recursive: true});
});

test.afterAll(async () => {
  if (checkoutSha && storybookSha) {
    fs.writeFileSync(
      path.join(OUTPUT, 'manifest.json'),
      `${JSON.stringify(
        {
          version: 1,
          component: 'core/CollapsibleGroup',
          headSha: checkoutSha,
          storybookSha,
          browser: browserVersion,
          frames,
        },
        null,
        2,
      )}\n`,
    );
  }
  await storybook?.close();
});

async function capture(page: Page, scenario: Case) {
  const errors: string[] = [];
  const onError = (error: Error) => errors.push(String(error));
  page.on('pageerror', onError);
  try {
    await page.setViewportSize(scenario.viewport);
    await page.emulateMedia({reducedMotion: 'reduce'});
    browserVersion = page.context().browser()?.version() ?? 'unknown';
    await page.goto(
      `${storybook.origin}/iframe.html?id=${STORY_ID}&viewMode=story&globals=colorMode:${scenario.mode};astryxTheme:neutral;direction:${scenario.direction}`,
    );
    const subject = page.locator('#storybook-root > *').first();
    await subject.waitFor();
    await holdMotionStill(page);
    await page.evaluate(async () => document.fonts.ready);
    await page.waitForFunction(
      expected =>
        document.documentElement.getAttribute('data-theme') === expected,
      scenario.mode,
    );

    const box = await subject.boundingBox();
    const observed = await subject.evaluate(node => {
      const buttons = [...node.querySelectorAll('button')];
      return {
        direction: getComputedStyle(node).direction,
        text: (node as HTMLElement).innerText,
        sectionCount: node.querySelectorAll('section').length,
        headingCount: node.querySelectorAll('h2').length,
        groupCount: node.querySelectorAll('.astryx-collapsible-group').length,
        buttonCount: buttons.length,
        expandedNames: buttons
          .filter(button => button.getAttribute('aria-expanded') === 'true')
          .map(button => (button as HTMLElement).innerText.trim()),
        collapsedNames: buttons
          .filter(button => button.getAttribute('aria-expanded') === 'false')
          .map(button => (button as HTMLElement).innerText.trim()),
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
      };
    });
    const environment = await page.evaluate(() => ({
      theme: document
        .querySelector('[data-astryx-theme]')
        ?.getAttribute('data-astryx-theme'),
      mode: document.documentElement.getAttribute('data-theme'),
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      fonts: document.fonts.status,
      viewport: {width: innerWidth, height: innerHeight},
      dpr: devicePixelRatio,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      coarsePointer: matchMedia('(pointer: coarse)').matches,
      forcedColors: matchMedia('(forced-colors: active)').matches,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      storyError: [
        ...document.querySelectorAll(
          '.sb-errordisplay, [data-testid="story-error"]',
        ),
      ].some(element => {
        const errorBox = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          errorBox.width > 0 &&
          errorBox.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        );
      }),
    }));

    // Every expectation is authored from the fixture and current component
    // contract before the page is observed. A failed sensor mints no frame.
    expect(await page.locator('#storybook-root > *').count()).toBe(1);
    expect(box).not.toBeNull();
    expect(await subject.isVisible()).toBe(true);
    expect(observed.direction).toBe(scenario.direction);
    expect(observed.sectionCount).toBe(2);
    expect(observed.headingCount).toBe(2);
    expect(observed.groupCount).toBe(2);
    expect(observed.buttonCount).toBe(5);
    expect(observed.expandedNames).toEqual(EXPANDED_NAMES);
    expect(observed.collapsedNames).toEqual(COLLAPSED_NAMES);
    expect(observed.text).toContain('Single selection with leading chevrons');
    expect(observed.text).toContain('Multiple selection with compact rows');
    expect(observed.width).toBeGreaterThan(0);
    expect(observed.height).toBeGreaterThan(0);
    expect(environment.theme).toBe('neutral');
    expect(environment.mode).toBe(scenario.mode);
    expect(environment.colorScheme).toBe(scenario.mode);
    expect(environment.fonts).toBe('loaded');
    expect(environment.viewport).toEqual(scenario.viewport);
    expect(environment.reducedMotion).toBe(true);
    expect(environment.forcedColors).toBe(false);
    expect(environment.coarsePointer).toBe(scenario.coarsePointer ?? false);
    expect(environment.horizontalOverflow).toBe(false);
    expect(environment.storyError).toBe(false);
    expect(errors).toEqual([]);

    const file = `CollapsibleGroup__${scenario.state}.png`;
    const png = await subject.screenshot({animations: 'disabled'});
    expect(png.length).toBeGreaterThan(100);
    const receipt = {
      expected: {
        build: checkoutSha,
        storyId: STORY_ID,
        theme: 'neutral',
        mode: scenario.mode,
        direction: scenario.direction,
        viewport: scenario.viewport,
        rootCount: 1,
        sectionCount: 2,
        headingCount: 2,
        groupCount: 2,
        buttonCount: 5,
        expandedNames: EXPANDED_NAMES,
        collapsedNames: COLLAPSED_NAMES,
        coarsePointer: scenario.coarsePointer ?? false,
      },
      observed: {
        build: storybookSha,
        storyId: STORY_ID,
        rootCount: await page.locator('#storybook-root > *').count(),
        ...observed,
        ...environment,
        pageErrors: errors.length,
        selectorVisible: await subject.isVisible(),
        geometry: box,
      },
      image: {
        file,
        sha256: createHash('sha256').update(png).digest('hex'),
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20),
      },
      browser: browserVersion,
      passed: true,
    };
    fs.writeFileSync(path.join(OUTPUT, file), png);
    fs.writeFileSync(
      path.join(OUTPUT, `${file}.sensors.json`),
      `${JSON.stringify(receipt, null, 2)}\n`,
    );
    frames.push({
      state: scenario.state,
      receipt: `${file}.sensors.json`,
      image: receipt.image,
    });
  } finally {
    page.off('pageerror', onError);
  }
}

test('captures the complete group matrix with sensor receipts', async ({
  browser,
  page,
}: {
  browser: Browser;
  page: Page;
}) => {
  for (const scenario of CASES.filter(value => !value.coarsePointer)) {
    await capture(page, scenario);
  }

  const touchContext = await browser.newContext({
    viewport: NARROW,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  try {
    const touchPage = await touchContext.newPage();
    for (const scenario of CASES.filter(value => value.coarsePointer)) {
      await capture(touchPage, scenario);
    }
  } finally {
    await touchContext.close();
  }
});
