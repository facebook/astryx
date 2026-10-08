// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input A local production docsite and exact-origin companion endpoint fixtures
 * @output Browser proof of floating geometry, dynamic origins, and dismissal
 * @position Docsite integration tests; no live network access is inferred here
 */

import {expect, test, type Page} from '@playwright/test';

const deployments = [
  {name: 'production', origin: 'https://astryx.atmeta.com'},
  {
    name: 'preview',
    origin:
      'https://astryx-git-feat-docs-internal-network-prompt-fbopensource.vercel.app',
  },
  {name: 'canary', origin: 'https://astryx-canary.vercel.app'},
];
const internalOrigin = 'https://astryx.internalmeta.com';
const promptName = 'Internal Astryx documentation';

test.afterEach(async ({page}) => {
  // The fixture proxies Next.js prefetches too. Drain the final navigation's
  // network work before Playwright disposes its fetched response bodies.
  await page.waitForLoadState('networkidle');
});

async function servePublicOrigin(
  page: Page,
  baseURL: string | undefined,
  origin: string,
) {
  if (!baseURL) {
    throw new Error('A local docsite baseURL is required');
  }
  // Exercise the shipped origin gate without granting localhost access.
  await page.route(`${origin}/**`, async route => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `${baseURL}${url.pathname}${url.search}`,
    });
    await route.fulfill({response});
  });
}

async function serveReachability(page: Page, origin: string) {
  let requests = 0;
  let allowReply = () => {};
  const gate = new Promise<void>(resolve => {
    allowReply = resolve;
  });
  await page.route(`${internalOrigin}/embed/access-check?**`, async route => {
    requests++;
    expect(
      new URL(route.request().url()).searchParams.get('parent_origin'),
    ).toBe(origin);
    await gate;
    await route.fulfill({
      contentType: 'text/html; charset=utf-8',
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Security-Policy': `frame-ancestors ${origin}`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
      body: `<!doctype html><html><body><script>window.parent.postMessage({type:'astryx:access-check:v1',reachable:true},${JSON.stringify(origin)});</script></body></html>`,
    });
  });
  return {requests: () => requests, allowReply};
}

for (const {name, origin} of deployments) {
  for (const width of [1440, 390]) {
    test(`${name}: fixed pill at ${width}px never shifts content and dismissal stays view-local`, async ({
      page,
      baseURL,
    }, testInfo) => {
      await page.setViewportSize({width, height: 900});
      await servePublicOrigin(page, baseURL, origin);
      const probe = await serveReachability(page, origin);
      await page.goto(`${origin}/docs/getting-started?source=test`, {
        waitUntil: 'domcontentloaded',
      });
      const heading = page.getByRole('heading', {
        name: 'Getting Started',
        exact: true,
      });
      await expect(heading).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const before = await heading.boundingBox();
      const prompt = page.getByRole('complementary', {name: promptName});
      await expect(prompt).toHaveCount(0);
      probe.allowReply();
      await expect(prompt).toBeVisible();
      const after = await heading.boundingBox();
      expect(after).toEqual(before);
      const link = prompt.getByRole('link', {
        name: /Internal docs — open Astryx documentation/,
      });
      await expect(link).toHaveText('Internal docs');
      await expect(
        prompt.getByText("On Meta's network?", {exact: true}),
      ).toHaveCount(0);
      await expect(prompt.getByText(/Meta-specific components/)).toHaveCount(0);
      await expect(prompt.getByRole('link')).toHaveCount(1);
      await expect(prompt.getByRole('button')).toHaveCount(1);
      await expect(link).toHaveAttribute(
        'href',
        `${internalOrigin}/docs/getting-started?source=test`,
      );
      await expect(
        page.locator('iframe[title="Astryx documentation reachability check"]'),
      ).toHaveCount(0);
      expect(probe.requests()).toBe(1);

      const box = await prompt.boundingBox();
      if (!box) {
        throw new Error('The prompt must have a visible bounding box');
      }
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y + box.height).toBeLessThanOrEqual(900);
      expect(box.width).toBeLessThan(240);
      expect(box.height).toBeLessThan(64);
      expect(box.x + box.width / 2).toBeGreaterThan(width / 2);
      expect(box.y).toBeGreaterThan(900 / 2);
      expect(
        await prompt.evaluate(element => getComputedStyle(element).position),
      ).toBe('fixed');
      expect(
        await prompt.evaluate(element =>
          Number(getComputedStyle(element).zIndex),
        ),
      ).toBeGreaterThan(1);
      await page.screenshot({
        path: testInfo.outputPath(`internal-docs-pill-${name}-${width}.png`),
      });

      const close = prompt.getByRole('button', {
        name: 'Dismiss internal docs prompt',
      });
      const storageBefore = await page.evaluate(() => ({
        session: {...sessionStorage},
        local: {...localStorage},
        cookie: document.cookie,
      }));
      await close.focus();
      await expect(close).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(prompt).toHaveCount(0);
      expect(
        await page.evaluate(() => ({
          session: {...sessionStorage},
          local: {...localStorage},
          cookie: document.cookie,
        })),
      ).toEqual(storageBefore);

      // Next.js' native history integration updates the client URL view without
      // reloading the document or repeating the successful reachability probe.
      await page.evaluate(() =>
        window.history.pushState(null, '', '?source=after-dismiss'),
      );
      await expect(prompt).toBeVisible();
      await expect(link).toHaveAttribute(
        'href',
        `${internalOrigin}/docs/getting-started?source=after-dismiss`,
      );
      expect(probe.requests()).toBe(1);
      await close.click();
      await expect(prompt).toHaveCount(0);

      await page.reload();
      await expect(heading).toBeVisible();
      await expect(prompt).toBeVisible();
      expect(probe.requests()).toBe(2);
    });
  }
}

test('unreachable visitors never see a prompt', async ({page, baseURL}) => {
  const origin = deployments[0].origin;
  await servePublicOrigin(page, baseURL, origin);
  await page.route(`${internalOrigin}/**`, route => route.abort());
  await page.goto(`${origin}/docs/getting-started`);
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
