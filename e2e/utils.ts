import fs from 'fs';
import path from 'path';
import type {Page} from '@playwright/test';

export interface StoryEntry {
  id: string;
  title: string;
  name: string;
  type: string;
}

/**
 * Reads and parses the Storybook index.json to get all story entries.
 * Filters out docs-only entries.
 */
export function getStories(storybookDir: string): StoryEntry[] {
  const indexPath = path.join(storybookDir, 'index.json');
  const content = fs.readFileSync(indexPath, 'utf8');
  const data = JSON.parse(content);
  const entries: Record<string, StoryEntry> =
    data.entries || data.stories || {};

  return Object.values(entries).filter(
    entry => entry.type !== 'docs' && !entry.id.endsWith('--docs'),
  );
}

/**
 * Waits for a Storybook story to be fully rendered including styles and fonts.
 * Reuses the waiting logic from capture-screenshots.js.
 */
export async function waitForStoryReady(page: Page): Promise<void> {
  // Storybook adds sb-show-main to body once the story has rendered.
  // It may instead show sb-show-errordisplay or sb-show-nopreview on failure.
  // Wait for any terminal state, then check which one we got.
  const result = await page.waitForFunction(
    () => {
      const cl = document.body.classList;
      if (cl.contains('sb-show-main')) return 'main';
      if (cl.contains('sb-show-errordisplay')) return 'error';
      if (cl.contains('sb-show-nopreview')) return 'nopreview';
      return null;
    },
    null,
    {timeout: 15000},
  );

  const state = await result.jsonValue();
  if (state === 'error') {
    const errorText = await page.evaluate(() => {
      const msg = document.getElementById('error-message')?.textContent || '';
      const stack = document.getElementById('error-stack')?.textContent || '';
      return [msg, stack].filter(Boolean).join('\n');
    });
    throw new Error(`Story render error: ${errorText || 'unknown error'}`);
  }
  if (state === 'nopreview') {
    throw new Error('Story has no preview');
  }

  // Wait for all stylesheets to load
  await page.evaluate(async () => {
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    );
    await Promise.all(
      links.map(link => {
        if ((link as HTMLLinkElement).sheet) return Promise.resolve();
        return new Promise<void>(resolve => {
          link.addEventListener('load', () => resolve());
          link.addEventListener('error', () => resolve());
        });
      }),
    );

    // Wait for style elements to be processed
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
  });

  // Wait for StyleX runtime injection
  await page.waitForTimeout(1500);

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for CSS variables / theme wrapper to be resolved
  await page.evaluate(async () => {
    const checkStyles = () => {
      const storyRoot = document.querySelector('#storybook-root');
      if (!storyRoot) return false;

      const firstChild = storyRoot.querySelector('*');
      if (firstChild) {
        const styles = getComputedStyle(firstChild);
        return styles.display !== '';
      }
      return true;
    };

    for (let i = 0; i < 20; i++) {
      if (checkStyles()) break;
      await new Promise(r => setTimeout(r, 100));
    }
  });

  // Additional wait for CSS transitions/animations
  await page.waitForTimeout(500);
}
