// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComboboxField.a11y.chromium.spec.ts
 * @input The `Core/Hooks/useCombobox` stories in a built Storybook, the
 *   reusable Combobox contract, axe, and real keyboard and pointer input
 * @output Chromium proof that a combobox over a field the story renders itself
 *   keeps focus in the field, exposes its roles and relationships, and takes
 *   the keys and presses spec:AST-075 assigns to it
 * @position Run with `pnpm test:a11y-contract`. The unit suite in
 *   useCombobox.test.tsx covers the same requirements without an engine.
 */

import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  COMBOBOX_PATTERN,
  blockingResults,
  checkAccessibilitySpec,
  formatFailures,
  type ComboboxStateFacts,
} from '@astryxdesign/a11y-spec';
import {createChromiumHarness} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

const STORY = {
  message: 'core-hooks-usecombobox--message-field',
  search: 'core-hooks-usecombobox--search-field',
  editable: 'core-hooks-usecombobox--editable-field',
  dialog: 'core-hooks-usecombobox--in-dialog',
} as const;

async function openStory(page: Page, story: string): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${story}&viewMode=story`,
    {waitUntil: 'load'},
  );
}

/** Whether DOM focus is on exactly this element. */
async function hasFocus(locator: Locator): Promise<boolean> {
  return locator.evaluate(el => el === el.ownerDocument.activeElement);
}

/** The id the field names as its active option, which must be rendered. */
async function activeOptionName(page: Page, field: Locator): Promise<string> {
  const id = await field.getAttribute('aria-activedescendant');
  expect(id).not.toBeNull();
  const option = page.locator(`[id="${id}"]`);
  await expect(option).toHaveAttribute('role', 'option');
  await expect(option).toHaveAttribute('aria-selected', 'true');
  return (await option.textContent()) ?? '';
}

const AXE_DISABLED_RULES = [
  // A story is a fragment, not a page.
  'landmark-one-main',
  'page-has-heading-one',
  'region',
  // A long list scrolls without a Tab stop of its own by design: focus stays
  // in the field, whose arrows reach every option and scroll it into view.
  'scrollable-region-focusable',
];

async function axeViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({page})
    .disableRules(AXE_DISABLED_RULES)
    .analyze();
  return results.violations.map(
    violation =>
      `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`,
  );
}

const closedFacts: ComboboxStateFacts = {
  name: '',
  expanded: false,
  popupRole: 'listbox',
  popupVisible: false,
  activeDescendant: false,
  readOnly: false,
  busy: false,
  inertUnderOwnModal: false,
};

interface Scenario {
  readonly id: string;
  readonly story: string;
  readonly name: string;
  readonly open: boolean;
  /** Puts the story in the state, starting from a focused field. */
  readonly arrange: (page: Page, field: Locator) => Promise<void>;
}

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: 'input-hidden',
    story: STORY.search,
    name: 'Search settings',
    open: false,
    arrange: async () => {},
  },
  {
    id: 'input-shown-in-flow',
    story: STORY.search,
    name: 'Search settings',
    open: true,
    arrange: async page => {
      await page.keyboard.type('no');
      await page.keyboard.press('ArrowDown');
    },
  },
  {
    id: 'contenteditable-shown-in-flow',
    story: STORY.editable,
    name: 'Add people',
    open: true,
    arrange: async page => {
      await page.keyboard.type('ar');
    },
  },
  {
    id: 'input-shown-in-dialog',
    story: STORY.dialog,
    name: 'Add people',
    open: true,
    arrange: async page => {
      await page.keyboard.type('a');
    },
  },
];

for (const scenario of SCENARIOS) {
  test(`Combobox contract over a caller-rendered field — ${scenario.id}`, async ({
    page,
  }) => {
    await openStory(page, scenario.story);
    const field = page.getByRole('combobox', {name: scenario.name});
    await field.click();
    await scenario.arrange(page, field);
    const listbox = page.getByRole('listbox');
    if (scenario.open) {
      await expect(listbox).toBeVisible();
    } else {
      await expect(listbox).toHaveCount(0);
    }

    const related: Record<string, Locator> = {};
    if (scenario.open) {
      related.popup = listbox;
      const id = await field.getAttribute('aria-activedescendant');
      expect(id).not.toBeNull();
      related['active-descendant'] = page.locator(`[id="${id}"]`);
    }
    const cdp = await page.context().newCDPSession(page);
    const run = await checkAccessibilitySpec({
      spec: COMBOBOX_PATTERN,
      binding: 'useCombobox.field',
      state: scenario.id,
      facts: {
        ...closedFacts,
        name: scenario.name,
        expanded: scenario.open,
        popupVisible: scenario.open,
        activeDescendant: scenario.open,
      },
      mount: async () =>
        createChromiumHarness({page, cdp, subject: field, related}),
    });
    expect(formatFailures(blockingResults([run]))).toBe('');
    expect(
      run.results
        .filter(result => result.status === 'unrun')
        .map(result => `${result.expectation}: ${result.detail ?? ''}`),
    ).toEqual([]);
    // Arranging the state never moved focus out of the field (FR1).
    expect(await hasFocus(field)).toBe(true);
    expect(await axeViolations(page)).toEqual([]);
  });
}

test('a textarea stays a textbox that names its list in a layer and its active option', async ({
  page,
}) => {
  await openStory(page, STORY.message);
  const field = page.getByRole('textbox', {name: 'Message'});
  await expect(field).not.toHaveAttribute('aria-expanded');
  await expect(field).not.toHaveAttribute('aria-controls');
  await field.click();
  await page.keyboard.type('@a');

  const listbox = page.getByRole('listbox', {name: 'People'});
  await expect(listbox).toBeVisible();
  // The list renders in a layer: an open popover in the top layer.
  expect(
    await listbox.evaluate(
      el => el.closest('[popover]')?.matches(':popover-open') === true,
    ),
  ).toBe(true);
  await expect(field).toHaveAttribute('aria-autocomplete', 'list');
  await expect(field).not.toHaveAttribute('role');
  await expect(field).not.toHaveAttribute('aria-expanded');
  await expect(field).toHaveAttribute(
    'aria-controls',
    (await listbox.getAttribute('id')) ?? '',
  );
  expect(await activeOptionName(page, field)).toBe('Ada Lovelace');
  expect(await axeViolations(page)).toEqual([]);
  expect(await hasFocus(field)).toBe(true);
});

test('arrows move the active option and Enter picks it, with focus kept in the field', async ({
  page,
}) => {
  await openStory(page, STORY.search);
  const field = page.getByRole('combobox', {name: 'Search settings'});
  await field.click();
  await page.keyboard.type('no');
  await expect(page.getByRole('option')).toHaveText([
    'Notifications',
    'Notification sound',
  ]);
  // A new query activates nothing, so Enter would stay the field's.
  await expect(field).not.toHaveAttribute('aria-activedescendant');

  await page.keyboard.press('ArrowDown');
  expect(await activeOptionName(page, field)).toBe('Notifications');
  await page.keyboard.press('ArrowDown');
  expect(await activeOptionName(page, field)).toBe('Notification sound');
  await page.keyboard.press('ArrowDown');
  expect(await activeOptionName(page, field)).toBe('Notifications');
  await page.keyboard.press('ArrowUp');
  expect(await activeOptionName(page, field)).toBe('Notification sound');
  expect(await hasFocus(field)).toBe(true);

  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.getByText('Opened Notification sound')).toBeVisible();
  await expect(field).toHaveAttribute('aria-expanded', 'false');
  expect(await hasFocus(field)).toBe(true);
});

test('ArrowDown brings back a hidden list in a single-line field', async ({
  page,
}) => {
  await openStory(page, STORY.search);
  const field = page.getByRole('combobox', {name: 'Search settings'});
  await field.click();
  await page.keyboard.type('pass');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(field).toHaveValue('pass');

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await activeOptionName(page, field)).toBe('Password');
});

test('in a textarea, a pick stops Enter, a hidden list leaves the arrows to the caret, and Enter sends', async ({
  page,
}) => {
  await openStory(page, STORY.message);
  const field = page.getByRole('textbox', {name: 'Message'});
  await field.click();
  await page.keyboard.type('Hi @ad');
  expect(await activeOptionName(page, field)).toBe('Ada Lovelace');
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('Hi @Ada ');
  await expect(page.getByRole('listbox')).toHaveCount(0);

  // A new mention, dismissed: the arrows are the caret's again.
  await page.keyboard.type('@k');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  expect(
    await field.evaluate(el => (el as HTMLTextAreaElement).selectionStart),
  ).toBe(0);

  await page.keyboard.press('Enter');
  await expect(page.getByText('Sent: Hi @Ada @k')).toBeVisible();
  expect(await hasFocus(field)).toBe(true);
});

test('Escape hides the list before it closes the dialog around the field', async ({
  page,
}) => {
  await openStory(page, STORY.dialog);
  const dialog = page.getByRole('dialog', {name: 'Share'});
  await expect(dialog).toBeVisible();
  const field = page.getByRole('combobox', {name: 'Add people'});
  await field.click();
  await page.keyboard.type('al');
  await expect(page.getByRole('listbox')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(dialog).toBeVisible();
  expect(await hasFocus(field)).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('with no matches in the dialog, the first Escape hides the empty message and the dialog stays', async ({
  page,
}) => {
  await openStory(page, STORY.dialog);
  const dialog = page.getByRole('dialog', {name: 'Share'});
  const field = page.getByRole('combobox', {name: 'Add people'});
  await field.click();
  await page.keyboard.type('zz');
  const empty = page.getByText('No one matches');
  await expect(empty).toBeVisible();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(field).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Escape');
  await expect(empty).toHaveCount(0);
  await expect(dialog).toBeVisible();
  expect(await hasFocus(field)).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('hovering makes an option active and a press picks it, with focus kept in the field', async ({
  page,
}) => {
  await openStory(page, STORY.dialog);
  const field = page.getByRole('combobox', {name: 'Add people'});
  await field.click();
  await page.keyboard.type('a');
  const grace = page.getByRole('option', {name: 'Grace Hopper (away)'});
  await expect(grace).toHaveAttribute('aria-disabled', 'true');

  await page.getByRole('option', {name: 'Katherine Johnson'}).hover();
  expect(await activeOptionName(page, field)).toBe('Katherine Johnson');
  await grace.hover();
  expect(await activeOptionName(page, field)).toBe('Katherine Johnson');
  // Playwright waits for an aria-disabled element to enable; press it anyway.
  await grace.click({force: true});
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByText('Not shared yet')).toBeVisible();
  expect(await hasFocus(field)).toBe(true);

  await page.getByRole('option', {name: 'Margaret Hamilton'}).click();
  await expect(page.getByText('Shared with Margaret Hamilton')).toBeVisible();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  expect(await hasFocus(field)).toBe(true);
});

test('a contenteditable field keeps its arrows while the list is hidden', async ({
  page,
}) => {
  await openStory(page, STORY.editable);
  const field = page.getByRole('combobox', {name: 'Add people'});
  await field.click();
  await page.keyboard.type('ed');
  expect(await activeOptionName(page, field)).toBe('Edsger Dijkstra');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('list', {name: 'Added'})).toHaveText(
    'Edsger Dijkstra',
  );
  await expect(page.getByRole('listbox')).toHaveCount(0);

  await page.keyboard.type('b');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(field).toHaveAttribute('aria-expanded', 'false');
  expect(await hasFocus(field)).toBe(true);
});

test('a new query is announced once, through the shared live region', async ({
  page,
}) => {
  // Every non-empty text written to the shared polite region, in order.
  await page.addInitScript(() => {
    const writes: string[] = [];
    (window as unknown as {__politeWrites: string[]}).__politeWrites = writes;
    new MutationObserver(records => {
      for (const record of records) {
        if (
          record.target instanceof Element &&
          record.target.matches('[data-astryx-live-region="polite"]')
        ) {
          for (const node of record.addedNodes) {
            if (node.textContent) {
              writes.push(node.textContent);
            }
          }
        }
      }
    }).observe(document, {childList: true, subtree: true});
  });
  await openStory(page, STORY.search);
  const field = page.getByRole('combobox', {name: 'Search settings'});
  await field.click();
  await page.keyboard.type('no');
  const polite = page.locator('[data-astryx-live-region="polite"]');
  await expect(polite).toHaveText('2 results');
  await page.keyboard.type('pe');
  await expect(polite).toHaveText('No results found');
  await page.waitForTimeout(500);
  // One update per new query: n, no, nop, nope.
  expect(
    await page.evaluate(
      () => (window as unknown as {__politeWrites: string[]}).__politeWrites,
    ),
  ).toEqual(['5 results', '2 results', 'No results found', 'No results found']);
  const regions = await page
    .locator('[aria-live]')
    .evaluateAll(nodes =>
      nodes.map(node => node.getAttribute('data-astryx-live-region')),
    );
  expect(regions.every(region => region != null)).toBe(true);
});
