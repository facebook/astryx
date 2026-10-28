// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogForeground.interaction.browser.spec.ts
 * @input Built Dialog stories in a real Chromium/WebKit browser
 * @output Regression proof for foreground and existing close behavior
 * @position Browser-only evidence; jsdom cannot resolve theme color variables
 */

import {expect, test} from '@playwright/test';
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

for (const mode of ['light', 'dark']) {
  test(`a dialog opened from a banner keeps its own foreground (${mode})`, async ({
    page,
  }) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=core-dialog--from-banner&viewMode=story&globals=astryxTheme:neutral;colorMode:${mode}`,
    );
    // A host reset may remove the native dialog's CanvasText foreground.
    // The component still owns its painted surface's foreground above resets.
    await page.addStyleTag({
      content: '@layer reset { :where(dialog) { color: inherit; } }',
    });
    const trigger = page.getByRole('button', {
      name: 'Review results',
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole('dialog', {name: 'Review validation'});
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate(
        element => element.closest('.astryx-banner') != null,
      ),
    ).toBe(true);

    const colors = await dialog.evaluate(element => {
      const theme = element.closest('[data-astryx-theme]');
      if (!theme) {
        throw new Error('Dialog lost its local theme');
      }
      const content = element.querySelector('.astryx-text');
      const banner = element.closest('.astryx-banner');
      if (!content || !banner) {
        throw new Error('Dialog fixture is incomplete');
      }
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-text-primary)';
      theme.appendChild(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return {
        expected,
        surface: getComputedStyle(element).color,
        content: getComputedStyle(content).color,
        banner: getComputedStyle(banner).color,
      };
    });
    expect(colors.surface).toBe(colors.expected);
    expect(colors.content).toBe(colors.expected);
    expect(colors.banner).not.toBe(colors.expected);

    await page.getByRole('button', {name: 'Close review', exact: true}).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
