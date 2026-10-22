// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BusyAnnouncements.a11y.chromium.spec.ts
 * @input Checked-in busy announcement stories and Chromium's accessibility tree
 * @output Page/modal routing, silent-indicator, and accessible-name evidence
 * @position AST-086 FR3/FR8 browser checks; not evidence of real AT speech
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer | undefined;
let origin: string;
test.beforeAll(async () => {
  if (process.env.ASTRYX_STORYBOOK_URL) {
    origin = process.env.ASTRYX_STORYBOOK_URL;
  } else {
    storybook = await serveStorybook(
      process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
    );
    origin = storybook.origin;
  }
});
test.afterAll(async () => {
  await storybook?.close();
});

async function mount(page: Page, story: string) {
  await page.goto(
    `${origin}/iframe.html?id=a11y-busy-announcements--${story}&viewMode=story`,
  );
}

async function expectSilentIndicator(page: Page) {
  const spinner = page.locator('.astryx-spinner');
  await expect(spinner).toHaveCount(1);
  await expect(spinner).toHaveAttribute('aria-hidden', 'true');
  await expect(spinner).not.toHaveAttribute('role', /.*/);
  await expect(spinner).not.toHaveAttribute('aria-live', /.*/);
  const cdp = await page.context().newCDPSession(page);
  try {
    const {root} = await cdp.send('DOM.getDocument');
    const {nodeId} = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '.astryx-spinner',
    });
    const {nodes} = await cdp.send('Accessibility.getPartialAXTree', {
      nodeId,
      fetchRelatives: false,
    });
    expect(nodes).toHaveLength(1);
    expect(nodes[0].ignored).toBe(true);
    const tree = await cdp.send('Accessibility.getFullAXTree');
    const statuses = tree.nodes.filter(
      node => !node.ignored && node.role?.value === 'status',
    );
    expect(statuses).toHaveLength(1);
    expect(statuses[0].properties).toContainEqual(
      expect.objectContaining({
        name: 'live',
        value: expect.objectContaining({value: 'polite'}),
      }),
    );
  } finally {
    await cdp.detach();
  }
}

test('page controls use the shared channel without changing their names', async ({
  page,
}) => {
  await mount(page, 'page-controls');
  const region = page.locator('[data-astryx-live-region="polite"]');
  await expect(region).toHaveText('Loading');
  await expect(page.getByRole('textbox', {name: 'Email'})).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expectSilentIndicator(page);
  await page.getByRole('button', {name: 'Rerender', exact: true}).click();
  await expect(page.locator('[data-revision]')).toHaveText('1');
  await page.getByRole('button', {name: 'Finish work'}).click();
  await expect(page.getByRole('textbox', {name: 'Email'})).not.toHaveAttribute(
    'aria-busy',
    'true',
  );
  await page.getByRole('button', {name: 'Start work'}).click();
  await expect(region).toHaveText('Loading');
});

test('initially busy native-modal controls expose a local live owner, not the indicator', async ({
  page,
}) => {
  await mount(page, 'initially-busy-modal');
  // Closed date pickers retain empty Button regions. Select the busy owner's
  // atomic endpoint; the AX check below independently counts exposed owners.
  const region = page.locator('dialog [role="status"][aria-atomic="true"]');
  await expect(region).toHaveText('Loading');
  expect(
    await page.locator('dialog').evaluate(dialog => dialog.matches(':modal')),
  ).toBe(true);
  await expect(page.locator('[data-astryx-live-region]')).toHaveCount(0);
  await expect(page.getByRole('textbox', {name: 'Email'})).toBeVisible();
  await expectSilentIndicator(page);
  for (const control of [
    'Switch',
    'CheckboxInput',
    'Native date',
    'Touch date',
  ]) {
    await page
      .getByRole('combobox', {name: /^Busy control/})
      .selectOption(control);
    await expect(region).toHaveText('Loading');
    await expectSilentIndicator(page);
    if (control === 'Switch') {
      await expect(page.getByRole('switch')).toHaveAccessibleName('Enable');
    } else if (control === 'CheckboxInput') {
      await expect(page.getByRole('checkbox')).toHaveAccessibleName('Accept');
    }
  }
  await page.getByRole('button', {name: 'Finish work'}).click();
  await expect(region).toBeEmpty();
  await page.getByRole('button', {name: 'Start work'}).click();
  await expect(region).toHaveText('Loading');
});

test('palette bootstrap, query, cleared query, and reopen use its exposed local region', async ({
  page,
}) => {
  await mount(page, 'palette-busy-starts');
  const region = page.locator('dialog [role="status"]');
  await expect(region).toHaveText('Loading');
  await expectSilentIndicator(page);
  await page.getByRole('button', {name: 'Finish load'}).click();
  await expect(region).toBeEmpty();
  await page.getByRole('combobox').fill('o');
  await expect(region).toHaveText('Loading');
  await page.getByRole('button', {name: 'Finish load'}).click();
  await expect(region).toBeEmpty();
  await page.getByRole('combobox').fill('');
  await expect(region).toHaveText('Loading');
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  await page.getByRole('button', {name: 'Open palette'}).click();
  await expect(region).toHaveText('Loading');
  await expect(
    page.locator('[data-astryx-live-region="polite"]'),
  ).not.toHaveText('Loading');
});
