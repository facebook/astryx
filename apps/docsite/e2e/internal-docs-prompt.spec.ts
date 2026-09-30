// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input A local production docsite and a fixture for the companion endpoint
 * @output Browser evidence for cross-origin detection, dismissal, and mobile fit
 * @position Docsite integration tests; no live network access is inferred here
 */

import {expect, test, type Page} from '@playwright/test';

const publicOrigin = 'https://astryx.atmeta.com';
const internalOrigin = 'https://astryx.internalmeta.com';
const promptName = 'Internal Astryx documentation';

async function servePublicOrigin(page: Page, baseURL: string | undefined) {
  if (!baseURL) {
    throw new Error('A local docsite baseURL is required');
  }
  // Exercise the actual shipped origin gate without changing production code
  // or granting localhost access to the companion endpoint.
  await page.route(`${publicOrigin}/**`, async route => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `${baseURL}${url.pathname}${url.search}`,
    });
    await route.fulfill({response});
  });
}

async function serveReachability(page: Page) {
  let requests = 0;
  await page.route(`${internalOrigin}/embed/access-check?**`, async route => {
    requests++;
    expect(
      new URL(route.request().url()).searchParams.get('parent_origin'),
    ).toBe(publicOrigin);
    await route.fulfill({
      contentType: 'text/html; charset=utf-8',
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Security-Policy': `frame-ancestors ${publicOrigin}`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
      body: `<!doctype html><html><body><script>window.parent.postMessage({type:'astryx:access-check:v1',reachable:true},'${publicOrigin}');</script></body></html>`,
    });
  });
  return () => requests;
}

for (const width of [1440, 390]) {
  test(`positive-only prompt fits at ${width}px and dismissal persists`, async ({
    page,
    baseURL,
  }, testInfo) => {
    await page.setViewportSize({width, height: 900});
    await servePublicOrigin(page, baseURL);
    const requests = await serveReachability(page);
    await page.goto(`${publicOrigin}/docs/getting-started?source=test`);
    const prompt = page.getByRole('complementary', {name: promptName});
    await expect(prompt).toBeVisible();
    await expect(
      prompt.getByRole('link', {name: /Open internal docs/}),
    ).toHaveAttribute(
      'href',
      `${internalOrigin}/docs/getting-started?source=test`,
    );
    await expect(
      page.locator('iframe[title="Astryx documentation reachability check"]'),
    ).toHaveCount(0);
    expect(requests()).toBe(1);

    const box = await prompt.boundingBox();
    if (!box) {
      throw new Error('The prompt must have a visible bounding box');
    }
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y + box.height).toBeLessThanOrEqual(900);
    if (width === 390) {
      expect(
        await prompt.evaluate(element => getComputedStyle(element).position),
      ).toBe('static');
      const heading = await page
        .getByRole('heading', {name: 'Getting Started', exact: true})
        .boundingBox();
      if (!heading) {
        throw new Error('The docs heading must have a visible bounding box');
      }
      expect(heading.y).toBeGreaterThanOrEqual(box.y + box.height);
    } else {
      expect(
        await prompt.evaluate(element => getComputedStyle(element).position),
      ).toBe('fixed');
      expect(box.x).toBeGreaterThan(width / 2);
      expect(box.y).toBeGreaterThan(900 / 2);
    }
    await page.screenshot({
      path: testInfo.outputPath(`internal-docs-prompt-${width}.png`),
    });
    const close = prompt.getByRole('button', {
      name: 'Dismiss internal docs prompt',
    });
    await close.focus();
    await expect(close).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(prompt).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole('heading', {name: 'Getting Started', exact: true}),
    ).toBeVisible();
    await expect(prompt).toHaveCount(0);
    expect(requests()).toBe(1);
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem('astryx:internal-prompt:dismissed'),
      ),
    ).toBe('true');
  });
}

test('unreachable visitors never see a prompt', async ({page, baseURL}) => {
  await servePublicOrigin(page, baseURL);
  await page.route(`${internalOrigin}/**`, route => route.abort());
  await page.goto(`${publicOrigin}/docs/getting-started`);
  await expect(
    page.getByRole('heading', {name: 'Getting Started', exact: true}),
  ).toBeVisible();
  await expect(page.getByRole('complementary', {name: promptName})).toHaveCount(
    0,
  );
  await expect(
    page.locator('iframe[title="Astryx documentation reachability check"]'),
  ).toHaveCount(0, {timeout: 10_000});
  await expect(page.getByRole('complementary', {name: promptName})).toHaveCount(
    0,
  );
});
