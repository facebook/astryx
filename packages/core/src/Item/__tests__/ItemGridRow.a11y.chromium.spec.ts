// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ItemGridRow.a11y.chromium.spec.ts
 * @input The checked-in Core/Item › Grid Rows story, a built Storybook and
 *   real Chromium with a touchscreen
 * @output Proof that a grid of Item rows is a valid grid to axe and to the
 *   accessibility tree at rest and while a row rests open on its swipe panel:
 *   every row child a gridcell, the link a plain link inside its cell, the
 *   selected row reporting aria-selected, the roving focus landing on the
 *   link and moving with the arrow keys, the revealed Archive a button in a
 *   cell that fires
 * @position Browser-only regression test for Item's grid-row shape. jsdom
 *   has no accessibility tree and no axe.
 */

import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';
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

// The swipe is touch only; a phone-sized viewport keeps the drag short.
test.use({hasTouch: true, viewport: {height: 800, width: 420}});

interface AxValue {
  value?: unknown;
}
interface AxNode {
  nodeId: string;
  ignored?: boolean;
  role?: AxValue;
  name?: AxValue;
  childIds?: ReadonlyArray<string>;
  properties?: ReadonlyArray<{name: string; value: AxValue}>;
}

/** The accessibility tree under one element, as Chromium computes it. */
async function axTreeOf(
  page: Page,
  selector: string,
): Promise<{nodes: ReadonlyArray<AxNode>; root: AxNode}> {
  const cdp = await page.context().newCDPSession(page);
  const {root} = (await cdp.send('DOM.getDocument', {depth: 0})) as {
    root: {nodeId: number};
  };
  const {nodeId} = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector,
  });
  const {nodes} = (await cdp.send('Accessibility.getPartialAXTree', {
    nodeId,
    fetchRelatives: true,
  })) as unknown as {nodes: ReadonlyArray<AxNode>};
  await cdp.detach();
  return {nodes, root: nodes[0]};
}

const roleOf = (node: AxNode | undefined): string => {
  const value = node?.role?.value;
  return typeof value === 'string' ? value : '';
};

/** The exposed (non-ignored) children of an AX node, descending through ignored wrappers. */
function exposedChildren(
  node: AxNode,
  byId: ReadonlyMap<string, AxNode>,
): AxNode[] {
  const out: AxNode[] = [];
  for (const id of node.childIds ?? []) {
    const child = byId.get(id);
    if (child == null) {
      continue;
    }
    if (child.ignored === true) {
      out.push(...exposedChildren(child, byId));
    } else {
      out.push(child);
    }
  }
  return out;
}

test('a grid of rows: valid to axe, every exposed row child a gridcell, selection on the row, focus roving on the link', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-item--grid-rows&viewMode=story`,
    {waitUntil: 'load'},
  );
  const grid = page.getByRole('grid', {name: 'Inbox'});
  await expect(grid).toBeVisible();
  const rows = grid.getByRole('row');
  await expect(rows).toHaveCount(5);

  const atRest = await new AxeBuilder({page})
    .include('[role="grid"]')
    .analyze();
  expect(atRest.violations).toEqual([]);

  // The second row is selected; the link inside is a plain link.
  const second = rows.nth(1);
  await expect(second).toHaveAttribute('aria-selected', 'true');
  const link = second.getByRole('link', {name: /Message 2/});
  await expect(link).not.toHaveAttribute('role');
  await expect(link).not.toHaveAttribute('aria-selected');

  // Chromium's tree: the row's exposed children are gridcells and nothing
  // else, the swipe panel's cell included.
  const {nodes, root} = await axTreeOf(page, '[role="row"][aria-rowindex="2"]');
  const byId = new Map(nodes.map(node => [node.nodeId, node]));
  expect(roleOf(root)).toBe('row');
  const children = exposedChildren(root, byId);
  expect(children.length).toBeGreaterThanOrEqual(3);
  expect(children.map(roleOf)).toEqual(children.map(() => 'gridcell'));
  expect(root.properties?.find(p => p.name === 'selected')?.value.value).toBe(
    true,
  );

  // Roving focus: the grid is one tab stop, the last focused cell. Tab lands
  // on the first row's select cell, Right moves to its link, Down and Up move
  // between rows, Left returns to the select cell; exactly one cell carries
  // tabindex 0 at any time, and Tab from it leaves the grid.
  const first = rows.nth(0).getByRole('link', {name: /Message 1/});
  const firstCheckbox = rows
    .nth(0)
    .getByRole('checkbox', {name: 'Select Message 1'});
  const stopCount = async () =>
    grid
      .locator('a, input, button')
      .evaluateAll(
        els => els.filter(el => el.getAttribute('tabindex') === '0').length,
      );
  expect(await stopCount()).toBe(1);
  await page.keyboard.press('Tab');
  await expect(firstCheckbox).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('tabindex', '0');
  await expect(firstCheckbox).toHaveAttribute('tabindex', '-1');
  await page.keyboard.press('ArrowDown');
  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute('tabindex', '0');
  await expect(first).toHaveAttribute('tabindex', '-1');
  expect(await stopCount()).toBe(1);
  await page.keyboard.press('ArrowUp');
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(firstCheckbox).toBeFocused();
  expect(await stopCount()).toBe(1);
  // The swipe panels are inert at rest, so their buttons are not stops.
  await expect(grid.locator('[data-swipe-panel]').first()).toHaveAttribute(
    'inert',
  );
  // Tab from the select cell leaves the grid.
  await page.keyboard.press('Tab');
  await expect(grid.locator(':focus')).toHaveCount(0);
  // A pointer focus moves the stop: after a click on the fourth row's select
  // cell, that cell is the one tabindex 0 and Shift+Tab from outside returns
  // to it, not to the first row.
  const fourthCheckbox = rows
    .nth(3)
    .getByRole('checkbox', {name: 'Select Message 4'});
  await fourthCheckbox.click();
  await expect(fourthCheckbox).toBeFocused();
  await expect(fourthCheckbox).toHaveAttribute('tabindex', '0');
  expect(await stopCount()).toBe(1);
  await page.keyboard.press('Tab');
  await expect(grid.locator(':focus')).toHaveCount(0);
  await page.keyboard.press('Shift+Tab');
  await expect(fourthCheckbox).toBeFocused();
  // Two rows are selected at once, and the grid says so.
  await expect(grid).toHaveAttribute('aria-multiselectable', 'true');
  await expect(grid.locator('[role="row"][aria-selected="true"]')).toHaveCount(
    2,
  );
});

test('a swipe on a grid row rests open on a gridcell of buttons, axe stays clean, and Archive fires', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-item--grid-rows&viewMode=story`,
    {waitUntil: 'load'},
  );
  const grid = page.getByRole('grid', {name: 'Inbox'});
  const row = grid.getByRole('row').first();
  const panel = row.locator('[data-swipe-panel="trailing"]');
  // The gesture arrives with the lazily loaded swipe layer; its panel is the
  // sign the row can be dragged.
  await expect(panel).toBeAttached();
  const box = await row.boundingBox();
  if (box == null) {
    throw new Error('the row has no box');
  }
  const y = box.y + box.height / 2;
  const startX = box.x + box.width - 24;
  const cdp = await page.context().newCDPSession(page);
  const at = async (x: number, type: 'touchStart' | 'touchMove') =>
    cdp.send('Input.dispatchTouchEvent', {touchPoints: [{x, y}], type});
  // Toward the inline start, past half the panel, slowly: rests open.
  await at(startX, 'touchStart');
  for (const dx of [6, 14, 28, 44, 60]) {
    await at(startX - dx, 'touchMove');
    await page.waitForTimeout(40);
  }
  await cdp.send('Input.dispatchTouchEvent', {
    touchPoints: [],
    type: 'touchEnd',
  });

  await expect(panel).not.toHaveAttribute('inert');
  await expect(panel).toHaveAttribute('role', 'gridcell');
  const archive = panel.getByRole('button', {name: 'Archive'});
  await expect(archive).toBeVisible();

  const resting = await new AxeBuilder({page})
    .include('[role="grid"]')
    .analyze();
  expect(resting.violations).toEqual([]);

  // The row's exposed children are still gridcells, the live panel among them.
  const {nodes, root} = await axTreeOf(page, '[role="row"][aria-rowindex="1"]');
  const byId = new Map(nodes.map(node => [node.nodeId, node]));
  const children = exposedChildren(root, byId);
  expect(children.map(roleOf)).toEqual(children.map(() => 'gridcell'));

  await archive.tap();
  await expect(grid.getByRole('row')).toHaveCount(4);
  await expect(grid.getByText('Message 1')).toHaveCount(0);
});
