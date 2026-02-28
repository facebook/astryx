import {test, expect} from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {getStories, waitForStoryReady} from './utils';

const storybookDir = path.resolve(__dirname, '../apps/storybook/dist');
const stories = getStories(storybookDir);
const snapshotsDir = path.resolve(
  __dirname,
  'visual-regression.spec.ts-snapshots',
);

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({page}) => {
    const url = `http://localhost:6006/iframe.html?id=${story.id}&viewMode=story`;
    await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});

    await waitForStoryReady(page);

    // Generate the expected snapshot filename (matches Playwright's naming)
    const snapshotName = `${story.title}/${story.name}.png`;

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      snapshotName,
    );
  });
}
