// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Render the CDN starter page in a browser, and report what went wrong.
 *
 * One render loads the page until its network goes idle, then reads the first
 * button: a page that throws while rendering still goes idle with an empty
 * root, so the render itself is asserted, not only the error streams. A page
 * with a request that never finishes never goes idle, so its navigation times
 * out: that is an unclean render like any other, reported with the requests
 * still in flight when the wait gave up, so the output names the asset that
 * hung instead of ending the run on a stack trace. renderUntilClean retries
 * an unclean render once, so a blip at a CDN is not a red build.
 */

/** Playwright's error for a navigation whose wait condition never came. */
function isTimeout(error) {
  return error?.name === 'TimeoutError';
}

/**
 * Load `url` once in a browser from `launch`, and collect its console errors,
 * page errors and failed requests, and the first button's text (null when no
 * button rendered). A navigation that times out comes back with `timedOut`
 * and the URLs still in flight (`pendingRequests`, in request order); any
 * other navigation error throws.
 *
 * @param {string} url
 * @param {{
 *   launch: () => Promise<import('playwright').Browser>,
 *   navigationTimeoutMs?: number,
 *   buttonTimeoutMs?: number,
 * }} options
 */
export async function renderPage(
  url,
  {launch, navigationTimeoutMs = 90_000, buttonTimeoutMs = 15_000},
) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  /** Requests the page made that have neither finished nor failed. */
  const inFlight = new Set();

  const browser = await launch();
  try {
    const page = await browser.newPage();
    page.on('console', m => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
    });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 300)));
    page.on('request', r => inFlight.add(r));
    page.on('requestfinished', r => inFlight.delete(r));
    page.on('requestfailed', r => {
      inFlight.delete(r);
      failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`);
    });
    page.on('response', r => {
      if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
    });

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: navigationTimeoutMs,
      });
    } catch (error) {
      if (!isTimeout(error)) {
        throw error;
      }
      return {
        consoleErrors,
        pageErrors,
        failedRequests,
        timedOut: true,
        pendingRequests: [...inFlight].map(r => r.url()),
        button: null,
      };
    }
    const button = await page
      .getByRole('button')
      .first()
      .textContent({timeout: buttonTimeoutMs})
      .catch(() => null);

    return {
      consoleErrors,
      pageErrors,
      failedRequests,
      timedOut: false,
      pendingRequests: [],
      button,
    };
  } finally {
    await browser.close();
  }
}

/** Whether a render went idle with nothing wrong and a button on the page. */
export function isCleanRender(result) {
  return (
    !result.timedOut &&
    result.consoleErrors.length === 0 &&
    result.pageErrors.length === 0 &&
    result.failedRequests.length === 0 &&
    Boolean(result.button)
  );
}

/**
 * Run `render` until one comes back clean, at most `attempts` times, and
 * return the last result. `onRetry(attempt)` hears each retry.
 *
 * @template {{timedOut: boolean, consoleErrors: string[], pageErrors: string[], failedRequests: string[], button: string | null}} R
 * @param {() => Promise<R>} render
 * @param {{attempts?: number, onRetry?: (attempt: number) => void}} [options]
 * @returns {Promise<R>}
 */
export async function renderUntilClean(render, {attempts = 2, onRetry} = {}) {
  let result;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    result = await render();
    if (isCleanRender(result)) break;
    if (attempt < attempts) onRetry?.(attempt);
  }
  return result;
}
