// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input A local production docsite and exact-origin companion endpoint fixtures
 * @output Browser proof of bottom-center geometry, dynamic origins, and dismissal
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
const probeOrigin = 'https://codebunny.internalmeta.com';
const promptName = 'Meta internal docs';

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
  await page.route(`${probeOrigin}/embed/access-check?**`, async route => {
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
      body: `<!doctype html><html><body><script>window.parent.postMessage({type:'codebunny:access-check:v1',reachable:true},${JSON.stringify(origin)});</script></body></html>`,
    });
  });
  return {requests: () => requests, allowReply};
}

for (const {name, origin} of deployments) {
  for (const width of [1440, 390]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${name}: bottom-center utility bar at ${width}px in ${colorScheme} never shifts content and dismissal stays view-local`, async ({
        page,
        baseURL,
      }, testInfo) => {
        await page.setViewportSize({width, height: 900});
        await page.emulateMedia({colorScheme});
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
        await expect(
          page.locator(
            'iframe[title="Astryx documentation reachability check"]',
          ),
        ).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
        probe.allowReply();
        await expect(prompt).toBeVisible();
        const after = await heading.boundingBox();
        expect(after).toEqual(before);
        const link = prompt.getByRole('link', {
          name: /Meta internal docs/,
        });
        await expect(link).toContainText('Meta internal docs');
        await page.keyboard.press('Tab');
        await expect(
          page.getByRole('link', {name: 'Skip to content', exact: true}),
        ).toBeFocused();
        await expect(
          prompt.getByText("On Meta's network?", {exact: true}),
        ).toHaveCount(0);
        await expect(prompt.getByText(/Meta-specific components/)).toHaveCount(
          0,
        );
        await expect(prompt.getByRole('link')).toHaveCount(1);
        await expect(prompt.getByRole('button')).toHaveCount(1);
        await expect(link).toHaveAttribute(
          'href',
          `${internalOrigin}/docs/getting-started?source=test`,
        );
        await expect(
          page.locator(
            'iframe[title="Astryx documentation reachability check"]',
          ),
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
        expect(box.height).toBeLessThanOrEqual(40);
        expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(1);
        expect(900 - box.y - box.height).toBeGreaterThanOrEqual(16);
        expect(box.y).toBeGreaterThan(900 / 2);
        const appearance = await prompt.evaluate(element => {
          const style = getComputedStyle(element);
          return {
            position: style.position,
            elevation: element.getAttribute('data-elevation'),
            borderWidth: style.borderTopWidth,
          };
        });
        expect(appearance).toEqual({
          position: 'fixed',
          elevation: 'none',
          borderWidth: '1px',
        });
        await expect(prompt.getByRole('separator')).toHaveAttribute(
          'aria-orientation',
          'vertical',
        );
        expect(
          await prompt.evaluate(element =>
            Number(getComputedStyle(element).zIndex),
          ),
        ).toBeGreaterThan(1);
        await heading.click();
        await link.focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        await expect(link).toBeFocused();
        await page.screenshot({
          path: testInfo.outputPath(
            `meta-internal-docs-link-focus-${name}-${width}-${colorScheme}.png`,
          ),
        });
        await page.keyboard.press('Tab');
        const dismiss = prompt.getByRole('button', {
          name: 'Dismiss Meta internal docs for this page view',
        });
        await expect(dismiss).toBeFocused();
        await expect(prompt).toHaveCSS('overflow', 'visible');
        await page.screenshot({
          path: testInfo.outputPath(
            `meta-internal-docs-dismiss-focus-${name}-${width}-${colorScheme}.png`,
          ),
        });
        await heading.click();
        await expect(page.getByRole('tooltip')).toHaveCount(0);
        await page.screenshot({
          path: testInfo.outputPath(
            `meta-internal-docs-${name}-${width}-${colorScheme}.png`,
          ),
        });
        await prompt.screenshot({
          path: testInfo.outputPath(
            `meta-internal-docs-detail-${name}-${width}-${colorScheme}.png`,
          ),
        });

        const close = prompt.getByRole('button', {
          name: 'Dismiss Meta internal docs for this page view',
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
}

test('unreachable visitors never see a prompt', async ({page, baseURL}) => {
  const origin = deployments[0].origin;
  await servePublicOrigin(page, baseURL, origin);
  await page.route(`${probeOrigin}/**`, route => route.abort());
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
