// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToggleButton.a11y.chromium.spec.ts
 * @input Uses @playwright/test, the a11y-spec static Storybook server, and the
 *   checked-in ToggleButtonDisabledA11y stories
 * @output Real-browser evidence for `docs/families/buttons.md` FR3 — disabled
 *   means non-operable — across the two ways a ToggleButton becomes disabled,
 *   plus the enabled control that catches a fix which disables too much.
 * @position The half of FR3 that jsdom cannot honestly reach. A disabled toggle
 *   kept focusable by a tooltip carries `aria-disabled` instead of the native
 *   `disabled` attribute, so whether a real mouse press is refused is an engine
 *   fact — jsdom's synthetic click does not settle it
 *   (`docs/specs/AST-013/spec.md`: a browser claim is made in a browser).
 *
 * Each state drives a checked-in story rather than a page this file builds, so
 * the reproduction path for any failure is a URL a person can open
 * (`docs/specs/AST-009/spec.md` FR30). Each story counts its own activations,
 * which is what `activationsOn` reads — a toggle that refuses a press leaves no
 * trace on itself.
 *
 * Presses go through `page.mouse` at the control's own centre rather than
 * `locator.click()`. Playwright's actionability wait would refuse to press a
 * natively disabled control at all, which would prove nothing about what the
 * engine does with a press that really lands.
 *
 * SYNC: Fixtures live in
 *   /apps/storybook/stories/ToggleButtonDisabledA11y.stories.tsx.
 */

import {expect, test, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const STORY_BASE = 'a11y-togglebutton-disabled-state';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

/** Load a story and wait for the control the assertions press. */
async function mountStory(page: Page, storyId: string): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY_BASE}--${storyId}&viewMode=story`,
    {waitUntil: 'load'},
  );
  await holdMotionStill(page);
  await page
    .locator('#storybook-root')
    .getByRole('button')
    .first()
    .waitFor({state: 'attached'});
}

/**
 * How many times this story's own handler has run.
 *
 * The story publishes the count as an attribute, so this reads a fact the story
 * renders rather than instrumenting the page from the test — a person opening
 * the story sees the same number the spec does.
 */
async function activationsOn(page: Page): Promise<number> {
  const raw = await page
    .locator('[data-a11y-activations]')
    .first()
    .getAttribute('data-a11y-activations');
  return Number(raw ?? '0');
}

/**
 * A real mouse press at the control's own centre, landing whether or not
 * Playwright would consider the control actionable. This is the press the
 * expectations are about: a user aiming at a control that looks unavailable.
 */
async function pressWithMouse(page: Page, name: string): Promise<void> {
  const control = page
    .locator('#storybook-root')
    .getByRole('button', {name, includeHidden: true})
    .first();
  const box = await control.boundingBox();
  expect(
    box,
    `"${name}" has no layout box, so no mouse press could land on it`,
  ).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

/**
 * Whether the engine reports this control as unavailable, by either of the two
 * spellings FR3 permits: the native attribute, or focusable `aria-disabled`.
 */
async function isUnavailable(page: Page, name: string): Promise<boolean> {
  return page
    .locator('#storybook-root')
    .getByRole('button', {name, includeHidden: true})
    .first()
    .evaluate(
      element =>
        (element as HTMLButtonElement).disabled ||
        element.getAttribute('aria-disabled') === 'true',
    );
}

test('a member that disables itself stays disabled inside an enabled group', async ({
  page,
}) => {
  await mountStory(page, 'group-enabled-member-disabled');

  expect(
    await isUnavailable(page, 'List'),
    'the member sets isDisabled, so it must be exposed as unavailable even though the group disables nothing',
  ).toBe(true);

  await pressWithMouse(page, 'List');
  expect(
    await activationsOn(page),
    'a disabled member must not invoke the group selection callback (family:buttons FR3)',
  ).toBe(0);
});

test('an enabled member of the same group still toggles', async ({page}) => {
  await mountStory(page, 'group-enabled-member-disabled');

  expect(await isUnavailable(page, 'Grid')).toBe(false);

  await pressWithMouse(page, 'Grid');
  expect(
    await activationsOn(page),
    'the sibling says nothing about its own availability and the group disables nothing, so it must still select',
  ).toBe(1);
});

test('a group disabled state still disables a member that says nothing', async ({
  page,
}) => {
  await mountStory(page, 'group-disabled-member-silent');

  expect(await isUnavailable(page, 'List')).toBe(true);

  await pressWithMouse(page, 'List');
  expect(
    await activationsOn(page),
    'a group disabled state overrides member availability (family:buttons FR3)',
  ).toBe(0);
});

test('a disabled toggle kept focusable by its tooltip refuses a mouse press', async ({
  page,
}) => {
  await mountStory(page, 'disabled-with-tooltip');

  const control = page.locator('#storybook-root').getByRole('button').first();

  // The tooltip is why this control is focusable rather than natively disabled,
  // so the press has to be made the way a user reaches it: hover first, let the
  // tip come up, then press. Pressing cold would skip the hover state the
  // tooltip's own pointer listeners run in.
  await control.hover();
  await expect(page.getByRole('tooltip')).toBeVisible();

  expect(
    await control.evaluate(element => element.getAttribute('aria-disabled')),
    'a tooltip keeps the reason reachable by making the control focusable rather than natively disabled',
  ).toBe('true');
  expect(await control.getAttribute('aria-pressed')).toBe('false');

  await pressWithMouse(page, 'Bold');

  expect(
    await activationsOn(page),
    'focusable is not operable: a disabled toggle must not invoke onPressedChange from a mouse press (family:buttons FR3)',
  ).toBe(0);
  expect(
    await control.getAttribute('aria-pressed'),
    'the pressed state must not flip',
  ).toBe('false');
});

test('an enabled toggle with the same tooltip still toggles on a mouse press', async ({
  page,
}) => {
  await mountStory(page, 'enabled-with-tooltip');

  const control = page.locator('#storybook-root').getByRole('button').first();
  await control.hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  expect(await control.getAttribute('aria-pressed')).toBe('false');

  await pressWithMouse(page, 'Bold');

  expect(
    await activationsOn(page),
    'the enabled path must be untouched by the disabled-state fix',
  ).toBe(1);
  expect(await control.getAttribute('aria-pressed')).toBe('true');
});
