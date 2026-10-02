// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TokenizerSelection.a11y.chromium.spec.ts
 * @input Uses @playwright/test, the a11y-spec static Storybook server, and
 *   checked-in Tokenizer/BaseTypeahead/Typeahead stories
 * @output Real-Chromium evidence for component:Tokenizer FR13-FR15 and direct
 *   disabled-transition compatibility
 * @position Browser lane for focus, native popover, pointer, keyboard, and
 *   stale-result behavior that jsdom cannot prove
 *
 * SYNC: Browser fixtures live in
 *   /apps/storybook/stories/TokenizerSelectionA11y.stories.tsx.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const TOKENIZER_STORY_BASE = 'a11y-tokenizer-consecutive-selection';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

async function mountStory(page: Page, storyId: string): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story`,
    {
      waitUntil: 'load',
    },
  );
  await holdMotionStill(page);
}

function tokenizerInput(page: Page): Locator {
  return page.getByRole('combobox', {name: 'Team members'});
}

async function expectOnlyOption(page: Page, name: string): Promise<Locator> {
  const option = page.getByRole('option', {name});
  await expect(option).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(1);
  return option;
}

async function expectActive(input: Locator, option: Locator): Promise<void> {
  const optionId = await option.getAttribute('id');
  if (optionId == null) {
    throw new Error('the active option must have an id');
  }
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(input).toHaveAttribute('aria-activedescendant', optionId);
}

test('keyboard selection advances through a capped loaded cohort, then closes', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--capped-cohort`);
  const input = tokenizerInput(page);

  await input.click();
  const alice = await expectOnlyOption(page, 'Alice Johnson');
  await expectActive(input, alice);

  await input.press('Enter');
  const bob = await expectOnlyOption(page, 'Bob Smith');
  await expect(page.locator('[data-selected-ids]')).toHaveText('1');
  await expectActive(input, bob);

  await input.press('Enter');
  await expect(page.locator('[data-selected-ids]')).toHaveText('1,2');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
});

test('pointer selection keeps focus and the next capped choice active', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--capped-cohort`);
  const input = tokenizerInput(page);

  await input.click();
  await (await expectOnlyOption(page, 'Alice Johnson')).click();
  const bob = await expectOnlyOption(page, 'Bob Smith');
  await expect(page.locator('[data-selected-ids]')).toHaveText('1');
  await expectActive(input, bob);
});

test('selecting the last displayed choice falls back to the preceding choice', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--full-cohort`);
  const input = tokenizerInput(page);

  await input.click();
  await input.press('ArrowDown');
  const bob = page.getByRole('option', {name: 'Bob Smith'});
  await expectActive(input, bob);
  await input.press('Enter');

  const alice = await expectOnlyOption(page, 'Alice Johnson');
  await expect(page.locator('[data-selected-ids]')).toHaveText('2');
  await expectActive(input, alice);
});

test('reaching maxEntries closes while another loaded choice remains', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--maximum-entry`);
  const input = tokenizerInput(page);

  await input.click();
  await (await expectOnlyOption(page, 'Alice Johnson')).click();
  await expect(page.locator('[data-selected-ids]')).toHaveText('1');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
});

for (const disabledMode of ['native', 'focusable'] as const) {
  test(`becoming ${disabledMode}-disabled closes the open popup and blocks selection`, async ({
    page,
  }) => {
    await mountStory(
      page,
      `${TOKENIZER_STORY_BASE}--${disabledMode}-disable-while-open`,
    );
    const input = tokenizerInput(page);

    await input.click();
    const alice = page.getByRole('option', {name: 'Alice Johnson'});
    await expect(alice).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(2);
    await expectActive(input, alice);
    await page
      .getByRole('button', {name: 'Disable tokenizer'})
      .evaluate(button => (button as HTMLButtonElement).click());

    if (disabledMode === 'native') {
      await expect(input).toBeDisabled();
    } else {
      await expect(input).toHaveAttribute('aria-disabled', 'true');
      await expect(input).toBeFocused();
    }
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).not.toHaveAttribute('aria-activedescendant');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-selected-ids]')).toHaveText('');
  });
}

test('dismissal rejects a settled stale result instead of reopening the popup', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--delayed-search-dismissal`);
  const input = tokenizerInput(page);

  await input.click();
  await expect(page.getByRole('option', {name: 'Alice Johnson'})).toBeVisible();
  await input.fill('a');
  await expect(input).toHaveAttribute('aria-busy', 'true');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-busy');

  await expect(page.locator('[data-search-settled]')).toHaveText('true');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('option')).toHaveCount(0);
});

test('direct BaseTypeahead still closes after a typed selection', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--direct-base-typeahead`);
  const input = page.getByRole('combobox', {name: 'Framework'});

  await input.fill('React');
  await page.getByRole('option', {name: 'React'}).waitFor();
  await input.press('Enter');

  await expect(page.locator('[data-selected-id]')).toHaveText('react');
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
});

test('direct BaseTypeahead preserves keyboard selection after focusable disable', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--direct-base-typeahead`);
  const input = page.getByRole('combobox', {name: 'Framework'});

  await input.fill('React');
  const option = page.getByRole('option', {name: 'React'});
  await expectActive(input, option);
  await page
    .getByRole('button', {name: 'Disable direct BaseTypeahead'})
    .evaluate(button => (button as HTMLButtonElement).click());

  await expect(input).toHaveAttribute('aria-disabled', 'true');
  await expect(input).toHaveAttribute('readonly', '');
  await expectActive(input, option);
  await input.press('Enter');

  await expect(page.locator('[data-selected-id]')).toHaveText('react');
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
});

test('public Typeahead preserves pointer selection after focusable disable', async ({
  page,
}) => {
  await mountStory(page, `${TOKENIZER_STORY_BASE}--direct-typeahead`);
  const input = page.getByRole('combobox', {name: 'Framework'});

  await input.fill('React');
  const option = page.getByRole('option', {name: 'React'});
  await expectActive(input, option);
  await page
    .getByRole('button', {name: 'Disable public Typeahead'})
    .evaluate(button => (button as HTMLButtonElement).click());

  await expect(input).toHaveAttribute('aria-disabled', 'true');
  await expect(input).toHaveAttribute('readonly', '');
  await expectActive(input, option);
  await option.click();

  await expect(page.locator('[data-selected-id]')).toHaveText('react');
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
});
